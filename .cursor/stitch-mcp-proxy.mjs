#!/usr/bin/env node
/**
 * Stdio-to-HTTP proxy for the official Google Stitch MCP endpoint.
 * Strips `outputSchema` from tools/list so Cursor can register the tools.
 */
import { request } from "node:https";
import { stdin, stdout, stderr } from "node:process";

const API_KEY = process.env.STITCH_API_KEY;
const STITCH_URL = process.env.STITCH_HOST || "https://stitch.googleapis.com/mcp";

if (!API_KEY) {
  stderr.write("STITCH_API_KEY is required\n");
  process.exit(1);
}

const parsedUrl = new URL(STITCH_URL);
let useContentLength = false;
let buffer = Buffer.alloc(0);

function postToStitch(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = request(
      {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          "Content-Length": Buffer.byteLength(data),
          "X-Goog-Api-Key": API_KEY,
          "MCP-Protocol-Version": "2025-03-26",
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          try {
            resolve(parseMcpHttpBody(raw, res.headers["content-type"]));
          } catch (err) {
            reject(
              new Error(
                `JSON parse error: ${err.message}\n${raw.slice(0, 200)}`
              )
            );
          }
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function parseMcpHttpBody(raw, contentType = "") {
  if (contentType.includes("text/event-stream")) {
    const dataLines = raw
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .filter(Boolean);
    if (!dataLines.length) {
      throw new Error("empty SSE body");
    }
    return JSON.parse(dataLines[dataLines.length - 1]);
  }
  return JSON.parse(raw);
}

function stripOutputSchema(response) {
  if (Array.isArray(response?.result?.tools)) {
    response.result.tools = response.result.tools.map((tool) => {
      const { outputSchema, ...rest } = tool;
      return rest;
    });
  }
  return response;
}

function writeMessage(obj) {
  const json = JSON.stringify(obj);
  if (useContentLength) {
    stdout.write(
      `Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`
    );
  } else {
    stdout.write(`${json}\n`);
  }
}

async function handleMessage(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;

  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    return;
  }

  if (msg.id === undefined) {
    postToStitch(msg).catch(() => {});
    return;
  }

  try {
    let response = await postToStitch(msg);
    if (msg.method === "tools/list") {
      response = stripOutputSchema(response);
    }
    if (response?.id === undefined) {
      response.id = msg.id;
    }
    writeMessage(response);
  } catch (err) {
    writeMessage({
      jsonrpc: "2.0",
      id: msg.id,
      error: { code: -32603, message: String(err.message) },
    });
  }
}

function processBuffer() {
  while (buffer.length) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd !== -1) {
      const header = buffer.slice(0, headerEnd).toString("utf8");
      const match = header.match(/Content-Length:\s*(\d+)/i);
      if (match) {
        useContentLength = true;
        const len = Number(match[1]);
        const bodyStart = headerEnd + 4;
        if (buffer.length < bodyStart + len) return;
        const body = buffer.slice(bodyStart, bodyStart + len).toString("utf8");
        buffer = buffer.slice(bodyStart + len);
        handleMessage(body);
        continue;
      }
    }

    const nl = buffer.indexOf(0x0a);
    if (nl === -1) return;
    const line = buffer.slice(0, nl).toString("utf8").replace(/\r$/, "");
    buffer = buffer.slice(nl + 1);
    handleMessage(line);
  }
}

stdin.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  processBuffer();
});

stdin.on("end", () => process.exit(0));
stderr.write("[stitch] proxy ready -> https://stitch.googleapis.com/mcp\n");

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const exportDir = path.join(root, "stitch-export");

const pages = [
  { src: "home.html", dest: "index.html", active: "home" },
  { src: "about.html", dest: "about.html", active: "about" },
  { src: "ministers.html", dest: "ministers.html", active: "ministers" },
  {
    src: "service-registration.html",
    dest: "service-registration.html",
    active: "registration",
  },
];

const routes = {
  home: "index.html",
  about: "about.html",
  ministers: "ministers.html",
  registration: "service-registration.html",
};

const navOrder = ["home", "about", "ministers", "registration"];

function replaceNavLinks(block) {
  let i = 0;
  return block.replace(/href="#"/g, () => {
    const key = navOrder[i++] ?? "home";
    return `href="${routes[key]}"`;
  });
}

function wireNav(html, active) {
  let out = html;

  out = out.replace(
    /(<div class="flex items-center gap-sm">\s*<span class="material-symbols-outlined[^"]*"[^>]*>account_balance<\/span>\s*<span class="font-headline-md text-headline-md font-bold text-secondary[^"]*">Kingdom of Cheria<\/span>\s*<\/div>)/,
    `<a href="index.html" class="flex items-center gap-sm no-underline text-inherit">$1</a>`
  );

  out = out.replace(
    /(<span class="font-headline-md text-headline-md text-secondary">Kingdom of Cheria<\/span>)/g,
    `<a href="index.html" class="no-underline text-inherit">$1</a>`
  );

  out = out.replace(
    /<nav class="hidden md:flex[^"]*"[^>]*>[\s\S]*?<\/nav>/g,
    replaceNavLinks
  );

  out = out.replace(
    /<nav class="flex-1 flex flex-col gap-2">[\s\S]*?<\/nav>/g,
    replaceNavLinks
  );

  out = out.replace(
    /<nav class="flex flex-col gap-2">[\s\S]*?<\/nav>/g,
    replaceNavLinks
  );

  out = out.replace(
    /<nav class="hidden md:block[\s\S]*?<\/nav>/g,
    replaceNavLinks
  );

  out = out.replace(
    /<nav class="bg-surface-container-low[\s\S]*?<\/nav>/g,
    replaceNavLinks
  );

  out = out.replace(
    /<nav class="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 md:mt-0">[\s\S]*?<\/nav>/g,
    replaceNavLinks
  );

  if (active === "home") {
    out = out.replace(
      /<button class="bg-\[#FFB7C5\][^"]*"[^>]*>\s*Explore Services\s*<\/button>/,
      `<a href="service-registration.html" class="bg-[#FFB7C5] text-white font-label-md text-label-md py-3 px-8 rounded-full hover:bg-primary-fixed-dim transition-colors petal-shadow inline-block text-center no-underline">Explore Services</a>`
    );
  }

  return out;
}

for (const page of pages) {
  const src = fs.readFileSync(path.join(exportDir, page.src), "utf8");
  const wired = wireNav(src, page.active);
  fs.writeFileSync(path.join(root, page.dest), wired, "utf8");
  console.log(`Wrote ${page.dest} (${wired.length} bytes)`);
}

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const toastStack = document.createElement("div");
  toastStack.className = "toast-stack";
  document.body.appendChild(toastStack);

  const veil = document.createElement("div");
  veil.className = "transition-veil";
  document.body.appendChild(veil);

  function toast(message) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    toastStack.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-out");
      setTimeout(() => el.remove(), 280);
    }, 3200);
  }

  function initScrollProgress() {
    const bar = document.querySelector(".scroll-progress");
    if (!bar) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = `${value}%`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initNavScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 16);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initReveal() {
    const items = [...document.querySelectorAll("[data-reveal]")];
    if (!items.length) return;
    if (reduceMotion) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el, i) => {
      if (el.parentElement?.hasAttribute("data-stagger")) {
        el.style.setProperty("--reveal-delay", `${Math.min(i % 6, 5) * 70}ms`);
      }
      observer.observe(el);
    });
  }

  function initParallax() {
    if (reduceMotion) return;
    const nodes = [...document.querySelectorAll("[data-parallax]")];
    if (!nodes.length) return;
    const update = () => {
      nodes.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const offset = (rect.top / window.innerHeight - 0.5) * Number(el.dataset.parallax || 12);
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero || reduceMotion) {
      document.querySelectorAll("[data-hero-item]").forEach((el) => el.classList.add("is-in"));
      return;
    }
    [...hero.querySelectorAll("[data-hero-item]")].forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${i * 110}ms`);
      requestAnimationFrame(() => el.classList.add("is-in"));
    });
  }

  function initDrawer() {
    const drawer = document.querySelector("#mobile-drawer");
    const toggle = document.querySelector("#mobile-menu-btn");
    const icon = document.querySelector(".menu-icon");
    if (!drawer || !toggle) return;

    const setOpen = (open) => {
      drawer.classList.toggle("is-open", open);
      icon?.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };

    toggle.addEventListener("click", () => setOpen(!drawer.classList.contains("is-open")));
    drawer.querySelector(".drawer-overlay")?.addEventListener("click", () => setOpen(false));
    drawer.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  }

  function initModals() {
    document.querySelectorAll("[data-open-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById(btn.dataset.openModal)?.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    });
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.querySelector(".modal-overlay")?.addEventListener("click", () => closeModal(modal));
      modal.querySelector("[data-close-modal]")?.addEventListener("click", () => closeModal(modal));
    });
  }

  function closeModal(modal) {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function initBrandHome() {
    document.querySelectorAll("a.brand-mark").forEach((link) => {
      link.setAttribute("href", "index.html");
      link.setAttribute("aria-label", "Kingdom of Cheria home");
    });
  }

  function initCounters() {
    const counters = [...document.querySelectorAll("[data-count]")];
    if (!counters.length) return;
    const animate = (el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      if (reduceMotion) {
        el.textContent = `${target}${suffix}`;
        return;
      }
      const start = performance.now();
      const duration = 900;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters
      .filter((el) => !el.dataset.counted && el.offsetParent)
      .forEach((el) => {
        el.dataset.counted = "1";
        observer.observe(el);
      });
  }

  function initRings() {
    document.querySelectorAll(".progress-ring .value").forEach((circle) => {
      const pct = Number(circle.dataset.progress || 0);
      const length = 113;
      circle.style.strokeDashoffset = String(length - (length * pct) / 100);
    });
  }

  function initTasks() {
    document.querySelectorAll("[data-task]").forEach((row) => {
      const box = row.querySelector("input[type='checkbox']");
      if (!box) return;
      row.classList.toggle("is-done", box.checked);
      box.addEventListener("change", () => {
        row.classList.toggle("is-done", box.checked);
        toast(box.checked ? "Status updated" : "Task reopened");
      });
    });
  }

  function initToggles() {
    document.querySelectorAll(".toggle").forEach((el) => {
      el.addEventListener("click", () => {
        el.classList.toggle("is-on");
        toast(el.classList.contains("is-on") ? "Alerts enabled" : "Alerts paused");
      });
    });
  }

  function initSearch() {
    const input = document.querySelector("[data-search]");
    const list = document.querySelector("[data-search-results]");
    if (!input || !list) return;
    const items = [...list.querySelectorAll(".search-result")];
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      items.forEach((item, i) => {
        const match = item.textContent.toLowerCase().includes(q);
        item.style.display = match || !q ? "" : "none";
        item.classList.remove("is-in");
        if (match || !q) {
          item.style.animationDelay = `${i * 50}ms`;
          requestAnimationFrame(() => item.classList.add("is-in"));
        }
      });
    });
    items.forEach((item, i) => {
      item.style.animationDelay = `${i * 50}ms`;
      item.classList.add("is-in");
    });
  }

  function getToken() {
    return sessionStorage.getItem("cheria_jwt") || "";
  }

  function setToken(token) {
    if (token) sessionStorage.setItem("cheria_jwt", token);
    else sessionStorage.removeItem("cheria_jwt");
    localStorage.removeItem("cheria_jwt");
  }

  function authHeaders() {
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async function readJson(response) {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { ok: false, error: "The registry returned an unexpected response." };
    }
  }

  function api(url, options = {}) {
    const headers = { ...authHeaders(), ...(options.headers || {}) };
    if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    return fetch(url, { credentials: "include", cache: "no-store", ...options, headers });
  }

  let stayOnSite = false;

  function goInternal(href) {
    stayOnSite = true;
    window.location.assign(href);
  }

  function logoutQuietly() {
    setToken("");
    try {
      navigator.sendBeacon("/api/logout");
    } catch {
      fetch("/api/logout", { method: "POST", credentials: "include", keepalive: true }).catch(() => {});
    }
  }

  async function signOut(redirect = "login.html") {
    stayOnSite = true;
    setToken("");
    await api("/api/logout", { method: "POST" }).catch(() => {});
    window.location.replace(redirect);
  }

  function routeAfterAuth(payload) {
    if (payload.token) setToken(payload.token);
    if (payload.citizen?.role === "admin") {
      goInternal("admin.html");
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    goInternal(next && /\.html$/i.test(next) ? next : "portal.html");
  }

  function initLeaveSiteLogout() {
    document.addEventListener(
      "click",
      (event) => {
        const link = event.target.closest("a[href]");
        if (!link) return;
        try {
          const url = new URL(link.href, window.location.href);
          if (url.origin === window.location.origin) stayOnSite = true;
        } catch {
          stayOnSite = true;
        }
      },
      true
    );

    window.addEventListener("pagehide", () => {
      if (stayOnSite) {
        stayOnSite = false;
        return;
      }
      logoutQuietly();
    });

    window.addEventListener("pageshow", (event) => {
      const gated = Boolean(
        document.getElementById("portal-workspace") || document.querySelector("[data-applications]")
      );
      if (!gated) return;
      if (event.persisted) {
        restoreSession().then(({ res, payload }) => {
          if (!res.ok || !payload.citizen) {
            stayOnSite = true;
            window.location.replace("login.html");
          }
        });
      }
    });
  }

  const REGIONS = {
    central_blossom: "Central Blossom District",
    eastern_woods: "Eastern Redwood Expanse",
    western_petals: "Western Petal Shores",
    northern_peaks: "Northern Serene Peaks",
  };

  function initForm() {
    const form = document.querySelector("[data-register-form]");
    if (!form) return;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector("[type='submit']");
      const original = submit.innerHTML;
      submit.disabled = true;
      submit.innerHTML = '<span class="skeleton" style="display:inline-block;width:72px;height:16px;"></span>';

      const data = Object.fromEntries(new FormData(form).entries());
      data.terms = Boolean(form.querySelector("[name='terms']")?.checked);
      delete data.role;
      delete data.status;
      delete data.admin;
      if (data.password_confirm && data.password !== data.password_confirm) {
        toast("Passwords do not match.");
        submit.disabled = false;
        submit.innerHTML = original;
        return;
      }
      delete data.password_confirm;

      try {
        const response = await api("/api/register", {
          method: "POST",
          body: JSON.stringify(data),
        });
        const payload = await readJson(response);
        if (!response.ok || !payload.ok) {
          toast(payload.error || "Registration could not be saved.");
          return;
        }
        toast("Account created. Complete your citizenship application.");
        routeAfterAuth(payload);
      } catch {
        toast("Could not reach the Cheria registry.");
      } finally {
        submit.disabled = false;
        submit.innerHTML = original;
      }
    });
  }

  function initLogin() {
    const form = document.querySelector("[data-login-form]");
    if (!form) return;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector("[type='submit']");
      const original = submit.innerHTML;
      submit.disabled = true;
      try {
        const data = Object.fromEntries(new FormData(form).entries());
        const response = await api("/api/login", {
          method: "POST",
          body: JSON.stringify(data),
        });
        const payload = await readJson(response);
        if (!response.ok || !payload.ok) {
          toast(payload.error || "Could not sign in.");
          return;
        }
        routeAfterAuth(payload);
      } catch {
        toast("Could not reach the Cheria registry.");
      } finally {
        submit.disabled = false;
        submit.innerHTML = original;
      }
    });
  }

  function bindLogout() {
    document.querySelectorAll("[data-logout]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        signOut("login.html");
      });
    });
  }

  function restoreSession() {
    return api("/api/me")
      .then(async (res) => ({ res, payload: await readJson(res) }))
      .then(({ res, payload }) => {
        if (res.ok && payload.ok && payload.token) setToken(payload.token);
        return { res, payload };
      })
      .catch(() => ({ res: { ok: false, status: 0 }, payload: {} }));
  }

  function fillCitizen(citizen) {
    document.querySelectorAll("[data-citizen-name]").forEach((name) => {
      name.textContent = `Welcome, ${citizen.given_name} ${citizen.family_name}`;
    });
    document.querySelectorAll("[data-citizen-meta]").forEach((meta) => {
      const region = REGIONS[citizen.region] || citizen.region || "Cheria";
      meta.textContent = `${citizen.email} · ${region}`;
    });
    document.querySelectorAll("[data-review-note]").forEach((note) => {
      if (citizen.review_note) note.textContent = citizen.review_note;
    });
  }

  function needsApplication(citizen) {
    return citizen.status === "registered" || (citizen.status === "pending" && !citizen.applied_at);
  }

  function hidePortalSections(sections) {
    sections.forEach((el) => el?.classList.add("hidden"));
  }

  function showPortalSection(el, asFlex = false) {
    if (!el) return;
    el.classList.remove("hidden");
    if (asFlex) el.classList.add("flex");
  }

  function initApplicationForm() {
    const form = document.querySelector("[data-application-form]");
    if (!form) return;

    const knows = form.querySelector("#knows_official");
    const fields = form.querySelector("[data-official-fields]");
    const officialSelect = form.querySelector("#official_name");
    const recommendation = form.querySelector("#recommendation");

    const syncOfficialFields = () => {
      const on = Boolean(knows?.checked);
      fields?.classList.toggle("hidden", !on);
      if (officialSelect) officialSelect.required = on;
      if (recommendation) recommendation.required = on;
      if (!on) {
        if (officialSelect) officialSelect.value = "";
        if (recommendation) recommendation.value = "";
      }
    };

    knows?.addEventListener("change", syncOfficialFields);
    syncOfficialFields();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector("[type='submit']");
      const original = submit.innerHTML;
      submit.disabled = true;
      try {
        const data = Object.fromEntries(new FormData(form).entries());
        data.knows_official = Boolean(knows?.checked);
        const response = await api("/api/application", {
          method: "POST",
          body: JSON.stringify(data),
        });
        const payload = await readJson(response);
        if (!response.ok || !payload.ok) {
          toast(payload.error || "Could not submit your application.");
          return;
        }
        toast("Citizenship application submitted for ministry review.");
        window.location.reload();
      } catch {
        toast("Could not reach the Cheria registry.");
      } finally {
        submit.disabled = false;
        submit.innerHTML = original;
      }
    });
  }

  function initPortal() {
    const application = document.getElementById("portal-application");
    const pending = document.getElementById("portal-pending");
    const rejected = document.getElementById("portal-rejected");
    const barred = document.getElementById("portal-barred");
    const workspace = document.getElementById("portal-workspace");
    if (!application || !pending || !rejected || !workspace) return;

    restoreSession().then(({ res, payload }) => {
        if (!res.ok || !payload.ok || !payload.citizen) {
          if (res.status === 401) {
            goInternal("login.html?next=portal.html");
          } else {
            toast("Could not open your portal.");
          }
          return;
        }
        const citizen = payload.citizen;
        if (citizen.role === "admin") {
          goInternal("admin.html");
          return;
        }
        fillCitizen(citizen);
        hidePortalSections([application, pending, rejected, workspace, barred]);

        if (citizen.blacklisted) {
          showPortalSection(barred, true);
          initReveal();
          return;
        }

        if (citizen.status === "approved") {
          showPortalSection(workspace, true);
          initCounters();
          initRings();
          initReveal();
          return;
        }
        if (citizen.status === "rejected") {
          showPortalSection(rejected, true);
          initReveal();
          return;
        }
        if (needsApplication(citizen)) {
          showPortalSection(application);
          initApplicationForm();
          initReveal();
          return;
        }
        showPortalSection(pending, true);
        initReveal();
      });
  }

  function statusLabel(status) {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    if (status === "registered") return "Registered only";
    return "Pending review";
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function applicationDetails(app) {
    return `
      <div class="mt-4 pt-4 border-t border-outline-variant/20 space-y-3 text-sm">
        <p><span class="font-label-md text-label-md text-secondary">Current citizenship:</span> ${escapeHtml(app.current_citizenship)}</p>
        <p><span class="font-label-md text-label-md text-secondary">Dual citizenship reason:</span> ${escapeHtml(app.dual_citizenship_reason)}</p>
        <p><span class="font-label-md text-label-md text-secondary">Leadership qualities:</span> ${escapeHtml(app.leadership_qualities)}</p>
        <p><span class="font-label-md text-label-md text-secondary">Why Cheria:</span> ${escapeHtml(app.join_reason)}</p>
        ${
          app.knows_official
            ? `<p><span class="font-label-md text-label-md text-secondary">Known official:</span> ${escapeHtml(app.official_name)}</p>
               <p><span class="font-label-md text-label-md text-secondary">Recommendation:</span> ${escapeHtml(app.recommendation)}</p>`
            : `<p class="text-on-surface-variant">No cofather or minister recommendation supplied.</p>`
        }
        <p class="text-on-surface-variant">Submitted ${escapeHtml(formatDate(app.applied_at))}</p>
      </div>`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initAdmin() {
    const list = document.querySelector("[data-applications]");
    if (!list) return;

    const rank = (status) => {
      if (status === "pending") return 0;
      if (status === "registered") return 1;
      if (status === "approved") return 2;
      return 3;
    };

    const render = (applications) => {
      const rows = [...applications].sort((a, b) => rank(a.status) - rank(b.status));
      if (!rows.length) {
        list.innerHTML = '<p class="text-on-surface-variant">No citizenship applications have been submitted yet.</p>';
        return;
      }
      list.innerHTML = rows
        .map((app) => {
          const region = REGIONS[app.region] || app.region;
          const dob = String(app.dob || "").slice(0, 10);
          const pending = app.status === "pending" || app.status === "registered";
          const hasDossier = Boolean(app.join_reason || app.current_citizenship);
          return `
            <article class="card-lift bg-surface-container-lowest rounded-xl p-6 border border-primary-container/30" data-reveal style="border-top:4px solid #8B0000" data-app="${escapeHtml(app.id)}">
              <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div class="flex-1">
                  <p class="font-label-md text-label-md text-secondary uppercase tracking-widest mb-1">${statusLabel(app.status)}</p>
                  <h2 class="font-headline-md text-headline-md text-primary">${escapeHtml(app.given_name)} ${escapeHtml(app.family_name)}</h2>
                  <p class="text-on-surface-variant mt-1">${escapeHtml(app.email)}</p>
                  <p class="text-on-surface-variant mt-2">${escapeHtml(region)} · Born ${escapeHtml(dob || "—")}</p>
                  <p class="text-on-surface-variant mt-2">${escapeHtml(app.address || "No residential address given.")}</p>
                  ${hasDossier ? applicationDetails(app) : '<p class="mt-4 text-on-surface-variant">Account registered; citizenship dossier not completed yet.</p>'}
                  ${app.review_note ? `<p class="mt-3 text-secondary font-label-md text-label-md">Ministry note: ${escapeHtml(app.review_note)}</p>` : ""}
                </div>
                ${
                  pending
                    ? `<div class="flex flex-col gap-2 min-w-[180px]">
                        <button class="btn btn-wood py-2 px-4 font-label-md text-label-md" type="button" data-review="approve">Approve citizenship</button>
                        <button class="btn btn-ghost py-2 px-4 font-label-md text-label-md" type="button" data-review="reject">Reject</button>
                        <button class="btn btn-ghost py-2 px-4 font-label-md text-label-md" type="button" data-blacklist-add>Blacklist</button>
                        <input class="form-input-cheria rounded-lg px-3 py-2" data-note placeholder="Review note (optional)">
                      </div>`
                    : `<div class="flex flex-col gap-2 min-w-[180px]">
                        <button class="btn btn-ghost py-2 px-4 font-label-md text-label-md" type="button" data-blacklist-add>Blacklist</button>
                      </div>`
                }
              </div>
            </article>`;
        })
        .join("");
      initReveal();
    };

    const load = () =>
      api("/api/admin-applications")
        .then(async (res) => ({ res, payload: await readJson(res) }))
        .then(({ res, payload }) => {
          if (res.status === 401) {
            goInternal("login.html?next=admin.html");
            return;
          }
          if (res.status === 403) {
            toast(payload.error || "Admin access only.");
            goInternal("portal.html");
            return;
          }
          if (!res.ok || !payload.ok) {
            const message = payload.error || "Could not load applications.";
            list.innerHTML = `<p class="text-on-surface-variant">${escapeHtml(message)}</p>`;
            toast(message);
            return;
          }
          const name = document.querySelector("[data-admin-name]");
          const apps = payload.applications || [];
          if (name) name.textContent = `Citizenship review (${apps.length})`;
          render(apps);
        })
        .catch(() => {
          list.innerHTML = '<p class="text-on-surface-variant">Could not reach the registry.</p>';
        });

    list.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-review]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const card = button.closest("[data-app]");
      const id = card?.getAttribute("data-app");
      const action = button.getAttribute("data-review");
      const note = card?.querySelector("[data-note]")?.value || "";
      if (!id) return;
      button.disabled = true;
      try {
        const response = await api("/api/admin-review", {
          method: "POST",
          body: JSON.stringify({ id, action, note }),
        });
        const payload = await readJson(response);
        if (!response.ok || !payload.ok) {
          toast(payload.error || "Could not update the application.");
          return;
        }
        toast(action === "approve" ? "Citizenship granted." : "Application rejected.");
        await load();
        await loadBlacklist();
        await loadCitizens();
      } catch {
        toast("Could not reach the registry.");
      } finally {
        button.disabled = false;
      }
    });

    const blacklistBox = document.querySelector("[data-blacklist]");
    const blacklistForm = document.querySelector("[data-blacklist-form]");
    const blacklistSelect = document.querySelector("[data-blacklist-select]");

    const renderBlacklist = (entries) => {
      if (!blacklistBox) return;
      if (!entries.length) {
        blacklistBox.innerHTML = '<p class="text-on-surface-variant">No registered individuals are currently blacklisted.</p>';
        return;
      }
      blacklistBox.innerHTML = entries
        .map((person) => `
          <article class="card-lift bg-surface-container-lowest rounded-xl p-6 border border-primary-container/30" data-reveal style="border-top:4px solid #8B0000" data-blacklist-id="${escapeHtml(person.id)}">
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <p class="font-label-md text-label-md text-secondary uppercase tracking-widest mb-1">Blacklisted</p>
                <h3 class="font-headline-md text-headline-md text-primary">${escapeHtml(person.given_name)} ${escapeHtml(person.family_name)}</h3>
                <p class="text-on-surface-variant mt-1">${escapeHtml(person.email)}</p>
                <p class="text-on-surface-variant mt-2">${escapeHtml(statusLabel(person.status))} · ${escapeHtml(formatDate(person.blacklisted_at))}</p>
                ${person.blacklist_note ? `<p class="mt-2 text-secondary">Reason: ${escapeHtml(person.blacklist_note)}</p>` : ""}
              </div>
              <button class="btn btn-ghost py-2 px-4 font-label-md text-label-md" type="button" data-blacklist-remove>Remove from blacklist</button>
            </div>
          </article>`)
        .join("");
      initReveal();
    };

    const fillBlacklistSelect = (registered) => {
      if (!blacklistSelect) return;
      const current = blacklistSelect.value;
      blacklistSelect.innerHTML =
        '<option value="">Select a person</option>' +
        registered
          .map(
            (person) =>
              `<option value="${escapeHtml(person.id)}">${escapeHtml(person.given_name)} ${escapeHtml(person.family_name)} — ${escapeHtml(person.email)}</option>`
          )
          .join("");
      if ([...blacklistSelect.options].some((opt) => opt.value === current)) {
        blacklistSelect.value = current;
      }
    };

    const loadCitizens = () => {
      const box = document.querySelector("[data-citizens]");
      if (!box) return Promise.resolve();
      return api("/api/admin-citizens")
        .then(async (res) => ({ res, payload: await readJson(res) }))
        .then(({ res, payload }) => {
          if (!res.ok || !payload.ok) {
            box.innerHTML = `<p class="text-on-surface-variant">${escapeHtml(payload.error || "Could not load citizens.")}</p>`;
            return;
          }
          const citizens = payload.citizens || [];
          if (!citizens.length) {
            box.innerHTML = '<p class="text-on-surface-variant">No citizenships have been granted yet.</p>';
            return;
          }
          box.innerHTML = citizens
            .map((person) => {
              const region = REGIONS[person.region] || person.region || "Cheria";
              return `
                <article class="card-lift bg-surface-container-lowest rounded-xl p-6 border border-primary-container/30" data-reveal style="border-top:4px solid #8B0000">
                  <p class="font-label-md text-label-md text-secondary uppercase tracking-widest mb-1">Citizen</p>
                  <h3 class="font-headline-md text-headline-md text-primary">${escapeHtml(person.given_name)} ${escapeHtml(person.family_name)}</h3>
                  <p class="text-on-surface-variant mt-1">${escapeHtml(person.email)}</p>
                  <p class="text-on-surface-variant mt-2">${escapeHtml(region)}</p>
                </article>`;
            })
            .join("");
          initReveal();
        })
        .catch(() => {
          box.innerHTML = '<p class="text-on-surface-variant">Could not load citizens.</p>';
        });
    };

    const loadBlacklist = () => {
      if (!blacklistBox) return Promise.resolve();
      return api("/api/admin-blacklist")
        .then(async (res) => ({ res, payload: await readJson(res) }))
        .then(({ res, payload }) => {
          if (!res.ok || !payload.ok) {
            const message = payload.error || "Could not load the blacklist.";
            blacklistBox.innerHTML = `<p class="text-on-surface-variant">${escapeHtml(message)}</p>`;
            return;
          }
          fillBlacklistSelect(payload.registered || []);
          renderBlacklist(payload.blacklisted || []);
        })
        .catch(() => {
          blacklistBox.innerHTML = '<p class="text-on-surface-variant">Could not load the blacklist.</p>';
        });
    };

    const updateBlacklist = async (body, successMessage) => {
      const response = await api("/api/admin-blacklist", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const payload = await readJson(response);
      if (!response.ok || !payload.ok) {
        toast(payload.error || "Could not update the blacklist.");
        return false;
      }
      toast(successMessage);
      await load();
      await loadBlacklist();
      await loadCitizens();
      return true;
    };

    list.addEventListener("click", async (event) => {
      const addBtn = event.target.closest("[data-blacklist-add]");
      if (!addBtn) return;
      event.preventDefault();
      event.stopPropagation();
      const card = addBtn.closest("[data-app]");
      const id = card?.getAttribute("data-app");
      const note = card?.querySelector("[data-note]")?.value || "";
      if (!id) return;
      addBtn.disabled = true;
      try {
        await updateBlacklist({ id, action: "add", note }, "Individual added to the blacklist.");
      } catch {
        toast("Could not reach the registry.");
      } finally {
        addBtn.disabled = false;
      }
    });

    blacklistBox?.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-blacklist-remove]");
      if (!button) return;
      const card = button.closest("[data-blacklist-id]");
      const id = card?.getAttribute("data-blacklist-id");
      if (!id) return;
      button.disabled = true;
      try {
        await updateBlacklist({ id, action: "remove" }, "Individual removed from the blacklist.");
      } catch {
        toast("Could not reach the registry.");
      } finally {
        button.disabled = false;
      }
    });

    blacklistForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = blacklistForm.querySelector("[type='submit']");
      const data = Object.fromEntries(new FormData(blacklistForm).entries());
      if (!data.id) {
        toast("Select a registered individual.");
        return;
      }
      submit.disabled = true;
      try {
        const ok = await updateBlacklist(
          { id: data.id, action: "add", note: data.note || "" },
          "Individual added to the blacklist."
        );
        if (ok) blacklistForm.reset();
      } catch {
        toast("Could not reach the registry.");
      } finally {
        submit.disabled = false;
      }
    });

    restoreSession().then(({ res, payload }) => {
      if (res.status === 401 || !payload.citizen) {
        goInternal("login.html?next=admin.html");
        return;
      }
      if (payload.citizen.role !== "admin") {
        toast("Admin access only.");
        goInternal("portal.html");
        return;
      }
      load();
      loadBlacklist();
      loadCitizens();
    });
  }

  function initCitizens() {
    const list = document.querySelector("[data-public-citizens]");
    if (!list) return;
    api("/api/citizens")
      .then(async (res) => ({ res, payload: await readJson(res) }))
      .then(({ res, payload }) => {
        if (!res.ok || !payload.ok) {
          list.innerHTML = `<p class="text-on-surface-variant">${escapeHtml(payload.error || "Could not load the citizen roll.")}</p>`;
          return;
        }
        const citizens = payload.citizens || [];
        if (!citizens.length) {
          list.innerHTML = '<p class="text-on-surface-variant md:col-span-3">No citizenships have been granted yet.</p>';
          return;
        }
        list.innerHTML = citizens
          .map((person) => {
            const region = REGIONS[person.region] || person.region || "Cheria";
            const initials = `${(person.given_name || "C").slice(0, 1)}${(person.family_name || "").slice(0, 1)}`.toUpperCase();
            return `
              <article class="card-lift bg-surface-container-lowest border border-primary-container/50 rounded-xl p-6" data-reveal style="border-top:4px solid #8B0000">
                <div class="w-14 h-14 rounded-full mb-4 bg-primary-container text-on-primary-container flex items-center justify-center font-headline-md">${escapeHtml(initials)}</div>
                <p class="font-label-md text-label-md text-secondary uppercase tracking-widest mb-1">Citizen</p>
                <h2 class="font-headline-md text-headline-md text-primary">${escapeHtml(person.given_name)} ${escapeHtml(person.family_name)}</h2>
                <p class="text-on-surface-variant mt-2">${escapeHtml(region)}</p>
              </article>`;
          })
          .join("");
        initReveal();
      })
      .catch(() => {
        list.innerHTML = '<p class="text-on-surface-variant">Could not load the citizen roll.</p>';
      });
  }

  function initTooltips() {
    document.querySelectorAll("[data-tooltip]").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        if (el.querySelector(".tooltip")) return;
        const tip = document.createElement("span");
        tip.className = "tooltip absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-on-surface text-white text-caption px-3 py-1 opacity-0 translate-y-1 pointer-events-none";
        tip.textContent = el.dataset.tooltip;
        el.classList.add("relative");
        el.appendChild(tip);
        requestAnimationFrame(() => {
          tip.style.transition = "opacity 180ms cubic-bezier(0.22,1,0.36,1), transform 180ms cubic-bezier(0.22,1,0.36,1)";
          tip.style.opacity = "1";
          tip.style.transform = "translate(-50%, 0)";
        });
      });
      el.addEventListener("mouseleave", () => {
        el.querySelector(".tooltip")?.remove();
      });
    });
  }

  initScrollProgress();
  initNavScroll();
  initHero();
  initReveal();
  initParallax();
  initDrawer();
  initModals();
  initBrandHome();
  initCounters();
  initRings();
  initTasks();
  initToggles();
  initSearch();
  initForm();
  initLogin();
  initPortal();
  initAdmin();
  initCitizens();
  bindLogout();
  initLeaveSiteLogout();
  initTooltips();
  if (!document.getElementById("portal-workspace") && !document.querySelector("[data-applications]")) {
    restoreSession();
  }
})();

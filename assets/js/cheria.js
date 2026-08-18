(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PAGE_LINKS = "a[href$='.html']";

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

  function homeUrl() {
    return new URL("index.html", window.location.href).href;
  }

  function goHome() {
    window.location.assign(homeUrl());
  }

  function navigate(href) {
    const next = new URL(href, window.location.href);
    if (next.origin === window.location.origin && next.pathname === window.location.pathname) {
      return;
    }
    window.location.assign(href);
  }

  function initBrandHome() {
    document.querySelectorAll("a.brand-mark").forEach((link) => {
      link.setAttribute("href", "index.html");
      link.setAttribute("aria-label", "Kingdom of Cheria home");
      link.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        goHome();
      });
    });
  }

  function initPageTransitions() {
    document.querySelectorAll(PAGE_LINKS).forEach((link) => {
      if (link.classList.contains("brand-mark")) return;
      link.addEventListener("click", (event) => {
        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) return;
        event.preventDefault();
        navigate(url.href);
      });
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
    return localStorage.getItem("cheria_jwt") || "";
  }

  function setToken(token) {
    if (token) localStorage.setItem("cheria_jwt", token);
    else localStorage.removeItem("cheria_jwt");
  }

  function authHeaders() {
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  function api(url, options = {}) {
    const headers = { ...authHeaders(), ...(options.headers || {}) };
    if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    return fetch(url, { credentials: "include", ...options, headers });
  }

  async function signOut(redirect = "login.html") {
    setToken("");
    await api("/api/logout", { method: "POST" }).catch(() => {});
    window.location.assign(redirect);
  }

  function routeAfterAuth(payload) {
    if (payload.token) setToken(payload.token);
    if (payload.citizen?.role === "admin") {
      window.location.assign("admin.html");
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.assign(next && /\.html$/i.test(next) ? next : "portal.html");
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
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.ok) {
          toast(payload.error || "Registration could not be saved.");
          return;
        }
        toast("Account created. Complete your citizenship application.");
        routeAfterAuth(payload);
      } catch {
        toast("Could not reach the Cheria registry. Start the local API server.");
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
        const payload = await response.json().catch(() => ({}));
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
      btn.addEventListener("click", () => signOut("login.html"));
    });
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
        const payload = await response.json().catch(() => ({}));
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
    const workspace = document.getElementById("portal-workspace");
    if (!application || !pending || !rejected || !workspace) return;

    if (!getToken()) {
      window.location.assign("login.html?next=portal.html");
      return;
    }

    api("/api/me")
      .then((res) => res.json().then((payload) => ({ res, payload })))
      .then(({ res, payload }) => {
        if (!res.ok || !payload.ok || !payload.citizen) {
          setToken("");
          window.location.assign("login.html?next=portal.html");
          return;
        }
        const citizen = payload.citizen;
        if (citizen.role === "admin") {
          window.location.assign("admin.html");
          return;
        }
        fillCitizen(citizen);
        hidePortalSections([application, pending, rejected, workspace]);

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
      })
      .catch(() => {
        toast("Could not open your portal.");
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

    if (!getToken()) {
      window.location.assign("login.html?next=admin.html");
      return;
    }

    const render = (applications) => {
      if (!applications.length) {
        list.innerHTML = '<p class="text-on-surface-variant">No citizenship applications have been submitted yet.</p>';
        return;
      }
      list.innerHTML = applications
        .map((app) => {
          const region = REGIONS[app.region] || app.region;
          const dob = String(app.dob || "").slice(0, 10);
          const pending = app.status === "pending";
          return `
            <article class="card-lift bg-surface-container-lowest rounded-xl p-6 border border-primary-container/30" data-reveal style="border-top:4px solid #8B0000" data-app="${escapeHtml(app.id)}">
              <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div class="flex-1">
                  <p class="font-label-md text-label-md text-secondary uppercase tracking-widest mb-1">${statusLabel(app.status)}</p>
                  <h2 class="font-headline-md text-headline-md text-primary">${escapeHtml(app.given_name)} ${escapeHtml(app.family_name)}</h2>
                  <p class="text-on-surface-variant mt-1">${escapeHtml(app.email)}</p>
                  <p class="text-on-surface-variant mt-2">${escapeHtml(region)} · Born ${escapeHtml(dob || "—")}</p>
                  <p class="text-on-surface-variant mt-2">${escapeHtml(app.address || "No residential address given.")}</p>
                  ${applicationDetails(app)}
                  ${app.review_note ? `<p class="mt-3 text-secondary font-label-md text-label-md">Ministry note: ${escapeHtml(app.review_note)}</p>` : ""}
                </div>
                ${
                  pending
                    ? `<div class="flex flex-col gap-2 min-w-[180px]">
                        <button class="btn btn-wood py-2 px-4 font-label-md text-label-md" type="button" data-review="approve">Approve citizenship</button>
                        <button class="btn btn-ghost py-2 px-4 font-label-md text-label-md" type="button" data-review="reject">Reject</button>
                        <input class="form-input-cheria rounded-lg px-3 py-2" data-note placeholder="Review note (optional)">
                      </div>`
                    : ""
                }
              </div>
            </article>`;
        })
        .join("");
      initReveal();
    };

    const load = () =>
      api("/api/admin/applications")
        .then((res) => res.json().then((payload) => ({ res, payload })))
        .then(({ res, payload }) => {
          if (res.status === 401) {
            setToken("");
            window.location.assign("login.html?next=admin.html");
            return;
          }
          if (res.status === 403) {
            toast(payload.error || "Admin access only.");
            window.location.assign("portal.html");
            return;
          }
          if (!res.ok || !payload.ok) {
            toast(payload.error || "Could not load applications.");
            return;
          }
          const name = document.querySelector("[data-admin-name]");
          if (name) name.textContent = `Citizenship review (${payload.applications?.length || 0})`;
          render(payload.applications || []);
        });

    list.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-review]");
      if (!button) return;
      const card = button.closest("[data-app]");
      const id = card?.getAttribute("data-app");
      const action = button.getAttribute("data-review");
      const note = card?.querySelector("[data-note]")?.value || "";
      if (!id) return;
      button.disabled = true;
      try {
        const response = await api("/api/admin/review", {
          method: "POST",
          body: JSON.stringify({ id, action, note }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.ok) {
          toast(payload.error || "Could not update the application.");
          return;
        }
        toast(action === "approve" ? "Citizenship granted." : "Application rejected.");
        await load();
      } catch {
        toast("Could not reach the registry.");
      } finally {
        button.disabled = false;
      }
    });

    load();
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
  initPageTransitions();
  initCounters();
  initRings();
  initTasks();
  initToggles();
  initSearch();
  initForm();
  initLogin();
  initPortal();
  initAdmin();
  bindLogout();
  initTooltips();
})();

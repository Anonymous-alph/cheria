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
    counters.forEach((el) => observer.observe(el));
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

      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.ok) {
          toast(payload.error || "Registration could not be saved.");
          return;
        }
        toast("Registration received. Welcome to Cheria.");
        form.reset();
      } catch {
        toast("Could not reach the Cheria registry. Start the local API server.");
      } finally {
        submit.disabled = false;
        submit.innerHTML = original;
      }
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
  initPageTransitions();
  initCounters();
  initRings();
  initTasks();
  initToggles();
  initSearch();
  initForm();
  initTooltips();
})();

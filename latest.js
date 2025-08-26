
document.addEventListener("DOMContentLoaded", function () {
    const viewMoreButtons = document.querySelectorAll(".view-more-btn");
  
    viewMoreButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const specs = this.nextElementSibling;
        specs.classList.toggle("hidden");
  
        // Change button text
        if (specs.classList.contains("hidden")) {
          this.textContent = "View More";
        } else {
          this.textContent = "View Less";
        }
      });
    });
  
    // add tilt + parallax to cards
    const cards = document.querySelectorAll(".phone-card");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cards.forEach((card) => {
      if (prefersReduced) return;
      card.style.transformStyle = "preserve-3d";
      card.style.transition = "transform .18s cubic-bezier(.2,.9,.25,1), box-shadow .18s";
      let rafId = null;
      let target = { rx: 0, ry: 0, tx: 0, ty: 0 };
      let current = { rx: 0, ry: 0, tx: 0, ty: 0 };
      function update() {
        // simple easing
        current.rx += (target.rx - current.rx) * 0.14;
        current.ry += (target.ry - current.ry) * 0.14;
        current.tx += (target.tx - current.tx) * 0.14;
        current.ty += (target.ty - current.ty) * 0.14;
        card.style.transform =
          `perspective(900px) rotateX(${current.rx}deg) rotateY(${current.ry}deg) translate3d(${current.tx}px, ${current.ty}px, 0)`;
        rafId = requestAnimationFrame(update);
      }
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width; // 0..1
        const py = (e.clientY - r.top) / r.height;
        const ry = (px - 0.5) * 12; // rotateY
        const rx = (0.5 - py) * 12; // rotateX
        const tx = (px - 0.5) * 10; // translateX
        const ty = (py - 0.5) * 6; // translateY
        target.rx = rx;
        target.ry = ry;
        target.tx = tx;
        target.ty = ty;
        if (!rafId) update();
      });
      card.addEventListener("mouseleave", () => {
        target = { rx: 0, ry: 0, tx: 0, ty: 0 };
        // allow one last settle then cancel
        setTimeout(() => {
          cancelAnimationFrame(rafId);
          rafId = null;
        }, 220);
      });
    });
  
    // subtle accent gradient hue animation (updates CSS vars)
    if (!prefersReduced) {
      const root = document.documentElement;
      let hue = 160; // start
      let dir = 1;
      function animateHue() {
        hue += 0.2 * dir;
        if (hue > 320) dir = -1;
        if (hue < 100) dir = 1;
        const accent = `hsl(${Math.round(hue)}, 85%, 50%)`;
        const accent2 = `hsl(${Math.round((hue + 40) % 360)}, 78%, 46%)`;
        root.style.setProperty("--accent", accent);
        root.style.setProperty("--accent-2", accent2);
        requestAnimationFrame(animateHue);
      }
      requestAnimationFrame(animateHue);
    }
  
    // canvas particle background (very subtle, behind content)
    if (!prefersReduced && window.innerWidth > 720) {
      const canvas = document.createElement("canvas");
      canvas.style.position = "fixed";
      canvas.style.inset = "0";
      canvas.style.zIndex = "0";
      canvas.style.pointerEvents = "none";
      canvas.style.opacity = "0.14";
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      let w, h, particles;
      function resize() {
        w = canvas.width = innerWidth;
        h = canvas.height = innerHeight;
        initParticles();
      }
      function initParticles() {
        particles = [];
        const count = Math.round((w * h) / 120000); // scale with screen
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.6 + Math.random() * 2.2,
            vx: (Math.random() - 0.5) * 0.15,
            vy: -0.15 - Math.random() * 0.25,
            alpha: 0.12 + Math.random() * 0.28
          });
        }
      }
      function tick() {
        ctx.clearRect(0, 0, w, h);
        for (let p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10) p.y = h + 10;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          ctx.beginPath();
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          g.addColorStop(0, `rgba(0,224,211,${p.alpha})`);
          g.addColorStop(0.7, `rgba(0,181,201,${p.alpha * 0.14})`);
          g.addColorStop(1, `rgba(0,0,0,0)`);
          ctx.fillStyle = g;
          ctx.fillRect(p.x - p.r * 6, p.y - p.r * 6, p.r * 12, p.r * 12);
        }
        requestAnimationFrame(tick);
      }
      addEventListener("resize", resize);
      resize();
      requestAnimationFrame(tick);
      // keep main content above canvas
      document.querySelectorAll(".container, .navbar, header, footer, .phone-container").forEach(el => {
        const z = window.getComputedStyle(el).zIndex;
        if (!z || z === "auto" || Number(z) <= 0) el.style.zIndex = 2;
      });
    }
  
    // inject tiny shimmer css for phone images (only when motion not reduced)
    if (!prefersReduced) {
      const style = document.createElement("style");
      style.textContent = `
        @keyframes tb-shimmer{ 0%{ transform: translateX(-120%);} 100%{ transform: translateX(120%);} }
        .phone-img::after{
          content:"";
          position:absolute;
          inset:0;
          border-radius:10px;
          pointer-events:none;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0) 100%);
          transform: translateX(-120%);
          animation: tb-shimmer 2.6s linear infinite;
          mix-blend-mode: overlay;
        }
        .phone-img{ position: relative; overflow: hidden; }
      `;
      document.head.appendChild(style);
    }
  });
  
  // Sample alert when button is clicked
  function showAlert() {
    alert("Thanks for your interest! Feature coming soon...");
  }  

// Toggle phone specs section
document.addEventListener("DOMContentLoaded", function () {
    const viewMoreButtons = document.querySelectorAll(".view-more-btn");
  
    viewMoreButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const specs = this.nextElementSibling;
        specs.classList.toggle("hidden");
  
        // Change button text
        if (specs.classList.contains("hidden")) {
          this.textContent = "View More";
        } else {
          this.textContent = "View Less";
        }
      });
    });
  
    // add tilt + parallax to cards
    const cards = document.querySelectorAll(".phone-card");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cards.forEach((card) => {
      if (prefersReduced) return;
      card.style.transformStyle = "preserve-3d";
      card.style.transition = "transform .18s cubic-bezier(.2,.9,.25,1), box-shadow .18s";
      let rafId = null;
      let target = { rx: 0, ry: 0, tx: 0, ty: 0 };
      let current = { rx: 0, ry: 0, tx: 0, ty: 0 };
      function update() {
        // simple easing
        current.rx += (target.rx - current.rx) * 0.14;
        current.ry += (target.ry - current.ry) * 0.14;
        current.tx += (target.tx - current.tx) * 0.14;
        current.ty += (target.ty - current.ty) * 0.14;
        card.style.transform =
          `perspective(900px) rotateX(${current.rx}deg) rotateY(${current.ry}deg) translate3d(${current.tx}px, ${current.ty}px, 0)`;
        rafId = requestAnimationFrame(update);
      }
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width; // 0..1
        const py = (e.clientY - r.top) / r.height;
        const ry = (px - 0.5) * 12; // rotateY
        const rx = (0.5 - py) * 12; // rotateX
        const tx = (px - 0.5) * 10; // translateX
        const ty = (py - 0.5) * 6; // translateY
        target.rx = rx;
        target.ry = ry;
        target.tx = tx;
        target.ty = ty;
        if (!rafId) update();
      });
      card.addEventListener("mouseleave", () => {
        target = { rx: 0, ry: 0, tx: 0, ty: 0 };
        // allow one last settle then cancel
        setTimeout(() => {
          cancelAnimationFrame(rafId);
          rafId = null;
        }, 220);
      });
    });
  
    // subtle accent gradient hue animation (updates CSS vars)
    if (!prefersReduced) {
      const root = document.documentElement;
      let hue = 160; // start
      let dir = 1;
      function animateHue() {
        hue += 0.2 * dir;
        if (hue > 320) dir = -1;
        if (hue < 100) dir = 1;
        const accent = `hsl(${Math.round(hue)}, 85%, 50%)`;
        const accent2 = `hsl(${Math.round((hue + 40) % 360)}, 78%, 46%)`;
        root.style.setProperty("--accent", accent);
        root.style.setProperty("--accent-2", accent2);
        requestAnimationFrame(animateHue);
      }
      requestAnimationFrame(animateHue);
    }
  
    // canvas particle background (very subtle, behind content)
    if (!prefersReduced && window.innerWidth > 720) {
      const canvas = document.createElement("canvas");
      canvas.style.position = "fixed";
      canvas.style.inset = "0";
      canvas.style.zIndex = "0";
      canvas.style.pointerEvents = "none";
      canvas.style.opacity = "0.14";
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      let w, h, particles;
      function resize() {
        w = canvas.width = innerWidth;
        h = canvas.height = innerHeight;
        initParticles();
      }
      function initParticles() {
        particles = [];
        const count = Math.round((w * h) / 120000); // scale with screen
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.6 + Math.random() * 2.2,
            vx: (Math.random() - 0.5) * 0.15,
            vy: -0.15 - Math.random() * 0.25,
            alpha: 0.12 + Math.random() * 0.28
          });
        }
      }
      function tick() {
        ctx.clearRect(0, 0, w, h);
        for (let p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10) p.y = h + 10;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          ctx.beginPath();
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          g.addColorStop(0, `rgba(0,224,211,${p.alpha})`);
          g.addColorStop(0.7, `rgba(0,181,201,${p.alpha * 0.14})`);
          g.addColorStop(1, `rgba(0,0,0,0)`);
          ctx.fillStyle = g;
          ctx.fillRect(p.x - p.r * 6, p.y - p.r * 6, p.r * 12, p.r * 12);
        }
        requestAnimationFrame(tick);
      }
      addEventListener("resize", resize);
      resize();
      requestAnimationFrame(tick);
      // keep main content above canvas
      document.querySelectorAll(".container, .navbar, header, footer, .phone-container").forEach(el => {
        const z = window.getComputedStyle(el).zIndex;
        if (!z || z === "auto" || Number(z) <= 0) el.style.zIndex = 2;
      });
    }
  
    // inject tiny shimmer css for phone images (only when motion not reduced)
    if (!prefersReduced) {
      const style = document.createElement("style");
      style.textContent = `
        @keyframes tb-shimmer{ 0%{ transform: translateX(-120%);} 100%{ transform: translateX(120%);} }
        .phone-img::after{
          content:"";
          position:absolute;
          inset:0;
          border-radius:10px;
          pointer-events:none;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0) 100%);
          transform: translateX(-120%);
          animation: tb-shimmer 2.6s linear infinite;
          mix-blend-mode: overlay;
        }
        .phone-img{ position: relative; overflow: hidden; }
      `;
      document.head.appendChild(style);
    }
  });
  
  // Sample alert when button is clicked
  function showAlert() {
    alert("Thanks for your interest! Feature coming soon...");
  }  
  document.addEventListener("DOMContentLoaded", function () {
  // existing code...
  // MOBILE NAV TOGGLE
  const navToggle = document.querySelector(".nav-toggle");
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (navToggle && navbar) {
    navToggle.addEventListener("click", (e) => {
      const isOpen = navbar.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // close when clicking a nav link (navigate)
    navLinks.forEach(a => a.addEventListener("click", () => {
      if (navbar.classList.contains("nav-open")) {
        navbar.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    }));

    // close on outside click
    document.addEventListener("click", (ev) => {
      if (!navbar.contains(ev.target) && navbar.classList.contains("nav-open")) {
        navbar.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });

    // close on Escape
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && navbar.classList.contains("nav-open")) {
        navbar.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const THEME_KEY = "tb-theme";
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  const icon = toggle?.querySelector(".theme-icon");
  const label = toggle?.querySelector(".theme-label");

  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    if (toggle) toggle.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    if (icon) icon.textContent = t === "dark" ? "🌙" : "☀️";
    if (label) label.textContent = t === "dark" ? "Dark" : "Light";
    // update mobile browser theme-color if meta exists
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? getComputedStyle(root).getPropertyValue("--bg-top").trim() || "#0f1724" : "#ffffff");
  }

  // determine initial theme: saved -> system -> default (dark)
  const saved = localStorage.getItem(THEME_KEY);
  const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initTheme = saved || (systemPrefersDark ? "dark" : "light");
  applyTheme(initTheme);

  // watch for toggle clicks
  if (toggle) {
    toggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  // respond to system changes only if user hasn't saved a preference
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener?.("change", (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
  }
});

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
    navToggle.setAttribute('aria-expanded', !expanded);
    navLinks.classList.toggle('nav-open');
  });
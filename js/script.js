"use strict";

(() => {
  function init() {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let reduceMotion = motionPreference.matches;

    const $ = (selector, parent = document) =>
      parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
      [...parent.querySelectorAll(selector)];

    /* Animation styles shared by both pages */

    const styles = document.createElement("style");

    styles.textContent = `
      .nova-reveal {
        opacity: 0;
        translate: 0 30px;
        transition:
          opacity 700ms ease var(--nova-delay, 0ms),
          translate 700ms cubic-bezier(.2,.7,.2,1)
            var(--nova-delay, 0ms);
      }

      .nova-reveal.nova-visible {
        opacity: 1;
        translate: 0 0;
      }

      .nova-top-button {
        position: fixed;
        right: 22px;
        bottom: 22px;
        z-index: 200;
        width: 46px;
        height: 46px;
        border: 1px solid #c6ff6b;
        border-radius: 50%;
        background: #c6ff6b;
        color: #142008;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 8px 30px #0005;
      }

      .nova-top-button:focus-visible {
        outline: 3px solid white;
        outline-offset: 5px;
      }

      .nova-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: #c6ff6b;
        transform: scaleX(0);
        transform-origin: left;
        z-index: 300;
        pointer-events: none;
      }

      .service-card,
      .package,
      .contact-content {
        position: relative;
        overflow: hidden;
      }

      .nova-spotlight {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        opacity: 0;
        background: radial-gradient(
          280px circle at var(--nova-x, 50%) var(--nova-y, 50%),
          rgba(198,255,107,.10),
          transparent 70%
        );
        transition: opacity 250ms ease;
      }

      .nova-spotlight.nova-active {
        opacity: 1;
      }

      .nova-ripple {
        position: absolute;
        border-radius: 50%;
        background: currentColor;
        opacity: .18;
        pointer-events: none;
        transform: scale(0);
      }

      .btn {
        position: relative;
        overflow: hidden;
      }

      .faq-answer {
        transform-origin: top;
      }

      @media (max-width: 760px) {
        .navbar.nova-menu-enabled {
          flex-wrap: wrap;
        }

        .navbar.nova-menu-enabled .menu-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
        }

        .navbar.nova-menu-enabled .nav-links {
          display: none;
          width: 100%;
          order: 5;
          padding: 18px 0;
        }

        .navbar.nova-menu-enabled .nav-links.nova-menu-open {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }

        .navbar.nova-menu-enabled > .btn,
        .navbar.nova-menu-enabled > .btn-small {
          display: none;
        }
      }

      @media (min-width: 761px) {
        .navbar.nova-menu-enabled .menu-toggle {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        html {
          scroll-behavior: auto !important;
        }

        .nova-reveal {
          opacity: 1 !important;
          translate: none !important;
          transition: none !important;
        }
      }
    `;

    document.head.append(styles);

    /* Track decorative animations */

    const decorativeAnimations = [];

    function animate(element, keyframes, options) {
      if (!element || typeof element.animate !== "function") {
        return null;
      }

      return element.animate(keyframes, options);
    }

    function decorate(element, keyframes, options) {
      const animation = animate(element, keyframes, options);

      if (!animation) return;

      decorativeAnimations.push(animation);

      if (reduceMotion || document.hidden) {
        animation.pause();
      }
    }

    function updateMotion() {
      reduceMotion = motionPreference.matches;

      decorativeAnimations.forEach((animation) => {
        if (reduceMotion || document.hidden) {
          animation.pause();
        } else {
          animation.play();
        }
      });

      if (reduceMotion) {
        $$(".nova-reveal").forEach((element) => {
          element.classList.add("nova-visible");
        });
      }
    }

    motionPreference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateMotion);

    /* Scroll reveals */

    const revealElements = $$(
      [
        ".reveal",
        ".section-heading",
        ".service-card",
        ".process-step",
        ".principle",
        ".package",
        ".project-card",
        ".feature-panel",
        ".contact-panel",
        ".contact-content",
        ".hero-content > *",
        ".hero-grid > div:first-child > *"
      ].join(",")
    );

    // Avoid nesting reveal effects inside another reveal.
    const revealTargets = revealElements.filter(
      (element) =>
        !revealElements.some(
          (parent) => parent !== element && parent.contains(element)
        )
    );

    if ("IntersectionObserver" in window && !reduceMotion) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("nova-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -20px 0px"
        }
      );

      revealTargets.forEach((element) => {
        const siblings = element.parentElement
          ? [...element.parentElement.children]
          : [];

        const index = siblings.indexOf(element);

        element.style.setProperty(
          "--nova-delay",
          `${Math.max(0, index % 3) * 90}ms`
        );

        element.classList.add("nova-reveal");
        revealObserver.observe(element);
      });
    }

    /* Floating badges */

    $$(".floating-badge, [data-float]").forEach((element, index) => {
      decorate(
        element,
        [
          { translate: "0 0" },
          { translate: `0 ${index % 2 ? 12 : -12}px` },
          { translate: "0 0" }
        ],
        {
          duration: 3800 + index * 500,
          iterations: Infinity,
          easing: "ease-in-out"
        }
      );
    });

    /* Background shapes */

    $$(".shape").forEach((element, index) => {
      decorate(
        element,
        [
          { translate: "0 0", scale: "1" },
          {
            translate: `${index % 2 ? -30 : 30}px 25px`,
            scale: "1.08"
          },
          { translate: "0 0", scale: "1" }
        ],
        {
          duration: 11000 + index * 2000,
          iterations: Infinity,
          easing: "ease-in-out"
        }
      );
    });

    /* Hero symbols */

    $$(".visual-symbol, [data-rotate]").forEach((element) => {
      decorate(
        element,
        [
          { rotate: "0deg" },
          { rotate: "360deg" }
        ],
        {
          duration: 40000,
          iterations: Infinity,
          easing: "linear"
        }
      );
    });

    $$(".orbit-two").forEach((element) => {
      decorate(
        element,
        [
          { rotate: "0deg" },
          { rotate: "-360deg" }
        ],
        {
          duration: 65000,
          iterations: Infinity,
          easing: "linear"
        }
      );
    });

    /* Counters */

    const counterRuns = new Map();

    function finishCounter(element) {
      const run = counterRuns.get(element);

      if (run) {
        cancelAnimationFrame(run.frame);
        counterRuns.delete(element);
      }

      const target = Number(element.dataset.target);

      if (Number.isFinite(target)) {
        element.textContent = target.toLocaleString();
      }
    }

    function startCounter(element) {
      const target = Number(element.dataset.target);

      if (!Number.isFinite(target)) return;

      if (reduceMotion) {
        finishCounter(element);
        return;
      }

      const startTime = performance.now();
      const duration = 1500;
      const run = { frame: 0 };

      counterRuns.set(element, run);

      function tick(time) {
        if (reduceMotion) {
          finishCounter(element);
          return;
        }

        const progress = Math.min((time - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        element.textContent = Math.round(
          target * eased
        ).toLocaleString();

        if (progress < 1) {
          run.frame = requestAnimationFrame(tick);
        } else {
          finishCounter(element);
        }
      }

      run.frame = requestAnimationFrame(tick);
    }

    const counters = $$(".counter[data-target]");

    if ("IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            startCounter(entry.target);
            counterObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.5 }
      );

      counters.forEach((counter) => counterObserver.observe(counter));
    }

    motionPreference.addEventListener("change", () => {
      if (motionPreference.matches) {
        counters.forEach(finishCounter);
      }
    });

    /* Card tilt — preserve existing CSS transforms */

    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    $$(".tilt-card, [data-tilt]").forEach((card) => {
      let tiltAnimation = null;
      let frame = 0;
      let pointerX = 0;
      let pointerY = 0;
      let baseTransform = "";
      let active = false;

      function clearTilt() {
        active = false;
        cancelAnimationFrame(frame);
        frame = 0;

        if (tiltAnimation) {
          tiltAnimation.cancel();
          tiltAnimation = null;
        }
      }

      function paintTilt() {
        frame = 0;

        if (!active || reduceMotion || !finePointer.matches) {
          clearTilt();
          return;
        }

        const bounds = card.getBoundingClientRect();

        if (!bounds.width || !bounds.height) return;

        const x = (pointerX - bounds.left) / bounds.width - 0.5;
        const y = (pointerY - bounds.top) / bounds.height - 0.5;

        const transform = [
          "perspective(900px)",
          `rotateX(${-y * 10}deg)`,
          `rotateY(${x * 10}deg)`,
          baseTransform
        ].join(" ");

        if (tiltAnimation) tiltAnimation.cancel();

        tiltAnimation = animate(
          card,
          [{ transform }, { transform }],
          {
            duration: 1000,
            fill: "both"
          }
        );
      }

      card.addEventListener("pointerenter", () => {
        if (reduceMotion || !finePointer.matches) return;

        baseTransform = getComputedStyle(card).transform;

        if (baseTransform === "none") baseTransform = "";

        active = true;
      });

      card.addEventListener("pointermove", (event) => {
        if (!active) return;

        pointerX = event.clientX;
        pointerY = event.clientY;

        if (!frame) frame = requestAnimationFrame(paintTilt);
      });

      card.addEventListener("pointerleave", clearTilt);
      card.addEventListener("pointercancel", clearTilt);

      motionPreference.addEventListener("change", clearTilt);
      finePointer.addEventListener("change", clearTilt);
    });

    /* Card spotlight */

    $$(".service-card, .package, .contact-content").forEach((card) => {
      const spotlight = document.createElement("span");

      spotlight.className = "nova-spotlight";
      spotlight.setAttribute("aria-hidden", "true");
      card.append(spotlight);

      let frame = 0;
      let x = 0;
      let y = 0;

      card.addEventListener("pointermove", (event) => {
        if (reduceMotion || !finePointer.matches) return;

        const bounds = card.getBoundingClientRect();

        x = event.clientX - bounds.left;
        y = event.clientY - bounds.top;

        spotlight.classList.add("nova-active");

        if (frame) return;

        frame = requestAnimationFrame(() => {
          card.style.setProperty("--nova-x", `${x}px`);
          card.style.setProperty("--nova-y", `${y}px`);
          frame = 0;
        });
      });

      card.addEventListener("pointerleave", () => {
        cancelAnimationFrame(frame);
        frame = 0;
        spotlight.classList.remove("nova-active");
      });
    });

    /* Button ripple */

    $$(".btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        if (reduceMotion) return;

        const bounds = button.getBoundingClientRect();
        const size = Math.max(bounds.width, bounds.height) * 2;

        const ripple = document.createElement("span");

        ripple.className = "nova-ripple";
        ripple.setAttribute("aria-hidden", "true");

        const x = event.detail
          ? event.clientX - bounds.left
          : bounds.width / 2;

        const y = event.detail
          ? event.clientY - bounds.top
          : bounds.height / 2;

        Object.assign(ripple.style, {
          width: `${size}px`,
          height: `${size}px`,
          left: `${x - size / 2}px`,
          top: `${y - size / 2}px`
        });

        button.append(ripple);

        const animation = animate(
          ripple,
          [
            { transform: "scale(0)", opacity: 0.18 },
            { transform: "scale(1)", opacity: 0 }
          ],
          {
            duration: 950,
            easing: "ease-out"
          }
        );

        if (animation) {
          animation.finished.then(
            () => ripple.remove(),
            () => ripple.remove()
          );
        } else {
          ripple.remove();
        }
      });
    });

    /* Mobile navigation */

    const navbar = $(".navbar");
    const navLinks = navbar ? $(".nav-links", navbar) : null;

    if (navbar && navLinks) {
      const mobile = window.matchMedia("(max-width: 760px)");

      let menuButton = $(".menu-toggle", navbar);

      if (!menuButton) {
        menuButton = document.createElement("button");
        menuButton.type = "button";
        menuButton.className = "menu-toggle";
        menuButton.textContent = "☰";

        Object.assign(menuButton.style, {
          background: "#181e19",
          color: "#f3f5ee",
          border: "1px solid #ffffff26",
          borderRadius: "10px",
          padding: "6px 12px",
          fontSize: "24px"
        });

        navbar.insertBefore(menuButton, navLinks);
      }

      if (!navLinks.id) navLinks.id = "nova-navigation";

      menuButton.hidden = false;
      menuButton.setAttribute("aria-controls", navLinks.id);

      navbar.classList.add("nova-menu-enabled");

      function setMenu(open) {
        navLinks.classList.toggle("nova-menu-open", open);

        menuButton.setAttribute("aria-expanded", String(open));
        menuButton.setAttribute(
          "aria-label",
          open ? "Close navigation" : "Open navigation"
        );

        menuButton.textContent = open ? "✕" : "☰";
      }

      setMenu(false);

      menuButton.addEventListener("click", () => {
        setMenu(
          menuButton.getAttribute("aria-expanded") !== "true"
        );
      });

      $$("a", navLinks).forEach((link) => {
        link.addEventListener("click", () => setMenu(false));
      });

      document.addEventListener("keydown", (event) => {
        if (
          event.key === "Escape" &&
          menuButton.getAttribute("aria-expanded") === "true"
        ) {
          setMenu(false);
          menuButton.focus();
        }
      });

      document.addEventListener("click", (event) => {
        if (!navbar.contains(event.target)) {
          setMenu(false);
        }
      });

      mobile.addEventListener("change", () => setMenu(false));
    }

    /* FAQ opening animation — native details still handles toggling */

    $$(".faq-item").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (!details.open || reduceMotion) return;

        const answer = $(".faq-answer", details);

        animate(
          answer,
          [
            { opacity: 0, translate: "0 -8px" },
            { opacity: 1, translate: "0 0" }
          ],
          {
            duration: 300,
            easing: "ease-out"
          }
        );
      });
    });

    /* Back to top */

    let topButton = $("#back-to-top");

    if (!topButton) {
      topButton = document.createElement("button");
      topButton.id = "back-to-top";
      topButton.type = "button";
      topButton.textContent = "↑";
      topButton.setAttribute("aria-label", "Back to top");
      document.body.append(topButton);
    }

    topButton.classList.add("nova-top-button");

    topButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "instant" : "smooth"
      });
    });

    /* Reading progress + header */

    const progress = document.createElement("div");

    progress.className = "nova-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.append(progress);

    const header = $(".header");
    let scrollFrame = 0;

    function updateScroll() {
      scrollFrame = 0;

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

      const fraction = scrollable > 0
        ? Math.min(1, Math.max(0, window.scrollY / scrollable))
        : 0;

      progress.style.transform = `scaleX(${fraction})`;

      topButton.hidden = window.scrollY < 500;

      if (header) {
        header.classList.toggle("scrolled", window.scrollY > 25);
      }
    }

    function scheduleScrollUpdate() {
      if (!scrollFrame) {
        scrollFrame = requestAnimationFrame(updateScroll);
      }
    }

    window.addEventListener("scroll", scheduleScrollUpdate, {
      passive: true
    });

    window.addEventListener("resize", scheduleScrollUpdate);
    window.addEventListener("load", scheduleScrollUpdate);

    updateScroll();

    /* Animate ribbon words without changing layout */

    $$(".ribbon-track > span:not(.star)").forEach((word, index) => {
      decorate(
        word,
        [
          { opacity: 0.65 },
          { opacity: 1 },
          { opacity: 0.65 }
        ],
        {
          duration: 3000,
          delay: index * 300,
          iterations: Infinity,
          easing: "ease-in-out"
        }
      );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
(() => {
  const initGeekTilt = () => {
    const cards = document.querySelectorAll("[data-geek-tilt]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (!cards.length || prefersReducedMotion || !supportsFinePointer) {
      return;
    }

    cards.forEach((card) => {
      let frameId = 0;

      const reset = () => {
        if (frameId) {
          cancelAnimationFrame(frameId);
          frameId = 0;
        }

        card.style.setProperty("--geek-tilt-x", "0deg");
        card.style.setProperty("--geek-tilt-y", "0deg");
        card.style.setProperty("--geek-glow-x", "50%");
        card.style.setProperty("--geek-glow-y", "50%");
      };

      const update = (event) => {
        const bounds = card.getBoundingClientRect();
        const px = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
        const py = Math.min(Math.max((event.clientY - bounds.top) / bounds.height, 0), 1);
        const rotateX = ((0.5 - py) * 7.5).toFixed(2);
        const rotateY = ((px - 0.5) * 9).toFixed(2);

        if (frameId) {
          cancelAnimationFrame(frameId);
        }

        frameId = requestAnimationFrame(() => {
          card.style.setProperty("--geek-tilt-x", `${rotateX}deg`);
          card.style.setProperty("--geek-tilt-y", `${rotateY}deg`);
          card.style.setProperty("--geek-glow-x", `${(px * 100).toFixed(2)}%`);
          card.style.setProperty("--geek-glow-y", `${(py * 100).toFixed(2)}%`);
        });
      };

      card.addEventListener("pointermove", update);
      card.addEventListener("pointerleave", reset);
      card.addEventListener("pointercancel", reset);
      card.addEventListener("blur", reset, true);
    });
  };

  const initGeekReveal = () => {
    const revealItems = document.querySelectorAll("[data-geek-reveal]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!revealItems.length) {
      return;
    }

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-geek-visible"));
      return;
    }

    document.documentElement.classList.add("geek-motion-ready");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-geek-visible");
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.16,
    });

    revealItems.forEach((item) => observer.observe(item));
  };

  const initGeek = () => {
    initGeekReveal();
    initGeekTilt();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGeek, { once: true });
  } else {
    initGeek();
  }
})();

// Hero 3D phone: turns to face front (with the Swap banner settling back
// into the screen) as you scroll past the hero.
(function () {
  const hero = document.querySelector(".hero");
  const phone = document.querySelector(".phone3d");
  if (!hero || !phone) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function onScroll() {
    if (reduceMotion.matches) return phone.style.setProperty("--p", 0);
    const p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.7)));
    phone.style.setProperty("--p", p.toFixed(3));
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      onScroll();
    });
  }, { passive: true });
  onScroll();
})();

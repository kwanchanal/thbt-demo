// Site header: transparent while the page is at the very top, white once it has been scrolled.
(function () {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const THRESHOLD = 8; // px scrolled before the header turns white

  let ticking = false;
  function update() {
    ticking = false;
    header.classList.toggle("is-scrolled", window.scrollY > THRESHOLD);
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
  update(); // e.g. after a reload part-way down the page
})();

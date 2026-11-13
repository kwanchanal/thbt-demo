// News row ("Stay in the loop"): the ‹ › buttons scroll the cards by one card.
// The row also scrolls with a trackpad, a swipe or the keyboard; the buttons grey out at either end.
(function () {
  const section = document.querySelector(".news");
  if (!section) return;
  const list = section.querySelector(".news-list");
  const prev = section.querySelector(".news-prev");
  const next = section.querySelector(".news-next");

  function step() {
    const card = list.querySelector("li");
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    return card ? card.getBoundingClientRect().width + gap : list.clientWidth * 0.8;
  }

  const smooth = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

  function update() {
    const max = list.scrollWidth - list.clientWidth;
    prev.disabled = list.scrollLeft <= 2;
    next.disabled = list.scrollLeft >= max - 2;
  }

  prev.addEventListener("click", () => list.scrollBy({ left: -step(), behavior: smooth() }));
  next.addEventListener("click", () => list.scrollBy({ left: step(), behavior: smooth() }));
  list.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

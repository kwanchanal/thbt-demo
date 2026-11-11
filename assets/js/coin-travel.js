// Travelling THBT coin: one fixed coin that drifts down the page as you scroll,
// stopping at each [data-coin-anchor] (above the hero headline → "Our Service" → "Swap in seconds").
//
// How it moves: for each anchor we know the scroll position at which that anchor sits REST
// of the way down the screen. Between two of those scroll positions the coin glides from one
// anchor to the next (eased), so it keeps pace with the page and seems to follow you down.
// Sections have a higher z-index, so on the way it passes behind the content.
//
// Reduced motion / no JS: nothing moves; each anchor shows a still coin instead (see styles.css).
(function () {
  const REST = 0.3; // where on screen (0 = top, 1 = bottom) the coin "arrives" at an anchor
  const SHRINK = 0.2; // how much smaller the coin gets halfway between two stops (0.2 = 20%)
  const IDLE_AFTER = 160; // ms without scrolling before the coin starts floating again
  const PHONE_SPIN = 10; // phones: how far (deg) the coin swings round in 3D while travelling
  const isPhone = window.matchMedia("(max-width: 799px)");
  const coin = document.querySelector(".coin-traveler");
  const anchors = Array.from(document.querySelectorAll("[data-coin-anchor]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!coin || anchors.length < 2) return;

  const BASE = 100; // .coin-traveler is 100×100 px; we scale it to each anchor's size
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const ease = (t) => t * t * (3 - 2 * t); // smoothstep: lingers at each stop, glides between
  const lerp = (a, b, t) => a + (b - a) * t;

  function place() {
    const sy = window.scrollY;
    const sx = window.scrollX;
    const vh = window.innerHeight;

    // Anchor centres in page coordinates, and the scroll position where each one "arrives".
    const pts = anchors.map((a) => {
      const r = a.getBoundingClientRect();
      // Centre from the box (rotation doesn't move it); size from offsetWidth (rotation would inflate the box).
      return { x: r.left + r.width / 2 + sx, y: r.top + r.height / 2 + sy, size: a.offsetWidth };
    });
    const stops = pts.map((p) => p.y - vh * REST);
    stops[0] = Math.max(0, stops[0]); // at the very top of the page the coin sits exactly on the first anchor

    let i = 0;
    while (i < pts.length - 2 && sy > stops[i + 1]) i++;
    const raw = clamp01((sy - stops[i]) / Math.max(1, stops[i + 1] - stops[i]));
    const t = ease(raw);
    const a = pts[i];
    const b = pts[i + 1];

    const x = lerp(a.x, b.x, t) - sx;
    const y = lerp(a.y, b.y, t) - sy;
    // Full size on each stop, a little smaller in between.
    // Phones: one fixed size the whole way. Desktop: full size on each stop, a little smaller in between.
    const size = isPhone.matches ? pts[0].size : lerp(a.size, b.size, t) * (1 - SHRINK * Math.sin(raw * Math.PI));
    // A little tilt while it's travelling, flat when it's resting on an anchor.
    const tilt = Math.sin(raw * Math.PI) * 18;
    // Phones: also swing the coin round in 3D (one way, then back) between stops.
    const spinY = isPhone.matches ? Math.sin(raw * Math.PI * 2) * PHONE_SPIN : 0;
    const spinX = isPhone.matches ? Math.sin(raw * Math.PI) * 14 : 0;

    coin.style.transform =
      "translate3d(" + (x - BASE / 2) + "px," + (y - BASE / 2) + "px,0) perspective(500px) rotateY(" + spinY + "deg) rotateX(" + spinX + "deg) scale(" + size / BASE + ") rotate(" + tilt + "deg)";
  }

  // Float only while the page is still.
  let idleTimer = 0;
  function markMoving() {
    coin.classList.add("is-moving");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => coin.classList.remove("is-moving"), IDLE_AFTER);
  }

  let ticking = false;
  function request() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      place();
    });
  }

  function setEnabled() {
    const on = !reduceMotion.matches;
    document.documentElement.classList.toggle("coin-travel-on", on);
    if (on) place();
  }

  window.addEventListener("scroll", () => {
    markMoving();
    request();
  }, { passive: true });
  window.addEventListener("resize", request);
  window.addEventListener("load", request); // fonts and images can move the anchors
  document.addEventListener("thbt:langchange", () => setTimeout(request, 50));
  reduceMotion.addEventListener("change", setEnabled);
  setEnabled();
})();

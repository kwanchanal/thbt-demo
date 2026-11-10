// Feature story: plays through the cards by itself. Each step slides the next card in
// from the right, moves the spotlight to that feature on the phone screen, and zooms in.
//
// Autoplay pauses while the mouse is over the phone or the text (or keyboard focus is inside)
// so people can pick a feature from the chips or use the ← / → keys. On touch screens, swipe the card;
// autoplay picks up again a few seconds after the last touch. Only plays while on screen.
// Reduced-motion users get no autoplay, just the controls.
(function () {
  const SCREEN_W = 375;
  const SCREEN_H = 812;

  const story = document.querySelector(".story");
  if (!story) return;

  const cards = Array.from(story.querySelectorAll(".story-card"));
  const track = story.querySelector(".story-track");
  const spot = story.querySelector(".spot");
  const zoom = story.querySelector(".screen-zoom");
  const dotsWrap = story.querySelector(".story-dots");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const HOLD = 1500; // ms per step
  const TOUCH_RESUME = 6000; // ms after the last touch before autoplay resumes
  const steps = cards.length;
  story.style.setProperty("--hold", HOLD + "ms");

  const dots = cards.map((card, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", card.querySelector("h3").textContent);
    btn.addEventListener("click", () => go(i));
    dotsWrap.appendChild(btn);
    return btn;
  });

  const PAD = 2; // px of breathing room (in Figma px) between the element and the spotlight ring
  // Keep dot labels in the current language.
  document.addEventListener("thbt:langchange", () => {
    dots.forEach((d, i) => d.setAttribute("aria-label", cards[i].querySelector("h3").textContent));
  });

  let active = -1;

  function setActive(i) {
    if (i === active) return;
    active = i;
    const card = cards[i];
    // Grow the box a little so the soft edge doesn't eat into the feature.
    const x = Math.max(0, +card.dataset.x - PAD);
    const y = Math.max(0, +card.dataset.y - PAD);
    const w = Math.min(SCREEN_W - x, +card.dataset.w + PAD * 2);
    const h = Math.min(SCREEN_H - y, +card.dataset.h + PAD * 2);
    const scale = reduceMotion.matches ? 1 : +card.dataset.zoom || 1;
    // Corner radius to match the element, in real pixels at the phone's current size.
    const k = zoom.offsetWidth / SCREEN_W;
    spot.style.borderRadius = (+card.dataset.r || 0) > 0 ? (+card.dataset.r + PAD) * k + "px" : "0px";

    // Spotlight box, in % of the screen so it scales with the phone size.
    spot.style.left = (x / SCREEN_W) * 100 + "%";
    spot.style.top = (y / SCREEN_H) * 100 + "%";
    spot.style.width = (w / SCREEN_W) * 100 + "%";
    spot.style.height = (h / SCREEN_H) * 100 + "%";

    // Zoom in and move the feature towards the middle of the screen,
    // without ever showing past the edges of the screenshot.
    const cx = ((x + w / 2) / SCREEN_W) * 100;
    const cy = ((y + h / 2) / SCREEN_H) * 100;
    const clamp = (v) => Math.min(0, Math.max((1 - scale) * 100, v));
    const tx = clamp(50 - scale * cx);
    const ty = clamp(50 - scale * cy);
    zoom.style.transform = "translate(" + tx + "%, " + ty + "%) scale(" + scale + ")";

    track.style.transform = "translateX(" + -i * 100 + "%)";
    cards.forEach((c, n) => {
      c.classList.toggle("is-active", n === i);
      c.setAttribute("aria-hidden", n === i ? "false" : "true");
    });
    dots.forEach((d) => d.removeAttribute("aria-current"));
    // Re-adding aria-current after a reflow restarts the chip's timer line.
    void dotsWrap.offsetWidth;
    dots[i].setAttribute("aria-current", "step");
  }

  // ---- Autoplay ----
  let timer = 0;
  let touchTimer = 0;
  let visible = false;
  let hovered = false;
  let focused = false;
  let touchHold = false;

  const isPaused = () => reduceMotion.matches || hovered || focused || touchHold;

  // Restart the current chip's timer line (e.g. when the mouse leaves).
  function restartTimer() {
    const dot = dots[active];
    dot.removeAttribute("aria-current");
    void dot.offsetWidth;
    dot.setAttribute("aria-current", "step");
  }

  function schedule() {
    clearTimeout(timer);
    story.classList.toggle("is-paused", isPaused());
    if (!visible || isPaused()) return;
    timer = setTimeout(() => go(active + 1), HOLD);
  }

  // Show step i (wraps around) and start its timer.
  function go(i) {
    setActive((i + steps) % steps);
    restartTimer();
    schedule();
  }

  // Pause while the mouse is over the phone or the card area (not the empty sides);
  // when it leaves, give the current step a fresh full timer.
  const stage = story.querySelector(".story-sticky");
  [story.querySelector(".phone"), story.querySelector(".story-copy")].forEach((zone) => {
    zone.addEventListener("mouseenter", () => {
      hovered = true;
      schedule();
    });
    zone.addEventListener("mouseleave", () => {
      hovered = false;
      go(active);
    });
  });

  // Keyboard users: pause while focus is inside, arrow keys step.
  stage.addEventListener("focusin", (e) => {
    // Mouse clicks also move focus to the buttons; only keyboard focus should hold the pause.
    if (!e.target.matches(":focus-visible")) return;
    focused = true;
    schedule();
  });
  stage.addEventListener("focusout", (e) => {
    if (stage.contains(e.relatedTarget)) return;
    focused = false;
    go(active);
  });
  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") go(active + 1);
    else if (e.key === "ArrowLeft") go(active - 1);
  });


  // Touch: swipe the card left/right; hold off autoplay for a bit after the last touch.
  let touchX = null;
  stage.addEventListener(
    "touchstart",
    (e) => {
      touchX = e.touches[0].clientX;
      touchHold = true;
      clearTimeout(touchTimer);
      schedule();
    },
    { passive: true }
  );
  stage.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - (touchX ?? e.changedTouches[0].clientX);
      if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
      touchTimer = setTimeout(() => {
        touchHold = false;
        go(active);
      }, TOUCH_RESUME);
    },
    { passive: true }
  );

  // Only play while the section is on screen.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        const now = entries.some((e) => e.isIntersecting);
        if (now === visible) return;
        visible = now;
        if (visible) go(active);
        else clearTimeout(timer);
      },
      { threshold: 0.4 }
    ).observe(story);
  } else {
    visible = true;
  }

  // Keep the corner radius right when the phone changes size.
  window.addEventListener("resize", () => {
    const i = active;
    active = -1;
    setActive(i);
  });
  reduceMotion.addEventListener("change", () => {
    const i = active;
    active = -1;
    go(i);
  });

  go(0);
})();

// Swap journey: plays the Baht Swap screens in order, like someone using the app.
// Before moving on, a finger "taps" where the user would tap (data-tap-x / data-tap-y).
// Plays only while the section is on screen. Starts paused for reduced-motion users.
(function () {
  const section = document.querySelector(".swap-demo");
  if (!section) return;

  const shots = Array.from(section.querySelectorAll(".swap-shot"));
  const captions = Array.from(section.querySelectorAll(".swap-steps li"));
  const tap = section.querySelector(".swap-tap");
  const dotsWrap = section.querySelector(".swap-dots");
  const toggle = section.querySelector(".swap-toggle");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const TAP_LEAD = 750; // ms before leaving a screen that the tap starts

  let index = -1;
  let timers = [];
  let visible = false;
  let paused = reduceMotion.matches;

  const dots = shots.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.addEventListener("click", () => {
      show(i);
      schedule();
    });
    dotsWrap.appendChild(b);
    return b;
  });

  function labelDots() {
    dots.forEach((b, i) => b.setAttribute("aria-label", (i + 1) + ". " + captions[i].textContent));
  }
  labelDots();
  document.addEventListener("thbt:langchange", labelDots);

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function show(i) {
    const prev = shots[index];
    index = (i + shots.length) % shots.length;
    const cur = shots[index];

    shots.forEach((s) => s.classList.remove("is-prev"));
    if (prev && prev !== cur) {
      prev.classList.remove("is-active");
      prev.classList.add("is-prev");
    }
    // Restart the enter animation even when re-showing the same screen.
    cur.classList.remove("is-active");
    void cur.offsetWidth;
    cur.classList.add("is-active");

    captions.forEach((c, n) => c.classList.toggle("is-active", n === index));
    section.style.setProperty("--hold", (+cur.dataset.hold || 2000) + "ms");
    dots.forEach((d, n) => {
      d.classList.toggle("is-done", n < index);
      d.removeAttribute("aria-current");
    });
    // Re-adding aria-current after a reflow restarts the dot's fill animation.
    void dotsWrap.offsetWidth;
    dots[index].setAttribute("aria-current", "step");
  }

  function doTap(shot) {
    if (shot.dataset.tapX == null || reduceMotion.matches) return;
    tap.style.left = shot.dataset.tapX + "%";
    tap.style.top = shot.dataset.tapY + "%";
    tap.classList.remove("is-tapping");
    void tap.offsetWidth;
    tap.classList.add("is-tapping");
  }

  // Queue the tap and the next screen for the current one.
  function schedule() {
    clearTimers();
    if (paused || !visible) return;
    const cur = shots[index];
    const hold = +cur.dataset.hold || 2000;
    timers.push(setTimeout(() => doTap(cur), Math.max(0, hold - TAP_LEAD)));
    timers.push(
      setTimeout(() => {
        show(index + 1);
        schedule();
      }, hold)
    );
  }

  function setPaused(p) {
    paused = p;
    section.classList.toggle("is-paused", p);
    toggle.setAttribute("aria-pressed", String(p));
    if (p) return clearTimers();
    // Resume: replay the current screen so the dot fill and the timer line up.
    if (visible) show(index);
    schedule();
  }

  toggle.addEventListener("click", () => setPaused(!paused));

  // Only play while on screen; restart from the first screen each time it comes into view.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        const nowVisible = entries.some((e) => e.isIntersecting);
        section.classList.toggle("in-view", nowVisible); // lets the title orbit pause off screen
        if (nowVisible && !visible) {
          visible = true;
          show(0);
          schedule();
        } else if (!nowVisible && visible) {
          visible = false;
          clearTimers();
        }
      },
      { threshold: 0.15 }
    ).observe(section);
  } else {
    visible = true;
    section.classList.add("in-view");
  }

  show(0);
  section.classList.toggle("is-paused", paused);
  toggle.setAttribute("aria-pressed", String(paused));
  if (visible) schedule(); // browsers without IntersectionObserver just play
})();

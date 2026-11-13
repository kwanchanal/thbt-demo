// Swap tutorial: the real Baht Swap screens, one step at a time, moved on by the visitor.
// Ways to move: Next / Back buttons, picking a step in the list, ← / → keys inside the section,
// or tapping the pulsing spot on the phone (where you would tap in the app, from data-tap-x / data-tap-y).
(function () {
  const section = document.querySelector(".swap-demo");
  if (!section) return;

  const shots = Array.from(section.querySelectorAll(".swap-shot"));
  const steps = Array.from(section.querySelectorAll(".swap-steps li"));
  const stepButtons = steps.map((li) => li.querySelector("button"));
  const tap = section.querySelector(".swap-tap");
  const prev = section.querySelector(".swap-prev");
  const next = section.querySelector(".swap-next");
  const count = section.querySelector(".swap-count");
  const last = shots.length - 1;

  // "Step 2 of 6" in the current language.
  const COUNT = {
    en: (n, t) => "Step " + n + " of " + t,
    th: (n, t) => "ขั้นตอนที่ " + n + " จาก " + t,
    ru: (n, t) => "Шаг " + n + " из " + t,
    my: (n, t) => "အဆင့် " + n + " / " + t,
  };

  let index = 0;

  function show(i) {
    i = Math.max(0, Math.min(last, i));
    const before = index;
    const forward = i > before;
    index = i;

    shots.forEach((s, n) => {
      s.classList.remove("is-prev", "is-back");
      if (n !== i) s.classList.remove("is-active");
    });
    const cur = shots[i];
    if (before !== i) {
      shots[before].classList.add("is-prev");
      // Restart the enter animation; going back always just fades.
      cur.classList.remove("is-active");
      void cur.offsetWidth;
      if (!forward) cur.classList.add("is-back");
    }
    cur.classList.add("is-active");

    steps.forEach((li, n) => {
      li.classList.toggle("is-active", n === i);
      li.classList.toggle("is-done", n < i);
    });
    stepButtons.forEach((b, n) => {
      if (n === i) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });

    // The pulsing tap spot shows where to tap next; the last two screens have none.
    const hasTap = cur.dataset.tapX != null;
    tap.hidden = !hasTap;
    if (hasTap) {
      tap.style.left = cur.dataset.tapX + "%";
      tap.style.top = cur.dataset.tapY + "%";
    }

    prev.disabled = i === 0;
    section.classList.toggle("is-last", i === last);
    updateCount();
  }

  function updateCount() {
    const lang = document.documentElement.lang || "en";
    count.textContent = (COUNT[lang] || COUNT.en)(index + 1, shots.length);
  }

  next.addEventListener("click", () => show(index === last ? 0 : index + 1));
  prev.addEventListener("click", () => show(index - 1));
  tap.addEventListener("click", () => show(index + 1));
  stepButtons.forEach((b, n) => b.addEventListener("click", () => show(n)));

  section.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "ArrowLeft") show(index - 1);
    else return;
    e.preventDefault();
  });

  document.addEventListener("thbt:langchange", updateCount);
  show(0);
})();

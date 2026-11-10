// Key numbers section: when the section scrolls into view, every digit rolls
// from 0 into place like an odometer. Numbers are formatted for the current language.
//
// To go live later, replace STATS (or fill it from an API) and call THBTStats.set({...}).
(function () {
  const STATS = {
    supply: { value: 1398000, format: "number", unit: "THBT" },
    mcap: { value: 41950, format: "usd" },
    fdv: { value: 41950, format: "usd" },
    volume: { value: 8100, format: "usd" },
  };
  const STAT_STAGGER = 150; // ms between stats
  const DIGIT_STAGGER = 60; // ms between digits within a stat

  const section = document.querySelector(".stats");
  if (!section) return;
  const els = Array.from(section.querySelectorAll("[data-stat]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Burmese would otherwise use Myanmar digits; keep Latin digits for money.
  function locale() {
    const lang = document.documentElement.lang || "en";
    return lang === "my" ? "my-u-nu-latn" : lang;
  }

  function format(stat) {
    const loc = locale();
    if (stat.format === "usd") {
      return new Intl.NumberFormat(loc, {
        style: "currency",
        currency: "USD",
        currencyDisplay: "narrowSymbol",
        maximumFractionDigits: 0,
      }).format(stat.value);
    }
    return new Intl.NumberFormat(loc, { maximumFractionDigits: 0 }).format(stat.value);
  }

  // Build the digits. With atZero = true every strip starts on 0, ready to roll.
  function build(atZero) {
    els.forEach((el) => {
      const stat = STATS[el.dataset.stat];
      if (!stat) return;
      const text = format(stat);
      el.textContent = "";

      // Screen readers get the real number; the rolling digits are hidden from them.
      const sr = document.createElement("span");
      sr.className = "sr-only";
      sr.textContent = text + (stat.unit ? " " + stat.unit : "");

      const odo = document.createElement("span");
      odo.className = "odo";
      odo.setAttribute("aria-hidden", "true");

      Array.from(text).forEach((ch) => {
        if (!/[0-9]/.test(ch)) {
          const c = document.createElement("span");
          c.className = "odo-char";
          c.textContent = ch;
          return odo.appendChild(c);
        }
        const win = document.createElement("span");
        win.className = "odo-digit";
        const strip = document.createElement("span");
        strip.className = "odo-strip";
        strip.dataset.digit = ch;
        for (let d = 0; d <= 9; d++) {
          const s = document.createElement("span");
          s.textContent = d;
          strip.appendChild(s);
        }
        strip.style.transform = "translateY(calc(" + (atZero ? 0 : -ch) + " * var(--odo-h)))";
        win.appendChild(strip);
        odo.appendChild(win);
      });

      el.append(sr, odo);
      if (stat.unit) {
        const unit = document.createElement("span");
        unit.className = "stat-unit";
        unit.setAttribute("aria-hidden", "true");
        unit.textContent = stat.unit;
        el.appendChild(unit);
      }
    });
  }

  function roll() {
    // Two frames so the browser paints the zeros before the transition starts.
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        els.forEach((el, i) => {
          el.querySelectorAll(".odo-strip").forEach((strip, k) => {
            strip.style.transitionDelay = i * STAT_STAGGER + k * DIGIT_STAGGER + "ms";
            strip.style.transform = "translateY(calc(" + -strip.dataset.digit + " * var(--odo-h)))";
          });
        })
      )
    );
  }

  let played = false;
  function play() {
    played = true;
    if (reduceMotion.matches) return build(false);
    build(true);
    roll();
  }

  // Start on zeros, then roll once visible. The HTML keeps the real numbers for no-JS.
  if (!reduceMotion.matches && "IntersectionObserver" in window) {
    build(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          play();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(section);
  } else {
    build(false);
    played = true;
  }

  // Re-format in the new language (e.g. "41 950 $" in Russian) without re-rolling.
  document.addEventListener("thbt:langchange", () => build(!played));

  // Hook for a future API: THBTStats.set({ mcap: 43000 }) updates and rolls again.
  window.THBTStats = {
    set(values) {
      Object.entries(values).forEach(([k, v]) => STATS[k] && (STATS[k].value = v));
      play();
    },
  };
})();

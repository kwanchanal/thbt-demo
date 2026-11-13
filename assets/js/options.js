// Design options panel: lets the team switch between design options for each part of the page.
//
// - Each choice is set as a data attribute on <html> (e.g. data-hero="orange"); styles.css does the rest.
// - The choice is remembered in this browser. A link can also preset it (?hero=orange&icons=solid).
// - To add a new set of options: add an entry to GROUPS below and the matching CSS under
//   "Design options" in styles.css. The first option of each group is the default.
(function () {
  const GROUPS = [
    {
      key: "hero",
      title: "1. Hero: สีพื้นหลัง",
      options: [
        { value: "white", label: "การ์ดขาว (ตอนนี้)", swatch: "#ffffff" },
        { value: "clear", label: "ใส เห็นพื้นเทา", swatch: "#f1f1f3" },
        { value: "orange", label: "พื้นส้ม", swatch: "linear-gradient(135deg, #f6802f, #f04a1c)" },
      ],
    },
    {
      key: "trust",
      title: "1.1 กล่อง Programmable Payment: สีพื้นหลัง",
      options: [
        { value: "navy", label: "กรมท่า (เหมือนกล่อง Swap)", swatch: "#121a33" },
        { value: "soft", label: "ส้มอ่อน", swatch: "#fff1e7" },
        { value: "white", label: "ขาว (เหมือน hero)", swatch: "#ffffff" },
      ],
    },
    {
      key: "icons",
      title: "2. Why THBT: สไตล์ไอคอน",
      options: [
        { value: "tint", label: "เส้นส้ม บนกล่องส้มอ่อน (ตอนนี้)", icon: true },
        { value: "solid", label: "ไอคอนขาว บนกล่องส้มทึบ", icon: true },
        { value: "duo", label: "ไอคอนใหญ่ สองโทน ไม่มีกล่อง", icon: true },
        { value: "coin", label: "เหรียญส้มกลม มีเงา", icon: true },
      ],
    },
    {
      key: "faq",
      title: "3. FAQ: ดีไซน์กล่องคำถาม",
      options: [
        { value: "box", label: "กล่องขาวกล่องเดียว มีเส้นคั่น (ตอนนี้)", swatch: "repeating-linear-gradient(#fff 0 7px, #d9d9de 7px 8px)" },
        { value: "cards", label: "แยกเป็นการ์ดทีละคำถาม ข้อที่เปิดมีขอบส้ม", swatch: "repeating-linear-gradient(#fff 0 6px, #f1f1f3 6px 9px)" },
        { value: "chevron", label: "ลูกศรแทน + (เปิดแล้วลูกศรหงายขึ้น เป็นสีส้ม)", swatch: "#fff", text: "⌄" },
        { value: "plain", label: "ไม่มีกล่อง เส้นบางบนพื้นเทา ตัวใหญ่", swatch: "repeating-linear-gradient(#f1f1f3 0 7px, #b9b9c0 7px 8px)" },
      ],
    },
  ];
  const STORE_KEY = "thbt-options";
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch (e) {}

  const state = {};
  GROUPS.forEach((g) => {
    const valid = (v) => g.options.some((o) => o.value === v);
    const fromUrl = params.get(g.key);
    state[g.key] = valid(fromUrl) ? fromUrl : valid(saved[g.key]) ? saved[g.key] : g.options[0].value;
  });

  function apply() {
    GROUPS.forEach((g) => (root.dataset[g.key] = state[g.key]));
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {}
  }
  apply();

  // ---- Panel ----
  // A copy of the shield icon for the icon-style previews.
  const ICON =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>';

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "opt-toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "opt-panel");
  toggle.innerHTML = '<span aria-hidden="true">⚙︎</span> Options';

  const panel = document.createElement("section");
  panel.id = "opt-panel";
  panel.className = "opt-panel";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Design options");

  let html =
    '<div class="opt-head"><h2>Design options</h2><button type="button" class="opt-close" aria-label="Close">×</button></div>';
  GROUPS.forEach((g) => {
    html += '<fieldset class="opt-group"><legend>' + g.title + "</legend>";
    g.options.forEach((o, i) => {
      const id = "opt-" + g.key + "-" + o.value;
      const preview = o.icon
        ? '<span class="opt-icon" data-style="' + o.value + '">' + ICON + "</span>"
        : '<span class="opt-swatch" style="background:' + o.swatch + '">' + (o.text || "") + "</span>";
      html +=
        '<label class="opt-choice" for="' + id + '">' +
        '<input type="radio" id="' + id + '" name="opt-' + g.key + '" value="' + o.value + '">' +
        preview +
        '<span class="opt-label"><b>' + String.fromCharCode(65 + i) + "</b> " + o.label + "</span></label>";
    });
    html += "</fieldset>";
  });
  html += '<div class="opt-foot"><button type="button" class="opt-reset">Reset</button></div>';
  panel.innerHTML = html;

  document.body.append(toggle, panel);

  function sync() {
    GROUPS.forEach((g) => {
      panel.querySelectorAll('input[name="opt-' + g.key + '"]').forEach((r) => (r.checked = r.value === state[g.key]));
    });
  }
  sync();

  panel.addEventListener("change", (e) => {
    const r = e.target;
    if (r.type !== "radio") return;
    state[r.name.slice(4)] = r.value;
    apply();
  });

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) panel.querySelector("input:checked, input").focus();
  }
  toggle.addEventListener("click", () => setOpen(panel.hidden));
  panel.querySelector(".opt-close").addEventListener("click", () => {
    setOpen(false);
    toggle.focus();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });

  panel.querySelector(".opt-reset").addEventListener("click", () => {
    GROUPS.forEach((g) => (state[g.key] = g.options[0].value));
    apply();
    sync();
  });

  // Open straight away with ?options (handy when sharing with the team).
  if (params.has("options")) setOpen(true);
})();

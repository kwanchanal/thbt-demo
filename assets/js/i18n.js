// Simple i18n for a static page (no build step).
//
// - English lives in index.html: it's the default, works without JS, and is the
//   fallback for any key a translation leaves empty.
// - Other languages live in assets/i18n/<code>.js and are loaded only when chosen.
// - Mark text with data-i18n="key" (add data-i18n-html if the string contains markup),
//   and attributes with data-i18n-attr="alt:key;aria-label:other.key".
// - Pick a language with the switcher, or ?lang=th in the URL. The choice is remembered.
// - Fires "thbt:langchange" on document after every switch.
(function () {
  // Set ready: true once a language file is translated. ?lang=xx still previews a non-ready language.
  const LANGS = [
    { code: "en", label: "EN", name: "English", ready: true },
    { code: "th", label: "ไทย", name: "ภาษาไทย", ready: true, font: "Noto+Sans+Thai:wght@400;600;700" },
    { code: "ru", label: "РУС", name: "Русский", ready: true },
    { code: "my", label: "မြန်မာ", name: "မြန်မာဘာသာ", ready: true, font: "Noto+Sans+Myanmar:wght@400;600;700" },
  ];
  const DEFAULT = "en";
  const STORE_KEY = "thbt-lang";

  const dicts = (window.THBT_I18N = window.THBT_I18N || {});
  const byCode = Object.fromEntries(LANGS.map((l) => [l.code, l]));

  function attrPairs(el) {
    return (el.dataset.i18nAttr || "")
      .split(";")
      .map((p) => p.split(":").map((s) => s.trim()))
      .filter((p) => p.length === 2 && p[0] && p[1]);
  }

  // Read the English text straight from the page so it never drifts from the HTML.
  const en = {};
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    en[el.dataset.i18n] = el.hasAttribute("data-i18n-html") ? el.innerHTML.trim() : el.textContent.trim();
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    attrPairs(el).forEach(([attr, key]) => (en[key] = el.getAttribute(attr)));
  });
  dicts.en = en;

  function apply(code) {
    const dict = dicts[code] || {};
    const t = (key) => (dict[key] ? dict[key] : en[key]);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const text = t(el.dataset.i18n);
      if (text == null) return;
      // Only trusted strings from our own dictionary files are set as HTML.
      if (el.hasAttribute("data-i18n-html")) el.innerHTML = text;
      else el.textContent = text;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      attrPairs(el).forEach(([attr, key]) => {
        const text = t(key);
        if (text != null) el.setAttribute(attr, text);
      });
    });

    document.documentElement.lang = code;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === code)));
    try {
      localStorage.setItem(STORE_KEY, code);
    } catch (e) {}
    document.dispatchEvent(new CustomEvent("thbt:langchange", { detail: { lang: code } }));
  }

  function loadFont(lang) {
    if (!lang.font || document.getElementById("font-" + lang.code)) return;
    const link = document.createElement("link");
    link.id = "font-" + lang.code;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + lang.font + "&display=swap";
    document.head.appendChild(link);
  }

  function setLang(code) {
    const lang = byCode[code] || byCode[DEFAULT];
    loadFont(lang);
    if (lang.code === "en" || dicts[lang.code]) return apply(lang.code);
    const script = document.createElement("script");
    script.src = "assets/i18n/" + lang.code + ".js";
    script.onload = () => apply(lang.code);
    script.onerror = () => apply(DEFAULT);
    document.head.appendChild(script);
  }

  // Switcher: a toggle ("🌐 English ▾") that opens a menu of full language names.
  const nav = document.querySelector(".lang-switch");
  const GLOBE =
    '<svg class="lang-globe" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">' +
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>';
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "lang-toggle";
  toggle.setAttribute("aria-haspopup", "true");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML =
    GLOBE + '<span class="lang-current"></span><span class="lang-current-name"></span><span class="lang-caret" aria-hidden="true">▾</span>';
  const menu = document.createElement("div");
  menu.className = "lang-menu";
  if (nav) nav.append(toggle, menu);

  const buttons = LANGS.map((lang) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.lang = lang.code;
    b.lang = lang.code;
    b.innerHTML = '<span class="lang-short"></span><span class="lang-name"></span>';
    b.querySelector(".lang-short").textContent = lang.label;
    b.querySelector(".lang-name").textContent = lang.name;
    b.title = lang.ready ? lang.name : lang.name + " — coming soon";
    b.setAttribute("aria-label", lang.name);
    b.disabled = !lang.ready;
    b.addEventListener("click", () => {
      setLang(lang.code);
      setOpen(false);
    });
    menu.appendChild(b);
    return b;
  });

  function setOpen(open) {
    if (!nav) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }
  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  document.addEventListener("click", (e) => {
    if (nav && !nav.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener("thbt:langchange", (e) => {
    const lang = byCode[e.detail.lang];
    toggle.querySelector(".lang-current").textContent = lang.label;
    toggle.querySelector(".lang-current-name").textContent = lang.name;
    toggle.setAttribute("aria-label", "Language: " + lang.name);
  });


  // Starting language: ?lang= → remembered choice → browser language (if ready) → English.
  function initial() {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (fromUrl && byCode[fromUrl]) return fromUrl;
    let saved = null;
    try {
      saved = localStorage.getItem(STORE_KEY);
    } catch (e) {}
    if (saved && byCode[saved] && byCode[saved].ready) return saved;
    const browser = (navigator.language || "").slice(0, 2);
    if (byCode[browser] && byCode[browser].ready) return browser;
    return DEFAULT;
  }

  setLang(initial());
})();

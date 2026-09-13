/* 深淺色主題切換 — 記在 localStorage，讀寫都包 try/catch */
(function () {
  var KEY = "notes-theme";
  var root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* 無痕模式等情況，忽略 */ }
  }

  var saved = stored();
  if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);

  function effective() {
    var attr = root.getAttribute("data-theme");
    if (attr) return attr;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function paint(btn) {
    var dark = effective() === "dark";
    btn.textContent = dark ? "☀" : "☾";
    btn.setAttribute("aria-label", dark ? "切換為淺色主題" : "切換為深色主題");
    btn.title = btn.getAttribute("aria-label");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".theme-toggle");
    if (!btn) return;
    paint(btn);
    btn.addEventListener("click", function () {
      var next = effective() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      save(next);
      paint(btn);
    });
  });
})();

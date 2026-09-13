/* ============================================================
   瀏覽次數計數器 — 前端

   呼叫 Cloudflare Pages Function（functions/api/views.js），
   資料存在 Cloudflare D1。不需要任何金鑰，也沒有外部依賴。

   端點寫成絕對網址，所以 GitHub Pages 那個網址也能用，
   兩個網址共用同一份計數（API 端有對應的 CORS 設定）。
   ============================================================ */

(function () {
  "use strict";

  var API = "https://notes-7ri.pages.dev/api/views";

  var el = document.querySelector("[data-hit-count]");
  if (!el) return;
  var box = el.closest(".hits") || el;

  /* 路徑正規化 —— 讓兩個平台算同一個頁面。
       GitHub Pages  /notes/lesserafim.html
       Cloudflare    /lesserafim
     兩者都對應到    /lesserafim                                  */
  function pageKey() {
    var p = location.pathname;
    p = p.replace(/\/index\.html$/i, "/");
    p = p.replace(/^\/notes(?=\/|$)/, "");
    p = p.replace(/\.html$/i, "");
    p = p.replace(/\/+$/, "");
    if (p === "") p = "/index";
    return /^\/[A-Za-z0-9_\-/]*$/.test(p) ? p : null;
  }

  function readFlag(k) {
    try { return sessionStorage.getItem(k); } catch (e) { return null; }
  }
  function writeFlag(k) {
    try { sessionStorage.setItem(k, "1"); } catch (e) { /* 無痕模式，略過 */ }
  }

  var key = pageKey();
  if (!key) { box.hidden = true; return; }

  var flag = "hit:" + key;
  // 同一個工作階段內重新載入只讀取，不重複累加
  var counted = readFlag(flag);

  var ctrl = null;
  if (typeof AbortController === "function") {
    ctrl = new AbortController();
    setTimeout(function () { ctrl.abort(); }, 8000);
  }

  var req = counted
    ? fetch(API + "?path=" + encodeURIComponent(key), {
        method: "GET",
        signal: ctrl ? ctrl.signal : undefined,
      })
    : fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: key }),
        signal: ctrl ? ctrl.signal : undefined,
      });

  req
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (d) {
      var v = Number(d && d.views);
      if (!isFinite(v)) throw new Error("bad value");
      el.textContent = v.toLocaleString("zh-Hant");
      box.hidden = false;
      if (!counted) writeFlag(flag);
    })
    .catch(function () {
      // 計數器壞掉不該影響閱讀，直接藏起來
      box.hidden = true;
    });
})();

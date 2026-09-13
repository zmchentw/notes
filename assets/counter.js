/* ============================================================
   瀏覽次數計數器 — 前端

   直接用 fetch 呼叫 Supabase 的 REST RPC 端點，不載入 supabase-js
   函式庫，整個檔案不到 2 KB，也不增加任何外部依賴。

   設定值讀自 assets/config.js。沒設定時安靜隱藏，不顯示錯誤。
   ============================================================ */

(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var el = document.querySelector("[data-hit-count]");
  if (!el) return;

  var box = el.closest(".hits") || el;

  // 沒設定就把整個計數器藏起來
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
    box.hidden = true;
    return;
  }

  /* 路徑正規化 —— 讓兩個平台算同一個頁面。
     GitHub Pages  /notes/lesserafim.html
     Cloudflare    /lesserafim
     兩者都要對應到  /lesserafim                                   */
  function pageKey() {
    var p = location.pathname;
    p = p.replace(/\/index\.html$/i, "/");
    p = p.replace(/^\/notes(?=\/|$)/, "");
    p = p.replace(/\.html$/i, "");
    p = p.replace(/\/+$/, "");
    return p === "" ? "/index" : p;
  }

  function readFlag(k) {
    try { return sessionStorage.getItem(k); } catch (e) { return null; }
  }
  function writeFlag(k) {
    try { sessionStorage.setItem(k, "1"); } catch (e) { /* 無痕模式，略過 */ }
  }

  var key = pageKey();
  var flag = "hit:" + key;

  // 同一個工作階段內重新載入只讀取，不重複累加
  var alreadyCounted = readFlag(flag);
  var fn = alreadyCounted ? "get_page_views" : "increment_page_view";

  var ctrl = null;
  if (typeof AbortController === "function") {
    ctrl = new AbortController();
    setTimeout(function () { ctrl.abort(); }, 8000);
  }

  fetch(cfg.SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/rpc/" + fn, {
    method: "POST",
    headers: {
      "apikey": cfg.SUPABASE_ANON_KEY,
      "Authorization": "Bearer " + cfg.SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ p_path: key }),
    signal: ctrl ? ctrl.signal : undefined
  })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (n) {
      var v = typeof n === "number" ? n : parseInt(n, 10);
      if (!isFinite(v)) throw new Error("bad value");
      el.textContent = v.toLocaleString("zh-Hant");
      box.hidden = false;
      if (!alreadyCounted) writeFlag(flag);
    })
    .catch(function () {
      // 計數器壞掉不該影響閱讀，直接藏起來
      box.hidden = true;
    });
})();

/* ============================================================
   瀏覽次數 API — Cloudflare Pages Function
   端點：/api/views

     POST  { "path": "/index" }   遞增並回傳新的次數
     GET   /api/views?path=/index 只讀取，不遞增

   D1 綁定名稱 DB，設定在專案根目錄的 wrangler.toml。

   加上 CORS 是為了讓 GitHub Pages 那個網址也能呼叫這個 API，
   兩個網址因此共用同一份計數。
   ============================================================ */

const ALLOWED_ORIGINS = new Set([
  "https://notes-7ri.pages.dev",
  "https://zmchentw.github.io",
]);

function headers(origin) {
  const h = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
    h["Access-Control-Max-Age"] = "86400";
  }
  return h;
}

function json(body, origin, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: headers(origin) });
}

/* 只接受前端正規化後的安全路徑，擋掉塞垃圾資料的嘗試 */
function normalizePath(p) {
  if (typeof p !== "string") return null;
  if (p.length < 1 || p.length > 120) return null;
  if (!/^\/[A-Za-z0-9_\-/]*$/.test(p)) return null;
  return p;
}

export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 204,
    headers: headers(request.headers.get("Origin")),
  });
}

export async function onRequestGet({ request, env }) {
  const origin = request.headers.get("Origin");
  const path = normalizePath(new URL(request.url).searchParams.get("path"));
  if (!path) return json({ error: "invalid path" }, origin, 400);

  try {
    const row = await env.DB
      .prepare("SELECT views FROM page_views WHERE path = ?")
      .bind(path)
      .first();
    return json({ path, views: row ? row.views : 0 }, origin);
  } catch (e) {
    return json({ error: "db error" }, origin, 500);
  }
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "invalid json" }, origin, 400);
  }

  const path = normalizePath(body && body.path);
  if (!path) return json({ error: "invalid path" }, origin, 400);

  try {
    const row = await env.DB
      .prepare(
        `INSERT INTO page_views (path, views, updated_at)
         VALUES (?, 1, datetime('now'))
         ON CONFLICT(path) DO UPDATE
           SET views = views + 1, updated_at = datetime('now')
         RETURNING views`
      )
      .bind(path)
      .first();
    return json({ path, views: row ? row.views : 1 }, origin);
  } catch (e) {
    return json({ error: "db error" }, origin, 500);
  }
}

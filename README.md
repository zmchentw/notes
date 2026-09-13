# notes

LE SSERAFIM 靜態資料站。純 HTML／CSS，無框架、無建置步驟、無外部資源依賴。

## 線上網址

| 平台 | 網址 |
|---|---|
| GitHub Pages | <https://zmchentw.github.io/notes/> |
| Cloudflare Pages | <https://notes-7ri.pages.dev/> |

兩邊都在 push 到 `main` 之後自動更新。

## 內容

| 頁面 | 說明 |
|---|---|
| `index.html` | 首頁與三十秒摘要 |
| `lesserafim.html` | LE SSERAFIM 入門指南：團名、成員背景、代表曲、為什麼吸引人 |
| `concert.html` | 2026 PUREFLOW 台北演唱會：時間地點、票價、售票時程 |
| `404.html` | 找不到頁面時顯示，兩個平台都會自動採用 |

## 本機預覽

不需要任何建置工具，直接開檔案就能看：

```bash
start index.html
```

或跑一個簡單的伺服器：

```bash
python -m http.server 8000
```

## 部署設定

### GitHub Pages

- 來源：`main` 分支的根目錄
- `.nojekyll` 讓 GitHub 跳過 Jekyll 處理，直接原樣提供靜態檔案
- push 後由 `pages-build-deployment` 自動建置，約 20–30 秒完成

### Cloudflare Pages

採用 **Cloudflare 後台的 Git 整合**，不需要 API token 也不需要 GitHub secrets。
設定如下：

| 項目 | 值 |
|---|---|
| Project name | `notes` |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | （空白） |
| Build output directory | `/` |

Cloudflare 的 GitHub App 只授權存取 `zmchentw/notes` 這一個倉庫，而非全部倉庫。

> **注意**：Cloudflare Pages 專案分成 *Git 整合* 與 *直接上傳* 兩種模式，建立之後**不能互換**。
> 這個專案是 Git 整合模式，所以不需要（也不該用）`wrangler pages deploy`。

## 兩個平台的行為差異

| 行為 | GitHub Pages | Cloudflare Pages |
|---|---|---|
| `/lesserafim.html` | 直接提供 | 308 轉址到 `/lesserafim` |
| 正規網址 | 含 `.html` | 不含 `.html` |
| 找不到的路徑 | 回 `404.html`，狀態 404 | 回 `404.html`，狀態 404 |

內部連結一律寫成 `xxx.html`：在 GitHub Pages 上直接命中，在 Cloudflare 上會轉址一次到無後綴網址。
兩邊都能正常運作，所以不需要為了其中一邊改寫連結。

沒有 `404.html` 時，Cloudflare Pages 會對不存在的路徑**退回首頁並回傳 200**，
而不是 404 —— 這是加入 `404.html` 的原因。

## 圖片與影片

`assets/img/` 的照片全部取自 Wikimedia Commons 的自由授權檔案，下載後縮小並轉為
JPEG 存在倉庫內，不熱連結他人伺服器。授權標示寫在圖片下方，完整清單見
`lesserafim.html` 的「圖片出處」一節。

| 檔案 | 來源 | 授權 |
|---|---|---|
| `cover-gda.jpg` | 2026 金唱片大獎紅毯，_TV10 | CC BY 4.0 |
| `cover-live.jpg` | Easy Crazy Hot 巡演西雅圖場，David Lee | CC BY 4.0 |
| `member-*.jpg` | K-POPIT 케이팝잇、티비텐 | CC BY 3.0 |
| `logo-white.svg` | Source Music | 公有領域 |

影片一律使用官方 YouTube 頻道的 `youtube-nocookie.com` 嵌入播放器，
不另存任何影音檔案。

## 瀏覽次數計數器

資料存在 **Cloudflare D1**，API 是一個 **Pages Function**，跟網站一起自動部署。
不需要任何 API 金鑰，前端沒有外部依賴。

| 元件 | 位置 |
|---|---|
| D1 資料庫 | `notes-counter`（APAC 區域） |
| 資料表 | `page_views (path, views, updated_at)` |
| API | `functions/api/views.js` → `/api/views` |
| D1 綁定 | `wrangler.toml` 的 `[[d1_databases]]`，綁定名稱 `DB` |
| 前端 | `assets/counter.js`，顯示在各頁頁尾 |

用法：

```
POST /api/views    {"path": "/index"}      遞增並回傳新次數
GET  /api/views?path=/index                只讀取
```

幾個設計要點：

- **兩個網址共用同一份計數。** 前端會把路徑正規化，GitHub Pages 的
  `/notes/lesserafim.html` 與 Cloudflare 的 `/lesserafim` 都記成 `/lesserafim`。
  API 端有 CORS 白名單，所以 GitHub Pages 也能呼叫 Cloudflare 上的 API。
- **同一個工作階段重新載入不會重複累加**，靠 `sessionStorage` 記錄。
- **計數器失效不影響閱讀**：抓不到數字就把整個元素隱藏，不顯示錯誤。
- API 只接受 `^/[A-Za-z0-9_\-/]*$` 且長度 120 以內的路徑，避免被塞垃圾資料。

> `wrangler.toml` 存在時，Cloudflare 會以它為設定來源，後台的建置設定會被忽略。
> `name` 必須與 Pages 專案名稱一致（`notes`）。

## 內容來源

站上的內容整理自對話紀錄，外部事實的來源連結都列在各頁底部。
演唱會資訊變動快，實際請以官方公告為準。

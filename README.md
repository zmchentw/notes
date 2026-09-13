# notes

個人筆記靜態網站。純 HTML／CSS，無框架、無建置步驟、無外部資源依賴。

## 內容

| 頁面 | 說明 |
|---|---|
| `index.html` | 首頁 |
| `lesserafim.html` | LE SSERAFIM 入門指南：團名、成員背景、代表曲、為什麼吸引人 |
| `concert.html` | 2026 PUREFLOW 台北演唱會：時間地點、票價、售票時程 |
| `setup.html` | Windows 開發環境建置紀錄與疑難排解 |

## 本機預覽

不需要任何建置工具，直接開檔案就能看：

```bash
start index.html
```

或跑一個簡單的伺服器：

```bash
python -m http.server 8000
```

## 部署

推上 `main` 分支後，兩邊會同時自動部署。

### GitHub Pages

已啟用，來源是 `main` 分支的根目錄。倉庫裡的 `.nojekyll` 讓 GitHub 跳過 Jekyll 處理，
直接原樣提供靜態檔案。

網址：`https://zmchentw.github.io/notes/`

### Cloudflare Pages

有兩種接法，**選一種就好**。

#### 方式 A — Cloudflare 後台 Git 整合（推薦，不需要任何 token）

在 Cloudflare 後台把這個倉庫接上去，之後每次 push 由 Cloudflare 自己抓取並部署：

1. 進入 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages**
2. **Create** → **Pages** → **Connect to Git**
3. 授權 GitHub，選擇 `zmchentw/notes` 倉庫
4. 建置設定全部留空：
   - Framework preset：`None`
   - Build command：**留空**
   - Build output directory：`/`
5. **Save and Deploy**

這個方式不需要 API token，也不需要 GitHub secrets。
接上之後 `.github/workflows/deploy-cloudflare.yml` 就不需要了，可以刪除。

#### 方式 B — GitHub Actions 推送部署

如果偏好由 GitHub Actions 主動推送，倉庫裡已經備好
`.github/workflows/deploy-cloudflare.yml`。啟用前要先做兩件事：

**1. 在 Cloudflare 建立 API token**

Cloudflare Dashboard → 右上角帳號圖示 → **API Tokens** → **Create Token**
→ 使用範本 **Edit Cloudflare Workers**（或自訂一個帶 `Cloudflare Pages: Edit` 權限的 token）。

同時記下 **Account ID**（在 Workers & Pages 頁面右側就能看到）。

**2. 加入 GitHub repository secrets**

倉庫 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**：

| Secret 名稱 | 值 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | 上一步建立的 token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 帳號 ID |

**3. 建立 Pages 專案**（只需一次）

```bash
npx wrangler pages project create notes --production-branch main
```

設定完成後，每次 push 到 `main` 就會自動部署。

> **注意**：Cloudflare Pages 的專案分成 *Git 整合* 與 *直接上傳* 兩種模式，
> 建立之後**不能互換**。方式 A 建立的是 Git 整合專案，方式 B 是直接上傳專案。
> 所以請先決定用哪一種再動手。

## 授權與內容來源

站上的內容整理自對話紀錄，外部事實的來源連結都列在各頁底部。
票務與演唱會資訊變動快，實際請以官方公告為準。

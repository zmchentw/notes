/* ============================================================
   計數器設定
   ============================================================

   這兩個值要從 Supabase 後台取得：
     後台 → 左側 Project Settings → API
       Project URL  →  SUPABASE_URL
       anon public  →  SUPABASE_ANON_KEY

   注意：anon key 是「可公開」的金鑰，Supabase 的設計就是讓它出現在
   前端程式碼裡，所以它會被放進這個公開倉庫、任何人都看得到。
   真正的保護來自 supabase/schema.sql 裡的 RLS 設定 ——
   這把金鑰只能呼叫「+1」和「讀取次數」兩個函式，不能做別的事。

   絕對不要把 service_role key 放進來，那把是有完整權限的密鑰。

   兩個值留空時，計數器會靜默隱藏，網站其他功能不受影響。
   ============================================================ */

window.SITE_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: ""
};

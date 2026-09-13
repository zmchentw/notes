-- ============================================================
-- 瀏覽次數計數器 — Supabase 端結構
--
-- 用法：在 Supabase 後台左側選 SQL Editor，把整份貼上執行一次即可。
-- 重複執行是安全的（全部都是 if not exists / or replace）。
-- ============================================================


-- ------------------------------------------------------------
-- 1. 資料表
-- ------------------------------------------------------------

create table if not exists public.page_views (
  path       text        primary key,
  views      bigint      not null default 0,
  updated_at timestamptz not null default now()
);

comment on table public.page_views is
  '每個頁面路徑的累計瀏覽次數。path 由前端正規化後傳入，例如 /index、/lesserafim。';


-- ------------------------------------------------------------
-- 2. 開啟 RLS，且「不」建立任何 policy
--
--    這是關鍵：RLS 開啟但沒有 policy，代表 anon 角色完全無法直接
--    讀取或寫入這張表。所有存取都必須經過下面兩個函式，
--    而函式用 security definer 以擁有者身分執行、繞過 RLS。
--
--    結果：anon key 洩漏（它本來就是公開的）也只能做「+1」和「讀取」
--    這兩件事，無法刪除、無法改成任意數字、無法看到其他資料。
-- ------------------------------------------------------------

alter table public.page_views enable row level security;


-- ------------------------------------------------------------
-- 3. 遞增並回傳新的次數
-- ------------------------------------------------------------

create or replace function public.increment_page_view(p_path text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_views bigint;
begin
  -- 擋掉異常輸入，避免被塞垃圾路徑
  if p_path is null or p_path = '' or length(p_path) > 200 then
    raise exception 'invalid path';
  end if;

  insert into public.page_views as pv (path, views, updated_at)
  values (p_path, 1, now())
  on conflict (path) do update
    set views = pv.views + 1,
        updated_at = now()
  returning pv.views into v_views;

  return v_views;
end;
$$;


-- ------------------------------------------------------------
-- 4. 只讀取，不遞增（同一個工作階段重新載入時使用）
-- ------------------------------------------------------------

create or replace function public.get_page_views(p_path text)
returns bigint
language sql
security definer
set search_path = public
as $$
  select coalesce((select views from public.page_views where path = p_path), 0);
$$;


-- ------------------------------------------------------------
-- 5. 權限：先全部收回，再只開放這兩個函式
-- ------------------------------------------------------------

revoke all on function public.increment_page_view(text) from public;
revoke all on function public.get_page_views(text)      from public;

grant execute on function public.increment_page_view(text) to anon, authenticated;
grant execute on function public.get_page_views(text)      to anon, authenticated;


-- ------------------------------------------------------------
-- 6. 驗證（執行後應該看到 1，再執行一次看到 2）
-- ------------------------------------------------------------

-- select public.increment_page_view('/test');
-- select public.get_page_views('/test');
-- delete from public.page_views where path = '/test';

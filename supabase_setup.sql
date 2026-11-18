-- 在 Supabase 控制台 → SQL Editor 里整段运行一次
create table if not exists public.progress (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lesson text not null,
  done_at timestamptz default now(),
  primary key (user_id, lesson)
);
alter table public.progress enable row level security;
create policy "own select" on public.progress for select using (auth.uid() = user_id);
create policy "own insert" on public.progress for insert with check (auth.uid() = user_id);
create policy "own delete" on public.progress for delete using (auth.uid() = user_id);

-- 站长查看学员名单与进度（只能在 SQL Editor 里以站长身份运行）
-- select u.raw_user_meta_data->>'display' as 昵称, split_part(u.email,'@',1) as 用户名,
--        u.created_at as 注册时间, u.last_sign_in_at as 最近登录, count(p.lesson) as 已学
-- from auth.users u left join public.progress p on p.user_id=u.id group by u.id order by u.created_at;

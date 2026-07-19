-- 20260718000100_user_schema.sql
-- 用户表三张：authenticated 获得 CRUD grants，RLS 限本人。
-- 来源：docs/prd/01-data-model.md §4。

create table user_bottles (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  bottle_id      uuid references bottles_catalog (id),
  custom_name    text,                            -- 手动添加时使用
  spirit_type_id uuid references spirit_types (id),
  volume_ml      int,
  status         text not null default 'owned',
  created_at     timestamptz not null default now(),
  -- catalog / custom 严格二选一：catalog 行不允许夹带 custom 字段；custom 名不得为空白。
  constraint user_bottles_source_check
    check (
      (bottle_id is not null and custom_name is null and spirit_type_id is null and volume_ml is null)
      or
      (bottle_id is null and nullif(btrim(custom_name), '') is not null and spirit_type_id is not null)
    ),
  constraint user_bottles_volume_check check (volume_ml is null or volume_ml > 0),
  constraint user_bottles_status_check check (status in ('owned','wishlist'))
);

-- unique (user_id, bottle_id) where bottle_id is not null
create unique index user_bottles_user_bottle_unique
  on user_bottles (user_id, bottle_id)
  where bottle_id is not null;

create table user_recipe_marks (              -- 收藏 + 评分（每人每配方一行）
  user_id     uuid not null references auth.users (id) on delete cascade,
  recipe_id   uuid not null references recipes (id) on delete cascade,
  is_favorite boolean not null default false,
  rating      smallint,
  updated_at  timestamptz not null default now(),
  primary key (user_id, recipe_id),
  constraint user_recipe_marks_rating_check check (rating between 1 and 5)
);

create table user_pour_logs (                 -- 调酒历史（多条）
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  recipe_id  uuid not null references recipes (id) on delete cascade,
  poured_at  date not null default current_date,
  rating     smallint,
  taste_tags text[] not null default '{}',
  note       text,
  created_at timestamptz not null default now(),
  constraint user_pour_logs_not_future check (poured_at <= current_date),
  constraint user_pour_logs_rating_check check (rating between 1 and 5),
  constraint user_pour_logs_taste_tags_check
    check (taste_tags <@ array['balanced','refreshing','sweet','sour','bitter','strong','fruity','herbal']::text[]),
  constraint user_pour_logs_note_check check (note is null or char_length(note) <= 500)
);

create index user_bottles_user_idx on user_bottles (user_id);
create index user_bottles_spirit_type_idx on user_bottles (spirit_type_id) where spirit_type_id is not null;
create index user_recipe_marks_user_idx on user_recipe_marks (user_id);
create index user_recipe_marks_recipe_idx on user_recipe_marks (recipe_id);
create index user_pour_logs_user_poured_idx on user_pour_logs (user_id, poured_at desc, created_at desc);
create index user_pour_logs_recipe_idx on user_pour_logs (recipe_id);

alter table user_bottles      enable row level security;
alter table user_recipe_marks enable row level security;
alter table user_pour_logs    enable row level security;

revoke all on table user_bottles, user_recipe_marks, user_pour_logs from public, anon, authenticated;
grant select, insert, update, delete on table user_bottles, user_recipe_marks, user_pour_logs to authenticated;
grant all on table user_bottles, user_recipe_marks, user_pour_logs to service_role;

create policy "user_bottles_select_own" on user_bottles for select to authenticated using (user_id = (select auth.uid()));
create policy "user_bottles_insert_own" on user_bottles for insert to authenticated with check (user_id = (select auth.uid()));
create policy "user_bottles_update_own" on user_bottles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "user_bottles_delete_own" on user_bottles for delete to authenticated using (user_id = (select auth.uid()));

create policy "user_recipe_marks_select_own" on user_recipe_marks for select to authenticated using (user_id = (select auth.uid()));
create policy "user_recipe_marks_insert_own" on user_recipe_marks for insert to authenticated with check (user_id = (select auth.uid()));
create policy "user_recipe_marks_update_own" on user_recipe_marks for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "user_recipe_marks_delete_own" on user_recipe_marks for delete to authenticated using (user_id = (select auth.uid()));

create policy "user_pour_logs_select_own" on user_pour_logs for select to authenticated using (user_id = (select auth.uid()));
create policy "user_pour_logs_insert_own" on user_pour_logs for insert to authenticated with check (user_id = (select auth.uid()));
create policy "user_pour_logs_update_own" on user_pour_logs for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "user_pour_logs_delete_own" on user_pour_logs for delete to authenticated using (user_id = (select auth.uid()));

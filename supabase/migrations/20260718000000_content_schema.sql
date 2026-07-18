-- 20260718000000_content_schema.sql
-- 内容表四张：官方内容，anon/authenticated 只读，service_role 可维护。
-- 来源：docs/prd/01-data-model.md §3（逐字翻译，not null 补强见计划「裁定口径 4」）。

create extension if not exists "pgcrypto";

create table spirit_types (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,              -- 'gin' / 'campari'
  name_zh     text not null,
  name_en     text not null,
  category    text not null,
  sort_order  int  not null default 0,
  constraint spirit_types_category_check
    check (category in ('gin','whisky','rum','vodka','tequila','brandy','liqueur','other')),
  constraint spirit_types_sort_order_check check (sort_order >= 0)
);

create table bottles_catalog (
  id             uuid primary key default gen_random_uuid(),
  spirit_type_id uuid not null references spirit_types (id),
  slug           text not null unique,
  name_zh        text not null,
  name_en        text not null,
  brand          text,
  volume_ml      int,
  image_url      text,
  is_active      boolean not null default true,
  constraint bottles_catalog_volume_check check (volume_ml is null or volume_ml > 0)
);

create table recipes (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,          -- URL 用，'negroni'
  name_zh         text not null,
  name_en         text not null,
  description_zh  text,
  description_en  text,
  instructions_zh text[] not null,               -- 每步一条
  instructions_en text[] not null,
  tip_zh          text,                          -- Bartender Tip，可空
  tip_en          text,
  image_url       text,
  difficulty      text not null,
  prep_minutes    int not null,
  abv_percent     numeric,
  flavor_tags     text[] not null default '{}',
  base_rating     numeric not null default 4.0,
  base_popularity int not null default 0,
  author_id       uuid references auth.users (id),  -- V1 全部 null（官方）
  is_public       boolean not null default true,
  created_at      timestamptz not null default now(),
  constraint recipes_difficulty_check check (difficulty in ('easy','medium','hard')),
  constraint recipes_prep_minutes_check check (prep_minutes >= 0),
  constraint recipes_abv_check check (abv_percent is null or abv_percent between 0 and 100),
  constraint recipes_flavor_tags_check
    check (flavor_tags <@ array['bitter','herbal','classic','strong','sour','citrus','refreshing','minty','sweet','fruity','creamy']::text[]),
  constraint recipes_base_rating_check check (base_rating between 3.0 and 5.0),
  constraint recipes_base_popularity_check check (base_popularity >= 0)
);

create table recipe_ingredients (
  id             uuid primary key default gen_random_uuid(),
  recipe_id      uuid not null references recipes (id) on delete cascade,
  is_spirit      boolean not null,
  spirit_type_id uuid references spirit_types (id),
  name_zh        text,   -- 显示名；is_spirit 行可空（回落 spirit_types 名称），辅料行必填
  name_en        text,
  amount         text not null,
  sort_order     int  not null default 0,
  -- spirit 与 spirit_type_id 必须同步，辅料不得夹带匹配单元
  constraint recipe_ingredients_spirit_type_required
    check ((is_spirit and spirit_type_id is not null) or (not is_spirit and spirit_type_id is null)),
  -- 辅料行（is_spirit=false）显示名双语必填
  constraint recipe_ingredients_name_required
    check (is_spirit or (nullif(btrim(name_zh), '') is not null and nullif(btrim(name_en), '') is not null)),
  constraint recipe_ingredients_amount_check check (btrim(amount) <> ''),
  constraint recipe_ingredients_sort_order_check check (sort_order >= 0),
  constraint recipe_ingredients_recipe_sort_unique unique (recipe_id, sort_order)
);

create index bottles_catalog_spirit_type_idx on bottles_catalog (spirit_type_id);
create index recipe_ingredients_recipe_idx on recipe_ingredients (recipe_id);
create index recipe_ingredients_spirit_type_idx on recipe_ingredients (spirit_type_id) where spirit_type_id is not null;
create index recipes_public_slug_idx on recipes (slug) where is_public;
create index recipes_author_idx on recipes (author_id) where author_id is not null;

alter table spirit_types       enable row level security;
alter table bottles_catalog    enable row level security;
alter table recipes            enable row level security;
alter table recipe_ingredients enable row level security;

grant usage on schema public to anon, authenticated, service_role;
revoke all on table spirit_types, bottles_catalog, recipes, recipe_ingredients from public, anon, authenticated;
grant select on table spirit_types, bottles_catalog, recipes, recipe_ingredients to anon, authenticated;
grant all on table spirit_types, bottles_catalog, recipes, recipe_ingredients to service_role;

create policy "spirit_types_select_all" on spirit_types for select to anon, authenticated using (true);
create policy "bottles_catalog_select_all" on bottles_catalog for select to anon, authenticated using (true);
create policy "recipes_select_public_or_own" on recipes for select to anon, authenticated
  using (is_public or author_id = (select auth.uid()));
create policy "recipe_ingredients_select_visible_recipe" on recipe_ingredients for select to anon, authenticated
  using (exists (
    select 1 from recipes
    where recipes.id = recipe_ingredients.recipe_id
      and (recipes.is_public or recipes.author_id = (select auth.uid()))
  ));

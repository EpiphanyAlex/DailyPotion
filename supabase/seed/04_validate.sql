-- 04_validate.sql — 种子数据自校验（违例即报错退出）
do $$
declare
  n        int;
  bad      text;
  expected text[] := array[
    'negroni','dry-martini','gimlet','whiskey-sour','mojito',
    'old-fashioned','manhattan','margarita','daiquiri','cosmopolitan',
    'moscow-mule','espresso-martini','white-russian','aperol-spritz','tom-collins',
    'sidecar','brandy-alexander','amaretto-sour','paloma','pina-colada'
  ];
begin
  select count(*) into n from spirit_types;
  if n < 25 then
    raise exception 'spirit_types 只有 % 条（期望 >= 25）', n;
  end if;

  select count(*) into n from bottles_catalog;
  if n < 30 then
    raise exception 'bottles_catalog 只有 % 条（期望 >= 30）', n;
  end if;

  if not exists (select 1 from bottles_catalog where slug = 'roku-gin') then
    raise exception 'bottles_catalog 缺少 roku-gin';
  end if;

  select string_agg(slug, ', ') into bad
  from unnest(expected) as e(slug)
  where not exists (select 1 from recipes r where r.slug = e.slug);
  if bad is not null then
    raise exception '缺少首发配方：%', bad;
  end if;

  -- 只校验本 seed 负责的 20 款；未来新增私有配方不应使 bootstrap 失败。
  select string_agg(r.slug, ', ') into bad
  from recipes r
  where r.slug = any(expected)
    and (
      array_length(r.instructions_zh, 1) is distinct from array_length(r.instructions_en, 1)
      or coalesce(array_length(r.instructions_zh, 1), 0) = 0
      or not exists (select 1 from recipe_ingredients ri where ri.recipe_id = r.id)
      or not exists (select 1 from recipe_ingredients ri where ri.recipe_id = r.id and ri.is_spirit)
    );
  if bad is not null then
    raise exception '以下配方双语步骤/配料/is_spirit 校验失败：%', bad;
  end if;

  select count(*) into n
  from recipe_ingredients ri
  join recipes r on r.id = ri.recipe_id
  where r.slug = any(expected);
  if n <> 75 then
    raise exception '首发配方配料共 % 条（期望 75）', n;
  end if;

  -- 每个 recipe 内 sort_order 已由 unique/check 保证非负且不重复，再确认从 0 连续。
  select string_agg(r.slug, ', ') into bad
  from recipes r
  cross join lateral (
    select min(sort_order) as min_sort, max(sort_order) as max_sort, count(*) as n
    from recipe_ingredients ri where ri.recipe_id = r.id
  ) s
  where r.slug = any(expected)
    and (s.min_sort <> 0 or s.max_sort <> s.n - 1);
  if bad is not null then
    raise exception '以下配方 sort_order 不连续：%', bad;
  end if;

  raise notice 'seed validate OK：20 款配方 / 75 条配料全部通过校验';
end $$;

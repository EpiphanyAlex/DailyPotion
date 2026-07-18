begin;

create extension if not exists pgtap with schema extensions;

select no_plan();

select is(
  (
    select count(*)
    from pg_class
    where relnamespace = 'public'::regnamespace
      and relname = any(array[
        'spirit_types',
        'bottles_catalog',
        'recipes',
        'recipe_ingredients',
        'user_bottles',
        'user_recipe_marks',
        'user_pour_logs'
      ])
      and relrowsecurity
  ),
  7::bigint,
  'all tables enable RLS'
);

select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
  ),
  16::bigint,
  'expected policy count'
);

select is(
  (
    select count(*)
    from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = any(array[
        'spirit_types',
        'bottles_catalog',
        'recipes',
        'recipe_ingredients'
      ])
      and grantee in ('anon', 'authenticated')
      and privilege_type = 'SELECT'
  ),
  8::bigint,
  'content SELECT grants'
);

select is(
  (
    select count(*)
    from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = any(array[
        'spirit_types',
        'bottles_catalog',
        'recipes',
        'recipe_ingredients'
      ])
      and grantee in ('anon', 'authenticated')
      and privilege_type <> 'SELECT'
  ),
  0::bigint,
  'no client content writes'
);

select is(
  (
    select count(*)
    from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = any(array[
        'user_bottles',
        'user_recipe_marks',
        'user_pour_logs'
      ])
      and grantee = 'anon'
  ),
  0::bigint,
  'anon has no user-table grants'
);

select is(
  (
    select count(*)
    from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = any(array[
        'user_bottles',
        'user_recipe_marks',
        'user_pour_logs'
      ])
      and grantee = 'authenticated'
      and privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
  ),
  12::bigint,
  'authenticated user CRUD grants'
);

select is(
  (
    select count(*)
    from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = any(array[
        'user_bottles',
        'user_recipe_marks',
        'user_pour_logs'
      ])
      and grantee = 'authenticated'
      and privilege_type not in ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
  ),
  0::bigint,
  'authenticated has no extra user-table grants'
);

select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = any(array[
        'user_bottles',
        'user_recipe_marks',
        'user_pour_logs'
      ])
  ),
  12::bigint,
  'expected user policy count'
);

select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = any(array[
        'user_bottles',
        'user_recipe_marks',
        'user_pour_logs'
      ])
      and (coalesce(qual, '') || coalesce(with_check, '')) ilike '%select auth.uid()%'
  ),
  12::bigint,
  'user policies use scalar auth.uid'
);

select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = any(array[
        'user_bottles',
        'user_recipe_marks',
        'user_pour_logs'
      ])
      and (
        (qual is not null and qual not ilike '%select auth.uid()%')
        or (with_check is not null and with_check not ilike '%select auth.uid()%')
      )
  ),
  0::bigint,
  'every user policy expression uses scalar auth.uid'
);

select alike(
  (
    select qual
    from pg_policies
    where schemaname = 'public'
      and tablename = 'recipe_ingredients'
      and policyname = 'recipe_ingredients_select_visible_recipe'
  ),
  '%EXISTS%recipes.id%recipe_ingredients.recipe_id%',
  'ingredients follow parent visibility'
);

select unalike(
  (
    select qual
    from pg_policies
    where schemaname = 'public'
      and tablename = 'recipe_ingredients'
      and policyname = 'recipe_ingredients_select_visible_recipe'
  ),
  '%true%',
  'ingredients policy is not globally visible'
);

select * from finish();

rollback;

begin;

create extension if not exists pgtap with schema extensions;

select no_plan();

select has_table('public'::name, 'spirit_types'::name);
select has_table('public'::name, 'bottles_catalog'::name);
select has_table('public'::name, 'recipes'::name);
select has_table('public'::name, 'recipe_ingredients'::name);
select has_table('public'::name, 'user_bottles'::name);
select has_table('public'::name, 'user_recipe_marks'::name);
select has_table('public'::name, 'user_pour_logs'::name);

with expected_checks(table_name, constraint_name) as (
  values
    ('spirit_types', 'spirit_types_category_check'),
    ('spirit_types', 'spirit_types_sort_order_check'),
    ('bottles_catalog', 'bottles_catalog_volume_check'),
    ('recipes', 'recipes_difficulty_check'),
    ('recipes', 'recipes_prep_minutes_check'),
    ('recipes', 'recipes_abv_check'),
    ('recipes', 'recipes_flavor_tags_check'),
    ('recipes', 'recipes_base_rating_check'),
    ('recipes', 'recipes_base_popularity_check'),
    ('recipe_ingredients', 'recipe_ingredients_spirit_type_required'),
    ('recipe_ingredients', 'recipe_ingredients_name_required'),
    ('recipe_ingredients', 'recipe_ingredients_amount_check'),
    ('recipe_ingredients', 'recipe_ingredients_sort_order_check'),
    ('user_bottles', 'user_bottles_source_check'),
    ('user_bottles', 'user_bottles_volume_check'),
    ('user_bottles', 'user_bottles_status_check'),
    ('user_recipe_marks', 'user_recipe_marks_rating_check'),
    ('user_pour_logs', 'user_pour_logs_not_future'),
    ('user_pour_logs', 'user_pour_logs_rating_check'),
    ('user_pour_logs', 'user_pour_logs_taste_tags_check'),
    ('user_pour_logs', 'user_pour_logs_note_check')
)
select ok(
  exists(
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = expected_checks.table_name
      and c.conname = expected_checks.constraint_name
      and c.contype = 'c'
  ),
  format(
    'public.%I has check constraint %I',
    expected_checks.table_name,
    expected_checks.constraint_name
  )
)
from expected_checks;

select has_index('public'::name, 'bottles_catalog'::name, 'bottles_catalog_spirit_type_idx'::name);
select has_index('public'::name, 'recipe_ingredients'::name, 'recipe_ingredients_recipe_idx'::name);
select has_index('public'::name, 'recipe_ingredients'::name, 'recipe_ingredients_spirit_type_idx'::name);
select has_index('public'::name, 'recipes'::name, 'recipes_public_slug_idx'::name);
select has_index('public'::name, 'recipes'::name, 'recipes_author_idx'::name);
select has_index('public'::name, 'user_bottles'::name, 'user_bottles_user_bottle_unique'::name);
select has_index('public'::name, 'user_bottles'::name, 'user_bottles_user_idx'::name);
select has_index('public'::name, 'user_bottles'::name, 'user_bottles_spirit_type_idx'::name);
select has_index('public'::name, 'user_recipe_marks'::name, 'user_recipe_marks_user_idx'::name);
select has_index('public'::name, 'user_recipe_marks'::name, 'user_recipe_marks_recipe_idx'::name);
select has_index('public'::name, 'user_pour_logs'::name, 'user_pour_logs_user_poured_idx'::name);
select has_index('public'::name, 'user_pour_logs'::name, 'user_pour_logs_recipe_idx'::name);

select col_not_null('public'::name, 'recipes'::name, 'instructions_zh'::name, 'recipes.instructions_zh is not null');
select col_not_null('public'::name, 'recipes'::name, 'instructions_en'::name, 'recipes.instructions_en is not null');
select col_not_null('public'::name, 'user_bottles'::name, 'user_id'::name, 'user_bottles.user_id is not null');
select col_not_null('public'::name, 'user_pour_logs'::name, 'user_id'::name, 'user_pour_logs.user_id is not null');

select * from finish();

rollback;

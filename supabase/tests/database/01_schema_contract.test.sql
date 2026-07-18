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

select has_check('public', 'spirit_types', 'spirit_types_category_check');
select has_check('public', 'spirit_types', 'spirit_types_sort_order_check');
select has_check('public', 'bottles_catalog', 'bottles_catalog_volume_check');
select has_check('public', 'recipes', 'recipes_difficulty_check');
select has_check('public', 'recipes', 'recipes_prep_minutes_check');
select has_check('public', 'recipes', 'recipes_abv_check');
select has_check('public', 'recipes', 'recipes_flavor_tags_check');
select has_check('public', 'recipes', 'recipes_base_rating_check');
select has_check('public', 'recipes', 'recipes_base_popularity_check');
select has_check('public', 'recipe_ingredients', 'recipe_ingredients_spirit_type_required');
select has_check('public', 'recipe_ingredients', 'recipe_ingredients_name_required');
select has_check('public', 'recipe_ingredients', 'recipe_ingredients_amount_check');
select has_check('public', 'recipe_ingredients', 'recipe_ingredients_sort_order_check');
select has_check('public', 'user_bottles', 'user_bottles_source_check');
select has_check('public', 'user_bottles', 'user_bottles_volume_check');
select has_check('public', 'user_bottles', 'user_bottles_status_check');
select has_check('public', 'user_recipe_marks', 'user_recipe_marks_rating_check');
select has_check('public', 'user_pour_logs', 'user_pour_logs_not_future');
select has_check('public', 'user_pour_logs', 'user_pour_logs_rating_check');
select has_check('public', 'user_pour_logs', 'user_pour_logs_taste_tags_check');
select has_check('public', 'user_pour_logs', 'user_pour_logs_note_check');

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

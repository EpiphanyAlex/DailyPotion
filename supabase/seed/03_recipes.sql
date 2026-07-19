-- 03_recipes.sql — 首发 20 款经典配方（5 款示范在此，其余 15 款按同格式追加）
-- 幂等：只清掉本文件负责的 20 个 slug 的配料再重插；recipes 行按 slug 更新，不删除 recipe UUID。
delete from recipe_ingredients
where recipe_id in (
  select id from recipes where slug in (
    'negroni','dry-martini','gimlet','whiskey-sour','mojito',
    'old-fashioned','manhattan','margarita','daiquiri','cosmopolitan',
    'moscow-mule','espresso-martini','white-russian','aperol-spritz','tom-collins',
    'sidecar','brandy-alexander','amaretto-sour','paloma','pina-colada'
  )
);

-- ═══ 1. Negroni 内格罗尼 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'negroni', '内格罗尼', 'Negroni',
  '金酒、金巴利与甜味美思 1:1:1 调和的意大利开胃酒经典，苦甜交织、酒体扎实。',
  'The iconic Italian aperitivo: equal parts gin, Campari and sweet vermouth—bittersweet, bold and timeless.',
  array['在搅拌杯中装满冰块','量入金酒、金巴利、甜味美思各 30 ml','搅拌 20–30 秒至充分冰镇','滤入放有大方冰的古典杯','削一片橙皮，挤压皮油后投入杯中'],
  array['Fill a mixing glass with ice','Add 30 ml each of gin, Campari and sweet vermouth','Stir for 20–30 seconds until well chilled','Strain into a rocks glass over a large ice cube','Express an orange peel over the drink and drop it in'],
  '用一块大方冰代替碎冰，融水更慢，苦甜结构能撑到最后一口。',
  'Use one large ice cube instead of crushed ice—slower dilution keeps the bittersweet structure to the last sip.',
  null,
  'easy', 3, 24, array['bitter','herbal','classic'], 4.8, 95
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'negroni'), true,  (select id from spirit_types where slug = 'gin'),            null, null, '30 ml', 0),
  ((select id from recipes where slug = 'negroni'), true,  (select id from spirit_types where slug = 'campari'),        null, null, '30 ml', 1),
  ((select id from recipes where slug = 'negroni'), true,  (select id from spirit_types where slug = 'sweet-vermouth'), null, null, '30 ml', 2),
  ((select id from recipes where slug = 'negroni'), false, null, '橙皮', 'Orange peel', '1 piece', 3);

-- ═══ 2. Dry Martini 干马天尼 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'dry-martini', '干马天尼', 'Dry Martini',
  '极简也极考究的调酒之王：冰冷的金酒被少许干味美思衬出植物香气，干冽利落。',
  'The king of cocktails at its most austere: ice-cold gin lifted by a whisper of dry vermouth—crisp, dry and precise.',
  array['搅拌杯装满冰块','量入金酒 60 ml、干味美思 10 ml','搅拌约 30 秒至充分冰镇','滤入冰镇过的马天尼杯','以柠檬皮油封面，或改投一颗橄榄'],
  array['Fill a mixing glass with ice','Add 60 ml gin and 10 ml dry vermouth','Stir for about 30 seconds until well chilled','Strain into a chilled martini glass','Express a lemon twist over the surface, or garnish with an olive instead'],
  '酒杯提前放冷冻室 10 分钟——马天尼的一半灵魂是温度。',
  'Freeze the glass for 10 minutes beforehand—half the soul of a Martini is temperature.',
  null,
  'medium', 4, 32, array['strong','classic'], 4.7, 88
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'dry-martini'), true,  (select id from spirit_types where slug = 'gin'),          null, null, '60 ml', 0),
  ((select id from recipes where slug = 'dry-martini'), true,  (select id from spirit_types where slug = 'dry-vermouth'), null, null, '10 ml', 1),
  ((select id from recipes where slug = 'dry-martini'), false, null, '柠檬皮或橄榄', 'Lemon twist or olive', '1 piece', 2);

-- ═══ 3. Gimlet 吉姆雷特 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'gimlet', '吉姆雷特', 'Gimlet',
  '金酒与青柠的两分钟经典：酸甜干净利落，是检验一支金酒品质的试金石。',
  'A two-minute classic of gin and lime: clean, tart and bright—the litmus test for any bottle of gin.',
  array['摇酒壶中加入金酒、青柠汁与糖浆','加满冰块，用力摇 10–15 秒','双重过滤入冰镇过的碟形杯','杯沿装饰一片青柠'],
  array['Add gin, lime juice and simple syrup to a shaker','Fill with ice and shake hard for 10–15 seconds','Double-strain into a chilled coupe','Garnish with a lime wheel on the rim'],
  '青柠汁必须现挤——放置超过几小时的青柠汁会发闷，整杯酒就塌了。',
  'Use lime juice squeezed to order—juice left standing for hours turns flat and dulls the whole drink.',
  null,
  'easy', 3, 27, array['sour','citrus','refreshing'], 4.5, 70
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'gimlet'), true,  (select id from spirit_types where slug = 'gin'), null, null, '60 ml', 0),
  ((select id from recipes where slug = 'gimlet'), false, null, '青柠汁', 'Fresh lime juice', '20 ml', 1),
  ((select id from recipes where slug = 'gimlet'), false, null, '糖浆',   'Simple syrup',     '15 ml', 2);

-- ═══ 4. Whiskey Sour 威士忌酸酒 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'whiskey-sour', '威士忌酸酒', 'Whiskey Sour',
  '波本、柠檬与糖浆的黄金三角，蛋清带来天鹅绒般的泡沫，是酸酒家族的标杆。',
  'Bourbon, lemon and sugar in golden proportion, with egg white for a velvet crown of foam—the benchmark of the sour family.',
  array['摇酒壶中加入威士忌、柠檬汁、糖浆与蛋清','先不加冰干摇 10 秒打出泡沫','加满冰块再摇 15 秒','双重过滤入放有大冰块的古典杯','可在泡沫上滴几滴安高天娜苦精作装饰'],
  array['Add whiskey, lemon juice, simple syrup and egg white to a shaker','Dry-shake without ice for 10 seconds to build the foam','Add ice and shake for another 15 seconds','Double-strain into a rocks glass over a large ice cube','Optionally dot the foam with a few dashes of Angostura bitters'],
  '干摇（不加冰先摇）是泡沫细腻的关键，别省这一步。',
  'The dry shake (shaking without ice first) is what makes the foam silky—do not skip it.',
  null,
  'medium', 5, 20, array['sour','classic'], 4.6, 85
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'whiskey-sour'), true,  (select id from spirit_types where slug = 'whisky'), null, null, '60 ml', 0),
  ((select id from recipes where slug = 'whiskey-sour'), false, null, '柠檬汁',       'Fresh lemon juice',    '30 ml', 1),
  ((select id from recipes where slug = 'whiskey-sour'), false, null, '糖浆',         'Simple syrup',         '20 ml', 2),
  ((select id from recipes where slug = 'whiskey-sour'), false, null, '蛋清（可选）', 'Egg white (optional)', '30 ml', 3);

-- ═══ 5. Mojito 莫吉托 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'mojito', '莫吉托', 'Mojito',
  '白朗姆、青柠、薄荷与气泡水的古巴国民饮品，清凉解暑，人人都爱。',
  'Cuba''s national refresher of white rum, lime, mint and soda—cooling, effervescent and universally loved.',
  array['薄荷叶放掌心轻拍出香气后投入高球杯','加入青柠汁与糖浆，用捣棒轻压薄荷（不要捣碎）','倒入白朗姆，杯中装满碎冰','苏打水补满，用吧勺自下而上轻轻提拌','以薄荷枝装饰'],
  array['Slap the mint leaves between your palms and drop them into a highball glass','Add lime juice and simple syrup, then press the mint gently with a muddler (do not shred it)','Pour in the white rum and fill the glass with crushed ice','Top with soda water and gently lift-stir with a bar spoon','Garnish with a mint sprig'],
  '薄荷轻压即可——捣碎会释放苦涩的叶绿素，只要香气不要渣。',
  'Press the mint gently—muddling it to bits releases bitter chlorophyll; you want aroma, not shreds.',
  null,
  'easy', 5, 12, array['refreshing','minty','sweet'], 4.5, 100
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'mojito'), true,  (select id from spirit_types where slug = 'rum'), null, null, '50 ml', 0),
  ((select id from recipes where slug = 'mojito'), false, null, '薄荷叶', 'Mint leaves',       '8 leaves', 1),
  ((select id from recipes where slug = 'mojito'), false, null, '青柠汁', 'Fresh lime juice',  '25 ml',    2),
  ((select id from recipes where slug = 'mojito'), false, null, '糖浆',   'Simple syrup',      '20 ml',    3),
  ((select id from recipes where slug = 'mojito'), false, null, '苏打水', 'Soda water',        'Top',      4);

-- ═══ 6. Old Fashioned 古典鸡尾酒 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'old-fashioned', '古典鸡尾酒', 'Old Fashioned',
  '威士忌、方糖与苦精的极简组合——鸡尾酒的原点，醇厚微甜，橙皮油香收尾。',
  'Whiskey, sugar and bitters at their most elemental—the original cocktail: rich, faintly sweet, finished with orange oils.',
  array['将方糖放入古典杯并滴上苦精','加入 1 茶匙水，压碎方糖并搅至溶解','倒入威士忌并加满大冰块','搅拌约 20 秒，以橙皮装饰'],
  array['Place the sugar cube in a rocks glass and soak it with bitters','Add 1 teaspoon of water, crush the cube and stir until dissolved','Pour in the whiskey and fill the glass with large ice cubes','Stir for about 20 seconds and garnish with an orange peel'],
  '先让糖完全溶解再加酒，最后一口就不会留下粗糖粒。',
  'Dissolve the sugar before adding whiskey so no gritty crystals remain in the final sip.',
  null,
  'easy', 4, 32, array['strong','sweet','classic'], 4.7, 92
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'old-fashioned'), true,  (select id from spirit_types where slug = 'whisky'), null, null, '60 ml', 0),
  ((select id from recipes where slug = 'old-fashioned'), false, null, '方糖', 'Sugar cube', '1 piece', 1),
  ((select id from recipes where slug = 'old-fashioned'), false, null, '安高天娜苦精', 'Angostura bitters', '2 dashes', 2),
  ((select id from recipes where slug = 'old-fashioned'), false, null, '橙皮', 'Orange peel', '1 piece', 3);

-- ═══ 7. Manhattan 曼哈顿 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'manhattan', '曼哈顿', 'Manhattan',
  '威士忌与甜味美思的经典联姻，酒体圆润深沉，一颗酒渍樱桃优雅收尾。',
  'The classic union of whiskey and sweet vermouth—deep, rounded and elegantly capped with a cocktail cherry.',
  array['在搅拌杯中加入威士忌、甜味美思与苦精','加满冰块，搅拌 25–30 秒','滤入冰镇过的碟形杯','以酒渍樱桃装饰'],
  array['Add the whiskey, sweet vermouth and bitters to a mixing glass','Fill with ice and stir for 25–30 seconds','Strain into a chilled coupe','Garnish with a cocktail cherry'],
  '用新鲜、冷藏保存的甜味美思，氧化的味美思会让成品发闷。',
  'Use fresh refrigerated sweet vermouth because oxidized vermouth makes the drink taste flat.',
  null,
  'medium', 4, 28, array['strong','classic'], 4.6, 80
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'manhattan'), true,  (select id from spirit_types where slug = 'whisky'),        null, null, '60 ml', 0),
  ((select id from recipes where slug = 'manhattan'), true,  (select id from spirit_types where slug = 'sweet-vermouth'), null, null, '30 ml', 1),
  ((select id from recipes where slug = 'manhattan'), false, null, '安高天娜苦精', 'Angostura bitters', '2 dashes', 2),
  ((select id from recipes where slug = 'manhattan'), false, null, '酒渍樱桃', 'Cocktail cherry', '1 piece', 3);

-- ═══ 8. Margarita 玛格丽特 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'margarita', '玛格丽特', 'Margarita',
  '龙舌兰、橙酒与青柠的墨西哥国民经典，盐边点睛，酸爽明快。',
  'The Mexican classic of tequila, orange liqueur and lime with a salted rim—zesty, tart and lively.',
  array['用青柠角润湿杯沿并蘸上薄盐边','将龙舌兰、橙皮利口酒与青柠汁倒入摇酒壶','加满冰块，用力摇 12–15 秒','滤入装有新冰的杯中'],
  array['Moisten the rim with a lime wedge and apply a light salt rim','Add tequila, orange liqueur and lime juice to a shaker','Fill with ice and shake hard for 12–15 seconds','Strain into the glass over fresh ice'],
  '盐边只做半圈，让每一口都能选择带盐或不带盐。',
  'Salt only half the rim so each sip can be taken with or without salt.',
  null,
  'easy', 4, 25, array['sour','citrus','refreshing'], 4.7, 98
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'margarita'), true,  (select id from spirit_types where slug = 'tequila'),    null, null, '50 ml', 0),
  ((select id from recipes where slug = 'margarita'), true,  (select id from spirit_types where slug = 'triple-sec'), null, null, '25 ml', 1),
  ((select id from recipes where slug = 'margarita'), false, null, '青柠汁', 'Fresh lime juice', '25 ml', 2),
  ((select id from recipes where slug = 'margarita'), false, null, '盐边', 'Salt rim', '1 piece', 3);

-- ═══ 9. Daiquiri 大吉利 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'daiquiri', '大吉利', 'Daiquiri',
  '白朗姆、青柠与糖浆的三件套，简洁干净，是朗姆酒最诚实的表达。',
  'White rum, lime and sugar in perfect balance—clean, direct and the most honest expression of rum.',
  array['将朗姆、青柠汁与糖浆倒入摇酒壶','加满冰块，用力摇 10–12 秒','双重过滤入冰镇过的碟形杯'],
  array['Add rum, lime juice and simple syrup to a shaker','Fill with ice and shake hard for 10–12 seconds','Double-strain into a chilled coupe'],
  '先尝一滴青柠汁，再按酸度微调糖浆 5 ml。',
  'Taste the lime first and adjust the syrup by 5 ml to match its acidity.',
  null,
  'easy', 3, 22, array['sour','citrus','classic'], 4.6, 75
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'daiquiri'), true,  (select id from spirit_types where slug = 'rum'), null, null, '60 ml', 0),
  ((select id from recipes where slug = 'daiquiri'), false, null, '青柠汁', 'Fresh lime juice', '25 ml', 1),
  ((select id from recipes where slug = 'daiquiri'), false, null, '糖浆', 'Simple syrup', '15 ml', 2);

-- ═══ 10. Cosmopolitan 大都会 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'cosmopolitan', '大都会', 'Cosmopolitan',
  '伏特加与蔓越莓的都会粉红经典，果香酸甜，杯型摩登。',
  'The urbane pink classic of vodka, cranberry and lime—fruity, tangy and unmistakably chic.',
  array['将伏特加、橙皮利口酒、蔓越莓汁与青柠汁倒入摇酒壶','加满冰块，用力摇 12–15 秒','双重过滤入冰镇过的马天尼杯','以橙皮装饰'],
  array['Add vodka, orange liqueur, cranberry juice and lime juice to a shaker','Fill with ice and shake hard for 12–15 seconds','Double-strain into a chilled martini glass','Garnish with an orange twist'],
  '蔓越莓汁负责颜色与轻甜，不要多到盖过青柠的明亮酸度。',
  'Use cranberry for color and gentle sweetness without masking the bright lime acidity.',
  null,
  'medium', 4, 20, array['fruity','sour'], 4.3, 72
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'cosmopolitan'), true,  (select id from spirit_types where slug = 'vodka'),      null, null, '40 ml', 0),
  ((select id from recipes where slug = 'cosmopolitan'), true,  (select id from spirit_types where slug = 'triple-sec'), null, null, '15 ml', 1),
  ((select id from recipes where slug = 'cosmopolitan'), false, null, '蔓越莓汁', 'Cranberry juice', '30 ml', 2),
  ((select id from recipes where slug = 'cosmopolitan'), false, null, '青柠汁', 'Fresh lime juice', '15 ml', 3);

-- ═══ 11. Moscow Mule 莫斯科骡子 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'moscow-mule', '莫斯科骡子', 'Moscow Mule',
  '伏特加、姜汁啤酒与青柠装进铜杯，辛辣气泡直冲头顶，清爽带劲。',
  'Vodka, ginger beer and lime, traditionally in a copper mug—spicy, fizzy and endlessly refreshing.',
  array['在铜杯或高球杯中加入伏特加与青柠汁','加满冰块','以姜汁啤酒补满并轻轻搅拌','以青柠角装饰'],
  array['Add vodka and lime juice to a copper mug or highball','Fill with ice','Top with ginger beer and stir gently','Garnish with a lime wedge'],
  '最后才倒姜汁啤酒并轻拌，能保留最多气泡。',
  'Add the ginger beer last and stir gently to preserve maximum carbonation.',
  null,
  'easy', 3, 10, array['refreshing','fruity'], 4.3, 78
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'moscow-mule'), true,  (select id from spirit_types where slug = 'vodka'), null, null, '45 ml', 0),
  ((select id from recipes where slug = 'moscow-mule'), false, null, '姜汁啤酒', 'Ginger beer', 'Top', 1),
  ((select id from recipes where slug = 'moscow-mule'), false, null, '青柠汁', 'Fresh lime juice', '15 ml', 2);

-- ═══ 12. Espresso Martini 浓缩咖啡马天尼 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'espresso-martini', '浓缩咖啡马天尼', 'Espresso Martini',
  '伏特加与现萃浓缩咖啡的现代经典，苦甜交融，顶着一层天鹅绒般的咖啡泡沫。',
  'The modern classic of vodka and fresh espresso—bittersweet, silky and crowned with velvety coffee foam.',
  array['现萃浓缩咖啡并稍微放凉','将伏特加、咖啡利口酒、浓缩咖啡与糖浆倒入摇酒壶','加满冰块，用力摇 15 秒','双重过滤入冰镇过的碟形杯'],
  array['Pull a fresh espresso and let it cool slightly','Add vodka, coffee liqueur, espresso and syrup to a shaker','Fill with ice and shake hard for 15 seconds','Double-strain into a chilled coupe'],
  '用新鲜咖啡并猛烈摇晃，才能得到稳定细密的泡沫层。',
  'Fresh espresso and a forceful shake create the most stable velvety foam.',
  null,
  'medium', 5, 18, array['sweet','creamy'], 4.6, 90
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'espresso-martini'), true,  (select id from spirit_types where slug = 'vodka'),          null, null, '40 ml', 0),
  ((select id from recipes where slug = 'espresso-martini'), true,  (select id from spirit_types where slug = 'coffee-liqueur'), null, null, '20 ml', 1),
  ((select id from recipes where slug = 'espresso-martini'), false, null, '浓缩咖啡', 'Espresso', '30 ml', 2),
  ((select id from recipes where slug = 'espresso-martini'), false, null, '糖浆', 'Simple syrup', '10 ml', 3);

-- ═══ 13. White Russian 白俄罗斯 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'white-russian', '白俄罗斯', 'White Russian',
  '伏特加、咖啡利口酒与奶油层层交叠，甜润绵密，像一杯成年人的咖啡奶昔。',
  'Vodka, coffee liqueur and cream in lazy layers—sweet, silky and dangerously easy to drink.',
  array['在古典杯中加入伏特加与咖啡利口酒','加满冰块并轻轻搅拌','沿吧勺背缓慢倒入淡奶油形成分层'],
  array['Add vodka and coffee liqueur to a rocks glass','Fill with ice and stir gently','Slowly pour the cream over the back of a bar spoon to form a layer'],
  '先展示分层，上桌前提醒饮用者轻拌后再喝。',
  'Present the layers first, then suggest a gentle stir before drinking.',
  null,
  'easy', 2, 18, array['creamy','sweet'], 4.2, 65
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'white-russian'), true,  (select id from spirit_types where slug = 'vodka'),          null, null, '40 ml', 0),
  ((select id from recipes where slug = 'white-russian'), true,  (select id from spirit_types where slug = 'coffee-liqueur'), null, null, '20 ml', 1),
  ((select id from recipes where slug = 'white-russian'), false, null, '淡奶油', 'Heavy cream', '30 ml', 2);

-- ═══ 14. Aperol Spritz 阿佩罗气泡 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'aperol-spritz', '阿佩罗气泡', 'Aperol Spritz',
  '阿佩罗、普罗塞克与苏打的意式黄昏仪式，橙红明亮，微苦开胃。',
  'The Italian sundown ritual of Aperol, Prosecco and soda—glowing orange, lightly bitter and endlessly sippable.',
  array['在大号葡萄酒杯中装满冰块','倒入普罗塞克与阿佩罗','加入苏打水并轻拌一次','以橙片装饰'],
  array['Fill a large wine glass with ice','Add Prosecco and Aperol','Add soda water and stir once gently','Garnish with an orange slice'],
  '先倒起泡酒再倒阿佩罗，能减少搅拌并保住气泡。',
  'Pour the sparkling wine before Aperol to reduce stirring and preserve bubbles.',
  null,
  'easy', 2, 11, array['refreshing','bitter','fruity'], 4.4, 88
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'aperol-spritz'), true,  (select id from spirit_types where slug = 'aperol'), null, null, '60 ml', 0),
  ((select id from recipes where slug = 'aperol-spritz'), false, null, '普罗塞克起泡酒', 'Prosecco', '90 ml', 1),
  ((select id from recipes where slug = 'aperol-spritz'), false, null, '苏打水', 'Soda water', '30 ml', 2),
  ((select id from recipes where slug = 'aperol-spritz'), false, null, '橙片', 'Orange slice', '1 piece', 3);

-- ═══ 15. Tom Collins 汤姆·柯林斯 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'tom-collins', '汤姆·柯林斯', 'Tom Collins',
  '金酒版的气泡柠檬水：酸甜清爽，高杯加冰，是夏日午后的标准答案。',
  'Sparkling gin lemonade in a tall glass—crisp, lightly sweet and the default answer to a summer afternoon.',
  array['将金酒、柠檬汁与糖浆倒入摇酒壶','加冰短摇 8–10 秒','滤入装满新冰的柯林斯杯','以苏打水补满并轻拌'],
  array['Add gin, lemon juice and simple syrup to a shaker','Add ice and shake briefly for 8–10 seconds','Strain into a Collins glass filled with fresh ice','Top with soda water and stir gently'],
  '短摇即可，苏打水还会继续稀释成品。',
  'Keep the shake short because the soda water adds further dilution.',
  null,
  'easy', 4, 12, array['refreshing','citrus'], 4.2, 60
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'tom-collins'), true,  (select id from spirit_types where slug = 'gin'), null, null, '45 ml', 0),
  ((select id from recipes where slug = 'tom-collins'), false, null, '柠檬汁', 'Fresh lemon juice', '30 ml', 1),
  ((select id from recipes where slug = 'tom-collins'), false, null, '糖浆', 'Simple syrup', '15 ml', 2),
  ((select id from recipes where slug = 'tom-collins'), false, null, '苏打水', 'Soda water', 'Top', 3);

-- ═══ 16. Sidecar 边车 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'sidecar', '边车', 'Sidecar',
  '干邑、橙酒与柠檬的黄金三角，糖边柔化酸度，优雅而有力。',
  'The golden triangle of cognac, orange liqueur and lemon, softened by a sugared rim—elegant and assertive.',
  array['用柠檬角润湿半圈杯沿并蘸糖','将白兰地、橙皮利口酒与柠檬汁倒入摇酒壶','加满冰块，用力摇 12–15 秒','双重过滤入冰镇过的碟形杯'],
  array['Moisten half the rim with lemon and apply sugar','Add brandy, orange liqueur and lemon juice to a shaker','Fill with ice and shake hard for 12–15 seconds','Double-strain into a chilled coupe'],
  '只做半圈糖边，既能柔化酸度也不会让每一口都过甜。',
  'Sugar only half the rim to soften the acidity without making every sip too sweet.',
  null,
  'medium', 4, 26, array['sour','citrus','classic'], 4.4, 58
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'sidecar'), true,  (select id from spirit_types where slug = 'brandy'),     null, null, '50 ml', 0),
  ((select id from recipes where slug = 'sidecar'), true,  (select id from spirit_types where slug = 'triple-sec'), null, null, '20 ml', 1),
  ((select id from recipes where slug = 'sidecar'), false, null, '柠檬汁', 'Fresh lemon juice', '20 ml', 2),
  ((select id from recipes where slug = 'sidecar'), false, null, '糖边', 'Sugar rim', '1 piece', 3);

-- ═══ 17. Brandy Alexander 白兰地亚历山大 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'brandy-alexander', '白兰地亚历山大', 'Brandy Alexander',
  '白兰地、可可利口酒与奶油调成的丝绒甜点酒，现磨肉豆蔻画龙点睛。',
  'A velvet dessert of brandy, dark cacao and cream, finished with a whisper of grated nutmeg.',
  array['将白兰地、可可利口酒与淡奶油倒入摇酒壶','加满冰块，用力摇 12–15 秒','双重过滤入冰镇过的碟形杯','现磨少量肉豆蔻在表面'],
  array['Add brandy, cacao liqueur and cream to a shaker','Fill with ice and shake hard for 12–15 seconds','Double-strain into a chilled coupe','Grate a little fresh nutmeg over the surface'],
  '肉豆蔻只需薄薄一层，过量会压住白兰地与可可香。',
  'Use only a light dusting of nutmeg so it does not overpower the brandy and cacao.',
  null,
  'easy', 3, 20, array['creamy','sweet'], 4.3, 55
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'brandy-alexander'), true,  (select id from spirit_types where slug = 'brandy'),         null, null, '30 ml', 0),
  ((select id from recipes where slug = 'brandy-alexander'), true,  (select id from spirit_types where slug = 'creme-de-cacao'), null, null, '30 ml', 1),
  ((select id from recipes where slug = 'brandy-alexander'), false, null, '淡奶油', 'Heavy cream', '30 ml', 2),
  ((select id from recipes where slug = 'brandy-alexander'), false, null, '肉豆蔻粉', 'Grated nutmeg', '1 dash', 3);

-- ═══ 18. Amaretto Sour 杏仁酸酒 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'amaretto-sour', '杏仁酸酒', 'Amaretto Sour',
  '杏仁利口酒担纲的酸酒，坚果甜香与柠檬酸爽相互托举，入口柔顺。',
  'A sour built on amaretto—nutty sweetness lifted by fresh lemon, smooth and easygoing.',
  array['将杏仁利口酒、柠檬汁、糖浆与可选蛋清倒入摇酒壶','使用蛋清时先无冰干摇 10 秒','加满冰块，再用力摇 12 秒','双重过滤入装有新冰的古典杯'],
  array['Add amaretto, lemon juice, syrup and optional egg white to a shaker','If using egg white, dry-shake without ice for 10 seconds','Fill with ice and shake hard for another 12 seconds','Double-strain into a rocks glass over fresh ice'],
  '杏仁利口酒本身很甜，先少放糖浆，摇前试酸甜平衡。',
  'Amaretto is already sweet, so start with less syrup and check the balance before shaking.',
  null,
  'easy', 4, 12, array['sweet','sour'], 4.2, 62
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'amaretto-sour'), true,  (select id from spirit_types where slug = 'amaretto'), null, null, '45 ml', 0),
  ((select id from recipes where slug = 'amaretto-sour'), false, null, '柠檬汁', 'Fresh lemon juice', '25 ml', 1),
  ((select id from recipes where slug = 'amaretto-sour'), false, null, '糖浆', 'Simple syrup', '10 ml', 2),
  ((select id from recipes where slug = 'amaretto-sour'), false, null, '蛋清（可选）', 'Egg white (optional)', '30 ml', 3);

-- ═══ 19. Paloma 帕洛玛 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'paloma', '帕洛玛', 'Paloma',
  '龙舌兰与西柚苏打的墨西哥日常，比玛格丽特更轻快，咸边清苦回甘。',
  'The everyday Mexican highball of tequila and grapefruit soda—lighter than a Margarita, with a salty, gently bitter edge.',
  array['用青柠角润湿杯沿并蘸上薄盐边','在高球杯中加入龙舌兰与青柠汁','加满冰块','以西柚苏打补满并轻轻搅拌'],
  array['Moisten the rim with lime and apply a light salt rim','Add tequila and lime juice to a highball','Fill with ice','Top with grapefruit soda and stir gently'],
  '选择苦味明显、甜度较低的西柚苏打，成品会更清爽。',
  'Choose a grapefruit soda with noticeable bitterness and restrained sweetness for a fresher drink.',
  null,
  'easy', 3, 10, array['refreshing','citrus','fruity'], 4.4, 68
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'paloma'), true,  (select id from spirit_types where slug = 'tequila'), null, null, '50 ml', 0),
  ((select id from recipes where slug = 'paloma'), false, null, '西柚苏打', 'Grapefruit soda', 'Top', 1),
  ((select id from recipes where slug = 'paloma'), false, null, '青柠汁', 'Fresh lime juice', '10 ml', 2),
  ((select id from recipes where slug = 'paloma'), false, null, '盐边', 'Salt rim', '1 piece', 3);

-- ═══ 20. Piña Colada 椰林飘香 ═══
insert into recipes (slug, name_zh, name_en, description_zh, description_en,
  instructions_zh, instructions_en, tip_zh, tip_en, image_url,
  difficulty, prep_minutes, abv_percent, flavor_tags, base_rating, base_popularity)
values (
  'pina-colada', '椰林飘香', 'Piña Colada',
  '朗姆、椰浆与菠萝汁的热带三重奏，绵密香甜，一口回到海滩。',
  'The tropical trio of rum, coconut cream and pineapple—lush, creamy and instantly transporting.',
  array['将朗姆、椰浆与菠萝汁倒入搅拌机','加入一杯碎冰','搅打至顺滑绵密','倒入冰镇过的飓风杯'],
  array['Add rum, coconut cream and pineapple juice to a blender','Add one cup of crushed ice','Blend until smooth and creamy','Pour into a chilled hurricane glass'],
  '椰浆使用前充分摇匀，避免油脂分层让口感忽稠忽稀。',
  'Shake the coconut cream well before measuring so separated fat does not create an uneven texture.',
  null,
  'easy', 5, 13, array['sweet','creamy','fruity'], 4.3, 82
)
on conflict (slug) do update set
  name_zh=excluded.name_zh, name_en=excluded.name_en, description_zh=excluded.description_zh, description_en=excluded.description_en,
  instructions_zh=excluded.instructions_zh, instructions_en=excluded.instructions_en, tip_zh=excluded.tip_zh, tip_en=excluded.tip_en,
  image_url=excluded.image_url, difficulty=excluded.difficulty, prep_minutes=excluded.prep_minutes, abv_percent=excluded.abv_percent,
  flavor_tags=excluded.flavor_tags, base_rating=excluded.base_rating, base_popularity=excluded.base_popularity, is_public=true;

insert into recipe_ingredients (recipe_id, is_spirit, spirit_type_id, name_zh, name_en, amount, sort_order) values
  ((select id from recipes where slug = 'pina-colada'), true,  (select id from spirit_types where slug = 'rum'), null, null, '50 ml', 0),
  ((select id from recipes where slug = 'pina-colada'), false, null, '椰浆', 'Coconut cream', '30 ml', 1),
  ((select id from recipes where slug = 'pina-colada'), false, null, '菠萝汁', 'Pineapple juice', '90 ml', 2);

-- 01_spirit_types.sql — 匹配单元 25 条（幂等且同步权威字段）
insert into spirit_types (slug, name_zh, name_en, category, sort_order) values
  -- 6 大基酒类（粒度到大类）
  ('gin',                 '金酒',           'Gin',                 'gin',     10),
  ('whisky',              '威士忌',         'Whisky',              'whisky',  20),
  ('rum',                 '朗姆酒',         'Rum',                 'rum',     30),
  ('vodka',               '伏特加',         'Vodka',               'vodka',   40),
  ('tequila',             '龙舌兰',         'Tequila',             'tequila', 50),
  ('brandy',              '白兰地',         'Brandy',              'brandy',  60),
  -- 利口酒 / 加强酒（粒度到品种）
  ('campari',             '金巴利',         'Campari',             'liqueur', 100),
  ('sweet-vermouth',      '甜味美思',       'Sweet Vermouth',      'other',   110),
  ('dry-vermouth',        '干味美思',       'Dry Vermouth',        'other',   120),
  ('triple-sec',          '橙皮利口酒',     'Triple Sec',          'liqueur', 130),
  ('coffee-liqueur',      '咖啡利口酒',     'Coffee Liqueur',      'liqueur', 140),
  ('amaretto',            '杏仁利口酒',     'Amaretto',            'liqueur', 150),
  ('aperol',              '阿佩罗',         'Aperol',              'liqueur', 160),
  ('elderflower-liqueur', '接骨木花利口酒', 'Elderflower Liqueur', 'liqueur', 170),
  ('benedictine',         '法国廊酒',       'Bénédictine',         'liqueur', 180),
  ('chartreuse',          '查特酒',         'Chartreuse',          'liqueur', 190),
  ('maraschino',          '黑樱桃利口酒',   'Maraschino',          'liqueur', 200),
  ('irish-cream',         '爱尔兰奶油利口酒','Irish Cream',        'liqueur', 210),
  ('peach-liqueur',       '蜜桃利口酒',     'Peach Liqueur',       'liqueur', 220),
  ('blue-curacao',        '蓝橙利口酒',     'Blue Curaçao',        'liqueur', 230),
  ('creme-de-cacao',      '可可利口酒',     'Crème de Cacao',      'liqueur', 240),
  ('creme-de-menthe',     '薄荷利口酒',     'Crème de Menthe',     'liqueur', 250),
  ('absinthe',            '苦艾酒',         'Absinthe',            'other',   260),
  ('fernet',              '菲奈特',         'Fernet',              'liqueur', 270),
  ('port',                '波特酒',         'Port',                'other',   280)
on conflict (slug) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  category = excluded.category,
  sort_order = excluded.sort_order;

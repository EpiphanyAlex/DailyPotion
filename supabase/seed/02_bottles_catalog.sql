-- 02_bottles_catalog.sql — 官方酒瓶库 34 瓶（幂等且同步权威字段）
insert into bottles_catalog (spirit_type_id, slug, name_zh, name_en, brand, volume_ml, image_url) values
  -- 金酒（5）
  ((select id from spirit_types where slug = 'gin'), 'roku-gin',                    'Roku 六金酒',            'Roku Gin',                       'Suntory',        700, null),
  ((select id from spirit_types where slug = 'gin'), 'tanqueray-london-dry',        '添加利伦敦干金酒',       'Tanqueray London Dry Gin',       'Tanqueray',      750, null),
  ((select id from spirit_types where slug = 'gin'), 'bombay-sapphire',             '孟买蓝宝石金酒',         'Bombay Sapphire',                'Bombay Sapphire',750, null),
  ((select id from spirit_types where slug = 'gin'), 'hendricks-gin',               '亨利爵士金酒',           'Hendrick''s Gin',                'Hendrick''s',    700, null),
  ((select id from spirit_types where slug = 'gin'), 'beefeater-london-dry',        '必富达伦敦干金酒',       'Beefeater London Dry Gin',       'Beefeater',      750, null),
  -- 威士忌（5）
  ((select id from spirit_types where slug = 'whisky'), 'jack-daniels-old-no-7',    '杰克丹尼老 7 号',        'Jack Daniel''s Old No. 7',       'Jack Daniel''s', 700, null),
  ((select id from spirit_types where slug = 'whisky'), 'makers-mark',              '美格波本威士忌',         'Maker''s Mark Bourbon',          'Maker''s Mark',  750, null),
  ((select id from spirit_types where slug = 'whisky'), 'bulleit-bourbon',          '布莱特波本威士忌',       'Bulleit Bourbon',                'Bulleit',        750, null),
  ((select id from spirit_types where slug = 'whisky'), 'jameson-irish-whiskey',    '尊美醇爱尔兰威士忌',     'Jameson Irish Whiskey',          'Jameson',        700, null),
  ((select id from spirit_types where slug = 'whisky'), 'suntory-toki',             '三得利季威士忌',         'Suntory Toki',                   'Suntory',        700, null),
  -- 朗姆（4）
  ((select id from spirit_types where slug = 'rum'), 'bacardi-carta-blanca',        '百加得白朗姆',           'Bacardí Carta Blanca',           'Bacardí',        750, null),
  ((select id from spirit_types where slug = 'rum'), 'havana-club-3',               '哈瓦那俱乐部 3 年',      'Havana Club Añejo 3 Años',       'Havana Club',    700, null),
  ((select id from spirit_types where slug = 'rum'), 'plantation-3-stars',          '蔗园三星白朗姆',         'Plantation 3 Stars',             'Plantation',     700, null),
  ((select id from spirit_types where slug = 'rum'), 'diplomatico-reserva',         '外交官珍藏朗姆',         'Diplomático Reserva Exclusiva',  'Diplomático',    700, null),
  -- 伏特加（4）
  ((select id from spirit_types where slug = 'vodka'), 'absolut-vodka',             '绝对伏特加',             'Absolut Vodka',                  'Absolut',        750, null),
  ((select id from spirit_types where slug = 'vodka'), 'smirnoff-no-21',            '斯米诺红牌伏特加',       'Smirnoff No. 21',                'Smirnoff',       750, null),
  ((select id from spirit_types where slug = 'vodka'), 'grey-goose',                '灰雁伏特加',             'Grey Goose',                     'Grey Goose',     750, null),
  ((select id from spirit_types where slug = 'vodka'), 'titos-handmade-vodka',      '铁托手工伏特加',         'Tito''s Handmade Vodka',         'Tito''s',        750, null),
  -- 龙舌兰（3）
  ((select id from spirit_types where slug = 'tequila'), 'espolon-blanco',          '埃斯波隆银龙舌兰',       'Espolòn Blanco',                 'Espolòn',        750, null),
  ((select id from spirit_types where slug = 'tequila'), 'jose-cuervo-silver',      '豪帅快活银龙舌兰',       'Jose Cuervo Especial Silver',    'Jose Cuervo',    750, null),
  ((select id from spirit_types where slug = 'tequila'), 'don-julio-blanco',        '唐胡里奥银龙舌兰',       'Don Julio Blanco',               'Don Julio',      750, null),
  -- 白兰地（2）
  ((select id from spirit_types where slug = 'brandy'), 'hennessy-vs',              '轩尼诗 VS 干邑',         'Hennessy V.S',                   'Hennessy',       700, null),
  ((select id from spirit_types where slug = 'brandy'), 'remy-martin-vsop',         '人头马 VSOP 干邑',       'Rémy Martin VSOP',               'Rémy Martin',    700, null),
  -- 利口酒 / 加强酒（11）
  ((select id from spirit_types where slug = 'campari'),        'campari-bitter',    '金巴利苦味利口酒',      'Campari Bitter',                 'Campari',        700, null),
  ((select id from spirit_types where slug = 'aperol'),         'aperol-aperitivo',  '阿佩罗开胃酒',          'Aperol Aperitivo',               'Aperol',         700, null),
  ((select id from spirit_types where slug = 'sweet-vermouth'), 'martini-rosso',     '马天尼红味美思',        'Martini Rosso',                  'Martini',        750, null),
  ((select id from spirit_types where slug = 'dry-vermouth'),   'dolin-dry-vermouth','杜凌干味美思',          'Dolin Vermouth Dry',             'Dolin',          750, null),
  ((select id from spirit_types where slug = 'triple-sec'),     'cointreau',         '君度橙酒',              'Cointreau',                      'Cointreau',      700, null),
  ((select id from spirit_types where slug = 'coffee-liqueur'), 'kahlua',            '甘露咖啡利口酒',        'Kahlúa Coffee Liqueur',          'Kahlúa',         700, null),
  ((select id from spirit_types where slug = 'amaretto'),       'disaronno-originale','帝萨诺杏仁利口酒',     'Disaronno Originale',            'Disaronno',      700, null),
  ((select id from spirit_types where slug = 'irish-cream'),    'baileys-original',  '百利甜酒',              'Baileys Original Irish Cream',   'Baileys',        700, null),
  ((select id from spirit_types where slug = 'maraschino'),     'luxardo-maraschino','路萨朵黑樱桃利口酒',    'Luxardo Maraschino Originale',   'Luxardo',        700, null),
  ((select id from spirit_types where slug = 'elderflower-liqueur'), 'st-germain',   '圣杰曼接骨木花利口酒',  'St-Germain',                     'St-Germain',     700, null),
  ((select id from spirit_types where slug = 'fernet'),          'fernet-branca',    '菲奈特·布兰卡',         'Fernet-Branca',                  'Fernet-Branca',  700, null)
on conflict (slug) do update set
  spirit_type_id = excluded.spirit_type_id,
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  brand = excluded.brand,
  volume_ml = excluded.volume_ml,
  image_url = excluded.image_url,
  is_active = true;

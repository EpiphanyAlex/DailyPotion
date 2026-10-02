# ADR-0001：匹配单元与纯函数边界

状态：accepted；实现：Phase 2 只有类型，Phase 3 函数待实现。

## 背景

首页、酒柜、配方库与详情页都要显示可调和缺失项；页面各算一次会产生不同口径。

## 决定

以 `spirit_types` 行为最小匹配单元。仅 `owned` 酒瓶和 `is_spirit = true` 的配料参与。所有 Can Make、Missing、覆盖率和推荐计算集中在无副作用的 `lib/matching.ts`；数据库访问留在 `lib/supabase/queries.ts`。精确算法和边界用例以 [02 匹配引擎](../prd/02-matching-engine.md) 为准。

## 后果与落地

品牌或具体酒瓶不会改变同一匹配单元的结果；wishlist 与辅料也不会误计。Phase 3 补函数和单元测试，Phase 5–8 接入页面并按 [交互验收](../engineering/interaction-acceptance.md) 验证共享口径。

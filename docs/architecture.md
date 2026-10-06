# DailyPotion 架构边界

状态：Phase 2 数据层、Phase 3 匹配函数、Phase 4 认证导航与 Phase 5 酒柜已实现；Phase 6–8 页面行为待实现。产品行为以 [PRD](prd/README.md) 为准，视觉以 [design.md](../design.md) 为准；本文只描述职责和数据流。

## 数据与状态归属

| 归属 | 内容 | 当前落点 |
|---|---|---|
| Supabase Postgres/Auth | 配方、匹配单元、酒瓶、用户库存、收藏、评分、调酒记录及身份；RLS 限定用户数据 | `supabase/migrations/`、`lib/supabase/queries.ts`、`lib/supabase/{server,client}.ts` 已实现 |
| 纯业务函数 | owned 酒瓶映射、Can Make、Missing、统计、Daily Pour、Because You Have | `lib/matching.ts` 已实现并有边界测试；规则权威是 [02 匹配引擎](prd/02-matching-engine.md) |
| URL | 配方库的 `q`、`spirit`、`filter`、`sort` | [05 配方库](prd/05-recipes-library.md) 已规定；页面待 Phase 6 |
| 组件局部状态 | 弹窗开关、焦点、未提交输入、toast、短暂交互选择 | 认证与酒柜已接入；不成为数据库事实副本 |

## 数据流

1. Next.js Server Component 或 Client Component 创建对应请求作用域内的 Supabase client；查询和写入只经 `lib/supabase/queries.ts`。服务端按请求读 cookie；浏览器只使用 publishable key。RLS 是最终账号隔离边界。
2. 查询层返回数据库行，`lib/supabase/transform.ts` 做形状转换。Phase 3 的 `lib/matching.ts` 只接收普通数据，不直接读 Supabase；`owned` 才进入库存集合，`wishlist` 与 `is_spirit = false` 配料不参与匹配。
3. 首页、酒柜、配方库与详情页调用同一批匹配纯函数，不能各自实现 Can Make 或 Missing。配方库在 V1 全量读取不超过 200 条配方后按 URL 筛选和排序；匹配状态只对登录用户展示。
4. 写入由查询层执行；成功后重取相关权威行，再由纯函数重新计算视图。失败撤销乐观显示并保留可重试的用户输入。具体读取、竞态与账号边界见 [ADR-0002](adr/0002-web-query-lifecycle.md)。

酒柜客户端保留当前身份下的临时行投影，成功写入后重读并刷新服务端视图；同资源写入 single-flight，失败按操作回滚，读序号和卸载检查丢弃旧响应。AppFrame 以用户 ID 为 key，账号切换时卸载私人状态。未引入跨会话私人缓存。Next.js 对公开内容的静态生成/ISR 要求与用户私人查询分开，详见 [总览 §5](prd/00-overview.md) 与 ADR-0002。

## 文档约定

跨页面决定写一条简短 [ADR](adr/README.md)，并同步受影响的 feature PRD；需求仍由 `docs/prd/` 定义，视觉仍由 `design.md` 定义。`npm test` 中的 [文档检查](engineering/checks.test.ts) 校验相对链接、视觉 token 与少量结构性规格，不代替页面验收。

# DailyPotion PRD · Home Dashboard（04）

| | |
|---|---|
| 优先级 | P0 |
| 依赖 | [01-data-model.md](01-data-model.md)、[02-matching-engine.md](02-matching-engine.md) |
| 设计稿 | `design/exports/v2/01-desktop-dashboard.png`、`design/exports/v2/05-mobile-home.png` |
| 总览 | [00-overview.md](00-overview.md) |

## 1. 目标

首页负责回答核心循环中的「今天调什么」：用户打开产品即看到当日确定性推荐（Daily Pour）、酒柜统计（能调 N 款、Missing Just One 可解锁 M 款）与基于自有酒瓶的推荐，驱动「挑一款调 → 记录 → 发现差一瓶 → 添加新酒瓶」的循环持续转动。本文件定义 Home Dashboard（路由 `/{locale}`，路由表与权限矩阵见[总览](00-overview.md)）的行为与数据逻辑。

## 2. 页面结构

- 首页是 Dashboard，不是静态酒单。
- 桌面自上而下：Daily Pour hero → Cabinet Snapshot → Because You Have X → Recently Added Bottles。
- 移动端为紧凑卡片版（compact Daily Pour、snapshot cards、横向配方 carousel）。
- 本文件只写行为与数据逻辑；视觉规格（颜色/字体/间距/状态）一律以 `design.md` 为准，布局对齐 meta 表中的设计稿。

## 3. Today's Daily Pour（hero）

- 每日为用户确定性推荐一款配方，当天内刷新不变。算法见[匹配引擎](02-matching-engine.md)的 dailyPour 小节。
- 展示：配方图、名称（双语）、描述、flavor tags、时长/难度/ABV、状态（Can Make 或 Missing 列表）。
- 操作：View Recipe（去[配方详情](06-recipe-detail.md)）、Save（收藏切换）。

## 4. Cabinet Snapshot（4 个数据卡）

| 卡片 | 定义 |
|---|---|
| Bottles Owned | `user_bottles` 中 `status = owned` 的数量 |
| Cocktails You Can Make | 可调配方数（[匹配引擎](02-matching-engine.md) canMake 小节） |
| Missing Just One | 只差 1 种匹配单元即可解锁的配方数（[匹配引擎](02-matching-engine.md) missing 与统计小节） |
| Cabinet Completion | 可调配方数 ÷ 公开配方总数，四舍五入为百分比 |

`user_bottles` 表结构见[数据模型](01-data-model.md)。

- 每张卡可点击：前两张去对应列表（[Cabinet](07-my-cabinet.md) / Recipes?filter=can-make，见[配方库](05-recipes-library.md)），Missing Just One 去 `/recipes?filter=missing-one`（该筛选态在配方库的呈现与清除行为见[配方库](05-recipes-library.md)）。
- CTA：Go to Cabinet（[我的酒柜](07-my-cabinet.md)）。

## 5. Because You Have X（横向推荐）

- X = 用户 owned 酒瓶中**解锁可调配方数最多**的一瓶（并列取最近添加），选瓶与选配方规则见[匹配引擎](02-matching-engine.md)的 becauseYouHave 小节。
- 展示 5 张配方卡：图片、名称（双语）、评分（V1 为官方策展分，规则见[匹配引擎](02-matching-engine.md)评分与热度小节）、Can Make/Missing 状态、收藏按钮。

## 6. Recently Added Bottles

- 用户最近添加的 owned 酒瓶（最多 6 个），点击去[我的酒柜](07-my-cabinet.md)。

## 7. 空酒柜状态

- 酒柜为空时，Snapshot 与推荐区收起，显示空状态卡：「Add your first bottle」+ Start with Gin / Whisky / Rum 快捷入口（点击打开 Add Bottle modal 并预选该类型筛选；Add Bottle modal 的完整规格见[我的酒柜](07-my-cabinet.md)）。

## 8. 未登录状态

- Daily Pour 显示全库策展版（[匹配引擎](02-matching-engine.md) dailyPour 小节的访客分支）。
- Snapshot 区替换为注册引导卡（三步路径文案 + Sign up CTA；三步路径「注册 → 添加第一瓶酒 → 看能调什么」的定义见 [Auth](03-auth.md)）。
- 推荐区显示 Popular 配方。

## 9. 验收标准

- 同一用户同一天内多次刷新，Daily Pour 不变；次日变化。
- 添加/移除酒瓶后返回首页，4 个统计数字即时正确。
- 空酒柜、未登录两种状态按上述规则渲染，无残缺模块。

# DailyPotion PRD · Recipes 配方库（05）

| | |
|---|---|
| 优先级 | P0 |
| 依赖 | [01-data-model.md](01-data-model.md)、[02-matching-engine.md](02-matching-engine.md) |
| 设计稿 | `design/exports/v2/03-recipes-grid.png` |
| 总览 | [00-overview.md](00-overview.md) |

视觉规格（颜色/字体/间距/状态）一律以 `design.md` 为准，本文只写行为与数据逻辑。

## 1. 目标

在「添加酒瓶 → 看到你能调 N 款 → 挑一款调 → 记录 & 评分」的核心循环中，配方库负责回答「都有哪些可能」：用户在这里浏览、搜索、筛选、排序全部官方配方，并结合自己的酒柜库存直接看到每款配方的 Can Make / Missing 状态，从而为「挑一款调」提供主入口。

## 2. 页面与入口

- 路由：`/{locale}/recipes`，未登录可访问（权限矩阵见 [总览](00-overview.md)）。
- 入口：
  - 全局导航的 Recipes 项（桌面顶部导航 / 移动端底部药丸 Tab，见 [总览](00-overview.md) 导航结构）。
  - 首页 Cabinet Snapshot 卡片：「Cocktails You Can Make」卡进入 `/recipes?filter=can-make`，「Missing Just One」卡进入 `/recipes?filter=missing-one`（见 [Home Dashboard](04-home-dashboard.md)）。
  - 桌面顶部导航搜索框（P1）：回车跳转 `/recipes?q=`（见 [总览](00-overview.md) 导航结构）。

## 3. 功能需求

### 3.1 搜索

- 按配方名搜索：zh 与 en 名称同时匹配。
- 匹配规则：不区分大小写、子串匹配。

### 3.2 筛选 chips

- **基酒筛选（单选）**：All Spirits / Gin / Whisky / Rum / Vodka / Tequila / Brandy / Liqueur。
- **状态筛选**：Can Make / Favorites，可与基酒筛选叠加。
- 未登录用户点击 Can Make 或 Favorites 这两个 chip 时跳转登录（登录流程见 [Auth](03-auth.md)）。
- Can Make 的判定逻辑见 [匹配引擎](02-matching-engine.md)；Favorites 收藏功能见 [Favorites & History](08-favorites-history.md)。

### 3.3 Missing Just One 筛选态

- 无常驻 chip，仅通过 URL `?filter=missing-one` 进入；该入口来自首页 Cabinet Snapshot 卡（见 [Home Dashboard](04-home-dashboard.md)）。
- 激活时，在 chip 区显示一个可清除的选中态 chip「Missing Just One」。
- Missing Just One（只差 1 种匹配单元即可解锁）的判定见 [匹配引擎](02-matching-engine.md)。

### 3.4 排序

- **Popular**（默认）：按 `recipes.base_popularity` 降序。
- **Recently Added**。
- **Easy First**：难度升序，同一难度内按 Popular。
- `base_popularity` 与 `base_rating` 为官方策展字段：字段定义见 [数据模型](01-data-model.md)，V1 评分与热度规则见 [匹配引擎](02-matching-engine.md)「评分与热度」。

### 3.5 配方卡

每张配方卡展示：

- 图片；
- 名称（双语；双语字段的 fallback 规则见 [国际化与全局状态](09-i18n-and-global-states.md)）；
- 基酒标签，带分类色点（分类色 token 见 `design.md`）；
- flavor tags；
- 评分（V1 为官方策展分 `base_rating`，规则见 [匹配引擎](02-matching-engine.md)「评分与热度」）；
- Can Make / Missing N 状态徽章（判定见 [匹配引擎](02-matching-engine.md)）；
- 收藏按钮。

补充规则：

- 未登录用户不展示 Can Make / Missing 状态徽章，显示中性的基酒标签即可。
- 配方卡为通用组件，收藏页复用同一组件（见 [Favorites & History](08-favorites-history.md)）。

### 3.6 空结果

- 筛选/搜索组合无结果时，展示空结果状态：说明当前筛选无结果 + 「Clear filters」按钮，可一键清除筛选。

### 3.7 URL 状态

- URL 反映当前筛选状态：`?q=&spirit=&filter=&sort=`。
- URL 可分享、可后退（浏览器后退可回到上一筛选状态）。

## 4. 数据加载策略

- **V1 配方总量 ≤200 条：页面一次性全量加载，筛选与排序全部在客户端完成。**
- 配方超过 200 条后该策略失效，届时再引入分页/服务端筛选；此项已登记为开放问题，见 [总览](00-overview.md)「风险与开放问题」表 #4。匹配逻辑为独立纯函数，不受该切换影响（见 [匹配引擎](02-matching-engine.md)）。
- 列表页加载中需 skeleton 布局，全局 Loading/反馈规范见 [国际化与全局状态](09-i18n-and-global-states.md)。
- 内容页（配方库/详情）的静态生成 + ISR、LCP 等性能要求见 [总览](00-overview.md)「非功能需求」。

## 5. 验收标准

1. 筛选、搜索、排序任意组合正确联动，URL 同步。
2. 未登录用户看不到 Can Make 徽章（显示中性的基酒标签即可），点击 Can Make chip 跳登录。
3. 空结果状态可一键清除筛选。

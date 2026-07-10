# DailyPotion PRD · Favorites & History（08）

| | |
|---|---|
| 优先级 | P0 |
| 依赖 | [01-data-model.md](01-data-model.md)（`user_recipe_marks`、`user_pour_logs`） |
| 设计稿 | 复用配方卡组件（design.md §5 Cards） |
| 总览 | [00-overview.md](00-overview.md) |

## 1. 目标

产品核心循环是「添加酒瓶 → 看到你能调 N 款 → 挑一款调 → 记录 & 评分 → 发现只差一瓶就能解锁 M 款 → 添加新酒瓶」。Favorites 与 History 承接其中「记录 & 评分」之后的沉淀环节：收藏页把用户想调、爱喝的配方聚合到一处，History 页让「调过什么、好不好喝」不再全靠记忆，从而驱动用户持续回到循环中。

## 2. 路由与访问权限

- 路由：`/{locale}/favorites`（收藏）与 `/{locale}/history`（调酒记录），带 locale 前缀（`/zh`、`/en`）。
- 两个页面均**仅登录用户可访问**；未登录访问跳转登录。完整路由表、权限矩阵与导航结构见[总览](00-overview.md)（信息架构一节）。
- 导航入口：桌面顶部导航含 History 与 Favorites 入口；移动端底部药丸 Tab 含 Favorites，History 在移动端从 Profile 进入（见[总览](00-overview.md)导航结构）。

## 3. Favorites 页

- **内容**：用户收藏的配方，以网格呈现，**复用配方卡组件**（卡片内容与状态规格见[配方库](05-recipes-library.md)，视觉规格见 design.md §5 Cards）。
- **数据来源**：`user_recipe_marks.is_favorite = true` 的配方（表结构见[数据模型](01-data-model.md)）。
- **全站同步**：收藏是全站统一的状态——首页 Daily Pour 的 Save（见[首页](04-home-dashboard.md)）、配方库卡片的收藏按钮（见[配方库](05-recipes-library.md)）、配方详情页的 Favorite（见[配方详情](06-recipe-detail.md)）与本页操作的是同一份数据，任一处收藏/取消，其他页面即时同步。

## 4. History 页

- **内容**：用户的调酒记录（`user_pour_logs`，表结构见[数据模型](01-data-model.md)），按时间倒序排列的列表。
- **单条记录展示**：
  - 配方名（链接到[配方详情](06-recipe-detail.md)页）
  - 日期
  - 星级
  - 口味 tags
  - 笔记摘要
- **单条操作**：可编辑、可删除；删除需确认。
- **记录来源与联动**：记录由配方详情页的 **Log Your Pour** modal 写入（字段为日期/星级/口味 tag/笔记，规格见[配方详情](06-recipe-detail.md)）；Log Your Pour 保存后，该记录**立即出现在 History 页顶部**（对应验收标准同时列于[配方详情](06-recipe-detail.md)）。

## 5. 空状态

- **Favorites 为空**：显示空状态，引导用户去配方库（见[配方库](05-recipes-library.md)）。
- **History 为空**：显示空状态，引导用户「调一杯并记录」（Log Your Pour 入口在配方详情页，见[配方详情](06-recipe-detail.md)）。
- 空状态视觉遵循 design.md；全局空状态、loading skeleton 与双语文案规则见[国际化与全局状态](09-i18n-and-global-states.md)。

## 6. 数据与权限

- 收藏存于 `user_recipe_marks`，调酒记录存于 `user_pour_logs`，均为用户表，RLS 限定**仅本人读写**（策略详见[数据模型](01-data-model.md)）。
- 收藏切换、记录编辑/删除等写操作遵循全局反馈规则（乐观更新 + 失败回滚 + toast），见[国际化与全局状态](09-i18n-and-global-states.md)。

## 7. 验收标准

- 收藏/取消在**所有出现收藏按钮的页面**即时同步。
- History 记录编辑、删除后列表即时更新。
- 用户只能看到和操作自己的记录。

# DailyPotion PRD · My Cabinet 我的酒柜（07）

| | |
|---|---|
| 优先级 | P0 |
| 依赖 | [01-data-model.md](01-data-model.md)、[02-matching-engine.md](02-matching-engine.md)（移除影响数 N 的计算） |
| 设计稿 | `design/exports/v2/04-my-cabinet.png`、`design/exports/v2/06-mobile-cabinet.png`、`design/exports/v2/09-overlays-modal-dropdown-toast.png`（Add Bottle modal、移除确认） |
| 总览 | [00-overview.md](00-overview.md) |

> 视觉规格（颜色/字体/间距/状态）一律以 `design.md` 为准，本文只写行为与数据逻辑。

## 1. 目标

我的酒柜是核心循环「添加酒瓶 → 看到你能调 N 款 → 挑一款调 → 记录 & 评分 → 发现只差一瓶 → 添加新酒瓶」的起点与终点：用户在这里记录家中拥有（owned）与想购入（wishlist）的酒瓶，酒柜内容直接驱动首页统计与配方库的 Can Make / Missing 判定。它回答的核心问题是「我有什么、还缺什么」。

## 2. 范围与访问权限

- 路由：`/{locale}/cabinet`，仅登录用户可访问，未登录访问跳转登录（路由表与权限矩阵见 [00-overview.md](00-overview.md) 信息架构章节）。
- V1 范围（P0）：从官方酒瓶库添加/移除；owned/wishlist 状态；手动添加自定义酒瓶。
- 用户酒瓶数据存于 `user_bottles` 表，表结构与数据库约束详见 [01-data-model.md](01-data-model.md)。

## 3. 列表

- **桌面**：酒瓶卡片网格——瓶图、名称、类型标签、容量、owned/wishlist、添加日期、more 菜单。
- **移动端**：list-first 布局 + sticky 筛选 + 悬浮 Add 按钮。

## 4. 搜索

- 按酒瓶名（zh/en）。

## 5. 筛选

- All Types / 各基酒类型 / Owned / Wishlist / Recently Added。

## 6. Add Bottle（modal，设计稿 09-overlays-modal-dropdown-toast.png）

- 搜索 `bottles_catalog`（zh/en 名、品牌），结果行带基酒分类色图标；选择后设 owned 或 wishlist。
- 已在酒柜中的瓶子在结果中标注「已拥有」，不可重复添加（数据库层的唯一性约束见 [01-data-model.md](01-data-model.md)）。
- **手动添加**：底部手动添加入口（info-soft）：找不到时填自定义名称 + 选择类型（必填，决定匹配）+ 容量（可选），存为自定义酒瓶。自定义瓶以其类型对应的匹配单元参与匹配，规则详见 [02-matching-engine.md](02-matching-engine.md)。
- 首页两个入口会打开本 modal，**预选机制不同**（见 [04-home-dashboard.md](04-home-dashboard.md)）：
  - 空酒柜状态的 Start with Gin / Whisky / Rum 快捷入口 → 预选**分类**筛选（`initialCategory`）。
  - 「最佳下一瓶」扩展区的 Add to Cabinet / Wishlist CTA → 按 `bestNextType` 的**精确匹配单元**预筛选（`initialSpiritTypeId`）：结果列表只显示该匹配单元下的酒瓶（分类 chip 同步选中所属分类，用户可清除精确筛选回退为分类筛选），手动添加表单的类型同步预选——保证添加的瓶子必定解锁承诺的配方。`initialSpiritTypeId` 优先于 `initialCategory`。

## 7. 状态切换

- wishlist ↔ owned 一键切换。
- wishlist 不参与匹配，匹配输入的定义见 [02-matching-engine.md](02-matching-engine.md)。

## 8. 移除（破坏性确认，设计稿 09-overlays-modal-dropdown-toast.png）

- popover 说明影响——「移除后将有 N 款配方变为不可调」（N 由匹配函数计算，见 [02-matching-engine.md](02-matching-engine.md)）。
- 确认按钮 danger 样式（视觉规格见 `design.md`）。

## 9. 全局反馈

- 酒柜变更属写操作：乐观更新 + 失败回滚 + danger toast，遵循 [09-i18n-and-global-states.md](09-i18n-and-global-states.md) 的全局状态与反馈规范。

## 10. 验收标准

1. 从 catalog 添加、手动添加、切换状态、移除四个操作后，首页统计与配方库 Can Make 状态均即时正确（首页统计定义见 [04-home-dashboard.md](04-home-dashboard.md)，配方库状态见 [05-recipes-library.md](05-recipes-library.md)）。
2. 同一 catalog 瓶不能重复添加；自定义瓶必须选类型才能保存。
3. 移除确认弹层展示的 N 与实际解锁变化一致。

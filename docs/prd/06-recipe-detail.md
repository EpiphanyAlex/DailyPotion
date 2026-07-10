# DailyPotion PRD · Recipe Detail 配方详情（06）

| | |
|---|---|
| 优先级 | P0（Share 为 P1） |
| 依赖 | [数据模型](01-data-model.md) · [匹配引擎](02-matching-engine.md) |
| 设计稿 | `design/exports/v2/02-recipe-detail.png` · `design/exports/v2/09-overlays-modal-dropdown-toast.png`（Log Your Pour modal） |
| 总览 | [00-overview.md](00-overview.md) |

## 1. 目标

配方详情页是核心循环「挑一款调 → 记录 & 评分」的落点：用户在这里看清一款鸡尾酒需要哪些材料、自己的酒柜缺什么、具体怎么调，并完成收藏、评分与 Log Your Pour 调酒记录。它把配方库呈现的「可能性」转化为一次真实的调酒行动，并为 History 与口味偏好沉淀数据。

## 2. 页面定位与访问

- 路由：`/{locale}/recipes/[slug]`，未登录可访问（路由表与权限矩阵见[总览](00-overview.md)）。
- 访客可完整浏览配方内容（Hero / Ingredients / Instructions / Bartender Tip）；库存匹配与个人操作按下文第 3.4 节、第 4.5 节的未登录规则降级。
- 视觉规格（颜色 / 字体 / 间距 / 状态）一律以 `design.md` 为准，本文只写行为与数据逻辑。

## 3. 页面内容结构

### 3.1 Hero

- 展示：配方图、名称（双语）、描述、flavor tags、meta 信息（时长 / ABV / 难度）。
- 字段来源为 `recipes` 表，定义见[数据模型](01-data-model.md)；双语 fallback 规则见[国际化与全局状态](09-i18n-and-global-states.md)。

### 3.2 Ingredients 配料

- 展示**全部配料列表（含辅料）**。
- 基酒/利口酒行（`recipe_ingredients.is_spirit = true`，表定义见[数据模型](01-data-model.md)）标注库存状态：拥有 ✓（success 色）/ 缺少（ink-soft，不用警示红）；色彩 token 以 `design.md` 为准。
- 辅料行仅展示名称与用量，不做库存判定，也不参与任何匹配计算（匹配单元规则见[匹配引擎](02-matching-engine.md)）。

### 3.3 Instructions 步骤

- 有序步骤列表（`recipes.instructions_zh` / `instructions_en`，每步一条）。

### 3.4 Availability Panel 库存匹配面板

- **登录且全部匹配**：显示「You have all ingredients」（success-soft 样式）。
- **有缺失**：显示「Missing: Campari, Sweet Vermouth」（paper-deep 样式），缺失项为**匹配单元名**；匹配单元定义与 missing 计算逻辑见[匹配引擎](02-matching-engine.md)。
- **未登录**：显示「登录后查看你的酒柜匹配」+ 登录链接（登录流程见 [Auth](03-auth.md)）。

### 3.5 Bartender Tip

- `recipes.tip_zh` / `tip_en` 非空时展示小型提示卡（字段定义见[数据模型](01-data-model.md)）。

## 4. 用户操作

### 4.1 Favorite 收藏

- 即时切换，toast 反馈；收藏状态存于 `user_recipe_marks`（见[数据模型](01-data-model.md)）。

### 4.2 Rate this recipe 评分

- 1–5 星，写入 `user_recipe_marks.rating`（表定义见[数据模型](01-data-model.md)），可修改。
- 仅展示「你的评分」；配方卡与排序使用的官方策展评分（`base_rating` / `base_popularity`）规则见[匹配引擎](02-matching-engine.md)。

### 4.3 Log Your Pour（modal，P0）

- 以 modal 呈现，设计稿见 `design/exports/v2/09-overlays-modal-dropdown-toast.png`。
- 字段规格：
  - **日期**（默认今天，不可选未来）
  - **星级**（可空）
  - **口味 tag chips**（多选，来自固定 tag 字典）
  - **笔记**（≤500 字，可空）
- 保存后 toast + 写入 History。数据写入 `user_pour_logs` 表，字段定义与约束（含笔记 ≤500 字的应用层校验、口味 tag 存 slug）见[数据模型](01-data-model.md)；History 页展示行为见 [Favorites & History](08-favorites-history.md)。

### 4.4 Share（P1）

- 复制当前页面 URL，toast 确认。

### 4.5 未登录行为

- 未登录点击 Favorite / Rate / Log 任一操作跳转登录，登录成功后回到该配方页（`redirect` 参数机制见 [Auth](03-auth.md)）。

## 5. 移动端布局

- 图片置顶、内容区滚动。
- 底部 sticky 操作条（Log Your Pour / Favorite），不与 bottom tab 重叠；bottom tab 导航结构见[总览](00-overview.md)，断点与布局规则见 `design.md`。

## 6. 全局状态与反馈

- 详情页需提供 skeleton 加载布局；收藏 / 评分 / 记录等写操作采用乐观更新 + 失败回滚 + danger toast。全局规则见[国际化与全局状态](09-i18n-and-global-states.md)。

## 7. 验收标准

1. 库存状态与酒柜实时一致：添加缺失的酒后回到详情页，Availability Panel 变为全有（「You have all ingredients」）。
2. Log Your Pour 保存后立即出现在 History 页顶部。
3. 未登录点击 Favorite / Rate / Log 任一操作跳转登录，登录后回到该配方页。

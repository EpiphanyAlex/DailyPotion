# DailyPotion PRD · 国际化与全局状态（09）

| | |
|---|---|
| 优先级 | P0 |
| 依赖 | 无（横切所有 feature） |
| 设计稿 | `design/exports/v2/09-overlays-modal-dropdown-toast.png`（toast）、`design/exports/v2/10-interaction-states.png` |
| 总览 | [00-overview.md](00-overview.md) |

---

## 1. 目标

DailyPotion 面向中文与英文两类使用者，核心循环（添加酒瓶 → 看到「你能调 N 款」 → 调一杯并 Log Your Pour）必须在任一语言下完整可用。本文件定义两项横切所有页面的需求：其一是全站国际化机制（路由、UI 文案、数据内容 fallback、枚举翻译）；其二是全局加载、写操作反馈与错误页规范，保证各 feature 在慢网络与失败场景下体验一致。

---

## 2. 国际化

### 2.1 路由与语言协商

- next-intl，`/zh` `/en` 前缀路由；首次访问按 `Accept-Language` 重定向；语言切换器写 cookie，后续访问优先 cookie。
- 完整路由表与导航结构见 [总览](00-overview.md)（信息架构章节）。

### 2.2 UI 文案

- UI 文案：`messages/zh.json` / `messages/en.json`，禁止组件内硬编码文案。

### 2.3 数据内容双列与 fallback

- 数据内容：`*_zh` / `*_en` 双列（各表字段定义见 [数据模型](01-data-model.md)）；**fallback 规则：当前 locale 列为空时显示另一语言列**，两列都空显示占位符。

### 2.4 枚举翻译策略

- 口味 tag、难度、类型等枚举值存 slug，翻译放 messages。

---

## 3. 全局状态与反馈

### 3.1 Loading

- Loading：paper-deep skeleton（design.md §8），列表页与详情页均需 skeleton 布局。

### 3.2 写操作反馈

- 写操作（收藏/评分/记录/酒柜变更）：乐观更新 + 失败回滚 + danger toast。
- 上述写操作的具体行为定义见各 feature 文件：收藏、评分与 Log Your Pour 见 [配方详情](06-recipe-detail.md)；owned/wishlist 状态切换等酒柜变更见 [我的酒柜](07-my-cabinet.md)；收藏与记录的列表管理见 [收藏与调酒记录](08-favorites-history.md)。

### 3.3 错误页

- 全局错误页与 404 页遵循空状态样式，双语。

---

## 4. 验收标准

### 4.1 国际化

- 全站无硬编码文案；zh/en 切换后所有页面（含 toast、错误提示、空状态）语言正确。
- 人为清空某配方 `description_en` 后，英文站该字段显示中文内容而非空白。

### 4.2 全局状态与反馈

- 列表页与详情页在数据加载中均显示 paper-deep skeleton 布局（视觉规格见 design.md §8）。
- 收藏/评分/记录/酒柜变更任一写操作先乐观更新界面，请求失败时回滚并展示 danger toast。
- 全局错误页与 404 页按空状态样式渲染，在 `/zh` 与 `/en` 下文案均正确。

# DailyPotion PRD 索引

DailyPotion（家庭酒柜管理 + 鸡尾酒配方推荐 Web 应用）的产品需求文档，已由单体 PRD 按 feature 拆分为本目录下的独立文件。**本目录是产品需求的唯一权威来源**；原 `docs/PRD.md` 已替换为指向本目录的存根，完整历史见 git 记录。

## 文件索引

| 文件 | 内容 | 优先级 | 依赖 |
|---|---|---|---|
| [00-overview.md](00-overview.md) | 产品概述、版本规划（V1 范围 / V2 / V3 路线图）、信息架构（路由 / 导航 / 权限矩阵）、非功能需求、成功指标、风险与开放问题、设计稿索引 | —（总览，无优先级） | 无 |
| [01-data-model.md](01-data-model.md) | Supabase 数据模型：内容表 / 用户表结构、RLS 策略、种子数据要求 | P0（地基） | 无 |
| [02-matching-engine.md](02-matching-engine.md) | `lib/matching.ts` 匹配与推荐纯函数：canMake / missing / dailyPour / becauseYouHave / 评分热度规则 / 单元测试要求 | P0（地基） | [01-data-model.md](01-data-model.md) |
| [03-auth.md](03-auth.md) | 邮箱注册 / 登录 / 登出 / 重置密码，登录跳转与表单校验 | P0（Google OAuth 子项为 P1） | 无（Supabase Auth 内建） |
| [04-home-dashboard.md](04-home-dashboard.md) | 首页 Dashboard：Daily Pour、Cabinet Snapshot、Because You Have X、空酒柜与未登录状态 | P0 | [01-data-model.md](01-data-model.md)、[02-matching-engine.md](02-matching-engine.md) |
| [05-recipes-library.md](05-recipes-library.md) | 配方库：搜索 / 筛选 chips / 排序 / 配方卡 / URL 状态同步 | P0（顶部导航全局搜索为 P1） | [01-data-model.md](01-data-model.md)、[02-matching-engine.md](02-matching-engine.md) |
| [06-recipe-detail.md](06-recipe-detail.md) | 配方详情：配料与库存状态、步骤、Availability Panel、收藏 / 评分 / Log Your Pour、Bartender Tip | P0（Share 复制链接子项为 P1） | [01-data-model.md](01-data-model.md)、[02-matching-engine.md](02-matching-engine.md) |
| [07-my-cabinet.md](07-my-cabinet.md) | 我的酒柜：列表 / 搜索筛选 / Add Bottle modal / owned-wishlist 切换 / 移除确认 | P0 | [01-data-model.md](01-data-model.md)、[02-matching-engine.md](02-matching-engine.md) |
| [08-favorites-history.md](08-favorites-history.md) | 收藏页与调酒记录（History）：列表、编辑、删除、空状态 | P0 | [01-data-model.md](01-data-model.md)（记录写入口在 [06-recipe-detail.md](06-recipe-detail.md) 的 Log Your Pour） |
| [09-i18n-and-global-states.md](09-i18n-and-global-states.md) | 国际化（next-intl 路由、双语字段 fallback）+ 全局状态与反馈（skeleton、乐观更新、错误页） | P0（横切所有 feature） | 无（横切所有 feature） |

优先级说明：01、02 是所有页面 feature 的地基，必须先行；03–09 为各页面与横切 feature，整体均为 P0，仅表中注明的子项（Google OAuth、全局搜索、Share）为 P1，可在 V1 后期补齐。

「依赖」列与各文件 meta 表保持一致，指**文档阅读依赖**（理解该 feature 需要先掌握的数据/算法地基）。实施顺序上，所有登录后功能（04–08）还需要 [03-auth.md](03-auth.md) 先行，这属于排期依赖，不在此列。

## 阅读顺序建议

1. **新会话 / 新成员**：先读 [00-overview.md](00-overview.md)，建立产品定位、V1 范围与信息架构的全貌。
2. **做数据库 / 算法**：读 [01-data-model.md](01-data-model.md) 与 [02-matching-engine.md](02-matching-engine.md)（含单元测试要求，`npm test` 必须覆盖）。
3. **做某个页面 feature**：直接读 03–09 中对应文件，并按其「依赖」列回看地基文档。

## 权威边界

- **产品需求**：只看本目录（`docs/prd/`）。
- **视觉 token 与组件规格**：看仓库根目录 [`design.md`](../../design.md)（唯一权威来源），本目录各 PRD 只写行为与数据逻辑，不重复视觉规格。
- **设计稿源文件**：`design_system.pen`，通过 pencil MCP 工具读取（禁止用 Read/Grep 直接读 .pen 文件）；导出图在 `design/exports/v2/`，与各 feature 的对应关系见 [00-overview.md](00-overview.md) 的设计稿索引。

## 变更流程

1. **需求变更先改文档，再写代码**：任何 feature 的行为变化，先更新对应的 feature PRD（03–09，或地基文档 01、02），再动实现。
2. **跨 feature 决策**（版本范围调整、路由 / 导航变化、非功能需求、新增风险或开放问题）：改 [00-overview.md](00-overview.md)，并同步受影响的 feature 文件。
3. 涉及新视觉规格时，遵循 `CLAUDE.md` 约定：先在根目录 `design.md` 增加 token，再写组件；PRD 中只引用，不定义视觉细节。

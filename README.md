# DailyPotion

面向家庭调酒爱好者的酒柜管理与鸡尾酒配方推荐 Web 应用。记录家中的酒瓶，按基酒与利口酒匹配现在能调什么、还差什么，再用清晰的双语配方把“家里有一瓶酒”变成“今晚调一杯”。

状态：Phase 1 基础工程已完成本地实现与验收。Next.js 15 脚手架、Vitest 3、Tailwind v4 设计 token、五套字体、双语路由与 10 个占位页面均已就绪；Vercel 生产部署接入中。更新于 2026-07-13。

## 当前基线

- **产品**：管理 owned / wishlist 酒瓶，浏览和收藏配方，记录每次调酒，并根据现有库存推荐可调配方与最佳下一瓶。
- **Web 技术**：Next.js 15 App Router、React 19、TypeScript 5 strict、Tailwind CSS 4。
- **测试**：Vitest 3；`npm test` 运行全部单元测试，生产构建同时执行 TypeScript 与 Next.js 校验。
- **设计**：Modern Editorial Home Bar。米色纸感、衬线标题与现代 Dashboard 组合；颜色、字号、间距、圆角和阴影统一来自 `design.md` token。
- **国际化**：中文与英文两套界面文案，URL 使用 `/zh`、`/en` 前缀；实体数据采用 `*_zh` / `*_en` 双列与跨语言 fallback。
- **数据与身份**：Supabase Postgres、Auth 与 RLS；内容表公开可读，用户酒柜、收藏和调酒记录仅本人可读写。
- **匹配边界**：匹配单元是 `spirit_types`；只计算 owned 酒瓶和 `is_spirit = true` 的配料，wishlist 与果汁、糖浆、装饰物不参与库存匹配。

## 本地启动

需要 Node.js 22.0 或更高版本，以及 npm。

```bash
git clone git@github.com:EpiphanyAlex/DailyPotion.git
cd DailyPotion
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。当前基础页面无需 Supabase 密钥；后续数据阶段使用的变量名已列在 `.env.example`。

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动 Turbopack 开发服务器 |
| `npm test` | 运行 Vitest 单元测试 |
| `npm run lint` | 运行 ESLint |
| `npm run build` | 构建生产版本并执行类型检查 |
| `npm run start` | 启动已构建的生产服务器 |

## 文档地图

| 文档 | 作用 |
|---|---|
| [`docs/prd/README.md`](docs/prd/README.md) | PRD 索引；进入各功能需求的起点 |
| [`docs/prd/00-overview.md`](docs/prd/00-overview.md) | 产品范围、版本路线、路由、权限与非功能要求 |
| [`docs/prd/01-data-model.md`](docs/prd/01-data-model.md) | 数据模型、RLS、约束与内容基线 |
| [`docs/prd/02-matching-engine.md`](docs/prd/02-matching-engine.md) | 可调判断、缺失项、每日推荐与排序规则 |
| [`design.md`](design.md) | 视觉 token、组件规格、响应式规则与页面结构的唯一权威 |
| [`design/exports/v2/`](design/exports/v2/) | 11 张设计参考图 |
| `design_system.pen` | Pencil 设计源文件；通过 Pencil 工具读写 |
| [`CLAUDE.md`](CLAUDE.md) | 协作者与代码代理必须遵守的项目约束、命名和测试协议 |

## 阶段路线图

1. **基础**：Next.js、Tailwind token、字体、Vitest、双语路由与部署。
2. **数据层**：Supabase 表、RLS、种子数据、类型与查询层。
3. **匹配引擎**：纯函数实现可调、缺失、推荐与统计，并覆盖全部边界测试。
4. **身份与导航**：邮箱认证、路由守卫、TopNav、BottomTab 与个人页。
5. **我的酒柜**：搜索、筛选、添加、自定义酒瓶、owned / wishlist 与移除影响。
6. **配方浏览**：配方库、URL 筛选、详情、配料、步骤与库存状态。
7. **收藏与调酒记录**：收藏、评分、Log Your Pour、Favorites、History 与 toast。
8. **首页与收口**：Daily Pour、酒柜统计、最佳下一瓶、推荐、空状态与全局验收。

## 文档规则

`docs/prd/` 是产品范围、数据与验收标准的事实源；`design.md` 是视觉实现的事实源；`CLAUDE.md` 约束代码结构、领域命名和测试流程。功能或视觉需求发生变化时，先更新对应事实源，再修改实现。

# Phase 5 · 酒柜验收

日期：2026-10-06。环境：本地 Next.js 开发服务器、真实本地 Supabase、临时 A/B 账号、agent-browser 0.27.0。

结果：完整浏览器脚本通过。官方/自定义 CRUD、重复防护、输入校验、真实移除影响、写入失败回滚、写入成功后读取失败与只读重试、快速双击只写一次、zh/en、三个断点、焦点返回、A 登出/B 登录及 A 的迟到读取均通过断言。迟到响应场景保留同一浏览器文档，在 B 酒柜为空时释放 A 的已完成读取，确认 B 页面仍无 A 的行。

工程检查：ESLint、TypeScript、73 个 Vitest 用例与生产构建通过。沙箱内的首次构建因 Turbopack 子进程绑定端口被拒而中断；同一代码在允许该构建进程运行后通过。未改变数据库迁移或 RLS。

## 范围

- 官方库搜索（中英文名称/品牌）、分类筛选、owned/wishlist 添加和重复防护。
- 自定义名称/类型校验、可选正整数容量、酒柜搜索与类型/状态/最近添加筛选。
- 状态切换、移除确认和真实匹配引擎计算的可调损失；同类型多瓶和 wishlist 边界。
- 操作级乐观回滚、成功后的权威重读、单独重试读取、过期响应丢弃。
- 桌面网格、移动列表、底部悬浮添加、双语、弹窗焦点和键盘关闭。

## 运行

先配置 `.env.local` 指向本地 Supabase，并启动已迁移、有种子数据的实例及 `npm run dev`。脚本拒绝非 localhost 地址，不重置现有数据库，只创建和清理本次临时账号。

```sh
AGENT_BROWSER_BIN=/absolute/path/to/agent-browser node scripts/verify-cabinet.mjs
npm run verify
```

浏览器脚本在真实 UI 操作后读取相应账号的数据库行校验持久化；失败场景只拦截浏览器的请求边界，正常写入及账号隔离仍经过真实 Supabase/RLS。截图写入忽略提交的 `output/playwright/phase-5/`，不保存密码、令牌或会话状态。

## 已检查的视觉状态

| 视口 | 证据 | 结果 |
|---|---|---|
| 1280 × 900 | `desktop-empty.png`、`desktop-inventory.png` | 顶部导航、三列网格规格、空态与操作入口 |
| 900 × 900 | `tablet-inventory.png` | 两列网格与底部导航，无水平溢出 |
| 390 × 844 | `mobile-inventory.png`、`mobile-add.png` | 单列酒瓶行、可横向滚动筛选、添加按钮不遮挡底部导航、弹窗在视口内 |

目视发现并修复了 `max-w-md/lg` 与 spacing token 同名导致的宽度错误；容器现明确引用 Tailwind container 变量。弹窗关闭恢复到触发按钮；焦点捕获不再因父组件重渲染而重置。

## 阶段边界

Phase 6 接入配方库/详情后补齐酒柜变更的跨页匹配验收，Phase 7 接入全局 toast，Phase 8 接入首页与统一 loading/error 状态。正式酒瓶图片属于 Public V1 内容阶段，当前空图使用设计 token 占位。

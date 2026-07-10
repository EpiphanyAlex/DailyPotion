# DailyPotion PRD · Auth 登录注册（03）

| | |
|---|---|
| 优先级 | P0（Google OAuth 为 P1） |
| 依赖 | 无（Supabase Auth 内建；重定向规则见 [00-overview.md](00-overview.md) 路由表） |
| 设计稿 | `design/exports/v2/07-auth-desktop-login.png`、`design/exports/v2/08-auth-mobile-signup.png` |
| 总览 | [00-overview.md](00-overview.md) |

## 1. 目标

Auth 是产品核心循环「添加酒瓶 → 看到你能调 N 款 → 记录 & 评分」的准入门槛：酒柜、收藏、评分、调酒记录等个人化能力都以登录身份为前提。本模块基于 Supabase Auth 提供邮箱注册/登录/登出/重置密码（P0）与 Google OAuth（P1），并通过注册页引导文案把新用户直接带入核心循环的第一步。各页面的登录可见性以 [00-overview.md](00-overview.md) 的权限矩阵为准。

## 2. 功能点

### 2.1 邮箱注册

- 邮箱 + 密码注册，使用 Supabase Auth，开启邮件确认。
- 密码 ≥8 位。
- 注册页引导文案呈现三步路径：**注册 → 添加第一瓶酒 → 看能调什么**。

### 2.2 登录 / 登出 / 忘记密码

- 登录、登出。
- 忘记密码走 Supabase 内建 reset 邮件流。

### 2.3 Google OAuth（P1）

- Secondary 按钮样式（视觉规格见 `design.md`），与邮箱表单以「或」分隔线隔开。

### 2.4 表单校验与错误处理

- 客户端即时校验：邮箱格式、密码长度、两次密码一致。
- 校验未通过时主按钮禁用。
- 服务端错误（邮箱已注册等）以表单错误条展示，文案双语。

### 2.5 登录成功后跳转

- 有 `redirect` 参数时回原页，否则去 `/{locale}`。
- 登录/注册页路由为 `/{locale}/login`、`/{locale}/signup`，未登录访问受保护路由（如 `/{locale}/cabinet`）的重定向规则见 [00-overview.md](00-overview.md) 路由表与权限矩阵。

## 3. 验收标准

- 新用户可完成注册 → 收到确认邮件 → 确认后登录成功。
- 未登录访问 `/cabinet` 被重定向到 `/login?redirect=/cabinet`，登录后回到酒柜页。
- 错误态视觉符合 `design.md` 表单规格（danger-soft 底 + danger 边 + 图标文案）。

# CI 工程 PRD

| 项目 | 内容 |
|---|---|
| 状态 | 本地已验收；待首次 GitHub Actions 运行 |
| 范围 | 当前 Next.js 代码门禁与已有 Supabase 数据库门禁的职责边界 |
| 依据 | `package.json`、`.github/workflows/ci.yml`、测试与静态检查配置 |

## 目标

Pull Request 与 `main` 提交使用可重复的检查。Web 代码门禁在本地与 CI 共用同一条命令；已有数据库门禁继续独立运行。通过门禁表示当前已实现代码通过对应检查，不代表后续产品功能已完成。

## 范围

1. Web 代码门禁使用 Node.js 22 和锁文件安装依赖，依次运行 ESLint、TypeScript、Vitest 与生产构建。
2. 本地与 CI 的 Web 代码门禁共用 `npm run verify`，避免维护两份不同的步骤清单。
3. 本地忽略的 `.worktrees/`、依赖目录和构建产物不进入 lint、类型检查或测试发现范围。
4. 已有 Database job 保留 Supabase 启动、重置、pgTAP、查询契约验证及清理流程。
5. CI 只需读取仓库，不使用部署密钥，不执行远端部署或迁移。

## 非目标

- 不改变产品功能、页面设计、业务数据模型或已有数据库门禁。
- 当前阶段不增加浏览器端到端测试或视觉回归测试；在对应页面落地时按风险加入。
- 不把代码门禁通过解释为业务功能已完整交付。

## 验收标准

1. 在仓库根目录运行 `npm run verify`，顺序执行 lint、typecheck、test、build，任一步失败即返回非零退出码。
2. 即使本地保留 `.worktrees/`，`npm run lint`、`npm run typecheck`、`npm test` 也不读取其中的源码、依赖或构建产物。
3. GitHub Actions 在 Pull Request 和 `main` 的 push 上通过 `npm ci` 安装依赖并运行 `npm run verify`。
4. Database job 仍独立执行全部原有数据库验证，且始终清理本地 Supabase。
5. 项目 README 能找到本工程 PRD 和本地验证命令。

## 后续演进

新增业务模块时，把有意义的单元或交互测试接入现有 `npm test`；数据库契约扩展时更新 Database job 的验证入口。两类门禁分别维护，避免 Web 代码检查依赖本地数据库。

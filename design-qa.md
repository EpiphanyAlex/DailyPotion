# 登录页设计核对

- 设计源图：[07-auth-desktop-login.png](design/exports/v2/07-auth-desktop-login.png)，2880×1800 px（对应 1440×900 CSS 视口的 2× 导出）。
- 实现截图：[login-implementation.jpg](docs/engineering/qa/login-implementation.jpg)，1440×900 px（Codex 内置浏览器，1440×900 CSS 视口，1× 截图）。
- 同尺寸对比：[login-comparison.png](docs/engineering/qa/login-comparison.png)；表单局部对比：[login-form-comparison.png](docs/engineering/qa/login-form-comparison.png)。源图使用 Lanczos 缩至 1440×900，未裁切。
- 状态：`/zh/login`，邮箱填入示例地址、密码填入测试字符串并获得焦点，主按钮已启用；没有提交表单。截图采自生产构建。

## 比较历史

1. 初版：左侧占 50%（设计稿为 4:5，1440px 视口分界应在 x=640）；表单左边界在 x=880（设计稿 x=840）；表单起点约 y=236（设计稿约 y=183）；中文标题字重偏轻；没有密码可见按钮。
2. 修正：桌面分栏改为 4:5；表单顶部使用 `20vh` token；品牌距边缘 48px；中文标题改用 UI 字体粗体；补上密码可见按钮与示例邮箱占位文案。再次截取生产构建，并将源图与截图按相同尺寸并排比较。

## 最终核对

- **字体与文案**：中文标题字重、层级和位置接近画稿；品牌沿用 Playfair 斜体。实际界面遵循 PRD 09 §2.4，只显示当前语言，因此画稿中的双语标签和品牌副文不同时出现。
- **布局与间距**：分界 x=640，表单左边界 x=840，宽 400px；标题、说明、输入框和按钮的排列接近源图。品牌纵向位置有少量像素差异，属 P3。
- **颜色与控件**：左侧 `paper-deep` 叠 `image-overlay` 与画稿灰棕色接近；右侧为 `paper`。输入框及按钮沿用设计 token。焦点态保留设计规范要求的 2px outline + 2px offset，因此比画稿中的单线红边更明显。
- **图片与图标**：本张画稿左侧为纯色占位面，实现也使用纯色占位面。密码眼睛图标使用现有 Lucide 图标库。
- **预期差异**：Google 登录及「或」分隔线属 Public V1 / P1，Engineering MVP 按 `design.md` Auth 规范不渲染。因缺少该区块，注册链接比画稿更靠上。空表单时主按钮按校验规则禁用；截图用已填写状态比较。
- **交互与响应式**：密码显示/隐藏切换已在内置浏览器验证；390×844 手机视口、英文登录页已检查；浏览器 error 日志为空。`npm run lint`、`npm test`（64 项）、`npm run build` 均通过。

没有剩余可执行的 P0/P1/P2 视觉问题。

final result: passed

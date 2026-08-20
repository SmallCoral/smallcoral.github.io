# SmallCoral Aquarium

SmallCoral 的个人博客，使用 React、TypeScript 和 Vite 构建，并通过 GitHub Actions 发布到 GitHub Pages。

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

构建产物位于 `dist/`。现有文章地址继续保留为 `blog/*.html`，`images/`、`data/` 和 `pay/` 会在构建时复制到发布目录。

## 友链自动化

- 申请入口：`.github/ISSUE_TEMPLATE/friend-link.yml`
- 给申请 Issue 添加 `friend-approved` 标签后，现有工作流会更新 `data/friends.json`
- `main` 分支更新后，`deploy-pages.yml` 会重新构建并发布网站

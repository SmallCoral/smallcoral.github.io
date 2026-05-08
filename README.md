# SmallCoral Aquarium

SmallCoral 的个人博客重写版。

保留内容：

- 头像、Logo、favicon
- 博客封面图
- 部分 gallery 图片
- 4 篇原有文章内容

新功能：

- 全新首页视觉
- BH6TAW 业余无线电台呼号展示
- 博客文章卡片与独立文章页
- 友链展示、筛选、搜索、信息复制和 GitHub Issues 审核后自动添加
- 无 Bootstrap、无旧模板脚本、无外部构建流程

直接打开 `index.html` 即可浏览。

友链自动化：

- 申请入口使用 GitHub Issue Form：`.github/ISSUE_TEMPLATE/friend-link.yml`
- 审核通过时给申请 Issue 添加 `friend-approved` 标签
- GitHub Actions 会把申请信息追加到 `data/friends.json`，提交到默认分支，并关闭 Issue

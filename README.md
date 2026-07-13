# Aster Notes

一个可直接部署的个人博客首页，视觉结构参考沉浸式数字花园：悬浮磨砂导航、全屏封面、桌面三栏信息架构、移动端单栏文章流，以及搜索、主题、磨砂和音乐状态交互。

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000/aster-notes-blog/`。生产构建与静态预览：

```bash
npm run build
npm run start
```

线上版本由 GitHub Actions 自动部署至 `https://xiwanzi.github.io/aster-notes-blog/`。

## 修改内容

站点名称、Hero 文案、简介、分类、标签和文章数据都集中在 `src/data/site.ts`。新增文章时复制 `posts` 数组中的一项；`pinned: true` 会把文章放进“置顶文章”。

视觉令牌、响应式断点和组件样式位于 `src/app/globals.css`。原创 Hero 图形位于 `public/hero-art.svg`，可以直接换成同名文件而无需改组件代码。

## 项目结构

```text
src/app/layout.tsx          页面元数据与根布局
src/app/page.tsx            首页入口
src/app/globals.css         主题、布局、组件与响应式样式
src/components/BlogHome.tsx 页面组件与交互逻辑
src/data/site.ts            可编辑的站点内容模型
public/hero-art.svg         原创封面视觉
docs/architecture.md        架构分析与优化记录
```

## 已实现交互

- 亮色/暗色主题切换并持久保存
- 磨砂效果切换并持久保存
- 文章即时搜索
- 移动端菜单
- 音乐卡片播放状态与进度反馈
- 平滑锚点导航、阅读进度条与返回顶部
- 尊重 `prefers-reduced-motion` 的低动态模式

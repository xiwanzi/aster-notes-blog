# 星汐回响 · 抽卡动画模拟器

原创二次元科幻抽卡体验，包含单抽、九连、五星保底、九连四星保底、跳过动画、共鸣记录、概率说明和程序化音效。

## 本地运行

```bash
npm install
set LOCAL_PREVIEW=1
npm run dev
```

访问 `http://localhost:3000/`。生产构建：

```bash
npm run lint
npm run build
```

GitHub Pages 会在推送 `master` 后自动部署到 `https://xiwanzi.github.io/aster-notes-blog/`。

## 交互

- 单次观测消耗 160 折光晶核。
- 九重共鸣消耗 1,280 折光晶核，并至少包含四星或以上回响。
- 首次共鸣必定出现五星角色，方便完整体验最高稀有度动画。
- 60 抽五星保底，第 50 抽开始进入概率提升区间。
- 动画可跳过，九连结果卡可点击查看详情。
- 声音由 Web Audio API 实时合成，不依赖外部音频。

## 主要文件

```text
src/components/LumenGacha.tsx  抽卡状态、概率、分镜和交互
src/app/globals.css             游戏大厅、动画和响应式视觉
public/lumen-gate.webp          原创星门场景
public/*-*.webp                 原创角色美术
docs/architecture.md            实现与动画架构说明
```

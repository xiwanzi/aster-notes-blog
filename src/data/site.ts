export type Post = {
  title: string;
  summary: string;
  category: string;
  tags: string[];
  date: string;
  minutes: number;
  pinned?: boolean;
};

export const site = {
  name: "Aster",
  mark: "A",
  eyebrow: "A PERSONAL FIELD NOTE",
  headline: "Make · Learn · Wander",
  subheadline: "记录技术实现与创作过程，覆盖前端工程、交互设计、图形实验与数字生活中的长期思考。",
  bio: "A quiet place for things I make, learn and notice.",
  about: "这是一座持续生长的个人数字花园：不追赶更新频率，只记录真正想留下的思考。",
  since: "2026",
};

export const categories = [
  { name: "设计札记", count: 7 },
  { name: "代码实验", count: 5 },
  { name: "效率系统", count: 4 },
  { name: "生活切片", count: 3 },
  { name: "阅读与观看", count: 2 },
];

export const tags = [
  ["Design", 8],
  ["Frontend", 6],
  ["Creative Coding", 5],
  ["Notes", 5],
  ["Workflow", 4],
  ["Typography", 3],
  ["Life", 3],
  ["Reading", 2],
] as const;

export const posts: Post[] = [
  {
    title: "把个人网站变成一座可以长期维护的数字花园",
    summary: "正文尚未填写，当前仅保留首页卡片占位。",
    category: "设计札记",
    tags: ["Design", "Digital Garden", "System"],
    date: "2026-07-10",
    minutes: 12,
    pinned: true,
  },
  {
    title: "让界面安静下来：克制动效的四条判断原则",
    summary: "正文尚未填写，当前仅保留首页卡片占位。",
    category: "设计札记",
    tags: ["Motion", "UX", "Details"],
    date: "2026-07-04",
    minutes: 8,
    pinned: true,
  },
  {
    title: "从零搭建一套不会拖累写作的内容工作流",
    summary: "正文尚未填写，当前仅保留首页卡片占位。",
    category: "效率系统",
    tags: ["Workflow", "Writing", "Notes"],
    date: "2026-06-28",
    minutes: 10,
    pinned: true,
  },
  {
    title: "一周界面观察：留白不是空白，而是阅读的节拍",
    summary: "正文尚未填写，当前仅保留首页卡片占位。",
    category: "设计札记",
    tags: ["Layout", "Typography", "UI"],
    date: "2026-07-12",
    minutes: 7,
  },
  {
    title: "用 CSS 做一张会呼吸的抽象封面",
    summary: "正文尚未填写，当前仅保留首页卡片占位。",
    category: "代码实验",
    tags: ["CSS", "Creative Coding", "Frontend"],
    date: "2026-07-08",
    minutes: 9,
  },
  {
    title: "我如何整理散落在各处的灵感碎片",
    summary: "正文尚未填写，当前仅保留首页卡片占位。",
    category: "效率系统",
    tags: ["Notes", "PKM", "Workflow"],
    date: "2026-07-01",
    minutes: 6,
  },
  {
    title: "六月书影音：关于城市、创造与缓慢生活",
    summary: "正文尚未填写，当前仅保留首页卡片占位。",
    category: "阅读与观看",
    tags: ["Reading", "Film", "Monthly"],
    date: "2026-06-30",
    minutes: 11,
  },
  {
    title: "一次没有目的地的海边散步",
    summary: "正文尚未填写，当前仅保留首页卡片占位。",
    category: "生活切片",
    tags: ["Life", "Walk", "Journal"],
    date: "2026-06-22",
    minutes: 5,
  },
  {
    title: "组件不是积木：从语义而不是形状开始设计",
    summary: "正文尚未填写，当前仅保留首页卡片占位。",
    category: "代码实验",
    tags: ["Components", "React", "Design System"],
    date: "2026-06-16",
    minutes: 13,
  },
  {
    title: "雨夜界面的光与层次：从一张壁纸开始配色",
    summary: "正文尚未填写，当前仅保留首页卡片占位。",
    category: "代码实验",
    tags: ["Color", "Canvas", "Atmosphere"],
    date: "2026-06-11",
    minutes: 9,
  },
  {
    title: "个人知识库真正需要的不是更多文件夹",
    summary: "正文尚未填写，当前仅保留首页卡片占位。",
    category: "效率系统",
    tags: ["PKM", "Notes", "Review"],
    date: "2026-06-05",
    minutes: 8,
  },
  {
    title: "为静态博客加入刚刚好的互动感",
    summary: "正文尚未填写，当前仅保留首页卡片占位。",
    category: "代码实验",
    tags: ["Interaction", "Next.js", "Motion"],
    date: "2026-05-29",
    minutes: 12,
  },
  {
    title: "五月工具清单：留下真正反复使用的四件东西",
    summary: "正文尚未填写，当前仅保留首页卡片占位。",
    category: "阅读与观看",
    tags: ["Tools", "Monthly", "Workflow"],
    date: "2026-05-22",
    minutes: 7,
  },
];

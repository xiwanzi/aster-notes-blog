"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { categories, posts, site, tags, type Post } from "@/data/site";
import { AmbientBackdrop, wallpapers } from "@/components/AmbientBackdrop";

const avatarPath = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/avatar-aster.webp`;

type IconName =
  | "home" | "file" | "user" | "link" | "search" | "music" | "sun" | "moon"
  | "spark" | "menu" | "close" | "arrow" | "clock" | "folder" | "pin"
  | "chart" | "hash" | "calendar" | "mail" | "rss" | "github" | "play"
  | "pause" | "prev" | "next" | "volume" | "list" | "grid" | "chevron"
  | "monitor";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    file: <><path d="M6 3h9l3 3v15H6z"/><path d="M9 9h6M9 13h6M9 17h4"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></>,
    link: <><path d="m10 13 4-4"/><path d="M7.5 16.5 5 19a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0" transform="translate(3 -2)"/><path d="m13 8 2-2a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    music: <><path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></>,
    moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>,
    spark: <><path d="m12 2 1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <path d="m5 5 14 14M19 5 5 19"/>,
    arrow: <><path d="M4 12h15"/><path d="m14 7 5 5-5 5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></>,
    folder: <path d="M3 6h7l2 2h9v11H3z"/>,
    pin: <><path d="m8 3 8 8M14 2l8 8-4 1-5 5-1 4-8-8 4-1 5-5Z"/><path d="m9 15-6 6"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    hash: <><path d="M10 3 8 21M16 3l-2 18M4 9h16M3 15h16"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    rss: <><path d="M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M4 10a9 9 0 0 1 9 9M4 4a15 15 0 0 1 15 15"/></>,
    github: <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-2c-3 .7-3.6-1.3-3.6-1.3-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.1.9.1-.7.4-1.2.7-1.5-2.4-.3-4.9-1.2-4.9-5A3.9 3.9 0 0 1 7.4 8c-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.8 1.1a9.6 9.6 0 0 1 5.1 0c2-1.4 2.8-1.1 2.8-1.1.6 1.4.2 2.5.1 2.8a3.9 3.9 0 0 1 1.1 2.8c0 3.9-2.5 4.8-4.9 5 .4.3.7 1 .7 2V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/>,
    play: <path d="m8 5 11 7-11 7Z"/>,
    pause: <><path d="M8 5v14M16 5v14"/></>,
    prev: <><path d="M6 5v14M18 6l-9 6 9 6Z"/></>,
    next: <><path d="M18 5v14M6 6l9 6-9 6Z"/></>,
    volume: <><path d="M5 10v4h4l5 4V6l-5 4Z"/><path d="M17 9a4 4 0 0 1 0 6"/></>,
    list: <><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
    grid: <><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></>,
    chevron: <path d="m8 10 4 4 4-4"/>,
    monitor: <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function SectionTitle({ icon, title, count }: { icon: IconName; title: string; count?: number }) {
  return <div className="panel-title"><span><Icon name={icon} size={17}/>{title}</span>{count !== undefined && <b>{count}</b>}</div>;
}

function SocialRow() {
  return <div className="social-row">
    <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><Icon name="github"/></a>
    <button aria-label="订阅更新"><Icon name="rss"/></button>
    <button aria-label="发送邮件"><Icon name="mail"/></button>
    <button aria-label="友链"><Icon name="link"/></button>
  </div>;
}

function ProfileCard() {
  return <section className="glass-panel profile-card">
    <h2>{site.name}</h2>
    <p>{site.bio}</p>
    <div className="profile-stats"><span><b>62</b>天</span><i/><span><b>18</b>篇</span></div>
    <SocialRow/>
  </section>;
}

function NoticeCard() {
  return <section className="glass-panel notice-card">
    <SectionTitle icon="spark" title="公告"/>
    <p>内容仍在生长中。先从喜欢的主题开始写，网站会替你保留每一次变化。</p>
    <button className="text-link">关于这座花园 <Icon name="arrow" size={15}/></button>
  </section>;
}

const tracks = [
  { title: "Blue hour", artist: "Aster radio · glass piano", duration: 204 },
  { title: "Quiet terminal", artist: "Aster radio · soft signal", duration: 228 },
  { title: "After the rain", artist: "Aster radio · night ambience", duration: 192 },
];

function formatTime(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function MusicCard({ playing, trackIndex, elapsed, onToggle, onPrevious, onNext }: {
  playing: boolean; trackIndex: number; elapsed: number; onToggle: () => void; onPrevious: () => void; onNext: () => void;
}) {
  const track = tracks[trackIndex];
  return <section className="glass-panel music-card">
    <SectionTitle icon="music" title="此刻在听"/>
    <div className="track"><div className={`album ${playing ? "is-playing" : ""}`}><Icon name="music"/></div><div><b>{track.title}</b><span>{track.artist}</span></div></div>
    <div className="player-controls">
      <button aria-label="上一首" onClick={onPrevious}><Icon name="prev"/></button>
      <button className="play-button" aria-label={playing ? "暂停" : "播放"} onClick={onToggle}><Icon name={playing ? "pause" : "play"}/></button>
      <button aria-label="下一首" onClick={onNext}><Icon name="next"/></button>
    </div>
    <div className="music-volume" aria-label="音量 70%"><Icon name="volume" size={14}/><i><span/></i></div>
    <div className="track-progress"><i style={{ width: `${Math.min(100, elapsed / track.duration * 100)}%` }}/></div>
    <div className="track-time"><span>{formatTime(elapsed)}</span><span>{formatTime(track.duration)}</span></div>
  </section>;
}

function CategoryCard() {
  return <section className="glass-panel compact-panel">
    <SectionTitle icon="folder" title="分类" count={categories.length}/>
    <div className="category-list">{categories.map((item) => <button key={item.name}><span>{item.name}</span><b>{item.count}</b></button>)}</div>
  </section>;
}

function TagCard() {
  return <section className="glass-panel compact-panel">
    <SectionTitle icon="hash" title="标签" count={tags.length}/>
    <div className="tag-cloud">{tags.map(([name, count]) => <button key={name}># {name}<sup>{count}</sup></button>)}</div>
  </section>;
}

function StatsCard() {
  const items: [IconName, string, string][] = [
    ["file", "21", "文章"], ["folder", "8", "分类"],
    ["hash", "55", "标签"], ["chart", "109,591", "总字数"],
    ["clock", "62", "运行天数"], ["calendar", "14", "最后更新(天)"],
  ];
  return <section className="glass-panel stats-card">
    <SectionTitle icon="chart" title="站点统计"/>
    <div className="stats-grid">{items.map(([icon, value, label]) => <div key={label}><Icon name={icon}/><span><b>{value}</b>{label}</span></div>)}</div>
  </section>;
}

function CalendarCard() {
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  const heat = [0,1,0,0,2,0,0,1,2,3,1,0,0,0,1,3,2,1,0,0,0,2,1,0,0,0,1,2,3,1,0,0,0,0,1,2,1,0,0,0,0,1,0,0,0,0,0,0];
  return <section className="glass-panel calendar-card">
    <SectionTitle icon="calendar" title="发文日历"/>
    <div className="calendar-head"><strong>7月</strong><span>2026</span></div>
    <div className="weekdays">{"日一二三四五六".split("").map((d) => <span key={d}>{d}</span>)}</div>
    <div className="calendar-days">{[0, 1, 2].map((n) => <i key={`blank-${n}`}/>)}{days.map((d) => <span className={[4,8,10,12].includes(d) ? "has-post" : ""} key={d}>{d}</span>)}</div>
    <div className="year-label">年度概览</div>
    <div className="heatmap">{heat.map((v, i) => <i key={i} data-level={v}/>)}</div>
    <div className="heat-legend"><span>少</span><i data-level="1"/><i data-level="2"/><i data-level="3"/><span>多</span></div>
  </section>;
}

function PostMeta({ post }: { post: Post }) {
  return <div className="post-meta">
    {post.pinned && <span className="pin-pill"><Icon name="pin" size={13}/>置顶</span>}
    <span className="category-pill"><Icon name="folder" size={13}/>{post.category}</span>
    {post.tags.map((tag) => <span className="tag-pill" key={tag}>#{tag}</span>)}
    <time>{post.date}</time>
  </div>;
}

function PostCard({ post, pinned = false }: { post: Post; pinned?: boolean }) {
  return <article className={`post-card ${pinned ? "is-pinned" : ""}`}>
    <PostMeta post={post}/>
    <h3><button>{post.title}</button></h3>
    <p>{post.summary}</p>
    <div className="read-time"><Icon name="clock" size={13}/>{post.minutes} 分钟</div>
  </article>;
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return posts.slice(0, 4);
    return posts.filter((post) => [post.title, post.summary, post.category, ...post.tags].join(" ").toLowerCase().includes(normalized));
  }, [query]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  return <div className="search-overlay" role="dialog" aria-modal="true" aria-label="搜索文章" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="search-dialog">
      <div className="search-input"><Icon name="search"/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、分类或标签…"/><button onClick={onClose} aria-label="关闭搜索"><Icon name="close"/></button></div>
      <div className="search-results"><div className="result-label">{query ? `${results.length} 个结果` : "推荐阅读"}</div>{results.length ? results.map((post) => <button className="search-result" key={post.title}><span>{post.category}</span><strong>{post.title}</strong><Icon name="arrow"/></button>) : <p className="empty-result">没有找到相关内容，换个关键词试试。</p>}</div>
    </section>
  </div>;
}

type ThemeMode = "auto" | "light" | "dark";
type AudioEngine = { context: AudioContext; master: GainNode; oscillators: OscillatorNode[]; track: number };

export function BlogHome() {
  const [theme, setTheme] = useState<ThemeMode>("auto");
  const [blur, setBlur] = useState(true);
  const [wallpaperIndex, setWallpaperIndex] = useState(0);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [typedLine, setTypedLine] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const audioRef = useRef<AudioEngine | null>(null);

  const resolvedTheme = theme === "auto" ? wallpapers[wallpaperIndex].tone : theme;

  useEffect(() => {
    const savedTheme = localStorage.getItem("aster-theme") as ThemeMode | null;
    const savedBlur = localStorage.getItem("aster-blur");
    const savedWallpaper = Number(localStorage.getItem("aster-wallpaper"));
    if (savedTheme && ["auto", "light", "dark"].includes(savedTheme)) setTheme(savedTheme);
    if (savedBlur) setBlur(savedBlur === "true");
    if (Number.isInteger(savedWallpaper) && savedWallpaper >= 0 && savedWallpaper < wallpapers.length) setWallpaperIndex(savedWallpaper);
    setPreferencesReady(true);
  }, []);

  useEffect(() => {
    if (!preferencesReady) return;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themeMode = theme;
    document.documentElement.dataset.wallpaperTone = wallpapers[wallpaperIndex].tone;
    document.documentElement.classList.toggle("glass-frosted", blur);
    document.documentElement.classList.toggle("glass-solid", !blur);
    document.documentElement.classList.toggle("no-blur", !blur);
    localStorage.setItem("aster-theme", theme);
    localStorage.setItem("aster-blur", String(blur));
    localStorage.setItem("aster-wallpaper", String(wallpaperIndex));
  }, [blur, preferencesReady, resolvedTheme, theme, wallpaperIndex]);

  useEffect(() => {
    const phrases = ["Build what you want", "Reverse what you see", "Graphics stack traces"];
    let phraseIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timer = 0;
    const step = () => {
      const phrase = phrases[phraseIndex];
      characterIndex += deleting ? -1 : 1;
      setTypedLine(phrase.slice(0, characterIndex));
      let delay = deleting ? 38 : 76;
      if (!deleting && characterIndex === phrase.length) { deleting = true; delay = 2200; }
      else if (deleting && characterIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 320; }
      timer = window.setTimeout(step, delay);
    };
    timer = window.setTimeout(step, 420);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? window.scrollY / max : 0);
      setShowTop(window.scrollY >= 360);
    };
    const onResize = () => window.innerWidth > 900 && setMenuOpen(false);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setElapsed((value) => (value + 1) % tracks[trackIndex].duration), 1000);
    return () => window.clearInterval(timer);
  }, [playing, trackIndex]);

  useEffect(() => () => { void audioRef.current?.context.close(); }, []);

  const startAudio = (nextTrack: number) => {
    const existing = audioRef.current;
    const context = existing?.context ?? new AudioContext();
    const master = existing?.master ?? context.createGain();
    if (!existing) {
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1150;
      master.gain.value = 0.0001;
      master.connect(filter).connect(context.destination);
    }
    existing?.oscillators.forEach((oscillator) => oscillator.stop());
    const chords = [[196, 293.66, 392], [174.61, 261.63, 349.23], [220, 329.63, 440]];
    const oscillators = chords[nextTrack].map((frequency, index) => {
      const oscillator = context.createOscillator();
      const voice = context.createGain();
      oscillator.type = index === 1 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index * 3 - 3;
      voice.gain.value = index === 0 ? 0.45 : 0.18;
      oscillator.connect(voice).connect(master);
      oscillator.start();
      return oscillator;
    });
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(0.026, context.currentTime, 0.55);
    void context.resume();
    audioRef.current = { context, master, oscillators, track: nextTrack };
  };

  const toggleMusic = () => {
    if (playing) {
      const engine = audioRef.current;
      if (engine) engine.master.gain.setTargetAtTime(0.0001, engine.context.currentTime, 0.28);
    } else startAudio(trackIndex);
    setPlaying((value) => !value);
  };

  const changeTrack = (direction: number) => {
    const next = (trackIndex + direction + tracks.length) % tracks.length;
    setTrackIndex(next);
    setElapsed(0);
    if (playing) startAudio(next);
  };

  const cycleTheme = () => setTheme((value) => value === "auto" ? "light" : value === "light" ? "dark" : "auto");
  const themeIcon: IconName = theme === "auto" ? "monitor" : theme === "light" ? "sun" : "moon";
  const themeLabel = theme === "auto" ? "自动主题" : theme === "light" ? "明亮主题" : "暗色主题";

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const pinned = posts.filter((post) => post.pinned);
  const recent = posts.filter((post) => !post.pinned);

  return <div className="site-root app-root">
    <AmbientBackdrop wallpaperIndex={wallpaperIndex} tone={wallpapers[wallpaperIndex].tone}/>
    <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }}/>
    <header className="topbar-wrap">
      <nav className="topbar" aria-label="主导航">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span className="brand-orbit"><img src={avatarPath} alt=""/></span><b>{site.name}</b></button>
        <div className="desktop-nav">
          <button className="active" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><Icon name="home" size={15}/>首页</button>
          <details><summary><Icon name="file" size={15}/>文章</summary><div className="nav-dropdown"><button onClick={() => jump("recent")}>文章归档<span>{posts.length}</span></button>{categories.map((category) => <button key={category.name} onClick={() => jump("recent")}>{category.name}<span>{category.count}</span></button>)}</div></details>
          <button onClick={() => jump("about")}><Icon name="user" size={15}/>关于</button>
          <button onClick={() => jump("contact")}><Icon name="link" size={15}/>联系</button>
        </div>
        <div className="nav-tools">
          <button onClick={() => setSearchOpen(true)} aria-label="搜索" title="搜索"><Icon name="search"/></button>
          <button className={playing ? "active" : ""} onClick={toggleMusic} aria-label={playing ? "暂停音乐" : "播放音乐"} title="环境音乐"><Icon name="music"/></button>
          <button onClick={cycleTheme} aria-label={`切换主题，当前：${themeLabel}`} title={themeLabel}><Icon name={themeIcon}/></button>
          <button className={`blur-switch ${blur ? "active" : ""}`} onClick={() => setBlur((value) => !value)} aria-label="切换磨砂效果" title={blur ? "磨砂玻璃" : "纯色玻璃"}><Icon name="spark"/></button>
          <button className="mobile-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="菜单"><Icon name={menuOpen ? "close" : "menu"}/></button>
        </div>
      </nav>
      {menuOpen && <div className="mobile-menu"><button onClick={() => jump("pinned")}>文章</button><button onClick={() => jump("about")}>关于</button><button onClick={() => jump("contact")}>联系</button></div>}
    </header>

    <main className="main-content">
      <div className="site-grid">
        <aside className="left-sidebar" aria-label="作者与分类信息">
          <ProfileCard/><NoticeCard/><MusicCard playing={playing} trackIndex={trackIndex} elapsed={elapsed} onToggle={toggleMusic} onPrevious={() => changeTrack(-1)} onNext={() => changeTrack(1)}/><CategoryCard/><TagCard/>
        </aside>

        <div className="main-column">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <div className="hero-ghost-avatar" aria-hidden="true"><span><img src={avatarPath} alt=""/></span></div>
              <h1 id="hero-title"><span>Develop</span><em>&amp;</em><span>Deconstruct</span></h1>
              <div className="hero-typewriter" aria-label={typedLine}>{typedLine}<i/></div>
              <p>{site.subheadline}</p>
              <div className="hero-stats"><span><b>62</b>天</span><i/><span><b>21</b>篇文章</span><i/><span><b>∞</b>深度</span></div>
              <div className="hero-actions"><button className="primary-button" onClick={() => jump("pinned")}><Icon name="file" size={16}/>浏览文章</button><button className="secondary-button" onClick={() => jump("about")}><Icon name="user" size={16}/>关于我</button></div>
            </div>
          </section>
          <nav className="archive-strip" aria-label="文章分类"><button className="archive-home" aria-label="全部文章"><Icon name="home"/></button><button>归档 <b>21</b></button>{categories.slice(0, 3).map((category) => <button key={category.name}>{category.name} <b>{category.count}</b></button>)}<button>更多 <Icon name="arrow" size={14}/></button></nav>

          <section className="content-section pinned-section" id="pinned">
            <div className="content-heading"><h2>置顶文章</h2><span>EDITOR&apos;S PICK</span></div>
            <div className="post-stack">{pinned.map((post) => <PostCard key={post.title} post={post} pinned/>)}</div>
          </section>

          <section className="content-section" id="recent">
            <div className="content-heading recent-heading"><h2>最近文章</h2><div className="view-switch"><button className="active" aria-label="列表视图"><Icon name="list"/></button><button aria-label="网格视图"><Icon name="grid"/></button></div><button className="all-link">查看全部 <Icon name="arrow" size={15}/></button></div>
            <div className="post-stack">{recent.map((post) => <PostCard key={post.title} post={post}/>)}</div>
            <nav className="pagination" aria-label="分页"><button className="active">1</button><button>2</button><button aria-label="下一页"><Icon name="arrow" size={16}/></button></nav>
          </section>
        </div>

        <aside className="right-sidebar" aria-label="站点统计">
          <StatsCard/><CalendarCard/>
        </aside>
      </div>
    </main>

    <footer id="about">
      <div className="footer-inner">
        <div><b>{site.name}</b><p>{site.about}</p><span>© {site.since} {site.name} · Built with care and curiosity.</span></div>
        <div id="contact" className="footer-contact"><SocialRow/><p>联系方式将在个人资料确认后启用。</p></div>
      </div>
    </footer>

    <button className={`floating-music ${playing ? "is-playing" : ""}`} onClick={toggleMusic} aria-label={playing ? "暂停悬浮音乐" : "播放悬浮音乐"}><Icon name={playing ? "pause" : "music"}/></button>
    <button className="scroll-cue" onClick={() => jump("pinned")} aria-label="向下滚动"><Icon name="chevron"/></button>
    <button className={`back-to-top ${showTop ? "visible" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="回到顶部"><Icon name="chevron"/></button>
    {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)}/>} 
  </div>;
}

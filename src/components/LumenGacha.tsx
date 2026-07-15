"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ResonanceCanvas, type CinematicPhase } from "./ResonanceCanvas";

type Rarity = 3 | 4 | 5;
type Phase = CinematicPhase;
type IconName = "spark" | "gem" | "home" | "summon" | "archive" | "info" | "sound" | "mute" | "close" | "skip" | "history" | "user" | "star" | "chevron" | "lock";

type Reward = {
  id: string;
  name: string;
  title: string;
  rarity: Rarity;
  kind: "character" | "relic";
  image?: string;
  element: string;
  quote: string;
  accent: string;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (file: string) => `${basePath}/${file}`;

const FIVE_STAR: Reward[] = [
  {
    id: "seren",
    name: "瑟琳",
    title: "寂月的裁定",
    rarity: 5,
    kind: "character",
    image: "seren-astral.webp",
    element: "星蚀",
    quote: "若群星保持沉默，就由我替它们回答。",
    accent: "#f6d99a",
  },
  {
    id: "cael",
    name: "凯尔",
    title: "引力档案官",
    rarity: 5,
    kind: "character",
    image: "cael-archive.webp",
    element: "虚数",
    quote: "知识不会消失，它只是在等待正确的轨道。",
    accent: "#b9a4ff",
  },
];

const FOUR_STAR: Reward[] = [
  {
    id: "nia",
    name: "妮娅",
    title: "逐云信使",
    rarity: 4,
    kind: "character",
    image: "nia-courier.webp",
    element: "巡风",
    quote: "下一站？当然是太阳升起的地方！",
    accent: "#65e9eb",
  },
  {
    id: "orin",
    name: "奥林",
    title: "夜航观测员",
    rarity: 4,
    kind: "character",
    image: "cael-archive.webp",
    element: "潮汐",
    quote: "记录完毕。今晚的星轨比昨天偏移了零点七度。",
    accent: "#9e8cff",
  },
  {
    id: "vela",
    name: "维拉",
    title: "银庭护卫",
    rarity: 4,
    kind: "character",
    image: "seren-astral.webp",
    element: "辉光",
    quote: "无需担心，我会守住这里。",
    accent: "#e2c8ff",
  },
];

const THREE_STAR: Reward[] = [
  { id: "prism-blade", name: "棱镜短刃", title: "制式遗物", rarity: 3, kind: "relic", element: "武装", quote: "折射过七次晨光的轻型刃具。", accent: "#7db9ff" },
  { id: "beacon", name: "航迹信标", title: "探索遗物", rarity: 3, kind: "relic", element: "装置", quote: "在失去方向时，它会记得归途。", accent: "#68d9ff" },
  { id: "archive", name: "静默档案", title: "记忆遗物", rarity: 3, kind: "relic", element: "档案", quote: "一份没有署名，也无法删除的旧记录。", accent: "#91a9ff" },
  { id: "stardust", name: "星屑溶剂", title: "精炼素材", rarity: 3, kind: "relic", element: "素材", quote: "微光在瓶中缓慢沉降。", accent: "#72c7e8" },
];

const STARS = Array.from({ length: 42 }, (_, index) => ({
  left: `${(index * 47.3 + 11) % 100}%`,
  top: `${(index * 29.7 + 7) % 93}%`,
  size: `${1 + (index % 4) * 0.55}px`,
  delay: `${-(index % 11) * 0.38}s`,
}));

const MOTES = Array.from({ length: 28 }, (_, index) => ({
  angle: `${index * (360 / 28)}deg`,
  delay: `${-(index % 9) * 0.16}s`,
  distance: `${130 + (index % 6) * 21}px`,
}));

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    spark: <><path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z"/><path d="m5.5 14 .9 2.6L9 17.5l-2.6.9L5.5 21l-.9-2.6-2.6-.9 2.6-.9.9-2.6Z"/></>,
    gem: <><path d="m5 4 3-2h8l3 2 2 5-9 13L3 9l2-5Z"/><path d="m3 9 5-2h8l5 2M8 2l-1 5 5 15 5-15-1-5M8 7l4-5 4 5"/></>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    summon: <><circle cx="12" cy="12" r="8"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3m0-14-3 3M8 16l-3 3"/><circle cx="12" cy="12" r="2"/></>,
    archive: <><path d="M4 5h16v15H4zM3 2h18v4H3z"/><path d="M9 10h6"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/></>,
    sound: <><path d="M5 10v4h4l5 4V6l-5 4H5Z"/><path d="M17 9c1 2 1 4 0 6m3-9c2.5 4 2.5 8 0 12"/></>,
    mute: <><path d="M5 10v4h4l5 4V6l-5 4H5Z"/><path d="m18 10 4 4m0-4-4 4"/></>,
    close: <path d="m5 5 14 14M19 5 5 19"/>,
    skip: <><path d="m5 5 9 7-9 7V5Zm10 0h3v14h-3z"/></>,
    history: <><path d="M4 12a8 8 0 1 0 2-5.3L3 10"/><path d="M3 4v6h6M12 7v5l3 2"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    star: <path d="m12 2.5 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.1l6.2-.9L12 2.5Z"/>,
    chevron: <path d="m8 10 4 4 4-4"/>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  };
  return <svg className="ui-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function rarityStars(rarity: Rarity) {
  return <span className="rarity-stars" aria-label={`${rarity} 星`}>{Array.from({ length: rarity }, (_, index) => <Icon name="star" size={13} key={index}/>)}</span>;
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function rollReward(pity: number, forceFive: boolean): { reward: Reward; nextPity: number } {
  const softBoost = pity >= 49 ? (pity - 48) * 0.085 : 0;
  const fiveChance = Math.min(1, 0.016 + softBoost);
  const roll = Math.random();
  if (forceFive || pity >= 59 || roll < fiveChance) return { reward: { ...pick(FIVE_STAR) }, nextPity: 0 };
  if (roll < fiveChance + 0.12) return { reward: { ...pick(FOUR_STAR) }, nextPity: pity + 1 };
  return { reward: { ...pick(THREE_STAR) }, nextPity: pity + 1 };
}

function RelicGlyph({ id }: { id: string }) {
  return <div className={`relic-glyph relic-${id}`} aria-hidden="true">
    <span/><i/><b/>
  </div>;
}

function ResultCard({ reward, index, visible, onInspect }: { reward: Reward; index: number; visible: boolean; onInspect: () => void }) {
  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    event.currentTarget.style.setProperty("--card-rotate-y", `${((x - 0.5) * 13).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--card-rotate-x", `${((0.5 - y) * 11).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--gloss-x", `${(x * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty("--gloss-y", `${(y * 100).toFixed(1)}%`);
  };
  const resetTilt = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty("--card-rotate-y", "0deg");
    event.currentTarget.style.setProperty("--card-rotate-x", "0deg");
    event.currentTarget.style.setProperty("--gloss-x", "50%");
    event.currentTarget.style.setProperty("--gloss-y", "30%");
  };

  return <button
    className={`result-card rarity-${reward.rarity} ${visible ? "is-visible" : ""}`}
    style={{ "--reveal-index": index, "--card-accent": reward.accent } as React.CSSProperties}
    onClick={onInspect}
    onPointerMove={onPointerMove}
    onPointerLeave={resetTilt}
    aria-label={`查看 ${reward.name}，${reward.rarity} 星`}
  >
    <div className="card-surface">
      <span className="card-back"><Icon name="spark" size={24}/><i/></span>
      <span className="card-frame"/>
      <span className="card-glow"/>
      {reward.image
        ? <img src={asset(reward.image)} alt="" draggable={false}/>
        : <RelicGlyph id={reward.id}/>
      }
      <span className="card-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="card-shade"/>
      <span className="card-copy">
        <small>{reward.element}</small>
        <strong>{reward.name}</strong>
        {rarityStars(reward.rarity)}
      </span>
    </div>
  </button>;
}

export function LumenGacha() {
  const lobbyRef = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const launchLocked = useRef(false);
  const dragStartY = useRef(0);
  const pullPowerRef = useRef(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [drawCount, setDrawCount] = useState<1 | 9>(1);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [revealCount, setRevealCount] = useState(0);
  const [focused, setFocused] = useState<Reward | null>(null);
  const [currency, setCurrency] = useState(12800);
  const [pity, setPity] = useState(17);
  const [hasSummoned, setHasSummoned] = useState(false);
  const [sound, setSound] = useState(true);
  const [showRates, setShowRates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Reward[]>([]);
  const [toast, setToast] = useState("");
  const [countdown, setCountdown] = useState("16天 08:42:19");
  const [pullPower, setPullPower] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const maxRarity = useMemo<Rarity>(() => rewards.reduce<Rarity>((max, reward) => Math.max(max, reward.rarity) as Rarity, 3), [rewards]);
  const overlayOpen = phase !== "idle";

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  const later = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  }, []);

  const playSound = useCallback((kind: "tap" | "charge" | "flight" | "converge" | "burst" | "flip") => {
    if (!sound || typeof window === "undefined") return;
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    let context = audioContext.current;
    if (!context || context.state === "closed") {
      context = new AudioCtor();
      audioContext.current = context;
    }
    if (context.state === "suspended") void context.resume();
    const now = context.currentTime;
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, now);
    compressor.knee.setValueAtTime(14, now);
    compressor.ratio.setValueAtTime(5, now);
    gain.connect(filter).connect(compressor).connect(context.destination);
    filter.type = kind === "flight" ? "bandpass" : "lowpass";
    filter.frequency.setValueAtTime(kind === "burst" ? 6200 : kind === "flight" ? 1350 : 2800, now);
    filter.Q.setValueAtTime(kind === "flight" ? 0.72 : 0.35, now);

    const notes = kind === "burst" ? [440, 660, 990, 1320, 1760] : kind === "flight" ? [82, 123, 185] : kind === "converge" ? [196, 294, 392, 588] : kind === "charge" ? [110, 165, 220] : kind === "flip" ? [520, 780] : [420];
    const duration = kind === "burst" ? 1.35 : kind === "flight" ? 1.82 : kind === "converge" ? 0.78 : kind === "charge" ? 1.5 : 0.32;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(kind === "burst" ? 0.15 : kind === "flight" ? 0.075 : 0.055, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index % 3 === 1 ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.035);
      if (kind === "flight") oscillator.frequency.exponentialRampToValueAtTime(frequency * 3.4, now + 1.62);
      if (kind === "charge") oscillator.detune.linearRampToValueAtTime(index % 2 ? 18 : -12, now + 1.3);
      if (kind === "converge") oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.45, now + 0.62);
      oscillator.connect(gain);
      oscillator.start(now + index * 0.035);
      oscillator.stop(now + duration + 0.08);
    });

    if (kind === "flight" || kind === "burst") {
      const noiseDuration = kind === "flight" ? 1.78 : 0.74;
      const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * noiseDuration), context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let index = 0; index < channel.length; index += 1) channel[index] = (Math.random() * 2 - 1) * (1 - index / channel.length);
      const source = context.createBufferSource();
      const noiseFilter = context.createBiquadFilter();
      const noiseGain = context.createGain();
      source.buffer = buffer;
      noiseFilter.type = kind === "flight" ? "highpass" : "bandpass";
      noiseFilter.frequency.setValueAtTime(kind === "flight" ? 900 : 1800, now);
      if (kind === "flight") noiseFilter.frequency.exponentialRampToValueAtTime(4200, now + noiseDuration);
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.exponentialRampToValueAtTime(kind === "flight" ? 0.035 : 0.065, now + 0.05);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + noiseDuration);
      source.connect(noiseFilter).connect(noiseGain).connect(compressor);
      source.start(now);
      source.stop(now + noiseDuration);
    }
  }, [sound]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    later(() => setToast(""), 2200);
  }, [later]);

  const finishToResults = useCallback((items: Reward[]) => {
    clearTimers();
    launchLocked.current = false;
    setIsPulling(false);
    pullPowerRef.current = 0;
    setPullPower(0);
    setPhase("results");
    setRevealCount(0);
    items.forEach((_, index) => later(() => {
      setRevealCount(index + 1);
      if (index < 4 || index === items.length - 1) playSound("flip");
    }, 180 + index * (items.length === 1 ? 0 : 135 + Math.min(index, 4) * 7)));
  }, [clearTimers, later, playSound]);

  const launchFromGate = useCallback((items: Reward[]) => {
    if (launchLocked.current || !items.length) return;
    launchLocked.current = true;
    clearTimers();
    setIsPulling(false);
    setPullPower(1);
    setPhase("flight");
    playSound("flight");
    navigator.vibrate?.(18);

    later(() => {
      setPhase("converge");
      playSound("converge");
    }, 1720);
    later(() => {
      const batchMaxRarity = items.reduce<Rarity>((max, item) => Math.max(max, item.rarity) as Rarity, 3);
      setPhase("burst");
      playSound("burst");
      navigator.vibrate?.(batchMaxRarity === 5 ? [24, 36, 68] : batchMaxRarity === 4 ? [24, 28, 38] : 24);
    }, 2440);
    later(() => finishToResults(items), 3740);
  }, [clearTimers, finishToResults, later, playSound]);

  const summon = useCallback((count: 1 | 9) => {
    const cost = count === 1 ? 160 : 1280;
    if (currency < cost) {
      showToast("折光晶核不足");
      playSound("tap");
      return;
    }

    clearTimers();
    let nextPity = pity;
    const items: Reward[] = [];
    for (let index = 0; index < count; index += 1) {
      const guaranteedFirst = !hasSummoned && (count === 1 ? index === 0 : index === count - 1);
      const rolled = rollReward(nextPity, guaranteedFirst);
      items.push({ ...rolled.reward, id: `${rolled.reward.id}-${Date.now()}-${index}` });
      nextPity = rolled.nextPity;
    }
    if (!items.some((item) => item.rarity >= 4)) {
      const guaranteed = { ...pick(FOUR_STAR) };
      items[items.length - 1] = { ...guaranteed, id: `${guaranteed.id}-${Date.now()}-guaranteed` };
    }
    setCurrency((value) => value - cost);
    setPity(nextPity);
    setHasSummoned(true);
    setDrawCount(count);
    setRewards(items);
    setHistory((current) => [...items, ...current].slice(0, 36));
    setRevealCount(0);
    setFocused(null);
    launchLocked.current = false;
    pullPowerRef.current = 0;
    setPullPower(0);
    setIsPulling(false);
    setPhase("charging");
    playSound("charge");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      later(() => finishToResults(items), 180);
      return;
    }

    later(() => launchFromGate(items), 1650);
  }, [clearTimers, currency, finishToResults, hasSummoned, later, launchFromGate, pity, playSound, showToast]);

  const skip = useCallback(() => {
    if (!rewards.length || phase === "results") return;
    playSound("tap");
    finishToResults(rewards);
  }, [finishToResults, phase, playSound, rewards]);

  const startCorePull = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (phase !== "charging") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartY.current = event.clientY;
    pullPowerRef.current = Math.max(0.08, pullPowerRef.current);
    setPullPower(pullPowerRef.current);
    setIsPulling(true);
    playSound("tap");
  }, [phase, playSound]);

  const moveCorePull = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isPulling || phase !== "charging") return;
    const distance = Math.max(0, dragStartY.current - event.clientY);
    const nextPower = Math.min(1, distance / 104);
    pullPowerRef.current = nextPower;
    setPullPower(nextPower);
  }, [isPulling, phase]);

  const releaseCorePull = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isPulling || phase !== "charging") return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setIsPulling(false);
    if (pullPowerRef.current >= 0.46) {
      navigator.vibrate?.(16);
      launchFromGate(rewards);
      return;
    }
    pullPowerRef.current = 0;
    setPullPower(0);
  }, [isPulling, launchFromGate, phase, rewards]);

  const closeResults = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setRevealCount(0);
    setFocused(null);
    playSound("tap");
  }, [clearTimers, playSound]);

  useEffect(() => {
    const update = () => {
      const target = new Date("2026-07-31T04:00:00+08:00").getTime();
      const diff = Math.max(0, target - Date.now());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor(diff / 3600000) % 24;
      const minutes = Math.floor(diff / 60000) % 60;
      const seconds = Math.floor(diff / 1000) % 60;
      setCountdown(`${days}天 ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
    };
    update();
    const interval = window.setInterval(update, 1000);
    ["seren-astral.webp", "cael-archive.webp", "nia-courier.webp"].forEach((file) => {
      const image = new Image();
      image.src = asset(file);
    });
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("summon-open", overlayOpen);
    return () => document.body.classList.remove("summon-open");
  }, [overlayOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (focused) setFocused(null);
      else if (phase === "results") closeResults();
      else if (phase !== "idle") skip();
      else {
        setShowRates(false);
        setShowHistory(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeResults, focused, phase, skip]);

  useEffect(() => () => {
    clearTimers();
    void audioContext.current?.close();
  }, [clearTimers]);

  const onParallax = (event: React.PointerEvent<HTMLElement>) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;
    lobbyRef.current?.style.setProperty("--pointer-x", x.toFixed(3));
    lobbyRef.current?.style.setProperty("--pointer-y", y.toFixed(3));
    lobbyRef.current?.style.setProperty("--pointer-px", `${event.clientX.toFixed(1)}px`);
    lobbyRef.current?.style.setProperty("--pointer-py", `${event.clientY.toFixed(1)}px`);
  };

  const onCinematicMove = (event: React.PointerEvent<HTMLElement>) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;
    event.currentTarget.style.setProperty("--cinematic-x", x.toFixed(3));
    event.currentTarget.style.setProperty("--cinematic-y", y.toFixed(3));
  };

  const onShowcaseMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--showcase-x", x.toFixed(3));
    event.currentTarget.style.setProperty("--showcase-y", y.toFixed(3));
  };

  return <main className="gacha-lobby" ref={lobbyRef} onPointerMove={onParallax} style={{ "--lobby-bg": `url("${asset("lumen-gate.webp")}")` } as React.CSSProperties}>
    <div className="lobby-scene" aria-hidden="true">
      <div className="scene-image"/>
      <div className="scene-aurora"/>
      <div className="scene-grid"/>
      {!overlayOpen && <ResonanceCanvas phase="idle" rarity={5} className="lobby-particle-canvas"/>}
      <div className="star-field">{STARS.map((star, index) => <i key={index} style={{ left: star.left, top: star.top, width: star.size, height: star.size, animationDelay: star.delay }}/>)}</div>
      <div className="scene-vignette"/>
    </div>
    <div className="pointer-reactor" aria-hidden="true"><i/><span/></div>

    <header className="game-header">
      <a className="game-logo" href="#main-banner" aria-label="星汐回响首页">
        <span className="logo-sigil"><Icon name="spark" size={25}/></span>
        <span><b>星汐回响</b><small>ECHOES OF LUMEN</small></span>
      </a>
      <div className="header-spacer"/>
      <button className="resource-chip" onClick={() => showToast("折光晶核可通过每日委托获得")}><Icon name="gem" size={18}/><span>{currency.toLocaleString("zh-CN")}</span><b>＋</b></button>
      <button className="header-icon" onClick={() => { setSound((value) => !value); playSound("tap"); }} aria-label={sound ? "关闭声音" : "开启声音"}><Icon name={sound ? "sound" : "mute"}/></button>
      <button className="player-chip" onClick={() => showToast("旅行者档案尚未开放")}><span>27</span><Icon name="user" size={19}/><b>旅人</b></button>
    </header>

    <nav className="side-rail" aria-label="游戏导航">
      <button onClick={() => showToast("当前已经在星门大厅")}><Icon name="home"/><span>大厅</span></button>
      <button className="active"><Icon name="summon"/><span>共鸣</span><i/></button>
      <button onClick={() => setShowHistory(true)}><Icon name="archive"/><span>记录</span></button>
    </nav>

    <section className="event-copy" id="main-banner">
      <div className="event-kicker"><span>LIMITED RESONANCE</span><i/>限时共鸣</div>
      <h1><small>黎明相位</small>寂月裁定</h1>
      <p>五星观测者「瑟琳」获取概率提升。<br/>穿越星门，聆听未被记录的回响。</p>
      <div className="event-feature"><span>UP</span>{rarityStars(5)}<b>瑟琳</b><i>星蚀 · 裁决</i></div>
      <div className="event-time"><span>距离共鸣结束</span><b>{countdown}</b></div>
      <button className="rates-link" onClick={() => setShowRates(true)}><Icon name="info" size={16}/> 概率详情与规则</button>
    </section>

    <div className="featured-character" aria-hidden="true">
      <div className="character-halo"/>
      <img src={asset("seren-astral.webp")} alt="" draggable={false}/>
      <div className="character-name-ghost">SEREN</div>
    </div>

    <section className="summon-dock" aria-label="共鸣操作">
      <div className="pity-meter">
        <div className="pity-copy"><span>五星共鸣保底</span><b>{pity}<i>/60</i></b></div>
        <div className="pity-track"><i style={{ width: `${Math.min(100, pity / 60 * 100)}%` }}/><span style={{ left: `${50 / 60 * 100}%` }}>概率提升</span></div>
        <small>九连必得四星或以上 · 首次共鸣必得五星</small>
      </div>
      <div className="summon-actions">
        <button className="summon-button single" onClick={() => summon(1)} data-count="01">
          <span><small>共鸣一次</small><b>单次观测</b></span>
          <i><Icon name="gem" size={16}/>160</i>
        </button>
        <button className="summon-button multi" onClick={() => summon(9)} data-count="09">
          <span className="button-shine"/>
          <span><small>九重共鸣</small><b>连续观测 × 9</b></span>
          <i><Icon name="gem" size={16}/>1,280</i>
        </button>
      </div>
    </section>

    <div className="banner-dots" aria-label="卡池切换"><button className="active" aria-label="当前卡池"/><button onClick={() => showToast("下一期共鸣尚未开启")} aria-label="下一卡池"/><button onClick={() => showToast("常驻共鸣尚未开启")} aria-label="常驻卡池"/></div>
    <div className="legal-note">本页面仅为原创抽卡动画模拟，不含充值与真实交易</div>

    {overlayOpen && <section
      className={`summon-overlay phase-${phase} rarity-${maxRarity} ${isPulling ? "is-pulling" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="共鸣动画"
      onPointerMove={onCinematicMove}
      style={{ "--pull-power": pullPower, "--pull-offset": `${(-pullPower * 88).toFixed(1)}px`, "--pull-percent": `${(pullPower * 100).toFixed(1)}%` } as React.CSSProperties}
    >
      {phase !== "results" && <>
        <button className="skip-button" onClick={skip}><Icon name="skip" size={17}/>跳过</button>
        <div className="cinematic-bars" aria-hidden="true"><i/><i/></div>
        <div className="sequence-readout" aria-hidden="true"><span>RESONANCE / {drawCount === 9 ? "Σ-09" : "Σ-01"}</span><b>星门同步协议</b><i><em/></i></div>
        <div className="summon-space">
          <ResonanceCanvas phase={phase} rarity={maxRarity}/>
          <div className="lens-field" aria-hidden="true"><i/><b/><span/></div>
          <div className="space-stars">{STARS.map((star, index) => <i key={index} style={{ left: star.left, top: star.top, width: star.size, height: star.size, animationDelay: star.delay }}/>)}</div>
          <div className="gate-rings" aria-hidden="true"><i/><i/><i/><b/><span/><em/></div>
          <div className="charge-tether" aria-hidden="true"><i/><b/></div>
          <button
            className="summon-core"
            onPointerDown={startCorePull}
            onPointerMove={moveCorePull}
            onPointerUp={releaseCorePull}
            onPointerCancel={releaseCorePull}
            onClick={() => phase === "charging" && launchFromGate(rewards)}
            aria-label="向上牵引星核并松手，启动共鸣"
          ><i/><b/><span/><em><Icon name="spark" size={28}/></em></button>
          <div className="core-instruction" aria-hidden="true"><span>{isPulling ? "保持牵引" : "向上牵引星核"}</span><i><b/></i><small>松手启动 · 亦可轻触跳过校准</small></div>
          <div className="comet" aria-hidden="true"><i/><b/><span/><em/></div>
          <div className="motes" aria-hidden="true">{MOTES.map((mote, index) => <i key={index} style={{ "--mote-angle": mote.angle, "--mote-delay": mote.delay, "--mote-distance": mote.distance } as React.CSSProperties}/>)}</div>
          <div className="burst-sigil" aria-hidden="true"><div className="sigil-orbit"><i/><b/><span/></div><Icon name="spark" size={88}/><span>{maxRarity === 5 ? "命运相位已确认" : maxRarity === 4 ? "高阶回响" : "标准回响"}</span><small>{maxRarity === 5 ? "FIVE-STAR RESONANCE" : maxRarity === 4 ? "ADVANCED RESONANCE" : "STANDARD RESONANCE"}</small></div>
          <div className="screen-flash" aria-hidden="true"/>
          <div className="film-grain" aria-hidden="true"/>
        </div>
        <div className="summon-caption"><span>RESONANCE SEQUENCE</span><b>{phase === "charging" ? "正在校准星门" : phase === "flight" ? "穿越折光航道" : phase === "converge" ? "信号正在聚合" : "捕获回响"}</b></div>
        <div className="sequence-progress" aria-hidden="true"><i className={phase === "charging" ? "active" : "done"}/><i className={phase === "flight" ? "active" : phase === "converge" || phase === "burst" ? "done" : ""}/><i className={phase === "converge" ? "active" : phase === "burst" ? "done" : ""}/><i className={phase === "burst" ? "active" : ""}/></div>
      </>}

      {phase === "results" && <div className={`results-screen ${drawCount === 1 ? "single-result" : "multi-result"}`}>
        <ResonanceCanvas phase="results" rarity={maxRarity} className="results-particle-canvas"/>
        <div className="results-topline"><span>RESONANCE RESULT</span><b>共鸣结果</b></div>
        {drawCount === 1 ? <div className={`single-showcase rarity-${rewards[0]?.rarity ?? 3}`} onPointerMove={onShowcaseMove}>
          <div className="single-rays"/>
          <div className="single-art">
            {rewards[0]?.image ? <img src={asset(rewards[0].image)} alt={rewards[0].name}/> : <RelicGlyph id={rewards[0]?.id.split("-").slice(0, -2).join("-") || "beacon"}/>} 
          </div>
          <div className="single-copy">
            <span>{rewards[0]?.title}</span>
            <h2>{rewards[0]?.name}</h2>
            {rewards[0] && rarityStars(rewards[0].rarity)}
            <p>“{rewards[0]?.quote}”</p>
            <i>{rewards[0]?.element}</i>
          </div>
        </div> : <div className="result-grid">
          {rewards.map((reward, index) => <ResultCard key={reward.id} reward={reward} index={index} visible={index < revealCount} onInspect={() => setFocused(reward)}/>) }
        </div>}
        <div className="result-actions">
          <button className="result-close" onClick={closeResults}>返回星门</button>
          <button className="result-repeat" onClick={() => { closeResults(); later(() => summon(drawCount), 80); }}><span>再次共鸣</span><i><Icon name="gem" size={15}/>{drawCount === 1 ? 160 : "1,280"}</i></button>
        </div>
        {drawCount === 9 && <small className="inspect-hint">点击卡片可查看回响详情</small>}
      </div>}
    </section>}

    {focused && <div className="inspect-backdrop" role="dialog" aria-modal="true" aria-label={`${focused.name}详情`} onClick={() => setFocused(null)}>
      <article className={`inspect-card rarity-${focused.rarity}`} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={() => setFocused(null)} aria-label="关闭"><Icon name="close"/></button>
        <div className="inspect-art">{focused.image ? <img src={asset(focused.image)} alt={focused.name}/> : <RelicGlyph id={focused.id.split("-").slice(0, -2).join("-")}/>}</div>
        <div className="inspect-copy"><span>{focused.title}</span><h3>{focused.name}</h3>{rarityStars(focused.rarity)}<p>“{focused.quote}”</p><i>{focused.element}</i></div>
      </article>
    </div>}

    {(showRates || showHistory) && <div className="modal-backdrop" onClick={() => { setShowRates(false); setShowHistory(false); }}>
      <section className="info-modal" role="dialog" aria-modal="true" aria-label={showRates ? "共鸣概率详情" : "共鸣记录"} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={() => { setShowRates(false); setShowHistory(false); }} aria-label="关闭"><Icon name="close"/></button>
        {showRates ? <>
          <header><Icon name="info"/><div><small>RESONANCE DATA</small><h2>共鸣概率详情</h2></div></header>
          <div className="rate-feature"><span>本期概率提升</span><img src={asset("seren-astral.webp")} alt=""/><div><b>瑟琳</b>{rarityStars(5)}<small>首次共鸣必定获得五星观测者</small></div></div>
          <dl className="rate-list"><div><dt>{rarityStars(5)}五星观测者</dt><dd>基础概率 <b>1.6%</b></dd></div><div><dt>{rarityStars(4)}四星回响</dt><dd>综合概率 <b>12.0%</b></dd></div><div><dt>{rarityStars(3)}三星遗物</dt><dd>综合概率 <b>86.4%</b></dd></div></dl>
          <p className="rule-copy">连续 60 次共鸣内必定获得五星观测者。自第 50 次起，五星概率逐次大幅提升。每次九重共鸣至少包含一项四星或以上回响。</p>
        </> : <>
          <header><Icon name="history"/><div><small>RESONANCE LOG</small><h2>共鸣记录</h2></div></header>
          {history.length ? <div className="history-list">{history.map((item, index) => <div key={`${item.id}-${index}`} className={`rarity-${item.rarity}`}><span>{item.kind === "character" ? "观测者" : "遗物"}</span><b>{item.name}</b>{rarityStars(item.rarity)}<time>刚刚</time></div>)}</div> : <div className="empty-history"><Icon name="history" size={34}/><b>尚无共鸣记录</b><span>完成一次共鸣后，结果会显示在这里。</span></div>}
        </>}
      </section>
    </div>}

    <div className={`game-toast ${toast ? "show" : ""}`} role="status">{toast}</div>
  </main>;
}

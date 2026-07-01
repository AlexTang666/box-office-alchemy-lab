import { AnimatePresence, motion } from "framer-motion";
import { Activity, Clapperboard, Database, Film, FlaskConical, Orbit, Route, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PlayerRecipe } from "../types/movie";

const stages = [
  {
    title: "市场反应炉启动",
    icon: FlaskConical,
    energy: 20,
    duration: 1800,
    pulseScale: 1.03,
    pulseDuration: 1.05,
    outerRingDuration: 8,
    filmRingDuration: 5.5,
    pulse: "shadow-[0_0_52px_rgba(34,211,238,0.35)]",
  },
  {
    title: "电影设定读取中",
    icon: Clapperboard,
    energy: 42,
    duration: 1800,
    pulseScale: 1.05,
    pulseDuration: 0.9,
    outerRingDuration: 6.8,
    filmRingDuration: 4.7,
    pulse: "shadow-[0_0_58px_rgba(245,158,11,0.35)]",
  },
  {
    title: "市场记忆池接入",
    icon: Database,
    energy: 64,
    duration: 1800,
    pulseScale: 1.08,
    pulseDuration: 0.74,
    outerRingDuration: 5.5,
    filmRingDuration: 3.9,
    pulse: "shadow-[0_0_64px_rgba(45,212,191,0.38)]",
  },
  {
    title: "混沌事件写入",
    icon: Sparkles,
    energy: 82,
    duration: 1800,
    pulseScale: 1.12,
    pulseDuration: 0.48,
    outerRingDuration: 4.2,
    filmRingDuration: 2.9,
    pulse: "shadow-[0_0_70px_rgba(244,114,182,0.36)]",
  },
  {
    title: "电影命运即将生成",
    icon: Route,
    energy: 100,
    duration: 2200,
    pulseScale: 1.16,
    pulseDuration: 0.36,
    outerRingDuration: 3.2,
    filmRingDuration: 2.25,
    pulse: "shadow-[0_0_76px_rgba(251,191,36,0.4)]",
  },
];

const pathBranches = [
  {
    label: "生成电影档案",
    detail: "设定摘要即将写入",
    line: "bg-cyan-300/75 -rotate-[16deg]",
    node: "border-cyan-200/60 bg-cyan-300/20 text-cyan-100",
    y: "-translate-y-24",
  },
  {
    label: "市场命运核心",
    detail: "票房区间即将收束",
    line: "bg-amber-300/75 rotate-0",
    node: "border-amber-200/60 bg-amber-300/20 text-amber-100",
    y: "translate-y-0",
  },
  {
    label: "命运影响因素",
    detail: "混沌事件即将锁定",
    line: "bg-fuchsia-300/75 rotate-[16deg]",
    node: "border-fuchsia-200/60 bg-fuchsia-300/20 text-fuchsia-100",
    y: "translate-y-24",
  },
];
const debugMode = true;

interface AlchemySimulatorProps {
  recipe: PlayerRecipe;
  onComplete: () => void;
  debugEnabled?: boolean;
  chaosEventTitles?: string[];
  chaosEventTypes?: string[];
  metricRows?: Array<[string, number, string]>;
}

function recipeFragments(recipe: PlayerRecipe) {
  return [
    recipe.country || "市场来源",
    recipe.genres.slice(0, 3).join("/") || "题材类型",
    recipe.season || "上映档期",
    recipe.formats[0] || "观看规格",
  ];
}

function energyLinesForRecipe(recipe: PlayerRecipe, metricRows: Array<[string, number, string]> = []) {
  if (metricRows.length) {
    const colorByLabel = new Map([
      ["预热值", "from-amber-300 to-orange-400"],
      ["口碑值", "from-emerald-200 to-reactor-green"],
      ["扩散值", "from-cyan-200 to-blue-400"],
      ["波动值", "from-fuchsia-300 to-rose-400"],
    ]);

    return metricRows.map(([label, value]) => ({
      label,
      value: Number(value.toFixed(1)),
      color: colorByLabel.get(label) ?? "from-cyan-200 to-blue-400",
    }));
  }

  const genreCount = recipe.genres.length;
  const hasPremiumFormat = recipe.formats.some((format) => format === "IMAX" || format === "中国巨幕");
  const isPeakSeason = recipe.season === "春节档" || recipe.season === "暑期档" || recipe.season === "国庆档";

  return [
    {
      label: "预热值",
      value: Math.min(94, 38 + (recipe.country ? 12 : 0) + (isPeakSeason ? 18 : 0)),
      color: "from-amber-300 to-orange-400",
    },
    {
      label: "口碑值",
      value: Math.min(92, 42 + (genreCount > 0 ? 10 : 0) + (recipe.promotion === "低成本口碑" ? 20 : 0)),
      color: "from-cyan-200 to-blue-400",
    },
    {
      label: "扩散值",
      value: Math.min(96, 36 + genreCount * 9 + (recipe.promotion === "粉丝预热" || recipe.promotion === "大规模宣发" ? 18 : 0)),
      color: "from-fuchsia-300 to-rose-400",
    },
    {
      label: "波动值",
      value: Math.min(96, 28 + genreCount * 7 + (hasPremiumFormat ? 12 : 0) + (recipe.promotion === "大规模宣发" ? 18 : 0)),
      color: "from-emerald-200 to-reactor-green",
    },
  ];
}

function disturbanceTone(type: string | undefined) {
  if (type === "positive" || type === "正向") {
    return "border-emerald-200/45 bg-emerald-300/12 text-emerald-100 shadow-[0_0_26px_rgba(52,211,153,0.18)]";
  }
  if (type === "negative" || type === "负向") {
    return "border-rose-200/45 bg-rose-300/12 text-rose-100 shadow-[0_0_26px_rgba(251,113,133,0.18)]";
  }
  return "border-violet-200/45 bg-violet-300/12 text-violet-100 shadow-[0_0_26px_rgba(167,139,250,0.18)]";
}

export function AlchemySimulator({ recipe, onComplete, debugEnabled = debugMode, chaosEventTitles = [], chaosEventTypes = [], metricRows = [] }: AlchemySimulatorProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const current = stages[stageIndex];
  const Icon = current.icon;
  const particles = useMemo(() => Array.from({ length: 18 }, (_, index) => index), []);
  const fragments = useMemo(() => recipeFragments(recipe), [recipe]);
  const energyLines = useMemo(() => energyLinesForRecipe(recipe, metricRows), [metricRows, recipe]);
  const disturbanceCards = useMemo(
    () =>
      Array.from({ length: 4 }, (_, index) => ({
        title: chaosEventTitles[index] ?? "混沌扰动待写入",
        type: chaosEventTypes[index],
      })),
    [chaosEventTitles, chaosEventTypes],
  );

  useEffect(() => {
    if (debugEnabled) return undefined;

    const timer = window.setTimeout(() => {
      if (stageIndex < stages.length - 1) {
        setStageIndex((value) => value + 1);
      } else {
        onComplete();
      }
    }, current.duration);

    return () => window.clearTimeout(timer);
  }, [current.duration, debugEnabled, stageIndex, onComplete]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-8 text-white">
      <div className="absolute inset-0 lab-backdrop" />
      <div className="absolute inset-0 reactor-grid opacity-40" />
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 11px, rgba(34,211,238,0.22) 12px, transparent 13px)",
        }}
        animate={{ y: [-18, 18] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
      />

      {particles.map((particle) => (
        <motion.span
          key={particle}
          className="absolute h-1.5 w-1.5 rounded-full bg-reactor-cyan/70"
          initial={{
            x: `${8 + (particle % 6) * 16}vw`,
            y: `${12 + Math.floor(particle / 6) * 24}vh`,
            opacity: 0.18,
          }}
          animate={{
            x: [`${8 + (particle % 6) * 16}vw`, `${18 + (particle % 5) * 17}vw`],
            y: [`${12 + Math.floor(particle / 6) * 24}vh`, `${18 + ((particle + 2) % 4) * 20}vh`],
            opacity: [0.16, 0.82, 0.24],
          }}
          transition={{ duration: 2.2 + particle * 0.04, repeat: Infinity, repeatType: "mirror" }}
        />
      ))}

      <section className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-7">
        {debugEnabled && (
          <div className="flex max-w-5xl flex-wrap justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/82 p-3 shadow-[0_0_28px_rgba(34,211,238,0.14)] backdrop-blur-md">
            {stages.map((stage, index) => (
              <button
                key={stage.title}
                type="button"
                onClick={() => setStageIndex(index)}
                className={[
                  "rounded-full border px-4 py-2 text-xs font-bold transition",
                  stageIndex === index
                    ? "border-amber-200/70 bg-amber-300/20 text-amber-100 shadow-amber"
                    : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-reactor-cyan/50 hover:text-reactor-cyan",
                ].join(" ")}
              >
                {index + 1}. {stage.title}
              </button>
            ))}
            <button
              type="button"
              onClick={onComplete}
              className="rounded-full border border-amber-200/60 bg-amber-300 px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-amber-200"
            >
              生成结算
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={current.title}
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-black text-amber-100 drop-shadow-[0_0_18px_rgba(245,158,11,0.28)] md:text-4xl">
              {current.title}
            </h1>
          </motion.div>
        </AnimatePresence>

        <div className="relative grid h-[600px] w-full max-w-5xl place-items-center overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/72 shadow-[0_0_72px_rgba(34,211,238,0.14)] backdrop-blur-md">
          <motion.div
            className="absolute h-[560px] w-[560px] rounded-full border border-reactor-cyan/15"
            animate={{ rotate: 360 }}
            transition={{ duration: current.outerRingDuration, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute h-[430px] w-[430px] rounded-full border-[10px] border-dashed border-amber-200/25"
            animate={{ rotate: -360 }}
            transition={{ duration: current.filmRingDuration, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute h-[330px] w-[330px] rounded-full border border-fuchsia-300/20"
            animate={{ scale: [0.96, 1.08, 0.98], opacity: [0.35, 0.75, 0.4] }}
            transition={{ duration: current.pulseDuration, repeat: Infinity }}
          />

          <motion.div
            className={`relative z-20 grid h-56 w-56 place-items-center rounded-full border border-reactor-cyan/45 bg-slate-950 ${current.pulse}`}
            animate={{ scale: [1, current.pulseScale, 1] }}
            transition={{ duration: current.pulseDuration, repeat: Infinity }}
          >
            <motion.div
              className="absolute inset-5 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.35),rgba(245,158,11,0.12)_46%,transparent_70%)]"
              animate={{ opacity: [0.55, 1, 0.58], rotate: 180 }}
              transition={{ duration: 1.1, repeat: Infinity, repeatType: "mirror" }}
            />
            <div className="relative grid h-24 w-24 place-items-center rounded-full border border-amber-200/50 bg-amber-300/10 shadow-amber">
              <Icon className="h-11 w-11 text-amber-100" aria-hidden="true" />
            </div>
            <Film className="absolute -top-5 h-8 w-8 text-cyan-200/80" aria-hidden="true" />
            <Orbit className="absolute -bottom-5 h-8 w-8 text-fuchsia-200/80" aria-hidden="true" />
          </motion.div>

          <AnimatePresence>
            {stageIndex === 1 &&
              fragments.map((fragment, index) => (
                <motion.div
                  key={fragment}
                  className="absolute z-30 rounded-full border border-amber-200/35 bg-amber-300/12 px-4 py-2 text-xs font-bold text-amber-50 shadow-amber"
                  initial={{
                    x: index < 2 ? -360 : 360,
                    y: index % 2 ? -150 : 150,
                    opacity: 0,
                    scale: 0.82,
                  }}
                  animate={{ x: 0, y: 0, opacity: [0, 1, 0.2], scale: [0.82, 1, 0.45] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, delay: index * 0.08 }}
                >
                  {fragment}
                </motion.div>
              ))}
          </AnimatePresence>

          {stageIndex === 2 && (
            <div className="absolute inset-x-8 bottom-20 z-30 grid gap-3 md:grid-cols-4">
              {energyLines.map((line, index) => (
                <div key={line.label} className="rounded-xl border border-white/10 bg-black/35 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{line.label}</span>
                    <span className="font-mono text-white">{line.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${line.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${line.value}%` }}
                      transition={{ duration: 0.75, delay: index * 0.08, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {stageIndex === 3 && (
            <div className="absolute right-8 top-8 z-30 grid grid-cols-2 gap-3">
              {disturbanceCards.map((card, index) => (
                <motion.div
                  key={`${card.title}-${index}`}
                  className={`grid h-28 w-28 place-items-center overflow-hidden rounded-xl border p-3 text-center text-xs font-bold leading-4 ${disturbanceTone(card.type)}`}
                  initial={{ opacity: 0, y: 16, rotate: -8 }}
                  animate={{ opacity: [0, 0.9, 0.42], y: 0, rotate: index * 4 - 6 }}
                  transition={{ duration: 0.7, delay: index * 0.12 }}
                >
                  <span className="line-clamp-3">{card.title}</span>
                </motion.div>
              ))}
            </div>
          )}

          {stageIndex === 4 && (
            <div className="absolute inset-0 z-10 grid place-items-center">
              {pathBranches.map((branch, index) => (
                <div key={branch.label} className={`absolute left-1/2 top-1/2 ${branch.y}`}>
                  <motion.div
                    className={`absolute h-1.5 w-56 origin-left rounded-full ${branch.line} shadow-[0_0_18px_rgba(255,255,255,0.18)]`}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 0.95 }}
                    transition={{ duration: 0.75, delay: index * 0.12, ease: "easeOut" }}
                  />
                  <motion.div
                    className={`absolute left-56 top-1/2 flex h-16 w-52 -translate-y-1/2 flex-col justify-center rounded-2xl border px-4 text-left ${branch.node}`}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.42, delay: 0.46 + index * 0.12, ease: "easeOut" }}
                  >
                    <span className="text-sm font-black">{branch.label}</span>
                    <span className="mt-1 text-[11px] font-bold opacity-80">{branch.detail}</span>
                  </motion.div>
                </div>
              ))}
            </div>
          )}

          <div className="absolute left-8 top-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-slate-300">
            <Sparkles className="h-4 w-4 text-amber-200" aria-hidden="true" />
            单屏实验台
          </div>
          <div className="absolute bottom-6 left-8 right-8 h-3 overflow-hidden rounded-full border border-white/10 bg-black/35">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-reactor-blue via-reactor-cyan to-ember-300"
              initial={{ width: 0 }}
              animate={{ width: `${current.energy}%` }}
              transition={{ duration: 0.62, ease: "easeOut" }}
            />
          </div>
          <Activity className="absolute bottom-10 right-8 h-6 w-6 text-reactor-green" aria-hidden="true" />
        </div>
      </section>
    </main>
  );
}

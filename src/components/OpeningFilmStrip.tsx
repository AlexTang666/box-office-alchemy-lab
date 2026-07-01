import { motion } from "framer-motion";
import { Clapperboard } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface OpeningFilmStripProps {
  onFinish: () => void;
}

const openingDuration = 6200;
const fadeDuration = 800;

function makePosterSamples() {
  return Array.from({ length: 15 }, (_, index) => {
    const rank = index + 1;
    return {
      id: `top15-sample-${rank}`,
      rank: `#${String(rank).padStart(2, "0")}`,
      title: `动画电影样本 ${String(rank).padStart(2, "0")}`,
      year: 2015 + (index % 11),
      posterUrl: `/poster/top15/poster-${String(rank).padStart(2, "0")}.webp`,
      tone: index % 3,
    };
  });
}

export function OpeningFilmStrip({ onFinish }: OpeningFilmStripProps) {
  const [leaving, setLeaving] = useState(false);
  const posters = useMemo(() => makePosterSamples(), []);
  const reel = useMemo(() => [...posters, ...posters], [posters]);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setLeaving(true), openingDuration - fadeDuration);
    const finishTimer = window.setTimeout(onFinish, openingDuration);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const finishNow = () => {
    setLeaving(true);
    window.setTimeout(onFinish, 180);
  };

  return (
    <motion.main
      className="relative min-h-screen overflow-hidden bg-[#030610] px-5 py-8 text-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: leaving ? 0.8 : 0.3, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(255,218,153,0.14),transparent_28rem),radial-gradient(circle_at_82%_20%,rgba(49,232,255,0.1),transparent_26rem),linear-gradient(135deg,#030610_0%,#07101d_52%,#100d1a_100%)]" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.16)_0_1px,transparent_1px),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.12)_0_1px,transparent_1px)] [background-size:4px_4px,7px_7px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(0,0,0,0.5)_100%)]" />
      <div className="absolute left-[-10%] top-[-10%] h-[52vh] w-[68vw] rotate-[10deg] bg-[conic-gradient(from_235deg_at_0%_0%,rgba(255,232,188,0.22),rgba(49,232,255,0.06)_16deg,transparent_32deg)] blur-[2px]" />

      <button
        type="button"
        onClick={finishNow}
        className="absolute right-6 top-6 z-30 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-bold text-slate-200 backdrop-blur transition hover:border-amber-200/40 hover:text-amber-100"
      >
        跳过片头
      </button>

      <section className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col justify-center gap-10">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/[0.06] px-4 py-2 text-xs font-bold text-amber-100">
            <Clapperboard size={16} aria-hidden="true" />
            Top15 Market Memory Reel
          </div>
          <motion.p
            className="mt-5 text-xs uppercase tracking-[0.38em] text-cyan-100/70"
            animate={{ opacity: [0.58, 1, 0.64] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror" }}
          >
            历史票房样本库正在载入
          </motion.p>
          <h1 className="mt-3 text-3xl font-black text-amber-100 md:text-5xl">Top15 动画电影进入市场记忆胶片</h1>
          <p className="mt-4 text-sm text-slate-300 md:text-base">数据并不预测未来，只记录曾经发生的奇迹</p>
        </div>

        <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-32 bg-gradient-to-r from-[#030610] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-32 bg-gradient-to-l from-[#030610] to-transparent" />

          <div className="relative h-[360px] rotate-[-1.5deg] border-y border-amber-100/20 bg-black/55 shadow-[0_0_48px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-x-0 top-0 h-8 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.24)_0_18px,transparent_18px_34px)] opacity-70" />
            <div className="absolute inset-x-0 bottom-0 h-8 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.22)_0_18px,transparent_18px_34px)] opacity-70" />

            <div className="absolute inset-x-0 top-7 bottom-7 grid place-items-center overflow-hidden">
              <motion.div
                className="flex items-center gap-3 px-5"
                style={{ willChange: "transform" }}
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 6.4, repeat: Infinity, ease: "linear" }}
              >
                {reel.map((poster, index) => (
                  <motion.article
                    key={`${poster.id}-${index}`}
                    className="relative h-[284px] w-[190px] flex-none overflow-hidden rounded-xl bg-slate-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_0_18px_rgba(0,0,0,0.38)]"
                  >
                    <img
                      src={poster.posterUrl}
                      alt={`${poster.title} 海报`}
                      className="absolute inset-0 h-full w-full object-cover brightness-[0.90] saturate-[0.9]"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.04)_42%,rgba(0,0,0,0.22)_100%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.12)_42%,transparent_58%)]" />
                  </motion.article>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
}

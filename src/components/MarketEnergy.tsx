import { motion } from "framer-motion";
import { ArrowLeft, Flame, MessageCircle, RadioTower, ShieldCheck, Sparkles, Ticket } from "lucide-react";
import type { MarketEnergyAllocation } from "../types/movie";

interface MarketEnergyProps {
  allocation: MarketEnergyAllocation;
  onChange: (allocation: MarketEnergyAllocation) => void;
  onBack: () => void;
  onStart: () => void;
}

const totalEnergy = 10;

const channels: Array<{
  key: keyof MarketEnergyAllocation;
  title: string;
  subtitle: string;
  benefit: string;
  cost: string;
  feedback: string;
  icon: typeof Flame;
  accent: "amber" | "cyan" | "green" | "magenta";
}> = [
  {
    key: "preheatPromotion",
    title: "宣发预热",
    subtitle: "拉高首映前关注",
    benefit: "提升预热值",
    cost: "预期压力上升",
    feedback: "预热 +10 / 波动 +3",
    icon: RadioTower,
    accent: "amber",
  },
  {
    key: "reputationBuild",
    title: "口碑维护",
    subtitle: "稳住观众反馈",
    benefit: "提升口碑值",
    cost: "爆发速度较慢",
    feedback: "口碑 +10 / 扩散 -2",
    icon: ShieldCheck,
    accent: "green",
  },
  {
    key: "screeningAccess",
    title: "风险控制",
    subtitle: "压低市场波动",
    benefit: "降低波动值",
    cost: "破圈上限下降",
    feedback: "波动 -6 / 上限 -4",
    icon: Ticket,
    accent: "cyan",
  },
  {
    key: "communitySpread",
    title: "社群扩散",
    subtitle: "放大破圈可能",
    benefit: "提升扩散值",
    cost: "波动值上升",
    feedback: "扩散 +10 / 波动 +7",
    icon: MessageCircle,
    accent: "magenta",
  },
];

const accentClass = {
  amber: "border-ember-300/40 bg-ember-300/10 text-ember-200",
  cyan: "border-reactor-cyan/40 bg-reactor-cyan/10 text-reactor-cyan",
  green: "border-reactor-green/40 bg-reactor-green/10 text-reactor-green",
  magenta: "border-reactor-magenta/40 bg-reactor-magenta/10 text-fuchsia-200",
};

const metricLabels = {
  heat: "预热值",
  reputation: "口碑值",
  spread: "扩散值",
  volatility: "波动值",
};

function strategyLabel(allocation: MarketEnergyAllocation) {
  const entries = [
    ["首映爆发型", allocation.preheatPromotion],
    ["稳健口碑型", allocation.reputationBuild],
    ["低风险长尾型", allocation.screeningAccess],
    ["高波动破圈型", allocation.communitySpread],
  ] as const;
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const [topLabel, topValue] = sorted[0];
  const [, secondValue] = sorted[1];

  if (topValue <= 3 || topValue - secondValue <= 1) return "均衡样本型";
  return topLabel;
}

export function MarketEnergy({ allocation, onChange, onBack, onStart }: MarketEnergyProps) {
  const used = Object.values(allocation).reduce((sum, value) => sum + value, 0);
  const remaining = totalEnergy - used;
  const ready = used === totalEnergy;
  const coreMetrics = {
    heat: allocation.preheatPromotion * 10,
    reputation: allocation.reputationBuild * 10,
    spread: Math.round((allocation.communitySpread * 0.75 + allocation.preheatPromotion * 0.25) * 10),
    volatility: Math.max(0, Math.round((allocation.communitySpread * 0.7 + allocation.preheatPromotion * 0.3 - allocation.screeningAccess * 0.45) * 10)),
  };
  const currentStrategy = strategyLabel(allocation);

  const updateChannel = (key: keyof MarketEnergyAllocation, delta: number) => {
    if (delta > 0 && used >= totalEnergy) return;
    const nextValue = Math.min(10, Math.max(0, allocation[key] + delta));
    onChange({ ...allocation, [key]: nextValue });
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 text-white">
      <div className="absolute inset-0 lab-backdrop" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="mb-3 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-200 transition hover:border-reactor-cyan/40"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              返回电影基因
            </button>
            <h1 className="text-3xl font-black md:text-5xl">市场能量分配</h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              市场能量有限，你无法同时追求高预热、高口碑、高扩散和低风险。
            </p>
          </div>

          <div className="rounded-lg border border-ember-300/30 bg-slate-950/70 px-5 py-4 text-right shadow-amber backdrop-blur-md">
            <div className="text-sm text-slate-400">剩余能量</div>
            <div className={`font-mono text-4xl font-black ${remaining === 0 ? "text-reactor-green" : "text-ember-200"}`}>
              {remaining}
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-4 md:grid-cols-2">
            {channels.map((channel) => {
              const Icon = channel.icon;
              const value = allocation[channel.key];
              const canAdd = used < totalEnergy && value < 10;
              const canRemove = value > 0;

              return (
                <motion.article
                  key={channel.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className={`relative overflow-hidden rounded-lg border p-5 backdrop-blur-md ${accentClass[channel.accent]}`}
                >
                  <div className="absolute inset-0 poster-lines opacity-25" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <div className="grid h-11 w-11 place-items-center rounded-md border border-current/30 bg-black/20">
                        <Icon size={22} aria-hidden="true" />
                      </div>
                      <h2 className="mt-4 text-2xl font-black text-white">{channel.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{channel.subtitle}</p>
                      <div className="mt-3 grid gap-2 text-xs">
                        <div className="flex items-center justify-between gap-3 rounded-md border border-current/20 bg-black/25 px-3 py-1">
                          <span className="font-bold text-reactor-green">收益</span>
                          <span className="text-slate-100">{channel.benefit}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-md border border-current/20 bg-black/25 px-3 py-1">
                          <span className="font-bold text-fuchsia-200">代价</span>
                          <span className="text-slate-100">{channel.cost}</span>
                        </div>
                      </div>
                      <p className="mt-3 inline-flex rounded-md border border-current/25 bg-black/25 px-3 py-1 font-mono text-xs text-white">
                        {channel.feedback}
                      </p>
                    </div>
                    <div className="font-mono text-5xl font-black text-white">{value}</div>
                  </div>

                  <div className="relative mt-6 flex items-center gap-3">
                    <button
                      type="button"
                      disabled={!canRemove}
                      onClick={() => updateChannel(channel.key, -1)}
                      className="grid h-11 w-11 place-items-center rounded-md border border-white/15 bg-black/25 text-xl font-bold text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label={`${channel.title} 减少 1 点`}
                    >
                      -
                    </button>
                    <div className="grid flex-1 grid-cols-10 gap-1">
                      {Array.from({ length: 10 }, (_, index) => (
                        <span
                          key={index}
                          className={[
                            "h-3 rounded-full border border-white/10",
                            index < value ? "bg-current shadow-cyan" : "bg-slate-950/80",
                          ].join(" ")}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={!canAdd}
                      onClick={() => updateChannel(channel.key, 1)}
                      className="grid h-11 w-11 place-items-center rounded-md border border-white/15 bg-black/25 text-xl font-bold text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label={`${channel.title} 增加 1 点`}
                    >
                      +
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <aside className="rounded-lg border border-reactor-cyan/25 bg-slate-950/75 p-5 shadow-cyan backdrop-blur-md">
            <div className="grid place-items-center py-5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="grid h-44 w-44 place-items-center rounded-full border border-dashed border-reactor-cyan/45"
              >
                <div className="grid h-28 w-28 place-items-center rounded-full border border-ember-300/40 bg-ember-300/10">
                  <Flame size={42} className="text-ember-200" aria-hidden="true" />
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(coreMetrics).map(([key, value]) => (
                <div key={key} className="rounded-md border border-white/10 bg-black/25 px-3 py-3">
                  <div className="text-xs text-slate-500">{metricLabels[key as keyof typeof metricLabels]}</div>
                  <div className="mt-1 font-mono text-2xl font-black text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-ember-300/25 bg-ember-300/10 px-4 py-3">
              <div className="text-xs text-slate-400">当前策略标签</div>
              <div className="mt-1 text-xl font-black text-ember-100">{currentStrategy}</div>
            </div>

            <div className="mt-5 space-y-2 text-sm leading-6 text-slate-300">
              <p>能量总和：{used} / {totalEnergy}</p>
              <p>{ready ? "能量就绪，可以启动。" : "请分配到正好 10 点。"}</p>
            </div>

            <button
              type="button"
              disabled={!ready}
              onClick={onStart}
              className={[
                "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border px-5 py-3 font-semibold transition",
                ready
                  ? "border-ember-300/60 bg-ember-300 text-slate-950 shadow-amber hover:-translate-y-0.5"
                  : "cursor-not-allowed border-white/10 bg-white/10 text-slate-500",
              ].join(" ")}
            >
              <Sparkles size={18} aria-hidden="true" />
              启动市场模拟
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}

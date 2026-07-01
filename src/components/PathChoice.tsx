import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles, TrendingUp } from "lucide-react";
import { formatBillionYuan } from "../lib/data";
import type { BoxOfficeRange, SelectedPath, SimulationResult } from "../types/movie";

interface PathChoiceProps {
  result: SimulationResult;
  selectedPath: SelectedPath | null;
  onSelect: (path: SelectedPath) => void;
}

type PathCardConfig = {
  id: SelectedPath;
  name: string;
  tags: string[];
  risk: "低" | "中" | "高";
  volatility: number;
  range: BoxOfficeRange;
  evidence: string;
  gain: string[];
  cost: string[];
  description: string;
  confirmLabel: string;
  icon: typeof Shield;
  tone: string;
  recommended?: boolean;
};

export function PathChoice({ result, selectedPath, onSelect }: PathChoiceProps) {
  const [pendingPath, setPendingPath] = useState<PathCardConfig | null>(null);
  const heat = Math.round(result.metrics.preReleaseHeat);
  const reputation = Math.round(result.metrics.reputationStability);
  const spread = Math.round(result.metrics.top15Probability);

  const paths: PathCardConfig[] = [
    {
      id: "conservative",
      name: "稳住基本盘",
      tags: ["低风险", "稳定长尾"],
      risk: "低",
      volatility: 32,
      range: result.conservativeRange,
      evidence: `口碑值 ${reputation} / 波动值 32`,
      gain: ["下限保护 +15%", "波动压制 -20%"],
      cost: ["破圈上限 -35%", "样本参照 -12%"],
      description: "这条路径降低极端波动，让电影沿目标受众和口碑反馈缓慢扩散。",
      confirmLabel: "确认稳住基本盘",
      icon: Shield,
      tone: "border-reactor-cyan/40 bg-reactor-cyan/10 text-reactor-cyan",
      recommended: result.metrics.seasonFit < 58,
    },
    {
      id: "normal",
      name: "参考历史样本",
      tags: ["中风险", "样本回声"],
      risk: "中",
      volatility: 58,
      range: result.normalRange,
      evidence: `预热值 ${heat} / 口碑值 ${reputation}`,
      gain: ["区间稳定 +12%", "历史参照增强"],
      cost: ["下限保护 -15%", "破圈上限 -35%"],
      description: "这条路径让电影沿着历史样本的中间轨迹前进，但历史参照不等于成功公式。",
      confirmLabel: "确认参考历史",
      icon: TrendingUp,
      tone: "border-ember-300/45 bg-ember-300/10 text-ember-200",
      recommended: result.metrics.seasonFit >= 58 && result.metrics.seasonFit < 78,
    },
    {
      id: "chaos",
      name: "押注破圈爆发",
      tags: ["高风险", "高上限"],
      risk: "高",
      volatility: 86,
      range: result.chaosRange,
      evidence: `扩散值 ${spread} / 波动值 86`,
      gain: ["破圈上限 +35%", "扩散放大 +20%"],
      cost: ["下限保护 -15%", "区间稳定 -12%"],
      description: "这条路径押注社群传播和偶然事件，上限更高，但也更不可控。",
      confirmLabel: "确认承担高波动命运",
      icon: Sparkles,
      tone: "border-reactor-magenta/45 bg-reactor-magenta/10 text-fuchsia-200",
      recommended: result.metrics.seasonFit >= 78,
    },
  ];
  const lostAdvantages = pendingPath
    ? paths.filter((path) => path.id !== pendingPath.id).map((path) => `${path.name}：${path.gain[0]}`)
    : [];

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 text-white">
      <div className="absolute inset-0 lab-backdrop" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="max-w-4xl text-3xl font-black md:text-5xl">市场反应炉分裂出三条路径</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            你只能锁定一条市场命运。未选择的路径将被折叠为遗失可能。
          </p>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          {paths.map((path, index) => {
            const Icon = path.icon;
            const active = selectedPath === path.id || pendingPath?.id === path.id;
            return (
              <motion.article
                key={path.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: index * 0.08 }}
                className={[
                  "relative min-h-[460px] overflow-hidden rounded-lg border p-5 backdrop-blur-md transition",
                  path.tone,
                  active ? "scale-[1.01] shadow-amber" : "",
                  path.recommended && !active ? "shadow-cyan" : "",
                ].join(" ")}
              >
                <div className="absolute inset-0 poster-lines opacity-30" />
                <div className="relative flex min-h-[420px] flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="grid h-12 w-12 place-items-center rounded-md border border-current/30 bg-black/25">
                        <Icon size={24} aria-hidden="true" />
                      </div>
                      <h2 className="mt-5 text-3xl font-black text-white">{path.name}</h2>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {path.tags.map((tag) => (
                          <span key={tag} className="rounded-md border border-current/25 bg-black/25 px-3 py-1 text-xs font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {path.recommended ? (
                      <div className="rounded-md border border-current/25 bg-black/20 px-3 py-2 text-xs font-bold">
                        推荐
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Info label="风险等级" value={path.risk} />
                      <Info label="波动程度" value={`${path.volatility}`} />
                    </div>
                    <Info label="可能票房区间" value={`${formatBillionYuan(path.range[0])} - ${formatBillionYuan(path.range[1])}`} />
                  </div>

                  <div className="mt-5 rounded-md border border-white/10 bg-black/25 px-3 py-2">
                    <div className="text-xs text-slate-500">关键数据依据</div>
                    <div className="mt-1 font-mono text-sm font-semibold text-slate-100">{path.evidence}</div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <DecisionCost label="获得" values={path.gain} />
                    <DecisionCost label="代价" values={path.cost} />
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-300">{path.description}</p>

                  <div className="mt-auto pt-6">
                    <button
                      type="button"
                      onClick={() => setPendingPath(path)}
                      className={[
                        "inline-flex w-full items-center justify-center rounded-md border px-5 py-3 font-semibold transition",
                        active
                          ? "border-ember-300/70 bg-ember-300 text-slate-950 shadow-amber"
                          : "border-white/15 bg-white/10 text-white hover:border-ember-300/50",
                      ].join(" ")}
                    >
                      选择这条路径
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>

        {pendingPath ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/78 px-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-ember-300/40 bg-slate-950/95 p-6 shadow-[0_0_48px_rgba(251,191,36,0.22)]"
              initial={{ scale: 0.96, y: 14 }}
              animate={{ scale: 1, y: 0 }}
            >
              <h2 className="text-3xl font-black text-white">锁定命运</h2>
              <p className="mt-4 rounded-lg border border-ember-300/20 bg-ember-300/10 px-4 py-3 text-sm font-semibold text-ember-100">
                你正在锁定：{pendingPath.name}
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-reactor-green/25 bg-reactor-green/10 p-4">
                  <div className="text-xs font-bold text-reactor-green">这将带来</div>
                  <div className="mt-3 space-y-2">
                    {pendingPath.gain.map((item) => (
                      <p key={item} className="rounded bg-black/25 px-3 py-2 text-sm text-slate-100">{item}</p>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-fuchsia-300/25 bg-fuchsia-300/10 p-4">
                  <div className="text-xs font-bold text-fuchsia-200">同时你将放弃</div>
                  <div className="mt-3 space-y-2">
                    {lostAdvantages.map((item) => (
                      <p key={item} className="rounded bg-black/25 px-3 py-2 text-sm text-slate-100">{item}</p>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-5 rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-sm text-slate-300">
                确认后，另外两条路径将被折叠，本局不再展开。
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onSelect(pendingPath.id)}
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-ember-300/70 bg-ember-300 px-5 py-3 font-bold text-slate-950 shadow-amber transition hover:-translate-y-0.5"
                >
                  {pendingPath.confirmLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingPath(null)}
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-white/15 bg-white/10 px-5 py-3 font-bold text-white transition hover:border-reactor-cyan/45"
                >
                  重新考虑
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </div>
    </main>
  );
}

function DecisionCost({ label, values }: { label: "获得" | "代价"; values: string[] }) {
  const isGain = label === "获得";

  return (
    <div className="rounded-md border border-white/10 bg-black/20 px-3 py-2">
      <span className={`text-xs font-bold ${isGain ? "text-reactor-green" : "text-fuchsia-200"}`}>{label}</span>
      <div className="mt-2 grid gap-1">
        {values.map((value) => (
          <span key={value} className="text-sm font-semibold text-slate-100">{value}</span>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
    </div>
  );
}

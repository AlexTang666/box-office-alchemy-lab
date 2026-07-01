import { RefreshCcw, RotateCcw, Sparkles, X } from "lucide-react";
import type { StudioSampleInfluenceSummary } from "../lib/studioOutcome";

type ResultEvent = {
  id: string;
  title: string;
  description: string;
  type: string;
  impactText: string;
};

type MetricRow = [string, number, string];

type StudioRange = {
  min: number;
  max: number;
  display: string;
};

type StudioBreakoutCeiling = {
  value: number;
  display: string;
};

interface StudioResultSummaryProps {
  title: string;
  marketLabel: string;
  genreLabel: string;
  seasonLabel: string;
  formatLabel: string;
  resourceLabel: string;
  strategyFingerprint: string;
  sampleActiveCount: number;
  sampleTotalCount: number;
  sampleNames: string[];
  selectedEvents: ResultEvent[];
  unselectedEvents: ResultEvent[];
  boxOfficeFloor: number;
  boxOfficeCeiling: number;
  baseRange: StudioRange;
  breakoutCeiling: StudioBreakoutCeiling;
  breakoutScore: number;
  breakoutTriggers: string[];
  breakoutReasons: string[];
  riskNotes: string[];
  sampleInfluenceSummary: StudioSampleInfluenceSummary;
  destinyType: string;
  destinyText: string;
  metrics: MetricRow[];
  onBack: () => void;
  onRetry: () => void;
}

function eventTone(type: string) {
  if (type === "正向") return "border-emerald-200/35 bg-emerald-300/[0.08] text-emerald-100";
  if (type === "负向") return "border-rose-200/35 bg-rose-300/[0.08] text-rose-100";
  return "border-violet-200/35 bg-violet-300/[0.08] text-violet-100";
}

export function StudioResultSummary({
  title,
  marketLabel,
  genreLabel,
  seasonLabel,
  formatLabel,
  resourceLabel,
  strategyFingerprint,
  sampleActiveCount,
  sampleTotalCount,
  sampleNames,
  selectedEvents,
  unselectedEvents,
  boxOfficeFloor,
  boxOfficeCeiling,
  baseRange,
  breakoutCeiling,
  breakoutScore,
  breakoutTriggers,
  breakoutReasons,
  riskNotes,
  sampleInfluenceSummary,
  destinyType,
  destinyText,
  metrics,
  onBack,
  onRetry,
}: StudioResultSummaryProps) {
  const visibleBreakoutTriggers = breakoutTriggers.slice(0, 3);
  const visibleBreakoutReasons = breakoutReasons.slice(0, 3);
  const visibleRiskNotes = riskNotes.slice(0, 2);
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#030612] p-5 text-white">
      <div className="pointer-events-none absolute inset-0 lab-backdrop" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(0,0,0,0.5)_100%)]" />
      <section className="relative z-10 grid aspect-video w-full max-w-7xl grid-rows-[auto_1fr_auto] overflow-hidden rounded-[28px] border border-amber-200/35 bg-slate-950/96 p-5 text-white shadow-[0_0_70px_rgba(251,191,36,0.16)]">
        <header className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="min-w-0">
            <h2 className="text-3xl font-black text-amber-100">电影命运结算</h2>
            <p className="mt-1 text-sm text-slate-400">历史样本进入市场反应炉后，本局电影命运已生成</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full border border-amber-200/25 bg-amber-200/[0.07] px-3 py-1.5 text-xs font-bold text-amber-100">
              {strategyFingerprint}
            </span>
            <button
              type="button"
              onClick={onBack}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-slate-400 transition hover:border-white/25 hover:text-white"
              aria-label="返回实验台"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 grid-cols-[0.92fr_1.05fr_1fr] gap-4 py-4">
          <aside className="grid min-h-0 grid-rows-[auto_1fr_auto_auto] gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div>
              <p className="text-sm font-bold text-slate-500">生成电影档案</p>
              <h3 className="mt-1 truncate text-2xl font-black text-white">{title}</h3>
            </div>
            <div className="grid content-start gap-2 text-xs">
              {[
                ["市场来源", marketLabel],
                ["题材类型", genreLabel],
                ["上映档期", seasonLabel],
                ["观看规格", formatLabel],
                ["资源倾向", resourceLabel],
                ["策略指纹", strategyFingerprint],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[4.5rem_1fr] gap-2 rounded-lg border border-white/10 bg-black/[0.18] px-2.5 py-2">
                  <span className="text-slate-500">{label}</span>
                  <span className="truncate font-bold text-slate-100">{value || "未选择"}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {metrics.map(([label, value, color]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.045] px-2 py-1.5">
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <span className="font-bold text-slate-300">{label}</span>
                    <span className="font-mono text-slate-500">{value.toFixed(1)}</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-cyan-200/18 bg-cyan-200/[0.045] px-3 py-2">
              <p className="text-xs font-bold text-cyan-100">市场记忆池：参与样本 {sampleActiveCount} / {sampleTotalCount}</p>
              <p className="mt-1 truncate text-[11px] text-slate-400">
                {sampleNames.slice(0, 2).join(" / ") || "暂无参与样本"}
              </p>
              <p className="mt-1 truncate text-[11px] font-bold text-amber-100/85">
                历史参照强度：{sampleInfluenceSummary.referenceStrength} · {sampleInfluenceSummary.baseImpact} · {sampleInfluenceSummary.riskImpact}
              </p>
              <p className="mt-1 truncate text-[10px] text-slate-500">
                主要支撑：{sampleInfluenceSummary.dominantTags.slice(0, 2).join(" / ")}
              </p>
            </div>
          </aside>

          <main className="grid min-h-0 content-start grid-rows-[auto_auto_auto_auto] gap-3 overflow-hidden rounded-2xl border border-amber-200/22 bg-amber-200/[0.045] p-4">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-amber-100/75">基础票房区间</p>
                <span className="rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] px-2 py-0.5 text-[10px] font-bold text-cyan-100">
                  破圈值 {breakoutScore}
                </span>
              </div>
              <p className="mt-1.5 text-4xl font-black text-white">{baseRange.display}</p>
              <div className="mt-5 rounded-xl border border-amber-200/18 bg-black/[0.16] px-3 py-1.5">
                <p className="text-xs font-bold text-slate-500">破圈上限</p>
                <p className="mt-0.5 truncate text-lg font-black text-amber-100">{breakoutCeiling.display}</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/[0.18] p-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-black text-amber-100">{destinyType}</span>
                <Sparkles className="h-4 w-4 text-amber-100" aria-hidden="true" />
              </div>
              <p className="mt-1.5 overflow-hidden text-xs leading-5 text-slate-300 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {destinyText}
              </p>
            </div>
            <div className="grid min-h-0 grid-cols-2 gap-2">
              <div className="min-h-0 overflow-hidden rounded-xl border border-white/10 bg-cyan-200/[0.045] p-2.5">
                <p className="text-xs font-black text-cyan-100">破圈触发器</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {(visibleBreakoutTriggers.length ? visibleBreakoutTriggers : ["暂无明显破圈触发"]).map((trigger) => (
                    <span key={trigger} className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-bold text-slate-200">
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
              <div className="min-h-0 overflow-hidden rounded-xl border border-white/10 bg-rose-200/[0.045] p-2.5">
                <p className="text-xs font-black text-rose-100">风险提示</p>
                <div className="mt-1.5 grid gap-1">
                  {visibleRiskNotes.map((note) => (
                    <p key={note} className="overflow-hidden text-[11px] leading-4 text-slate-300 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]">
                      {note}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
              <p className="text-xs font-black text-amber-100/90">爆火理由</p>
              <div className="mt-1 grid gap-1">
                {(visibleBreakoutReasons.length ? visibleBreakoutReasons : ["暂无明确爆火引信，本局更依赖基础盘和长线口碑。"]).map((reason) => (
                  <p key={reason} className="overflow-hidden text-[11px] leading-4 text-slate-300 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]">
                    {reason}
                  </p>
                ))}
              </div>
            </div>
          </main>

          <aside className="grid min-h-0 grid-rows-[1fr_auto] gap-3">
            <div className="min-h-0 overflow-hidden rounded-2xl border border-fuchsia-200/20 bg-fuchsia-200/[0.045] p-4">
              <p className="text-sm font-bold text-fuchsia-100/80">命运影响因素</p>
              <div className="mt-3 grid h-[calc(100%-1.75rem)] grid-rows-4 gap-1.5 overflow-hidden">
                {selectedEvents.map((event) => (
                  <article key={event.id} className={`min-h-0 overflow-hidden rounded-xl border px-2.5 py-2 ${eventTone(event.type)}`}>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="truncate text-xs font-black">{event.title}</h4>
                      <span className="shrink-0 rounded-full border border-white/15 bg-black/20 px-2 py-0.5 text-[10px] font-bold">{event.type}</span>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-slate-300">{event.description}</p>
                    <p className="mt-0.5 overflow-hidden text-[10px] leading-3 text-cyan-100/80 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]">
                      {event.impactText}
                    </p>
                  </article>
                ))}
                {!selectedEvents.length ? (
                  <div className="rounded-xl border border-white/10 bg-black/25 p-2 text-center opacity-55">
                    <p className="text-xs font-bold text-slate-400">暂无入局扰动</p>
                    <p className="mt-1 text-[11px] text-slate-500">返回实验台翻开事件</p>
                  </div>
                ) : null}
                {selectedEvents.length < 4 ? (
                  <div className="grid grid-cols-2 gap-2">
                  {unselectedEvents.slice(0, 2).map((event) => (
                    <div key={event.id} className="rounded-xl border border-white/10 bg-black/25 p-2 text-center opacity-55">
                      <p className="text-xs font-bold text-slate-400">未展开</p>
                      <p className="mt-1 text-[11px] text-slate-500">遗失扰动</p>
                    </div>
                  ))}
                </div>
                ) : null}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <p className="text-xs font-bold text-slate-500">关键选择回放</p>
              <div className="mt-2 grid gap-1.5 text-[11px] text-slate-300">
                <p>设定：{marketLabel} · {genreLabel}</p>
                <p>样本：{sampleActiveCount} 个历史参照参与</p>
                <p>扰动：已锁定 {selectedEvents.length} 个混沌事件</p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
          <p className="text-sm text-slate-300">历史样本不是爆款公式，混沌事件才会改变市场路径。</p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={onRetry} className="inline-flex items-center gap-2 rounded-full border border-cyan-200/35 bg-cyan-200/[0.08] px-4 py-2 text-sm font-bold text-cyan-100">
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              再来一局
            </button>
            <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-slate-200">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              返回实验台
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

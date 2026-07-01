import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, GitFork, Sparkles, Zap } from "lucide-react";
import { chaosEventLevels, responseTradeoffs } from "../lib/chaosEvents";
import type { ChaosEventResponses, MarketChaosEvent } from "../types/movie";

interface ChaosEventStageProps {
  events: MarketChaosEvent[];
  responses: ChaosEventResponses;
  onChange: (responses: ChaosEventResponses) => void;
  onBack: () => void;
  onContinue: (selectedEvents: MarketChaosEvent[]) => void;
}

const typeTone = {
  positive: "border-reactor-green/40 bg-reactor-green/10 text-reactor-green",
  negative: "border-reactor-magenta/40 bg-reactor-magenta/10 text-fuchsia-200",
  neutral: "border-reactor-cyan/40 bg-reactor-cyan/10 text-reactor-cyan",
};

const typeLabel = {
  positive: "正向扰动",
  negative: "负向扰动",
  neutral: "中性扰动",
};

const eventImpact = {
  positive: ["扩散 +12", "预热 +8"],
  negative: ["波动 +14", "口碑 -8"],
  neutral: ["波动 +8", "扩散 ±6"],
};

export function ChaosEventStage({
  events,
  responses,
  onChange,
  onBack,
  onContinue,
}: ChaosEventStageProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const selectedEvents = events.filter((event) => selectedIds.includes(event.id));
  const ready = selectedEvents.length === 2 && selectedEvents.every((event) => responses[event.id]);
  const selectionComplete = selectedIds.length === 2;
  const currentEvent = selectedEvents[currentEventIndex];
  const currentAnswered = Boolean(currentEvent && responses[currentEvent.id]);

  const selectResponse = (eventId: string, optionId: string) => {
    onChange({ ...responses, [eventId]: optionId });
  };

  const revealEvent = (eventId: string) => {
    if (selectedIds.includes(eventId) || selectedIds.length >= 2) return;
    setSelectedIds((ids) => [...ids, eventId]);
  };

  const goNextEvent = () => {
    if (currentEventIndex < selectedEvents.length - 1) {
      setCurrentEventIndex((index) => index + 1);
    }
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
              返回能量分配
            </button>
            <h1 className="text-3xl font-black md:text-5xl">混沌事件阶段</h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              {selectionComplete ? "逐张处理你翻开的事件卡。每次只解决一个市场扰动。" : "四张未知扰动卡已生成。请选择两张翻开，并承担对应代价。"}
            </p>
          </div>

          <div className="rounded-lg border border-reactor-cyan/30 bg-slate-950/70 px-5 py-4 text-right shadow-cyan backdrop-blur-md">
            <div className="text-sm text-slate-400">已响应事件</div>
            <div className="font-mono text-4xl font-black text-reactor-cyan">
              {selectedEvents.filter((event) => responses[event.id]).length}/2
            </div>
            <div className="mt-1 text-xs text-slate-500">已翻开 {selectedIds.length}/2</div>
          </div>
        </header>

        {selectedIds.length === 0 ? (
          <motion.div
            className="mb-5 rounded-lg border-2 border-reactor-cyan/40 bg-slate-950/85 p-8 text-center shadow-cyan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Sparkles className="mx-auto text-reactor-cyan" size={28} aria-hidden="true" />
            <p className="mt-3 text-lg font-black text-cyan-50">市场扰动正在生成……</p>
            <p className="mt-2 text-sm text-slate-400">点击任意两张背面卡，翻开你的市场变量。</p>
          </motion.div>
        ) : null}

        {!selectionComplete ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {events.map((event, index) => {
            const revealed = selectedIds.includes(event.id);
            const locked = !revealed && selectedIds.length >= 2;

            return (
            <motion.article
              key={event.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: locked ? 0.45 : 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className={[
                "relative min-h-[520px] overflow-hidden rounded-lg border-2 p-5 backdrop-blur-md transition",
                revealed ? typeTone[event.type] : "border-white/15 bg-slate-950/70 text-reactor-cyan",
                locked ? "cursor-not-allowed grayscale" : "cursor-pointer hover:border-ember-300/45",
              ].join(" ")}
              style={{ transformStyle: "preserve-3d" }}
              onClick={() => revealEvent(event.id)}
            >
              {!revealed ? (
                <motion.div
                  className="absolute inset-0 z-20 grid place-items-center bg-slate-950/95"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 0 }}
                >
                  <div className="text-center">
                    <div className="mx-auto grid h-20 w-20 place-items-center rounded-xl border border-reactor-cyan/30 bg-reactor-cyan/10 shadow-cyan">
                      <Sparkles className="text-reactor-cyan" size={30} aria-hidden="true" />
                    </div>
                    <p className="mt-5 text-xl font-black text-cyan-50">未知扰动卡</p>
                    <p className="mt-2 text-sm text-slate-400">
                      {locked ? "本局只可选择两张" : "点击翻开"}
                    </p>
                  </div>
                </motion.div>
              ) : null}

              <motion.div
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: revealed ? 0 : -90, opacity: revealed ? 1 : 0 }}
                transition={{ duration: 0.55 }}
              >
              <div className="absolute inset-0 poster-lines opacity-30" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-md border border-current/30 bg-black/25 px-3 py-2 text-sm">
                    <Zap size={16} aria-hidden="true" />
                    {typeLabel[event.type]}
                  </div>
                  <div className="mt-3 inline-flex rounded-md border border-ember-300/30 bg-ember-300/10 px-3 py-1 text-xs font-bold text-ember-100">
                    扰动等级：{chaosEventLevels[event.id] ?? "常见扰动"}
                  </div>
                  <h2 className="mt-4 text-3xl font-black text-white">{event.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{event.description}</p>
                </div>
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-current/25 bg-black/20">
                  <GitFork size={26} aria-hidden="true" />
                </div>
              </div>

              <div className="relative mt-6 rounded-lg border border-ember-300/30 bg-black/30 p-4 shadow-amber">
                <div className="flex flex-wrap gap-2">
                  {eventImpact[event.type].map((impact) => (
                    <span key={impact} className="rounded-md border border-white/10 bg-black/30 px-3 py-1 font-mono text-sm text-white">
                      {impact}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{event.marketImpact}</p>
              </div>

              <div className="relative mt-5 space-y-3">
                {event.options.map((option, optionIndex) => {
                  const active = responses[event.id] === option.id;
                  const tradeoff = responseTradeoffs[optionIndex % responseTradeoffs.length];
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => selectResponse(event.id, option.id)}
                      className={[
                        "w-full rounded-lg border p-4 text-left transition",
                        active
                          ? "border-ember-300/70 bg-ember-300/15 shadow-amber"
                          : "border-white/10 bg-slate-950/50 hover:border-reactor-cyan/40",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-white">{option.label}</span>
                        {active ? <Sparkles size={18} className="text-ember-300" aria-hidden="true" /> : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{option.description}</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <span className="rounded-md border border-reactor-green/20 bg-reactor-green/10 px-2 py-1 text-xs font-bold text-reactor-green">
                          获得：{tradeoff.gain}
                        </span>
                        <span className="rounded-md border border-fuchsia-300/20 bg-fuchsia-300/10 px-2 py-1 text-xs font-bold text-fuchsia-200">
                          代价：{tradeoff.cost}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              </motion.div>
            </motion.article>
          );
          })}
        </section>
        ) : currentEvent ? (
          <section className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950/65 px-4 py-3">
              <div>
                <p className="mt-1 text-sm text-slate-300">正在处理第 {currentEventIndex + 1} / {selectedEvents.length} 张事件卡</p>
              </div>
              <div className="rounded-md border border-ember-300/25 bg-ember-300/10 px-3 py-1 text-xs font-bold text-ember-100">
                逐张处理
              </div>
            </div>

            <motion.article
              key={currentEvent.id}
              initial={{ opacity: 0, rotateY: -82, y: 18 }}
              animate={{ opacity: 1, rotateY: 0, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`relative min-h-[520px] overflow-hidden rounded-lg border-2 p-5 backdrop-blur-md ${typeTone[currentEvent.type]}`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute inset-0 poster-lines opacity-30" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-md border border-current/30 bg-black/25 px-3 py-2 text-sm">
                    <Zap size={16} aria-hidden="true" />
                    {typeLabel[currentEvent.type]}
                  </div>
                  <div className="mt-3 inline-flex rounded-md border border-ember-300/30 bg-ember-300/10 px-3 py-1 text-xs font-bold text-ember-100">
                    扰动等级：{chaosEventLevels[currentEvent.id] ?? "常见扰动"}
                  </div>
                  <h2 className="mt-4 text-3xl font-black text-white">{currentEvent.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{currentEvent.description}</p>
                </div>
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-current/25 bg-black/20">
                  <GitFork size={26} aria-hidden="true" />
                </div>
              </div>

              <div className="relative mt-6 rounded-lg border border-ember-300/30 bg-black/30 p-4 shadow-amber">
                <div className="flex flex-wrap gap-2">
                  {eventImpact[currentEvent.type].map((impact) => (
                    <span key={impact} className="rounded-md border border-white/10 bg-black/30 px-3 py-1 font-mono text-sm text-white">
                      {impact}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{currentEvent.marketImpact}</p>
              </div>

              <div className="relative mt-5 space-y-3">
                {currentEvent.options.map((option, optionIndex) => {
                  const active = responses[currentEvent.id] === option.id;
                  const tradeoff = responseTradeoffs[optionIndex % responseTradeoffs.length];
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => selectResponse(currentEvent.id, option.id)}
                      className={[
                        "w-full rounded-lg border p-4 text-left transition",
                        active
                          ? "border-ember-300/70 bg-ember-300/15 shadow-amber"
                          : "border-white/10 bg-slate-950/50 hover:border-reactor-cyan/40",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-white">{option.label}</span>
                        {active ? <Sparkles size={18} className="text-ember-300" aria-hidden="true" /> : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{option.description}</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <span className="rounded-md border border-reactor-green/20 bg-reactor-green/10 px-2 py-1 text-xs font-bold text-reactor-green">
                          获得：{tradeoff.gain}
                        </span>
                        <span className="rounded-md border border-fuchsia-300/20 bg-fuchsia-300/10 px-2 py-1 text-xs font-bold text-fuchsia-200">
                          代价：{tradeoff.cost}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.article>

            <div className="mt-5 flex justify-end">
              {currentEventIndex < selectedEvents.length - 1 ? (
                <button
                  type="button"
                  disabled={!currentAnswered}
                  onClick={goNextEvent}
                  className={[
                    "inline-flex items-center gap-2 rounded-md border px-5 py-3 font-semibold transition",
                    currentAnswered
                      ? "border-ember-300/60 bg-ember-300 text-slate-950 shadow-amber hover:-translate-y-0.5"
                      : "cursor-not-allowed border-white/10 bg-white/10 text-slate-500",
                  ].join(" ")}
                >
                  <Sparkles size={18} aria-hidden="true" />
                  处理下一张
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={!ready || currentEventIndex < selectedEvents.length - 1}
            onClick={() => onContinue(selectedEvents)}
            className={[
              "inline-flex items-center gap-2 rounded-md border px-5 py-3 font-semibold transition",
              ready && currentEventIndex >= selectedEvents.length - 1
                ? "border-ember-300/60 bg-ember-300 text-slate-950 shadow-amber hover:-translate-y-0.5"
                : "cursor-not-allowed border-white/10 bg-white/10 text-slate-500",
            ].join(" ")}
          >
            <Sparkles size={18} aria-hidden="true" />
            进入上映模拟
          </button>
        </div>
      </div>
    </main>
  );
}

import { Fragment } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, FlaskConical, Play, Route, Sparkles, Trophy, Zap } from "lucide-react";

interface GameplayGuideProps {
  onBack: () => void;
  onStart: () => void;
  onGallery: () => void;
}

const steps = [
  {
    title: "完成电影设定",
    text: "在单屏实验台里选择市场来源、题材类型、上映档期、观看规格和资源投入。",
    icon: FlaskConical,
  },
  {
    title: "观察记忆样本",
    text: "市场记忆池会根据你的设定推荐历史动画样本，你可以保留或移除参照。",
    icon: Zap,
  },
  {
    title: "抽取混沌时刻",
    text: "启动后随机留下 4 张未知扰动卡，从中选择 2 张翻开并锁定。",
    icon: Sparkles,
  },
  {
    title: "读取市场反应炉",
    text: "反应炉会即时显示预热值、口碑值、扩散值和波动值的变化。",
    icon: Route,
  },
  {
    title: "生成电影命运",
    text: "设定和混沌事件都完成后，生成电影命运卡查看票房区间和市场解释。",
    icon: Trophy,
  },
];

export function GameplayGuide({ onBack, onStart, onGallery }: GameplayGuideProps) {
  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 text-white">
      <div className="absolute inset-0 lab-backdrop" />
      <div className="absolute inset-0 reactor-grid opacity-40" />
      <div className="film-strip left-4 top-0 rotate-[-8deg]" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-4xl"
        >
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-reactor-cyan/50 hover:text-reactor-cyan"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            返回首页
          </button>

          <h1 className="mt-8 text-4xl font-black text-amber-100 md:text-6xl">玩法说明</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            你会在一张单屏实验台里完成电影设定、筛选历史样本、抽取混沌事件，并生成一张电影命运卡。
          </p>
        </motion.div>

        <div className="grid gap-y-5 lg:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)_3rem_minmax(0,1fr)_3rem_minmax(0,1fr)_3rem_minmax(0,1fr)] lg:items-center">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <Fragment key={step.title}>
                <motion.article
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.36, delay: index * 0.06 }}
                  className="flex h-full min-h-[190px] flex-col rounded-[22px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_0_28px_rgba(34,211,238,0.08)] backdrop-blur-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-mono text-xs text-amber-200">0{index + 1}</div>
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-reactor-cyan/30 bg-reactor-cyan/10 text-reactor-cyan">
                      <Icon size={19} aria-hidden="true" />
                    </div>
                  </div>
                  <h2 className="mt-6 text-lg font-black text-slate-50">{step.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{step.text}</p>
                </motion.article>
                {index < steps.length - 1 ? (
                  <div className="grid place-items-center text-reactor-cyan/80">
                    <ArrowRight className="rotate-90 lg:rotate-0" size={28} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                ) : null}
              </Fragment>
            );
          })}
        </div>

        <div className="grid gap-4 rounded-[28px] border border-amber-300/20 bg-amber-300/[0.045] p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-xl font-black text-amber-100">结算时你会看到什么</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              电影命运卡会展示你的设定摘要、参与样本数量、已锁定的混沌事件、可能票房区间、策略指纹和一句市场命运判断。历史样本不是爆款公式，混沌事件才会改变市场路径。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center gap-2 rounded-md border border-ember-300/60 bg-ember-300 px-5 py-3 font-semibold text-slate-950 shadow-amber"
            >
              <Play size={18} aria-hidden="true" />
              开始实验
            </button>
            <button
              type="button"
              onClick={onGallery}
              className="inline-flex items-center gap-2 rounded-md border border-reactor-cyan/50 bg-reactor-cyan/10 px-5 py-3 font-semibold text-reactor-cyan shadow-cyan"
            >
              <Trophy size={18} aria-hidden="true" />
              样本库
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

import { motion } from "framer-motion";
import { BookOpen, FlaskConical, Trophy } from "lucide-react";
import { AlchemyReactor } from "./AlchemyReactor";

interface HomePageProps {
  onGallery: () => void;
  onGuide: () => void;
}

export function HomePage({ onGallery, onGuide }: HomePageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 text-white">
      <div className="absolute inset-0 lab-backdrop" />
      <div className="film-strip left-4 top-0 rotate-[-8deg]" />
      <div className="film-strip right-8 top-10 rotate-[10deg]" />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_420px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-reactor-cyan/30 bg-reactor-cyan/10 px-4 py-2 text-sm text-reactor-cyan">
            <FlaskConical size={16} aria-hidden="true" />
            2015-2025 动画电影市场实验
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-black leading-tight text-white md:text-7xl">
              《票房混沌炼成所》
            </h1>
            <p className="max-w-2xl text-xl text-ember-100 md:text-2xl">
              在市场反应炉里炼一部动画电影，看看它会被历史经验托起，还是被混沌浪潮改写命运。
            </p>
          </div>
          <p className="max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            你不是在套一张爆款公式，而是在调试一场上映实验。档期、题材、观看规格和资源投入会点亮反应炉，2015-2025 的动画电影样本会留下市场记忆；但最后冲进银幕的，还有 4 个无法提前驯服的混沌事件。
          </p>

          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onGuide}
              className="inline-flex items-center gap-2 rounded-md border border-ember-300/60 bg-ember-300 px-5 py-3 font-semibold text-slate-950 shadow-amber"
            >
              <BookOpen size={18} aria-hidden="true" />
              查看玩法并进入实验台
            </motion.button>
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGallery}
              className="inline-flex items-center gap-2 rounded-md border border-reactor-cyan/50 bg-reactor-cyan/10 px-5 py-3 font-semibold text-reactor-cyan shadow-cyan"
            >
              <Trophy size={18} aria-hidden="true" />
              查看 Top15 样本库
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="relative"
        >
          <div className="absolute -inset-8 rounded-full bg-reactor-cyan/10 blur-3xl" />
          <AlchemyReactor energy={0} stageLabel="预热待启动" compact />
        </motion.div>
      </section>
    </main>
  );
}

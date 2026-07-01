import { motion } from "framer-motion";
import { Clapperboard, Flame, Sparkles } from "lucide-react";
import { StatBar } from "./StatBar";
import type { PlayerRecipe } from "../types/movie";

interface AlchemyReactorProps {
  energy: number;
  recipe?: PlayerRecipe;
  stageLabel?: string;
  compact?: boolean;
}

export function AlchemyReactor({ energy, recipe, stageLabel, compact = false }: AlchemyReactorProps) {
  const completed = [
    recipe?.country,
    recipe?.genres?.length,
    recipe?.season,
    recipe?.formats?.length,
    recipe?.promotion,
  ].filter(Boolean).length;

  return (
    <div className="relative overflow-hidden rounded-lg border border-ember-300/25 bg-slate-950/70 p-5 shadow-amber backdrop-blur-md">
      <div className="absolute inset-0 reactor-grid opacity-45" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">票房反应炉</h3>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-md border border-ember-300/30 bg-ember-300/10 text-ember-200">
          <Flame size={20} aria-hidden="true" />
        </div>
      </div>

      <div className={compact ? "relative my-5 grid place-items-center" : "relative my-8 grid place-items-center"}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="absolute h-48 w-48 rounded-full border border-dashed border-reactor-cyan/40"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute h-36 w-36 rounded-full border border-dashed border-ember-300/40"
        />
        <motion.div
          animate={{
            boxShadow: [
              "0 0 25px rgba(49,232,255,0.24)",
              "0 0 50px rgba(255,178,56,0.4)",
              "0 0 25px rgba(49,232,255,0.24)",
            ],
            scale: [1, 1.04, 1],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="relative grid h-28 w-28 place-items-center rounded-full border border-white/20 bg-[radial-gradient(circle,#31e8ff_0%,#2778ff_34%,#0f172a_70%)]"
        >
          <Clapperboard className="text-white" size={34} aria-hidden="true" />
          <span className="absolute -bottom-8 flex items-center gap-1 text-xs text-ember-200">
            <Sparkles size={14} aria-hidden="true" />
            {stageLabel || `${completed}/5 原料已接入`}
          </span>
        </motion.div>
      </div>

      <div className="relative space-y-4">
        <StatBar label="票房能量槽" value={energy} tone="amber" />
        {recipe ? (
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-2">国别：{recipe.country || "未接入"}</span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-2">档期：{recipe.season || "未接入"}</span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-2">类型：{recipe.genres?.join("/") || "未接入"}</span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-2">制式：{recipe.formats?.join("/") || "未接入"}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

interface OptionCardProps {
  title: string;
  subtitle?: string;
  detail?: string;
  active: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  accent?: "amber" | "cyan" | "magenta" | "green";
  onClick: () => void;
}

const accentClass = {
  amber: "from-ember-400/25 to-ember-500/5 border-ember-300/60 shadow-amber",
  cyan: "from-reactor-cyan/20 to-reactor-blue/5 border-reactor-cyan/60 shadow-cyan",
  magenta: "from-reactor-magenta/20 to-reactor-blue/5 border-reactor-magenta/60 shadow-magenta",
  green: "from-reactor-green/20 to-reactor-cyan/5 border-reactor-green/60 shadow-cyan",
};

export function OptionCard({
  title,
  subtitle,
  detail,
  active,
  disabled = false,
  icon: Icon,
  accent = "amber",
  onClick,
}: OptionCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: -3, scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      disabled={disabled}
      onClick={onClick}
      className={[
        "group relative min-h-[112px] overflow-hidden rounded-lg border p-4 text-left transition",
        "bg-slate-950/60 text-slate-100 backdrop-blur-md",
        active
          ? `bg-gradient-to-br ${accentClass[accent]}`
          : "border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] hover:border-ember-300/40",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
      ].join(" ")}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <span className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-ember-300/10 blur-2xl transition group-hover:bg-reactor-cyan/20" />
      <span className="relative flex items-start gap-3">
        {Icon ? (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/10 bg-white/10 text-ember-300">
            <Icon size={20} aria-hidden="true" />
          </span>
        ) : null}
        <span className="min-w-0">
          <span className="block text-base font-semibold text-white">{title}</span>
          {subtitle ? <span className="mt-1 block text-sm text-ember-100/90">{subtitle}</span> : null}
          {detail ? <span className="mt-2 block text-xs leading-5 text-slate-300/80">{detail}</span> : null}
        </span>
      </span>
      {active ? (
        <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-ember-300 text-slate-950">
          <Check size={15} aria-hidden="true" />
        </span>
      ) : null}
    </motion.button>
  );
}

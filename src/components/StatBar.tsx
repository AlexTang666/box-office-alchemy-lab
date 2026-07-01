import { motion } from "framer-motion";

interface StatBarProps {
  label: string;
  value: number;
  hint?: string;
  tone?: "amber" | "cyan" | "magenta" | "green";
}

const toneClass = {
  amber: "from-ember-500 via-ember-300 to-yellow-100",
  cyan: "from-reactor-blue via-reactor-cyan to-white",
  magenta: "from-reactor-magenta via-fuchsia-300 to-white",
  green: "from-emerald-500 via-reactor-green to-white",
};

export function StatBar({ label, value, hint, tone = "amber" }: StatBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-200">{label}</span>
        <span className="font-mono text-ember-200">{Math.round(safeValue)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-slate-950/80">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${toneClass[tone]} shadow-[0_0_18px_rgba(255,178,56,0.35)]`}
        />
      </div>
      {hint ? <p className="text-xs leading-5 text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function GaugeRing({
  value,
  label,
  tone = "cyan",
}: {
  value: number;
  label: string;
  tone?: "amber" | "cyan" | "magenta" | "green";
}) {
  const safeValue = Math.max(0, Math.min(100, value));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const stroke = circumference * (1 - safeValue / 100);
  const strokeColor = tone === "amber" ? "#ffb238" : tone === "magenta" ? "#ff4fd8" : tone === "green" ? "#66f6a5" : "#31e8ff";

  return (
    <div className="relative grid h-32 w-32 place-items-center">
      <svg className="-rotate-90" width="124" height="124" viewBox="0 0 124 124" aria-hidden="true">
        <circle cx="62" cy="62" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
        <motion.circle
          cx="62"
          cy="62"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: stroke }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-2xl font-semibold text-white">{Math.round(safeValue)}%</div>
        <div className="mt-1 max-w-[96px] text-xs text-slate-300">{label}</div>
      </div>
    </div>
  );
}

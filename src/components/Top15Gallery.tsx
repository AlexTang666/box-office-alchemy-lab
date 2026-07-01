import { motion } from "framer-motion";
import { ArrowLeft, FlaskConical, Sparkles } from "lucide-react";
import { formatBillionYuan, formatCount } from "../lib/data";
import type { MovieRecord } from "../types/movie";

interface Top15GalleryProps {
  top15: MovieRecord[];
  onBack: () => void;
  onStart: () => void;
}

const rankTone = {
  1: "border-amber-200/90 bg-amber-300/[0.16] text-amber-100 shadow-[0_0_28px_rgba(251,191,36,0.28)]",
  2: "border-slate-100/80 bg-slate-100/[0.14] text-slate-50 shadow-[0_0_24px_rgba(226,232,240,0.2)]",
  3: "border-orange-300/85 bg-orange-400/[0.14] text-orange-100 shadow-[0_0_24px_rgba(251,146,60,0.22)]",
};

const rankBadgeTone = {
  1: "border-amber-200/80 bg-amber-300/20 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.28)]",
  2: "border-slate-100/70 bg-slate-100/18 text-slate-50 shadow-[0_0_14px_rgba(226,232,240,0.22)]",
  3: "border-orange-200/75 bg-orange-400/18 text-orange-100 shadow-[0_0_14px_rgba(251,146,60,0.24)]",
};

const influenceTone: Record<string, string> = {
  抬高上限: "text-amber-100",
  传播型样本: "text-cyan-100",
  稳基础盘: "text-emerald-100",
  档期参照: "text-violet-100",
  历史参照: "text-slate-200",
};

export function Top15Gallery({ top15, onBack, onStart }: Top15GalleryProps) {
  const samples = top15.slice(0, 15);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#030612] px-5 py-5 text-white">
      <div className="absolute inset-0 lab-backdrop" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_46%,rgba(0,0,0,0.54)_100%)]" />

      <section className="relative z-10 flex aspect-video w-full max-w-7xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/78 p-5 shadow-[0_0_60px_rgba(0,0,0,0.42)] backdrop-blur-md">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-cyan-200/35 hover:text-cyan-100"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              返回
            </button>
            <div className="flex min-w-0 items-center gap-3">
              <FlaskConical className="h-6 w-6 shrink-0 text-amber-200" aria-hidden="true" />
              <h1 className="truncate text-2xl font-black text-amber-100 md:text-3xl">历史高票房样本库</h1>
            </div>
            <p className="mt-1 max-w-3xl truncate text-sm text-slate-400">
              15 个市场记忆样本，按市场、题材、档期、制式和样本作用接入实验台。
            </p>
          </div>
          <button
            type="button"
            onClick={onStart}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-amber-200/60 bg-amber-200 px-4 text-sm font-black text-slate-950 shadow-[0_0_22px_rgba(251,191,36,0.22)] transition hover:bg-amber-100"
          >
            <Sparkles size={16} aria-hidden="true" />
            进入混沌实验
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-5 grid-rows-3 gap-4 pt-4">
          {samples.map((movie, index) => {
            const rank = movie.rank ?? index + 1;
            const tone = rankTone[rank as 1 | 2 | 3] ?? "border-white/10 bg-white/[0.045] text-slate-100";
            const badgeTone = rankBadgeTone[rank as 1 | 2 | 3] ?? "border-white/10 bg-black/30 text-current/80";
            const genre = getGenreFocus(movie);
            const format = getFormatFocus(movie);
            const influences = getInfluenceTags(movie, rank);

            return (
              <motion.article
                key={movie.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.025, duration: 0.25 }}
                whileHover={{ y: -3 }}
                className={`group relative min-h-0 overflow-hidden rounded-lg border px-3 pb-4 pt-3 backdrop-blur-md ${tone}`}
              >
                <div className="absolute inset-0 poster-lines opacity-20" />
                <div className="pointer-events-none absolute inset-0 bg-slate-950/0 transition duration-200 group-hover:bg-slate-950/42" />
                <div className="relative flex h-full min-h-0 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start gap-2">
                        <h2 className="line-clamp-2 min-w-0 flex-1 text-[15px] font-black leading-tight text-white">{movie.name}</h2>
                        <div className="shrink-0 pt-0.5 text-right text-[12px] font-black leading-tight text-amber-100">
                          {formatBillionYuan(movie.boxOffice)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] leading-4">
                    <SampleField label="市场" value={movie.countryGroup || movie.country || "未知"} />
                    <SampleField label="题材" value={genre} />
                    <SampleField label="制式" value={format} className="col-span-2" valueClassName="line-clamp-2 whitespace-normal break-words" />
                    <SampleField label="档期" value={movie.season || "未知档期"} />
                  </div>

                  <div className="mt-2 pb-1 pr-16 text-[11px] font-bold">
                    {influences.map((tag) => (
                      <span key={tag} className={influenceTone[tag] ?? influenceTone.历史参照}>
                        {tag}
                        {tag === influences[influences.length - 1] ? "" : " / "}
                      </span>
                    ))}
                  </div>
                  <div className={`absolute bottom-1 right-1 rounded-md border px-2.5 py-1.5 font-mono text-xs font-black ${badgeTone}`}>
                    RANK {rank}
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 rounded-md border border-cyan-200/32 bg-slate-900 p-2 text-[11px] leading-5 text-slate-200 opacity-0 shadow-[0_0_24px_rgba(34,211,238,0.2)] transition group-hover:translate-y-0 group-hover:opacity-100">
                  <div>首周：{formatBillionYuan(movie.firstWeekBoxOffice)}</div>
                  <div>想看：{formatCount(movie.wantToSee)} · 评分：{movie.maoyanScore ? movie.maoyanScore.toFixed(1) : "暂无"}</div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function SampleField({ label, value, className = "", valueClassName = "truncate" }: { label: string; value: string; className?: string; valueClassName?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="text-[10px] font-bold text-slate-500">{label}</div>
      <div className={`font-bold text-slate-100 ${valueClassName}`}>{value}</div>
    </div>
  );
}

function getGenreFocus(movie: MovieRecord) {
  const genres = movie.genres.filter((genre) => genre && genre !== "动画").slice(0, 3);
  return genres.length ? genres.join("/") : movie.mainGenre || "类型待定";
}

function getFormatFocus(movie: MovieRecord) {
  const formats = movie.formats.length ? movie.formats : movie.format.split("/");
  const normalizedFormats = formats.map((format) => format.trim()).filter(Boolean);
  return normalizedFormats.length ? Array.from(new Set(normalizedFormats)).join(" / ") : "常规";
}

function getInfluenceTags(movie: MovieRecord, rank: number) {
  const tags: string[] = [];
  const genreText = [movie.fullGenre, ...movie.genres].join("/");

  if (rank <= 5 || movie.boxOffice >= 2_000_000_000) tags.push("抬高上限");
  if (movie.wantToSee >= 100_000 || movie.firstWeekBoxOffice >= 500_000_000) tags.push("传播型样本");
  if (["喜剧", "家庭", "儿童", "动物", "治愈"].some((keyword) => genreText.includes(keyword))) tags.push("稳基础盘");
  if (["春节档", "暑期档", "国庆档"].some((keyword) => movie.season.includes(keyword))) tags.push("档期参照");

  return Array.from(new Set(tags.length ? tags : ["历史参照"])).slice(0, 2);
}

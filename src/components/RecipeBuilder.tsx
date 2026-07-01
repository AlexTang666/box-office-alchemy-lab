import { motion } from "framer-motion";
import {
  BadgeJapaneseYen,
  Building2,
  CalendarDays,
  Castle,
  Clapperboard,
  Compass,
  Drama,
  Film,
  Flag,
  Gem,
  Heart,
  History,
  Home,
  Laugh,
  Megaphone,
  Music,
  Rocket,
  Sparkles,
  Swords,
  Telescope,
  WandSparkles,
} from "lucide-react";
import { AlchemyReactor } from "./AlchemyReactor";
import { OptionCard } from "./OptionCard";
import type { CountryChoice, FormatChoice, PlayerRecipe, PromotionChoice, SeasonChoice } from "../types/movie";

interface RecipeBuilderProps {
  recipe: PlayerRecipe;
  onRecipeChange: (recipe: PlayerRecipe) => void;
  onStart: () => void;
  onHome: () => void;
}

const countries: Array<{
  value: CountryChoice;
  title: string;
  subtitle: string;
  accent: "amber" | "cyan" | "magenta" | "green";
}> = [
  { value: "中国", title: "赤金创作语境", subtitle: "中国", accent: "amber" },
  { value: "美国", title: "星蓝工业语境", subtitle: "美国", accent: "cyan" },
  { value: "日本", title: "樱粉电波语境", subtitle: "日本", accent: "magenta" },
  { value: "其他", title: "银灰混合语境", subtitle: "其他", accent: "green" },
];

const genres = [
  { value: "喜剧", title: "笑声基因", icon: Laugh },
  { value: "冒险", title: "远征基因", icon: Compass },
  { value: "奇幻", title: "星月基因", icon: WandSparkles },
  { value: "动作", title: "爆裂基因", icon: Swords },
  { value: "历史", title: "卷轴基因", icon: History },
  { value: "科幻", title: "电路基因", icon: Rocket },
  { value: "音乐", title: "音波基因", icon: Music },
  { value: "剧情", title: "心绪基因", icon: Drama },
  { value: "神话", title: "神火基因", icon: Castle },
  { value: "家庭", title: "暖光基因", icon: Home },
];

const seasons: Array<{ value: SeasonChoice; detail: string; icon: typeof CalendarDays }> = [
  { value: "春节档", icon: CalendarDays, detail: "家庭观影需求较强，但竞争和情绪变量也会被放大。" },
  { value: "暑期档", icon: CalendarDays, detail: "青少年与家庭观影更活跃，冒险、奇幻内容常形成更高扰动。" },
  { value: "国庆档", icon: CalendarDays, detail: "国产、历史、家庭向内容可能获得语境加成，但结果并不线性。" },
  { value: "年末档", icon: CalendarDays, detail: "海外动画、IP 内容、粉丝预热可能更显著，也可能被同档竞争稀释。" },
  { value: "普通档", icon: CalendarDays, detail: "竞争压力较低，但基础流量和传播扩散具有更高不确定性。" },
];

const formats: Array<{ value: FormatChoice; title: string; icon: typeof Film }> = [
  { value: "2D", title: "平面观看规格", icon: Film },
  { value: "3D", title: "立体观看规格", icon: Telescope },
  { value: "IMAX", title: "巨幅观看规格", icon: Gem },
  { value: "中国巨幕", title: "中国巨幕规格", icon: Clapperboard },
];

const promotions: Array<{ value: PromotionChoice; title: string; detail: string; icon: typeof Megaphone }> = [
  { value: "低成本口碑", title: "低成本口碑", icon: Heart, detail: "强调口碑扩散，但高评分不自动等于高票房。" },
  { value: "粉丝预热", title: "粉丝预热", icon: Sparkles, detail: "强调上映前热度，但想看数不必然转化为大众市场。" },
  { value: "大规模宣发", title: "大规模宣发", icon: Megaphone, detail: "强调首映声量，但后续走势仍受口碑与档期扰动影响。" },
  { value: "IP 续作加持", title: "IP 续作加持", icon: BadgeJapaneseYen, detail: "强调初始识别度，但系列优势也可能带来预期压力。" },
];

function progressForRecipe(recipe: PlayerRecipe) {
  const checks = [recipe.country, recipe.genres.length > 0, recipe.season, recipe.formats.length > 0, recipe.promotion];
  return (checks.filter(Boolean).length / checks.length) * 100;
}

function embryoTitle(recipe: PlayerRecipe) {
  if (recipe.genres.includes("神话") || recipe.genres.includes("奇幻")) {
    if (recipe.country === "中国") return "《云海神灯》";
    if (recipe.country === "日本") return "《月光列车》";
    return "《星之邮差》";
  }
  if (recipe.genres.includes("科幻")) return "《机械月亮》";
  if (recipe.genres.includes("历史") || recipe.genres.includes("剧情")) return "《少年与古城》";
  if (recipe.genres.includes("喜剧") || recipe.genres.includes("冒险")) return "《奇妙小队》";
  return recipe.country ? `《${recipe.country}动画实验体》` : "《未命名动画胚体》";
}

function tendencyTags(recipe: PlayerRecipe) {
  const tags: string[] = [];
  const hasAny = (items: string[]) => items.some((item) => recipe.genres.includes(item));

  if (recipe.season === "春节档" && hasAny(["家庭", "喜剧"])) tags.push("合家欢高预热");
  if (hasAny(["奇幻", "神话"]) && (recipe.promotion === "粉丝预热" || recipe.promotion === "大规模宣发")) {
    tags.push("破圈潜力");
  }
  if (hasAny(["历史", "剧情"])) tags.push("口碑长尾");
  if (recipe.formats.includes("IMAX") || recipe.formats.includes("中国巨幕")) tags.push("强观看规格");

  return tags.length > 0 ? tags.slice(0, 3) : ["等待基因注入"];
}

function fieldValue(value: string | string[], fallback = "未选择") {
  if (Array.isArray(value)) return value.length > 0 ? value.join(" / ") : fallback;
  return value || fallback;
}

export function RecipeBuilder({ recipe, onRecipeChange, onStart, onHome }: RecipeBuilderProps) {
  const ready = Boolean(
    recipe.country && recipe.genres.length > 0 && recipe.season && recipe.formats.length > 0 && recipe.promotion,
  );

  const toggleGenre = (genre: string) => {
    const selected = recipe.genres.includes(genre);
    const nextGenres = selected
      ? recipe.genres.filter((item) => item !== genre)
      : recipe.genres.length < 3
        ? [...recipe.genres, genre]
        : recipe.genres;
    onRecipeChange({ ...recipe, genres: nextGenres });
  };

  const toggleFormat = (format: FormatChoice) => {
    const nextFormats = recipe.formats.includes(format)
      ? recipe.formats.filter((item) => item !== format)
      : [...recipe.formats, format];
    onRecipeChange({ ...recipe, formats: nextFormats });
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 text-white">
      <div className="absolute inset-0 lab-backdrop" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={onHome}
              className="mb-3 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-200 transition hover:border-reactor-cyan/40"
            >
              <Flag size={15} aria-hidden="true" />
              返回入口
            </button>
            <h1 className="text-3xl font-black md:text-5xl">组合你的电影基因</h1>
          </div>
          <button
            type="button"
            disabled={!ready}
            onClick={onStart}
            className={[
              "inline-flex items-center gap-2 rounded-md border px-5 py-3 font-semibold transition",
              ready
                ? "border-ember-300/60 bg-ember-300 text-slate-950 shadow-amber hover:-translate-y-0.5"
                : "cursor-not-allowed border-white/10 bg-white/10 text-slate-500",
            ].join(" ")}
          >
            <Sparkles size={18} aria-hidden="true" />
            进入混沌实验
          </button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-10">
            <section>
              <SectionTitle index="01" title="生产语境" hint="选择影片进入市场时携带的文化与工业背景。" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {countries.map((country, index) => (
                  <OptionCard
                    key={country.value}
                    title={country.title}
                    subtitle={country.subtitle}
                    active={recipe.country === country.value}
                    accent={country.accent}
                    icon={[Castle, Building2, Sparkles, Gem][index]}
                    onClick={() => onRecipeChange({ ...recipe, country: country.value })}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionTitle index="02" title="内容基因" hint="可选择 1 到 3 个内容基因，观察它们在市场扰动中的变化。" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {genres.map((genre) => (
                  <OptionCard
                    key={genre.value}
                    title={genre.title}
                    subtitle={genre.value}
                    active={recipe.genres.includes(genre.value)}
                    disabled={!recipe.genres.includes(genre.value) && recipe.genres.length >= 3}
                    accent="magenta"
                    icon={genre.icon}
                    onClick={() => toggleGenre(genre.value)}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionTitle index="03" title="市场时机" hint="档期不是确定答案，只是市场温度和竞争压力的一部分。" />
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {seasons.map((season) => (
                  <OptionCard
                    key={season.value}
                    title={season.value}
                    detail={season.detail}
                    active={recipe.season === season.value}
                    accent="cyan"
                    icon={season.icon}
                    onClick={() => onRecipeChange({ ...recipe, season: season.value })}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionTitle index="04" title="观看规格" hint="制式会改变观看体验，但不能单独决定市场结果。" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {formats.map((format) => (
                  <OptionCard
                    key={format.value}
                    title={format.title}
                    subtitle={format.value}
                    active={recipe.formats.includes(format.value)}
                    accent="green"
                    icon={format.icon}
                    onClick={() => toggleFormat(format.value)}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionTitle index="05" title="传播策略" hint="宣发会改变信息扩散路径，但无法消除市场的不确定性。" />
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {promotions.map((promotion) => (
                  <OptionCard
                    key={promotion.value}
                    title={promotion.title}
                    detail={promotion.detail}
                    active={recipe.promotion === promotion.value}
                    accent="amber"
                    icon={promotion.icon}
                    onClick={() => onRecipeChange({ ...recipe, promotion: promotion.value })}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <AlchemyReactor energy={progressForRecipe(recipe)} recipe={recipe} />
            <MovieEmbryoCard recipe={recipe} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function MovieEmbryoCard({ recipe }: { recipe: PlayerRecipe }) {
  const tags = tendencyTags(recipe);

  return (
    <motion.article
      className="relative overflow-hidden rounded-2xl border border-ember-300/25 bg-slate-950/78 p-5 shadow-[0_0_30px_rgba(245,158,11,0.12)] backdrop-blur-md"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="absolute inset-0 poster-lines opacity-25" />
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-ember-300/10 blur-3xl" />

      <div className="relative">
        <h3 className="text-2xl font-black text-white">正在炼成的电影</h3>
        <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs text-slate-500">暂定片名</p>
          <p className="mt-1 break-keep text-2xl font-black text-ember-100">{embryoTitle(recipe)}</p>
        </div>

        <div className="mt-4 grid gap-2 text-sm">
          <EmbryoField label="生产语境" value={fieldValue(recipe.country)} />
          <EmbryoField label="内容基因" value={fieldValue(recipe.genres)} />
          <EmbryoField label="市场时机" value={fieldValue(recipe.season)} />
          <EmbryoField label="观看规格" value={fieldValue(recipe.formats)} />
        </div>

        <div className="mt-4">
          <p className="text-xs text-slate-500">当前倾向标签</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-md border border-reactor-cyan/25 bg-reactor-cyan/10 px-3 py-1 text-xs font-bold text-cyan-100">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function EmbryoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-100">{value}</span>
    </div>
  );
}

function SectionTitle({ index, title, hint }: { index: string; title: string; hint: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-3">
      <div>
        <div className="font-mono text-sm text-ember-300">{index}</div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <p className="max-w-xl text-sm text-slate-400">{hint}</p>
    </div>
  );
}

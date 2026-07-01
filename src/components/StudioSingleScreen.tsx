import { motion } from "framer-motion";
import {
  Box,
  Cat,
  Check,
  ChevronRight,
  Clapperboard,
  Compass,
  Film,
  Flame,
  FlaskConical,
  Flower,
  Footprints,
  Globe2,
  HeartHandshake,
  Info,
  Landmark,
  Maximize,
  MemoryStick,
  MessageCircle,
  Monitor,
  Music,
  Network,
  Play,
  RectangleHorizontal,
  RefreshCcw,
  Rocket,
  Search,
  Send,
  Shield,
  Smile,
  Sparkles,
  Sword,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadGameData, type GameData } from "../lib/data";
import { matchStudioSamples } from "../lib/sampleMatcher";
import { generateStudioMovieName } from "../lib/studioNameGenerator";
import { calculateStudioOutcome } from "../lib/studioOutcome";
import type { PlayerRecipe } from "../types/movie";
import { AlchemySimulator } from "./AlchemySimulator";
import { StudioResultSummary } from "./StudioResultSummary";

const studioSettings = [
  {
    key: "market",
    title: "市场来源",
    drawerTitle: "选择市场来源",
    defaultId: "china",
    options: [
      { id: "china", label: "中国动画", description: "本土情绪更强" },
      { id: "japan", label: "日本动画", description: "类型风格成熟" },
      { id: "western", label: "欧美动画", description: "工业体系完整" },
      { id: "global", label: "全球合拍", description: "跨市场传播" },
    ],
  },
  {
    key: "genre",
    title: "题材类型",
    drawerTitle: "选择题材类型",
    defaultId: "adventure",
    options: [
      { id: "adventure", label: "冒险", description: "成长与探索" },
      { id: "comedy", label: "喜剧", description: "全年龄传播" },
      { id: "fantasy", label: "奇幻", description: "想象力驱动" },
      { id: "hero", label: "动作", description: "英雄爽感与动作驱动" },
      { id: "sci-fi", label: "科幻", description: "视觉冲击强" },
      { id: "myth", label: "神话", description: "神话、玄幻与强世界观" },
      { id: "family", label: "家庭", description: "儿童友好与家庭观影" },
      { id: "music", label: "音乐", description: "音乐、歌舞与情绪感染" },
      { id: "mystery", label: "侦探", description: "悬疑推理与剧情驱动" },
      { id: "animal", label: "动物", description: "动物角色与亲和力" },
      { id: "healing", label: "治愈", description: "亲情温度与口碑长尾" },
      { id: "youth", label: "成长", description: "青春、少年与成长共鸣" },
    ],
  },
  {
    key: "season",
    title: "上映档期",
    drawerTitle: "选择上映档期",
    defaultId: "summer",
    flyoutAlign: "middle",
    options: [
      { id: "spring", label: "春节档", description: "亲子观影集中" },
      { id: "summer", label: "暑期档", description: "年轻观众活跃" },
      { id: "national", label: "国庆档", description: "合家欢需求高" },
      { id: "year-end", label: "年末档", description: "节日情绪更强" },
      { id: "regular", label: "普通档", description: "竞争压力较低" },
    ],
  },
  {
    key: "format",
    title: "观看规格",
    drawerTitle: "选择观看规格",
    defaultId: "imax",
    flyoutAlign: "middle",
    options: [
      { id: "2d", label: "普通 2D", description: "覆盖观众更广" },
      { id: "3d", label: "3D", description: "增强视觉体验" },
      { id: "imax", label: "IMAX", description: "强化视听奇观" },
      { id: "china-giant", label: "中国巨幕", description: "放大影院沉浸感" },
    ],
  },
  {
    key: "resource",
    title: "资源投入",
    drawerTitle: "选择资源投入",
    defaultId: "word-of-mouth",
    flyoutAlign: "middle",
    options: [
      { id: "preheat", label: "宣发预热", description: "提高首周关注" },
      { id: "word-of-mouth", label: "口碑维护", description: "利于长线发酵" },
      { id: "community", label: "社群扩散", description: "更容易破圈" },
      { id: "risk-control", label: "风险控制", description: "降低市场波动" },
    ],
  },
];

const marketNodeIcon: Record<string, LucideIcon> = {
  china: Landmark,
  japan: Flower,
  western: Film,
  global: Globe2,
};

const genreNodeIcon: Record<string, LucideIcon> = {
  adventure: Compass,
  comedy: Smile,
  fantasy: Sparkles,
  hero: Sword,
  "sci-fi": Rocket,
  myth: Flame,
  family: Users,
  music: Music,
  mystery: Search,
  animal: Cat,
  healing: HeartHandshake,
  youth: Footprints,
};

const formatNodeIcon: Record<string, LucideIcon> = {
  "2d": Monitor,
  "3d": Box,
  imax: RectangleHorizontal,
  "china-giant": Maximize,
};

const resourceNodeIcon: Record<string, LucideIcon> = {
  preheat: Send,
  "word-of-mouth": MessageCircle,
  community: Network,
  "risk-control": Shield,
};

const chaosEvents = [
  // 正向事件
  {
    id: "short-video-remix",
    title: "短视频二创扩散",
    type: "正向",
    description: "观众自发剪辑传播",
    impactText: "扩散值上升，票房上限提高",
    effects: { heat: 8, reputation: 2, spread: 16, volatility: 6 },
  },
  {
    id: "meme-boom",
    title: "表情包二创爆发",
    type: "正向",
    description: "角色表情被大量传播",
    impactText: "年轻观众关注增加",
    effects: { heat: 10, reputation: 0, spread: 14, volatility: 5 },
  },
  {
    id: "character-line-viral",
    title: "角色台词出圈",
    type: "正向",
    description: "角色梗被大量引用",
    impactText: "热度上升，讨论度增强",
    effects: { heat: 12, reputation: 2, spread: 12, volatility: 4 },
  },
  {
    id: "parent-word-of-mouth",
    title: "亲子口碑发酵",
    type: "正向",
    description: "家庭观众持续推荐",
    impactText: "口碑值上升，长线走势增强",
    effects: { heat: 4, reputation: 15, spread: 8, volatility: -5 },
  },
  {
    id: "ip-nostalgia",
    title: "IP 情怀爆发",
    type: "正向",
    description: "老观众情绪被唤起",
    impactText: "首周关注提高，核心受众增强",
    effects: { heat: 14, reputation: 6, spread: 7, volatility: 3 },
  },
  {
    id: "theme-song-viral",
    title: "主题曲意外出圈",
    type: "正向",
    description: "音乐片段在平台传播",
    impactText: "预热值和扩散值上升",
    effects: { heat: 11, reputation: 5, spread: 13, volatility: 4 },
  },
  {
    id: "award-nomination",
    title: "海外奖项提名",
    type: "正向",
    description: "国际评价带来关注",
    impactText: "口碑值上升，讨论度增强",
    effects: { heat: 7, reputation: 14, spread: 6, volatility: -3 },
  },

  // 负向事件
  {
    id: "blockbuster-pressure",
    title: "同档期大片挤压",
    type: "负向",
    description: "强竞争片抢占排片",
    impactText: "曝光下降，票房下限降低",
    effects: { heat: -8, reputation: 0, spread: -6, volatility: 12 },
  },
  {
    id: "word-of-mouth-backfire",
    title: "口碑反噬",
    type: "负向",
    description: "预期过高导致评价回落",
    impactText: "口碑值下降，波动值上升",
    effects: { heat: -3, reputation: -16, spread: -4, volatility: 15 },
  },
  {
    id: "opening-week-screening-low",
    title: "首周排片不足",
    type: "负向",
    description: "影院初期排片偏少",
    impactText: "首周爆发力下降",
    effects: { heat: -10, reputation: 0, spread: -8, volatility: 8 },
  },
  {
    id: "social-controversy",
    title: "社交争议发酵",
    type: "负向",
    description: "争议压过作品本身",
    impactText: "热度上升，但口碑风险增加",
    effects: { heat: 10, reputation: -12, spread: 6, volatility: 18 },
  },
  {
    id: "split-premiere-reviews",
    title: "首映评价分裂",
    type: "负向",
    description: "观众评价两极化",
    impactText: "口碑下降，市场波动加大",
    effects: { heat: 2, reputation: -10, spread: 3, volatility: 14 },
  },
  {
    id: "marketing-mistiming",
    title: "宣发节奏失误",
    type: "负向",
    description: "上映前关注没有转化",
    impactText: "预热值下降，首周潜力降低",
    effects: { heat: -14, reputation: -2, spread: -5, volatility: 9 },
  },
  {
    id: "competitor-date-shift",
    title: "竞品临时提档",
    type: "负向",
    description: "同类影片突然加入竞争",
    impactText: "曝光被分流，结果更不稳定",
    effects: { heat: -7, reputation: 0, spread: -7, volatility: 13 },
  },

  // 双刃剑事件
  {
    id: "over-marketing",
    title: "营销过度曝光",
    type: "双刃剑",
    description: "声量很高但期待被抬高",
    impactText: "预热上升，口碑风险增加",
    effects: { heat: 16, reputation: -7, spread: 6, volatility: 13 },
  },
  {
    id: "niche-fandom",
    title: "小众圈层狂热",
    type: "双刃剑",
    description: "特定观众高度认同",
    impactText: "扩散增强，大众覆盖有限",
    effects: { heat: 5, reputation: 8, spread: 12, volatility: 9 },
  },
  {
    id: "overseas-reverse-buzz",
    title: "海外评价反向带动",
    type: "双刃剑",
    description: "海外口碑影响国内讨论",
    impactText: "传播路径改变，结果波动增加",
    effects: { heat: 8, reputation: 7, spread: 9, volatility: 10 },
  },
  {
    id: "schedule-emotion-mismatch",
    title: "档期情绪错位",
    type: "双刃剑",
    description: "影片气质与观影情绪不完全匹配",
    impactText: "基本盘下降，但可能形成长尾",
    effects: { heat: -4, reputation: 6, spread: -2, volatility: 11 },
  },
  {
    id: "fan-review-control",
    title: "粉丝过度控评",
    type: "双刃剑",
    description: "高热度带来反感讨论",
    impactText: "预热上升，口碑波动增加",
    effects: { heat: 12, reputation: -6, spread: 5, volatility: 15 },
  },
  {
    id: "platform-algorithm-push",
    title: "平台算法推荐",
    type: "双刃剑",
    description: "内容被平台持续推送",
    impactText: "扩散值上升，但结果更不稳定",
    effects: { heat: 9, reputation: 1, spread: 15, volatility: 12 },
  },
];

type StudioChaosPhase = "idle" | "rolling" | "revealing" | "locked";

interface StudioPersistedState {
  selectedOptions: Record<string, string | null>;
  selectedGenreIds: string[];
  removedSampleIds: string[];
  chaosPhase: StudioChaosPhase;
  candidateChaosEvents: typeof chaosEvents;
  selectedChaosEventIds: string[];
}

const studioStateStorageKey = "box-office-chaos-studio-state";
const validGenreIds = new Set(studioSettings[1].options.map((option) => option.id));

function defaultStudioOptions() {
  return Object.fromEntries(studioSettings.map((setting) => [setting.key, null]));
}

function readStudioState(): Partial<StudioPersistedState> {
  if (typeof window === "undefined") return {};

  try {
    const rawState = window.sessionStorage.getItem(studioStateStorageKey);
    return rawState ? JSON.parse(rawState) : {};
  } catch {
    return {};
  }
}

interface StudioSingleScreenProps {
  initialResultMode?: boolean;
  initialSimulationMode?: boolean;
}

export function StudioSingleScreen({ initialResultMode = false, initialSimulationMode = false }: StudioSingleScreenProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | null>>(() => readStudioState().selectedOptions ?? defaultStudioOptions());
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>(() => (readStudioState().selectedGenreIds ?? []).filter((genreId) => validGenreIds.has(genreId)));
  const [openSettingKey, setOpenSettingKey] = useState<string | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [removedSampleIds, setRemovedSampleIds] = useState<Set<string>>(() => new Set(readStudioState().removedSampleIds ?? []));
  const [chaosPhase, setChaosPhase] = useState<StudioChaosPhase>(() => readStudioState().chaosPhase ?? "idle");
  const [candidateChaosEvents, setCandidateChaosEvents] = useState<typeof chaosEvents>(() => readStudioState().candidateChaosEvents ?? []);
  const [selectedChaosEventIds, setSelectedChaosEventIds] = useState<string[]>(() => readStudioState().selectedChaosEventIds ?? []);
  const [showStudioResult, setShowStudioResult] = useState(initialResultMode);
  const [showStudioSimulation, setShowStudioSimulation] = useState(initialSimulationMode);
  const [sampleFeedback, setSampleFeedback] = useState<string | null>(null);
  const settingsFlyoutRef = useRef<HTMLDivElement | null>(null);

  const selectedFor = (setting: (typeof studioSettings)[number]) =>
    setting.options.find((option) => option.id === selectedOptions[setting.key]) ?? null;
  const selectedGenreOptions = selectedGenreIds
    .map((genreId) => studioSettings[1].options.find((option) => option.id === genreId))
    .filter((option): option is (typeof studioSettings)[1]["options"][number] => Boolean(option));
  const selectedMarket = selectedFor(studioSettings[0]);
  const selectedSeason = selectedFor(studioSettings[2]);
  const selectedFormat = selectedFor(studioSettings[3]);
  const selectedResource = selectedFor(studioSettings[4]);
  const settingsComplete =
    Boolean(selectedMarket && selectedSeason && selectedFormat && selectedResource) && selectedGenreIds.length > 0;
  const selectedPreview = [
    selectedMarket?.label,
    selectedGenreOptions.length ? selectedGenreOptions.map((genre) => genre.label).join("/") : null,
    selectedResource?.label,
  ].filter(Boolean).join(" · ");
  const selectedInputCount = [
    selectedMarket,
    selectedGenreOptions.length ? selectedGenreOptions : null,
    selectedSeason,
    selectedFormat,
    selectedResource,
  ].filter(Boolean).length;
  const primaryGenre = selectedGenreOptions[0];
  const reactorNodes: Array<{
    key: string;
    title: string;
    Icons: LucideIcon[];
    className: string;
    position: string;
  }> = [
    {
      key: "market",
      title: selectedMarket ? `市场来源：${selectedMarket.label}` : "市场来源待定",
      Icons: selectedOptions.market && marketNodeIcon[selectedOptions.market] ? [marketNodeIcon[selectedOptions.market]] : [],
      className: selectedMarket
        ? "border-amber-200/35 bg-amber-200/[0.1] text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.16)]"
        : "border-white/10 bg-white/[0.035] text-slate-500",
      position: "left-0 top-0",
    },
    {
      key: "genre",
      title: primaryGenre ? `主题材：${primaryGenre.label}` : "主题材待定",
      Icons: primaryGenre && genreNodeIcon[primaryGenre.id] ? [genreNodeIcon[primaryGenre.id]] : [],
      className: primaryGenre
        ? "border-cyan-200/35 bg-cyan-200/[0.1] text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.16)]"
        : "border-white/10 bg-white/[0.035] text-slate-500",
      position: "right-0 top-0",
    },
    {
      key: "format",
      title: selectedFormat ? `观看规格：${selectedFormat.label}` : "观看规格待定",
      Icons: selectedOptions.format && formatNodeIcon[selectedOptions.format] ? [formatNodeIcon[selectedOptions.format]] : [],
      className: selectedFormat
        ? "border-violet-200/35 bg-violet-200/[0.1] text-violet-100 shadow-[0_0_18px_rgba(167,139,250,0.16)]"
        : "border-white/10 bg-white/[0.035] text-slate-500",
      position: "left-0 bottom-0",
    },
    {
      key: "resource",
      title: selectedResource ? `资源投入：${selectedResource.label}` : "资源投入待定",
      Icons: selectedOptions.resource && resourceNodeIcon[selectedOptions.resource] ? [resourceNodeIcon[selectedOptions.resource]] : [],
      className: selectedResource
        ? "border-emerald-200/35 bg-emerald-200/[0.1] text-emerald-100 shadow-[0_0_18px_rgba(52,211,153,0.16)]"
        : "border-white/10 bg-white/[0.035] text-slate-500",
      position: "right-0 bottom-0",
    },
  ];
  const matchedSamplePool = useMemo(
    () =>
      gameData
        ? matchStudioSamples(gameData.movies, gameData.top15, {
            marketId: selectedOptions.market,
            genreIds: selectedGenreIds,
            seasonId: selectedOptions.season,
            formatId: selectedOptions.format,
            resourceId: selectedOptions.resource,
          })
        : { samples: [], fallback: false },
    [gameData, selectedGenreIds, selectedOptions],
  );
  const activeSamples = matchedSamplePool.samples.filter((sample) => !removedSampleIds.has(sample.id));
  const activeSampleCount = activeSamples.length;

  useEffect(() => {
    loadGameData().then(setGameData).catch(() => setGameData({ movies: [], top15: [] }));
  }, []);

  useEffect(() => {
    if (!sampleFeedback) return undefined;

    const timer = window.setTimeout(() => setSampleFeedback(null), 3000);
    return () => window.clearTimeout(timer);
  }, [sampleFeedback]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nextState: StudioPersistedState = {
      selectedOptions,
      selectedGenreIds,
      removedSampleIds: Array.from(removedSampleIds),
      chaosPhase: chaosPhase === "rolling" ? "idle" : chaosPhase,
      candidateChaosEvents,
      selectedChaosEventIds,
    };

    window.sessionStorage.setItem(studioStateStorageKey, JSON.stringify(nextState));
  }, [candidateChaosEvents, chaosPhase, removedSampleIds, selectedChaosEventIds, selectedGenreIds, selectedOptions]);

  useEffect(() => {
    setRemovedSampleIds(new Set());
  }, [matchedSamplePool.samples]);

  useEffect(() => {
    if (!openSettingKey) return undefined;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!settingsFlyoutRef.current?.contains(event.target as Node)) {
        setOpenSettingKey(null);
      }
    };

    window.addEventListener("pointerdown", closeOnOutsideClick);
    return () => window.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [openSettingKey]);

  const startChaosMoment = () => {
    const canRestart = chaosPhase === "idle" || (chaosPhase === "revealing" && selectedChaosEventIds.length === 0);
    if (!canRestart) return;

    setChaosPhase("rolling");
    setCandidateChaosEvents([]);
    setSelectedChaosEventIds([]);
    setShowStudioResult(false);

    const shuffledEvents = [...chaosEvents].sort(() => Math.random() - 0.5);
    window.setTimeout(() => {
      const retainedEvents = shuffledEvents.slice(0, 4);
      setCandidateChaosEvents(retainedEvents);
      setChaosPhase("revealing");
    }, 3500);
  };

  const revealChaosEvent = (eventId: string) => {
    if (chaosPhase !== "revealing") return;

    setSelectedChaosEventIds((current) => {
      if (current.includes(eventId)) return current;

      const next = [...current, eventId];
      if (next.length === 4) {
        window.setTimeout(() => setChaosPhase("locked"), 420);
      }
      return next;
    });
  };

  const selectedChaosEvents = useMemo(
    () => candidateChaosEvents.filter((event) => selectedChaosEventIds.includes(event.id)),
    [candidateChaosEvents, selectedChaosEventIds],
  );
  const reactorBreathScale = Math.min(1.16, 1.03 + selectedInputCount * 0.018 + selectedChaosEvents.length * 0.01);
  const reactorBreathDuration = Math.max(1.45, 2.65 - selectedInputCount * 0.24 - selectedChaosEvents.length * 0.16);
  const studioMovieTitle = useMemo(
    () =>
      generateStudioMovieName({
        marketId: selectedOptions.market,
        genreIds: selectedGenreIds,
        seasonId: selectedOptions.season,
        formatId: selectedOptions.format,
        resourceId: selectedOptions.resource,
        selectedEventIds: selectedChaosEventIds,
      }),
    [selectedChaosEventIds, selectedGenreIds, selectedOptions],
  );
  const studioOutcome = useMemo(
    () =>
      calculateStudioOutcome({
        selectedMarketId: selectedOptions.market,
        selectedSeasonId: selectedOptions.season,
        selectedSeasonLabel: selectedSeason?.label ?? null,
        selectedFormatId: selectedOptions.format,
        selectedResourceId: selectedOptions.resource,
        selectedGenreIds,
        activeSampleCount,
        sampleTotalCount: matchedSamplePool.samples.length,
        activeSamples: activeSamples.map((sample) => ({
          isTop15: sample.isTop15,
          score: sample.score,
          tags: sample.tags,
          country: sample.country,
          genre: sample.genre,
          season: sample.season,
        })),
        candidateChaosEventCount: candidateChaosEvents.length,
        selectedChaosEvents,
      }),
    [
      activeSampleCount,
      activeSamples,
      candidateChaosEvents.length,
      matchedSamplePool.samples.length,
      selectedChaosEvents,
      selectedGenreIds,
      selectedOptions.format,
      selectedOptions.market,
      selectedOptions.resource,
      selectedOptions.season,
      selectedSeason?.label,
    ],
  );
  const chaosToneByType = (type: string) => {
    if (type === "正向") {
      return "border-emerald-200/70 bg-emerald-400/[0.18] shadow-[0_0_26px_rgba(52,211,153,0.24)]";
    }
    if (type === "负向") {
      return "border-rose-200/70 bg-rose-400/[0.18] shadow-[0_0_26px_rgba(251,113,133,0.24)]";
    }
    return "border-violet-200/70 bg-violet-400/[0.2] shadow-[0_0_26px_rgba(167,139,250,0.26)]";
  };
  const chaosTypeTextColor = (type: string) => {
    if (type === "正向") return "text-emerald-100";
    if (type === "负向") return "text-rose-100";
    return "text-violet-100";
  };
  const getSampleInfluenceTags = (sample: (typeof activeSamples)[number]) => {
    const tags: string[] = [];

    if (sample.tags.includes("同题材")) tags.push("同题材参照");
    if (sample.tags.includes("同题材") || sample.tags.includes("同档期") || sample.tags.includes("同市场")) tags.push("稳基础盘");
    if (sample.isTop15 || sample.score >= 72 || sample.tags.includes("高票房样本")) tags.push("抬高上限");
    if (sample.tags.includes("同档期") || sample.tags.includes("同市场")) tags.push("降低波动");

    const tagPriority = ["抬高上限", "同题材参照", "降低波动", "稳基础盘", "历史参照"];
    const uniqueTags = Array.from(new Set(tags.length ? tags : ["历史参照"]));

    return uniqueTags.sort((a, b) => tagPriority.indexOf(a) - tagPriority.indexOf(b)).slice(0, 2);
  };
  const getSampleInfluenceTagClass = (tag: string) => {
    if (tag === "抬高上限") return "border-amber-200/25 bg-amber-200/[0.08] text-amber-100";
    if (tag === "稳基础盘") return "border-emerald-200/25 bg-emerald-200/[0.07] text-emerald-100";
    if (tag === "降低波动") return "border-violet-200/25 bg-violet-200/[0.07] text-violet-100";
    if (tag === "同题材参照") return "border-cyan-200/25 bg-cyan-200/[0.07] text-cyan-100";
    return "border-white/15 bg-white/[0.045] text-slate-300";
  };
  const getSampleActionFeedback = (sample: (typeof activeSamples)[number], action: "remove" | "keep") => {
    const isHighReference = sample.isTop15 || sample.score >= 72 || sample.tags.includes("高票房样本");
    const hasGenreReference = sample.tags.includes("同题材");
    const hasSpreadReference = sample.tags.includes("传播型样本");
    const prefix = action === "remove" ? "已移除 1 个" : "已保留 1 个";

    if (isHighReference) {
      return action === "remove" ? `${prefix}高票房参照，破圈上限支撑下降` : `${prefix}高票房参照，破圈参照增强`;
    }
    if (hasGenreReference) {
      return action === "remove" ? `${prefix}同题材样本，基础盘稳定性下降` : `${prefix}同题材样本，基础盘支撑增强`;
    }
    if (hasSpreadReference) {
      return action === "remove" ? `${prefix}传播型样本，扩散参照减弱` : `${prefix}传播型样本，扩散参照增强`;
    }

    return action === "remove" ? `${prefix}历史样本，结果更依赖混沌事件` : `${prefix}历史样本，市场参照恢复`;
  };
  const chaosFeedback = {
    idle: "市场扰动尚未观测。启动后将随机留下 4 个未知扰动。",
    rolling: "混沌事件洗牌中……",
    revealing: "逐张翻开 4 个混沌事件。每翻开一张，市场反应炉都会重新计算。",
    locked: "4 张混沌事件已全部入局，它们将共同改变这部电影的市场命运。",
  }[chaosPhase];
  const canGenerateDestiny = settingsComplete && chaosPhase === "locked";
  const canStartChaosMoment = chaosPhase === "idle" || (chaosPhase === "revealing" && selectedChaosEventIds.length === 0);
  const studioSimulationRecipe: PlayerRecipe = {
    country: (selectedMarket?.label ?? "") as PlayerRecipe["country"],
    genres: selectedGenreOptions.map((genre) => genre.label),
    season: (selectedSeason?.label ?? "") as PlayerRecipe["season"],
    formats: selectedFormat ? [selectedFormat.label as PlayerRecipe["formats"][number]] : [],
    promotion: (selectedResource?.label ?? "") as PlayerRecipe["promotion"],
  };

  const resetStudioExperiment = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(studioStateStorageKey);
    }

    setSelectedOptions(defaultStudioOptions());
    setSelectedGenreIds([]);
    setOpenSettingKey(null);
    setRemovedSampleIds(new Set());
    setChaosPhase("idle");
    setCandidateChaosEvents([]);
    setSelectedChaosEventIds([]);
    setShowStudioResult(false);
    setShowStudioSimulation(false);
  };

  if (showStudioSimulation) {
    return (
      <AlchemySimulator
        recipe={studioSimulationRecipe}
        debugEnabled={false}
        chaosEventTitles={selectedChaosEvents.map((event) => event.title)}
        chaosEventTypes={selectedChaosEvents.map((event) => event.type)}
        metricRows={studioOutcome.reactorMetricRows}
        onComplete={() => {
          setShowStudioSimulation(false);
          setShowStudioResult(true);
        }}
      />
    );
  }

  if (showStudioResult) {
    return (
      <StudioResultSummary
        title={studioMovieTitle}
        marketLabel={selectedMarket?.label ?? "未选择"}
        genreLabel={selectedGenreOptions.length ? selectedGenreOptions.map((genre) => genre.label).join(" / ") : "未选择"}
        seasonLabel={selectedSeason?.label ?? "未选择"}
        formatLabel={selectedFormat?.label ?? "未选择"}
        resourceLabel={selectedResource?.label ?? "未选择"}
        strategyFingerprint={studioOutcome.strategyFingerprint}
        sampleActiveCount={activeSampleCount}
        sampleTotalCount={matchedSamplePool.samples.length}
        sampleNames={activeSamples.map((sample) => sample.name)}
        selectedEvents={selectedChaosEvents}
        unselectedEvents={candidateChaosEvents.filter((event) => !selectedChaosEventIds.includes(event.id))}
        boxOfficeFloor={studioOutcome.boxOfficeFloor}
        boxOfficeCeiling={studioOutcome.boxOfficeCeiling}
        baseRange={studioOutcome.baseRange}
        breakoutCeiling={studioOutcome.breakoutCeiling}
        breakoutScore={studioOutcome.breakoutScore}
        breakoutTriggers={studioOutcome.breakoutTriggers}
        breakoutReasons={studioOutcome.breakoutReasons}
        riskNotes={studioOutcome.riskNotes}
        sampleInfluenceSummary={studioOutcome.sampleInfluenceSummary}
        destinyType={studioOutcome.destinyType}
        destinyText={studioOutcome.outcomeExplanation}
        metrics={studioOutcome.reactorMetricRows}
        onBack={() => setShowStudioResult(false)}
        onRetry={resetStudioExperiment}
      />
    );
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#030612] px-5 py-5 text-white">
      <div className="absolute inset-0 lab-backdrop" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(0,0,0,0.48)_100%)]" />

      <section className="relative z-10 flex aspect-video w-full max-w-7xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/72 p-5 shadow-[0_0_60px_rgba(0,0,0,0.42)] backdrop-blur-md">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="text-2xl font-black text-amber-100">票房混沌实验台</h1>
              <div className="rounded-full border border-amber-200/25 bg-amber-200/[0.07] px-4 py-2 text-xs font-bold text-amber-100">
                未来 AI 电影实验室
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetStudioExperiment}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-black text-slate-200 transition hover:border-amber-200/35 hover:bg-amber-200/[0.08] hover:text-amber-100"
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              重新实验
            </button>
            <button
              type="button"
              onClick={() => setShowStudioSimulation(true)}
              disabled={!canGenerateDestiny}
              className={[
                "inline-flex h-10 items-center rounded-full border px-5 text-sm font-black transition",
                canGenerateDestiny
                  ? "border-cyan-200/45 bg-cyan-200/[0.14] text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)] hover:bg-cyan-200/[0.2]"
                  : "cursor-not-allowed border-white/10 bg-white/[0.035] text-slate-600",
              ].join(" ")}
            >
              进入上映模拟
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[21.5%_1fr_23%] gap-4 py-4">
          <aside className="flex min-h-0 flex-col gap-2 rounded-2xl border border-white/10 bg-black/25 p-3.5">
            <div className="flex items-center gap-2 text-sm font-black text-slate-100">
              <Clapperboard className="h-4 w-4 text-amber-200" aria-hidden="true" />
              电影设定卡
            </div>
            <div ref={settingsFlyoutRef} className="grid min-h-0 flex-1 grid-rows-5 gap-1.5">
              {studioSettings.map((setting) => {
                const selectedOption = selectedFor(setting);
                const selectedGenres = setting.key === "genre" ? selectedGenreOptions : [];
                const panelOpen = openSettingKey === setting.key;
                const flyoutWidth = setting.key === "genre" ? "w-[420px]" : "w-[260px]";
                const flyoutPosition =
                  setting.flyoutAlign === "bottom"
                    ? "bottom-0"
                    : setting.flyoutAlign === "middle"
                      ? "top-1/2 -translate-y-1/2"
                      : "top-0";

                return (
                  <div key={setting.key} className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenSettingKey((openKey) => (openKey === setting.key ? null : setting.key))}
                      className={[
                        "h-full w-full rounded-xl border p-2.5 text-left transition",
                        panelOpen
                          ? "border-amber-200/45 bg-amber-200/[0.075]"
                          : "border-white/10 bg-white/[0.045] hover:border-amber-200/35 hover:bg-amber-200/[0.055]",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white">{setting.title}</p>
                          {setting.key === "genre" ? (
                            selectedGenres.length ? (
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                {selectedGenres.map((genre) => (
                                  <div key={genre.id} className="inline-flex items-center gap-2">
                                    <p className="text-sm font-bold text-amber-100">{genre.label}</p>
                                    {selectedGenres.length === 1 ? (
                                      <p className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400">
                                        {genre.description}
                                      </p>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <p className="text-sm font-bold text-slate-500">未选择</p>
                                <p className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400">
                                  最多选 3 个
                                </p>
                              </div>
                            )
                          ) : (
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <p className={selectedOption ? "text-sm font-bold text-amber-100" : "text-sm font-bold text-slate-500"}>
                                {selectedOption?.label ?? "未选择"}
                              </p>
                              <p className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400">
                                {selectedOption?.description ?? "点击选择"}
                              </p>
                            </div>
                          )}
                        </div>
                        <span className="mt-4 inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-amber-100">
                          选择
                          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </div>
                    </button>

                    {panelOpen && (
                      <div className={`absolute left-[calc(100%+0.75rem)] ${flyoutPosition} z-50 ${flyoutWidth}`}>
                        <motion.div
                          initial={{ opacity: 0, x: -8, scale: 0.98 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ duration: 0.18 }}
                          className="rounded-2xl border border-amber-200/20 bg-slate-950/95 p-3 shadow-[0_0_34px_rgba(0,0,0,0.42)] backdrop-blur-md"
                        >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-black text-slate-100">{setting.drawerTitle}</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setOpenSettingKey(null)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-slate-400 transition hover:border-white/25 hover:text-slate-100"
                            aria-label={`关闭${setting.title}选择`}
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>

                        <div className={setting.key === "genre" ? "grid max-h-[360px] grid-cols-3 gap-2 overflow-hidden" : "grid max-h-[360px] gap-2 overflow-hidden"}>
                          {setting.options.map((option) => {
                            const selected = setting.key === "genre" ? selectedGenreIds.includes(option.id) : option.id === selectedOptions[setting.key];
                            const disabled = setting.key === "genre" && !selected && selectedGenreIds.length >= 3;

                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                  if (setting.key === "genre") {
                                    setSelectedGenreIds((current) => {
                                      if (current.includes(option.id)) {
                                        return current.filter((id) => id !== option.id);
                                      }

                                      return current.length >= 3 ? current : [...current, option.id];
                                    });
                                    return;
                                  }

                                  setSelectedOptions((current) => ({ ...current, [setting.key]: option.id }));
                                  setOpenSettingKey(null);
                                }}
                                disabled={disabled}
                                className={[
                                  setting.key === "genre" ? "rounded-xl border p-2.5 text-left transition" : "rounded-xl border p-3 text-left transition",
                                  selected
                                    ? "border-amber-200/60 bg-amber-200/[0.12] shadow-[0_0_18px_rgba(251,191,36,0.12)]"
                                    : disabled
                                      ? "cursor-not-allowed border-white/5 bg-white/[0.025] opacity-45"
                                      : "border-white/10 bg-white/[0.045] hover:border-cyan-200/35 hover:bg-cyan-200/[0.055]",
                                ].join(" ")}
                              >
                                <div className="flex h-5 items-center justify-between gap-2">
                                    <span className="text-sm font-black leading-5 text-slate-100">{option.label}</span>
                                  {selected ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/30 bg-amber-200/[0.08] px-2 py-0.5 text-[10px] font-bold text-amber-100">
                                      <Check className="h-3 w-3" aria-hidden="true" />
                                      当前
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 h-8 overflow-hidden text-xs leading-4 text-slate-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{option.description}</p>
                              </button>
                            );
                          })}
                        </div>
                        </motion.div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="relative min-h-0 overflow-hidden rounded-2xl border border-amber-200/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.76))] p-3.5">
            <div className="grid h-full w-full max-w-full grid-rows-[auto_1fr_auto] gap-2.5 overflow-hidden">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">市场反应炉</h2>
                  <p className="mt-0.5 text-xs text-slate-400">电影设定正在进入市场模拟</p>
                </div>
                <span className="max-w-[46%] truncate rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] px-2.5 py-1 text-[11px] font-bold text-cyan-100">
                  {studioOutcome.marketBias}
                </span>
              </div>

              <div className="grid min-h-0 grid-cols-[1fr_150px] items-stretch gap-3 rounded-2xl border border-white/10 bg-black/[0.2] px-4 py-3">
                <div className="flex h-full w-full min-w-0 flex-col items-center justify-center gap-1">
                  <div className="relative grid h-44 w-44 shrink-0 place-items-center">
                    <motion.div
                      className="absolute inset-0 rounded-full border border-cyan-200/25"
                      animate={{
                        scale: selectedChaosEvents.length
                          ? [1, reactorBreathScale, 0.98, reactorBreathScale - 0.02, 1]
                          : [1, reactorBreathScale, 1],
                      }}
                      transition={{ duration: selectedChaosEvents.length ? Math.min(1.45, reactorBreathDuration) : reactorBreathDuration, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-5 rounded-full border border-dashed border-amber-200/24"
                      animate={{ rotate: 360 }}
                      transition={{ duration: selectedChaosEvents.length ? 9 : 16, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="relative grid h-32 w-32 place-items-center rounded-full border border-cyan-200/35 bg-slate-950 shadow-[0_0_32px_rgba(34,211,238,0.22)]">
                      <FlaskConical className="h-14 w-14 text-cyan-100" aria-hidden="true" />
                    </div>
                    {reactorNodes.map((node) => (
                      <span
                        key={node.key}
                        title={node.title}
                        className={`absolute grid h-12 w-12 place-items-center rounded-full border backdrop-blur-sm transition ${node.position} ${node.className}`}
                      >
                        {node.Icons.length ? (
                          <span className={node.Icons.length > 1 ? "grid grid-cols-2 place-items-center gap-0.5" : "grid place-items-center"}>
                            {node.Icons.map((Icon, index) => (
                              <Icon
                                key={`${node.key}-${index}`}
                                className={node.Icons.length > 1 ? "h-4 w-4" : "h-6 w-6"}
                                aria-hidden="true"
                              />
                            ))}
                          </span>
                        ) : (
                          <span className="text-sm font-black">?</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <p className="w-full max-w-[280px] overflow-hidden text-center text-xs font-bold leading-4 text-amber-100 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                    {selectedPreview || "等待设定输入"}
                  </p>
                </div>

                <div className="grid h-full min-h-0 grid-rows-4 gap-2">
                  {studioOutcome.reactorMetricRows.map(([label, value, color]) => (
                    <div key={label} className="flex min-h-0 flex-col justify-center rounded-lg border border-white/10 bg-white/[0.045] px-2.5 py-1.5">
                      <div className="mb-1 flex items-center justify-between gap-2 text-[10px]">
                        <span className="truncate font-bold text-slate-200">{label}</span>
                        <span className="shrink-0 font-mono text-slate-400">{value.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className={`h-full rounded-full ${color}`}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 0.45 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200/18 bg-amber-200/[0.055] p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-cyan-100/75">{chaosFeedback}</p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    {studioOutcome.strategyFingerprint} · {selectedSeason?.label ?? "档期待定"} · {activeSampleCount} 个样本
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-bold text-amber-100/85">
                    {sampleFeedback ?? studioOutcome.sampleInfluenceSummary.influenceText}
                  </p>
                </div>
              </div>

              </div>
          </section>

          <aside className="flex min-h-0 flex-col gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-slate-100">
                <MemoryStick className="h-4 w-4 text-cyan-200" aria-hidden="true" />
                市场记忆池
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">根据你的电影设定，系统从历史动画电影中匹配相似样本。</p>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-color:rgba(148,163,184,0.38)_transparent] [scrollbar-width:thin]">
              {matchedSamplePool.fallback ? (
                <p className="rounded-xl border border-white/10 bg-white/[0.045] p-3 text-xs leading-5 text-slate-400">
                  暂无高度匹配样本，将使用更宽泛的历史样本池。
                </p>
              ) : null}
              {matchedSamplePool.samples.map((sample) => {
                const removed = removedSampleIds.has(sample.id);
                const sampleTags = getSampleInfluenceTags(sample);

                return (
                  <article
                    key={sample.id}
                    className={[
                      "rounded-xl border p-3 transition",
                      removed ? "border-white/5 bg-black/25 opacity-55" : "border-white/10 bg-white/[0.045]",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <p className="truncate text-sm font-bold text-slate-100">{sample.name}</p>
                          <span
                            className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] text-cyan-100"
                            title={`匹配原因：${sample.reason}`}
                          >
                            <Info className="h-3 w-3" aria-hidden="true" />
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-xs text-slate-500">{sample.year ?? "年份未知"}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSampleFeedback(getSampleActionFeedback(sample, "remove"));
                          setRemovedSampleIds((current) => {
                            const next = new Set(current);
                            next.add(sample.id);
                            return next;
                          });
                        }}
                        className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-[11px] text-slate-400 transition hover:border-rose-200/35 hover:text-rose-100"
                      >
                        移除
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {sampleTags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getSampleInfluenceTagClass(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">匹配理由：{sample.reason}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span
                        className={[
                          "text-[11px] font-bold",
                          removed ? "text-slate-500" : "text-emerald-100/85",
                        ].join(" ")}
                      >
                        {removed ? "已移出生成池" : "参与生成"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSampleFeedback(getSampleActionFeedback(sample, "keep"));
                          setRemovedSampleIds((current) => {
                            const next = new Set(current);
                            next.delete(sample.id);
                            return next;
                          });
                        }}
                        className={[
                          "rounded-md border px-2.5 py-1 text-[11px] font-bold transition",
                          removed
                            ? "border-amber-200/45 bg-amber-200/[0.1] text-amber-100"
                            : "border-emerald-200/25 bg-emerald-200/[0.055] text-emerald-100/85",
                        ].join(" ")}
                      >
                        {removed ? "保留" : "已保留"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </aside>
        </div>

        <footer className="grid h-[168px] min-h-[168px] max-h-[168px] grid-cols-[0.72fr_2.7fr] gap-3 overflow-hidden border-t border-white/10 pt-4">
          <div className="grid h-[140px] min-h-[140px] max-h-[140px] grid-rows-[auto_1fr_28px] overflow-hidden rounded-2xl border border-amber-200/15 bg-amber-200/[0.045] p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-100" aria-hidden="true" />
                <p className="text-sm font-black text-slate-100">混沌时刻</p>
              </div>
              <button
                type="button"
                onClick={startChaosMoment}
                disabled={!canStartChaosMoment}
                className={[
                  "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2.5 text-[11px] font-black shadow-[0_0_14px_rgba(251,191,36,0.14)] transition",
                  canStartChaosMoment
                    ? "border-amber-200/55 bg-amber-300 text-slate-950 hover:bg-amber-200"
                    : "cursor-not-allowed border-white/10 bg-white/[0.04] text-slate-600 shadow-none",
                ].join(" ")}
              >
                <Play className="h-3 w-3" aria-hidden="true" />
                {candidateChaosEvents.length && selectedChaosEventIds.length === 0 ? "重新抽取" : "启动"}
              </button>
            </div>
            <p className="mt-2 overflow-hidden text-xs leading-5 text-slate-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
              {chaosFeedback}
            </p>
            <p className="mt-2 h-7 overflow-hidden rounded-full border border-amber-200/20 bg-black/20 px-3 py-1 text-[11px] font-bold text-amber-100">
              {chaosPhase === "rolling"
                ? "抽取中"
                : candidateChaosEvents.length
                  ? `翻开：${selectedChaosEventIds.length}/4`
                  : "待启动"}
            </p>
          </div>
          <div className="relative h-[140px] min-h-[140px] max-h-[140px] overflow-hidden rounded-2xl">
            {chaosPhase === "rolling" ? (
              <motion.div
                className="flex gap-2.5"
                initial={{ x: 0 }}
                animate={{ x: "-128%" }}
                transition={{ duration: 3.5, ease: [0.1, 0.84, 0.22, 1] }}
              >
                {[...chaosEvents, ...chaosEvents].map((event, index) => (
                  <article
                    key={`${event.id}-${index}`}
                    className="h-[140px] w-[23.6%] shrink-0 rounded-2xl border border-cyan-200/18 bg-slate-950/80 p-3 shadow-[0_0_18px_rgba(34,211,238,0.08)]"
                  >
                    <div className="grid h-full place-items-center text-center">
                      <div>
                        <p className="mt-2 text-sm font-black text-slate-200">市场扰动</p>
                        <p className="mt-1 text-[11px] text-slate-500">未观测</p>
                      </div>
                    </div>
                  </article>
                ))}
              </motion.div>
            ) : (
              <div className="grid h-full grid-cols-4 gap-2.5">
            {(candidateChaosEvents.length ? candidateChaosEvents : chaosEvents.slice(0, 4)).map((event, index) => {
              const selected = selectedChaosEventIds.includes(event.id);
              const lockedUnselected = chaosPhase === "locked" && !selected;
              const canReveal = chaosPhase === "revealing" && !selected;

              return (
                <motion.article
                  key={event.id}
                  initial={candidateChaosEvents.length ? { opacity: 0, y: 12 } : false}
                  animate={{ opacity: lockedUnselected ? 0.48 : candidateChaosEvents.length ? 1 : 0.58, y: 0 }}
                  transition={{ duration: 0.35, delay: candidateChaosEvents.length ? index * 0.08 : 0 }}
                  onClick={() => revealChaosEvent(event.id)}
                  className={`relative h-full [perspective:900px] ${
                    selected
                      ? ""
                      : canReveal
                        ? "cursor-pointer hover:brightness-125"
                        : "grayscale"
                  }`}
                >
                  <motion.div
                    className="relative h-full rounded-2xl transition [transform-style:preserve-3d]"
                    animate={{ rotateY: selected ? 180 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="absolute inset-0 grid place-items-center rounded-2xl border border-cyan-200/18 bg-slate-950/80 p-3 text-center shadow-[0_0_18px_rgba(34,211,238,0.08)] [backface-visibility:hidden]">
                      <div>
                        <p className="mt-2 text-sm font-black text-slate-200">
                          {lockedUnselected ? "遗失扰动" : "市场扰动"}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {canReveal ? "点击翻开" : candidateChaosEvents.length ? "等待翻开" : "未观测"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`absolute inset-0 rounded-2xl border p-3 [backface-visibility:hidden] [transform:rotateY(180deg)] ${chaosToneByType(event.type)} ${
                        selected ? "ring-1 ring-amber-200/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-black text-slate-100">{event.title}</p>
                        <span className="shrink-0 rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-bold text-amber-100">
                          {event.type}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{event.description}</p>
                      <p className="mt-2 text-[11px] leading-4 text-cyan-100/80">影响：{event.impactText}</p>
                      <p className="mt-1 text-[10px] font-bold text-amber-100/75">
                        数值：预热 {event.effects.heat >= 0 ? "+" : ""}{event.effects.heat} / 口碑 {event.effects.reputation >= 0 ? "+" : ""}{event.effects.reputation} / 扩散 {event.effects.spread >= 0 ? "+" : ""}{event.effects.spread} / 波动 {event.effects.volatility >= 0 ? "+" : ""}{event.effects.volatility}
                      </p>
                    </div>
                  </motion.div>
                </motion.article>
              );
            })}
              </div>
            )}
          </div>
        </footer>

      </section>
    </main>
  );
}

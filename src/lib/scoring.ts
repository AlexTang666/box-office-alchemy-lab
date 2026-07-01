import { generateMovieName } from "./nameGenerator";
import type {
  BoxOfficeRange,
  ChaosEvent,
  ChaosEventResponses,
  CountryChoice,
  FormatChoice,
  MarketChaosEvent,
  MarketEnergyAllocation,
  MovieRecord,
  PathFit,
  PlayerRecipe,
  PromotionChoice,
  SeasonChoice,
  SelectedPath,
  SimulationResult,
} from "../types/movie";

type CompleteRecipe = {
  country: CountryChoice;
  genres: string[];
  season: SeasonChoice;
  formats: FormatChoice[];
  promotion: PromotionChoice;
};

type SimulationDecisionInput = {
  marketEnergy?: MarketEnergyAllocation;
  chaosEvents?: MarketChaosEvent[];
  eventResponses?: ChaosEventResponses;
  selectedPath?: SelectedPath | null;
};

const defaultMarketEnergy: MarketEnergyAllocation = {
  preheatPromotion: 0,
  reputationBuild: 0,
  screeningAccess: 0,
  communitySpread: 0,
};

const fallbackChaosEvents: ChaosEvent[] = [
  { label: "短视频二创扩散", type: "positive" },
  { label: "观众自发安利", type: "positive" },
  { label: "角色台词出圈", type: "positive" },
  { label: "同档期竞品口碑下滑", type: "positive" },
  { label: "同档期大片挤压", type: "negative" },
  { label: "预期过高导致口碑反噬", type: "negative" },
  { label: "社交平台争议发酵", type: "negative" },
  { label: "首周排片不足", type: "negative" },
  { label: "观众评价分化", type: "neutral" },
  { label: "小众圈层高度认同", type: "neutral" },
  { label: "数据样本不足，模型置信度下降", type: "neutral" },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value) && value > 0);
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
}

function median(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
  if (!valid.length) return 0;
  const middle = Math.floor(valid.length / 2);
  return valid.length % 2 ? valid[middle] : (valid[middle - 1] + valid[middle]) / 2;
}

function overlapCount(a: string[], b: string[]) {
  const bSet = new Set(b);
  return a.filter((item) => bSet.has(item)).length;
}

function overlapRatio(a: string[], b: string[]) {
  if (!a.length || !b.length) return 0;
  return overlapCount(a, b) / Math.max(a.length, b.length);
}

function formatOverlapCount(movieFormats: string[], selected: FormatChoice[]) {
  if (!selected.length) return 0;
  return selected.filter((format) => movieFormats.some((item) => item.includes(format) || format.includes(item))).length;
}

function formatOverlapRatio(movieFormats: string[], selected: FormatChoice[]) {
  if (!selected.length || !movieFormats.length) return 0;
  return formatOverlapCount(movieFormats, selected) / Math.max(selected.length, movieFormats.length);
}

function makeRange(low: number, high: number): BoxOfficeRange {
  return [Math.max(low, 0), Math.max(high, 0)];
}

function pickFallbackChaosEvents(sampleSize: number) {
  const count = Math.random() > 0.45 ? 3 : 2;
  const pool =
    sampleSize < 5
      ? [...fallbackChaosEvents, { label: "数据样本不足，模型置信度下降", type: "neutral" as const }]
      : fallbackChaosEvents;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

function seasonFitScore(country: CountryChoice, genres: string[], season: SeasonChoice) {
  let score = 54;
  const genreText = genres.join("/");

  if (country === "中国" && season === "春节档") score += 15;
  if (country === "中国" && season === "暑期档") score += 8;
  if ((country === "日本" || country === "美国") && season === "年末档") score += 8;
  if (/(喜剧|家庭)/.test(genreText) && season === "春节档") score += 12;
  if (/(冒险|奇幻)/.test(genreText) && season === "暑期档") score += 12;
  if (genreText.includes("历史") && (season === "暑期档" || season === "国庆档")) score += 10;
  if (genreText.includes("科幻") && (season === "暑期档" || season === "年末档")) score += 8;
  if (genreText.includes("音乐") && season === "年末档") score += 6;
  if (season === "普通档") score -= 4;

  return clamp(score, 18, 98);
}

function promotionProxyScore(movie: MovieRecord, promotion: PromotionChoice, maxValues: Record<string, number>) {
  if (promotion === "低成本口碑") return clamp((movie.maoyanScore / 10) * 15, 0, 15);
  if (promotion === "粉丝预热") {
    return clamp((Math.log10(movie.wantToSee + 10) / Math.log10(maxValues.wantToSee + 10)) * 15, 0, 15);
  }
  if (promotion === "大规模宣发") {
    const day = maxValues.firstDay ? movie.firstDayBoxOffice / maxValues.firstDay : 0;
    const week = maxValues.firstWeek ? movie.firstWeekBoxOffice / maxValues.firstWeek : 0;
    return clamp(((day + week) / 2) * 15, 0, 15);
  }

  const seriesSignal = /2|3|4|Ⅱ|Ⅲ|IV|之|新|重返|归来|传奇|外传|大电影/.test(movie.name) ? 6 : 0;
  const heatSignal = maxValues.wantToSee
    ? (Math.log10(movie.wantToSee + 10) / Math.log10(maxValues.wantToSee + 10)) * 9
    : 0;
  return clamp(seriesSignal + heatSignal, 0, 15);
}

function similarityScore(
  movie: MovieRecord,
  recipe: CompleteRecipe,
  promotion: PromotionChoice,
  maxValues: Record<string, number>,
) {
  let score = 0;
  if (movie.countryGroup === recipe.country) score += 20;
  if (movie.season === recipe.season) score += 25;
  score += overlapRatio(recipe.genres, movie.genres) * 30;
  score += formatOverlapRatio(movie.formats, recipe.formats) * 10;
  score += promotionProxyScore(movie, promotion, maxValues);
  return score;
}

function selectSimilarMovies(movies: MovieRecord[], recipe: CompleteRecipe) {
  const strict = movies.filter(
    (movie) =>
      movie.countryGroup === recipe.country &&
      movie.season === recipe.season &&
      overlapCount(recipe.genres, movie.genres) > 0 &&
      (formatOverlapCount(movie.formats, recipe.formats) > 0 || !movie.formats.length),
  );

  const relaxed =
    strict.length >= 5
      ? strict
      : movies.filter(
          (movie) =>
            movie.season === recipe.season ||
            overlapCount(recipe.genres, movie.genres) > 0 ||
            movie.countryGroup === recipe.country,
        );

  return relaxed.length ? relaxed : movies;
}

function gradeForBoxOffice(value: number, top15: MovieRecord[], allMovies: MovieRecord[]) {
  const top = [...top15].sort((a, b) => b.boxOffice - a.boxOffice);
  const allMedian = median(allMovies.map((movie) => movie.boxOffice));
  const top1 = top[0]?.boxOffice ?? allMedian * 8;
  const top3 = top[2]?.boxOffice ?? allMedian * 5;
  const top5 = top[4]?.boxOffice ?? allMedian * 4;
  const top10 = top[9]?.boxOffice ?? allMedian * 2.5;
  const top15Threshold = top[14]?.boxOffice ?? allMedian * 1.6;

  if (value >= top1 * 0.7) return "SSS";
  if (value >= top3) return "SS";
  if (value >= top5) return "S";
  if (value >= top10) return "A";
  if (value >= top15Threshold) return "B";
  if (value >= allMedian) return "C";
  return "D";
}

function normalizeEnergy(energy: MarketEnergyAllocation) {
  return {
    preheat: clamp(energy.preheatPromotion, 0, 10) / 10,
    reputation: clamp(energy.reputationBuild, 0, 10) / 10,
    screening: clamp(energy.screeningAccess, 0, 10) / 10,
    community: clamp(energy.communitySpread, 0, 10) / 10,
  };
}

function inferResponseType(optionId: string) {
  const steady = new Set(["hold", "steady", "niche", "reset", "clarify", "pause", "evidence", "longtail", "accept", "protect", "test"]);
  const spread = new Set(["amplify", "guide", "community", "meme", "character", "screen", "shift", "bridge", "event", "risk", "audience"]);
  if (steady.has(optionId)) return "steady";
  if (spread.has(optionId)) return "spread";
  return "balanced";
}

function responseCounts(events: MarketChaosEvent[], responses: ChaosEventResponses) {
  return events.reduce(
    (counts, event) => {
      const optionId = responses[event.id];
      if (!optionId) return counts;
      const option = event.options.find((item) => item.id === optionId);
      const responseType = option?.responseType ?? inferResponseType(optionId);
      counts[responseType] += 1;
      return counts;
    },
    { steady: 0, spread: 0, balanced: 0 },
  );
}

function applyDecisionAdjustments(
  base: number,
  energy: MarketEnergyAllocation,
  marketEvents: MarketChaosEvent[],
  eventResponses: ChaosEventResponses,
) {
  const normalized = normalizeEnergy(energy);
  const positiveCount = marketEvents.filter((event) => event.type === "positive").length;
  const negativeCount = marketEvents.filter((event) => event.type === "negative").length;
  const neutralCount = marketEvents.filter((event) => event.type === "neutral").length;
  const responses = responseCounts(marketEvents, eventResponses);

  let conservativeLow = base * 0.45 * (1 + normalized.reputation * 0.18);
  let conservativeHigh = base * 0.75 * (1 + normalized.reputation * 0.08);
  let normalLow = base * 0.75 * (1 + normalized.screening * 0.06);
  let normalHigh = base * 1.15 * (1 + normalized.preheat * 0.12 + normalized.screening * 0.1);
  let chaosLow = base * 1.15;
  let chaosHigh = base * 1.8 * (1 + normalized.community * 0.24 + normalized.preheat * 0.12);

  normalHigh *= 1 + positiveCount * 0.06;
  chaosHigh *= 1 + positiveCount * 0.1;
  conservativeLow *= 1 - negativeCount * 0.08;
  normalLow *= 1 - negativeCount * 0.07;

  const neutralSpread = 1 + neutralCount * 0.06;
  conservativeLow /= neutralSpread;
  conservativeHigh *= neutralSpread;
  normalLow /= neutralSpread;
  normalHigh *= neutralSpread;
  chaosLow /= neutralSpread;
  chaosHigh *= neutralSpread;

  const pathFit: PathFit = {
    conservativeFit: clamp(45 + normalized.reputation * 24 + responses.steady * 8 - negativeCount * 3, 0, 100),
    normalFit: clamp(45 + normalized.screening * 14 + normalized.preheat * 10 + responses.balanced * 8 + positiveCount * 3, 0, 100),
    chaosFit: clamp(40 + normalized.community * 28 + normalized.preheat * 8 + responses.spread * 9 + positiveCount * 5 + neutralCount * 2, 0, 100),
  };

  return {
    conservativeRange: makeRange(conservativeLow, Math.max(conservativeHigh, conservativeLow)),
    normalRange: makeRange(normalLow, Math.max(normalHigh, normalLow)),
    chaosRange: makeRange(chaosLow, Math.max(chaosHigh, chaosLow)),
    pathFit,
  };
}

function marketComment(normalRange: BoxOfficeRange, events: ChaosEvent[], sampleSize: number) {
  const eventText = events.map((event) => event.label).join("、");
  const confidenceText = sampleSize < 5 ? "邻近样本较少，本次区间需要更谨慎解读。" : "邻近样本提供了历史参照，但不能构成成功公式。";
  return `常规路径显示这部电影可能落在 ${(normalRange[0] / 100_000_000).toFixed(2)} 亿到 ${(normalRange[1] / 100_000_000).toFixed(2)} 亿之间。混沌扰动包括：${eventText}。${confidenceText}`;
}

function playerTitle(grade: string, recipe: CompleteRecipe, seasonFit: number) {
  if (grade === "SSS") return "混沌高能观察员";
  if (grade === "SS" || grade === "S") return "极端样本接近者";
  if (recipe.season === "春节档" && seasonFit >= 78) return "春节档扰动研究员";
  if (recipe.promotion === "粉丝预热") return "传播涟漪观察员";
  if (seasonFit < 55) return "档期错位实验者";
  return "市场命运记录员";
}

export function simulateMovie(
  recipeInput: PlayerRecipe,
  movies: MovieRecord[],
  top15: MovieRecord[],
  decisionInput: SimulationDecisionInput = {},
): SimulationResult {
  const recipe: CompleteRecipe = {
    country: recipeInput.country || "其他",
    genres: recipeInput.genres.length ? recipeInput.genres : ["冒险"],
    season: recipeInput.season || "普通档",
    formats: recipeInput.formats.length ? recipeInput.formats : ["2D"],
    promotion: recipeInput.promotion || "低成本口碑",
  };
  const allMovies = movies.length ? movies : top15;
  const top = [...top15].sort((a, b) => b.boxOffice - a.boxOffice);
  const allMovieMedian = median(allMovies.map((movie) => movie.boxOffice));

  const maxValues = {
    wantToSee: Math.max(...allMovies.map((movie) => movie.wantToSee), 1),
    firstDay: Math.max(...allMovies.map((movie) => movie.firstDayBoxOffice), 1),
    firstWeek: Math.max(...allMovies.map((movie) => movie.firstWeekBoxOffice), 1),
  };

  const candidates = selectSimilarMovies(allMovies, recipe);
  const scoredCandidates = candidates
    .map((movie) => ({
      movie,
      score: similarityScore(movie, recipe, recipe.promotion, maxValues),
    }))
    .sort((a, b) => b.score - a.score);
  const similarMovies = scoredCandidates.slice(0, Math.max(5, Math.min(12, scoredCandidates.length))).map((item) => item.movie);

  const boxOffices = similarMovies.map((movie) => movie.boxOffice);
  const baseBoxOffice = median(boxOffices) * 0.6 + average(boxOffices) * 0.3 + Math.max(...boxOffices) * 0.1;
  const safeBase = Math.max(baseBoxOffice, allMovieMedian * 0.35);
  const marketEvents = decisionInput.chaosEvents ?? [];
  const displayEvents =
    marketEvents.length > 0
      ? marketEvents.map((event) => ({ label: event.name, type: event.type }))
      : pickFallbackChaosEvents(similarMovies.length);
  const { conservativeRange, normalRange, chaosRange, pathFit } = applyDecisionAdjustments(
    safeBase,
    decisionInput.marketEnergy ?? defaultMarketEnergy,
    marketEvents,
    decisionInput.eventResponses ?? {},
  );

  const scoreAverage = average(similarMovies.map((movie) => movie.maoyanScore));
  const wantAverage = average(similarMovies.map((movie) => movie.wantToSee));
  const heatBase = maxValues.wantToSee
    ? (Math.log10(wantAverage + 10) / Math.log10(maxValues.wantToSee + 10)) * 100
    : 45;
  const seasonFit = seasonFitScore(recipe.country, recipe.genres, recipe.season);
  const top15Threshold = top[14]?.boxOffice ?? allMovieMedian * 1.8;
  const predictedBoxOffice = safeBase;
  const reputationStability = clamp((scoreAverage ? (scoreAverage / 10) * 100 : 62) + (recipe.promotion === "低成本口碑" ? 6 : 0), 28, 98);
  const preReleaseHeat = clamp(
    heatBase +
      (recipe.promotion === "粉丝预热" ? 10 : 0) +
      (recipe.promotion === "IP 续作加持" ? 8 : 0) +
      (recipe.promotion === "大规模宣发" ? 6 : 0),
    18,
    98,
  );

  const ratio = normalRange[1] / top15Threshold;
  const probability = clamp(
    ratio >= 1 ? 70 + Math.min(25, (ratio - 1) * 30) : ratio >= 0.75 ? 40 + ((ratio - 0.75) / 0.25) * 30 : 5 + (ratio / 0.75) * 35,
    4,
    96,
  );

  const grade = gradeForBoxOffice(normalRange[1], top, allMovies);
  const similarMovie = scoredCandidates[0]?.movie ?? null;
  const exceededMovie = top.find((movie) => chaosRange[1] >= movie.boxOffice) ?? null;
  const boxOfficeEnergy = clamp((normalRange[1] / Math.max(top[0]?.boxOffice ?? normalRange[1], 1)) * 100, 6, 100);

  return {
    title: generateMovieName(recipe.country, recipe.genres),
    recipe,
    predictedBoxOffice,
    conservativeRange,
    normalRange,
    chaosRange,
    pathFit,
    chaosEvents: displayEvents,
    grade,
    metrics: {
      boxOfficeEnergy,
      reputationStability,
      preReleaseHeat,
      seasonFit,
      top15Probability: probability,
    },
    similarMovie,
    selectedSampleSize: similarMovies.length,
    marketComment: marketComment(normalRange, displayEvents, similarMovies.length),
    playerTitle: playerTitle(grade, recipe, seasonFit),
    top15Threshold,
    top15Potential: chaosRange[1] >= top15Threshold,
    exceededMovie,
    formulaNotes: [
      "先按国别、档期、类型和制式寻找历史邻近样本。",
      "base = 邻近样本中位数 60% + 平均值 30% + 最高值 10%。",
      "市场能量、混沌事件和玩家应对会调整三条路径区间与路径适配度。",
    ],
  };
}

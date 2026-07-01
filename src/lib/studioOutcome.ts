export type StudioOutcomeMetricKey = "preheat" | "reputation" | "spread" | "volatility";

export type StudioOutcomeEffects = Record<StudioOutcomeMetricKey, number>;

export interface StudioChaosEventEffects {
  heat: number;
  reputation: number;
  spread: number;
  volatility: number;
}

export type StudioOutcomeMetricRows = Array<[string, number, string]>;

export interface StudioOutcomeChaosEvent {
  id: string;
  title?: string;
  type: string;
  effects: StudioChaosEventEffects;
}

export interface StudioOutcomeSample {
  isTop15: boolean;
  score: number;
  tags: string[];
  country?: string;
  genre?: string;
  season?: string;
}

export interface StudioRange {
  min: number;
  max: number;
  display: string;
}

export interface StudioBreakoutCeiling {
  value: number;
  display: string;
}

export interface StudioSampleInfluenceSummary {
  referenceStrength: "强" | "中" | "弱";
  activeCount: number;
  dominantTags: string[];
  influenceText: string;
  baseImpact: "基础盘增强" | "基础盘稳定" | "参照不足";
  ceilingImpact: "破圈参照增强" | "上限参照有限";
  riskImpact: "波动降低" | "波动增加" | "风险中性";
}

export interface StudioOutcomeInput {
  selectedMarketId: string | null;
  selectedSeasonId: string | null;
  selectedSeasonLabel: string | null;
  selectedFormatId: string | null;
  selectedResourceId: string | null;
  selectedGenreIds: string[];
  activeSampleCount: number;
  sampleTotalCount: number;
  activeSamples?: StudioOutcomeSample[];
  candidateChaosEventCount: number;
  selectedChaosEvents: StudioOutcomeChaosEvent[];
}

export interface StudioOutcome {
  chaosEffects: StudioChaosEventEffects;
  reactorMetrics: StudioOutcomeEffects;
  reactorMetricRows: StudioOutcomeMetricRows;
  strategyFingerprint: string;
  marketBias: string;
  boxOfficeFloor: number;
  boxOfficeCeiling: number;
  baseRange: StudioRange;
  breakoutCeiling: StudioBreakoutCeiling;
  breakoutScore: number;
  breakoutTriggers: string[];
  breakoutReasons: string[];
  riskNotes: string[];
  sampleInfluenceSummary: StudioSampleInfluenceSummary;
  marketFate: string;
  outcomeExplanation: string;
  destinyType: string;
  destinyText: string;
}

const zeroEffects: StudioChaosEventEffects = {
  heat: 0,
  reputation: 0,
  spread: 0,
  volatility: 0,
};

function clampMetric(value: number) {
  return Math.max(0, Math.min(96, value));
}

function formatMetricValue(value: number) {
  return Number(value.toFixed(1));
}

function sumChaosEffects(events: StudioOutcomeChaosEvent[]): StudioChaosEventEffects {
  const weights = [1, 0.72, 0.52, 0.38];

  return events.slice(0, 4).reduce(
    (total, event, index) => ({
      heat: total.heat + event.effects.heat * weights[index],
      reputation: total.reputation + event.effects.reputation * weights[index],
      spread: total.spread + event.effects.spread * weights[index],
      volatility: total.volatility + event.effects.volatility * weights[index],
    }),
    zeroEffects,
  );
}

function getStrategyFingerprint(input: StudioOutcomeInput) {
  if (input.selectedResourceId === "community") return "社群破圈型";
  if (input.selectedResourceId === "word-of-mouth") return "口碑长尾型";
  if (input.selectedResourceId === "preheat") return "高宣发高波动";
  if (input.selectedGenreIds.includes("family")) return "稳健家庭向";
  if (input.selectedChaosEvents.some((event) => event.id === "ip-nostalgia")) {
    return "IP 情怀型";
  }
  if (input.selectedGenreIds.length > 1 || input.selectedChaosEvents.length) return "混合实验型";
  return "等待设定";
}

function getMarketBias(input: StudioOutcomeInput) {
  if (input.selectedChaosEvents.length >= 4) return "4 个混沌扰动已入局";
  if (input.candidateChaosEventCount) return `已翻开 ${input.selectedChaosEvents.length}/4 个扰动`;
  if (input.activeSampleCount < input.sampleTotalCount) return "样本池已更新";
  if (input.selectedSeasonLabel) return `${input.selectedSeasonLabel}环境校准中`;
  return "市场环境待观测";
}

function getDestinyType(reactorMetrics: StudioOutcomeEffects, strategyFingerprint: string) {
  if (reactorMetrics.volatility >= 72) return "高热度波动型";
  if (strategyFingerprint === "口碑长尾型") return "口碑长尾型";
  if (strategyFingerprint === "稳健亲子向") return "稳健亲子型";
  if (strategyFingerprint === "社群破圈型") return "社群破圈型";
  return "混合实验型";
}

function getDestinyText(input: StudioOutcomeInput, reactorMetrics: StudioOutcomeEffects) {
  if (input.selectedChaosEvents.some((event) => event.type === "负向")) {
    return "市场路径带有明显波动，需要靠口碑和样本池稳住长线。";
  }
  if (reactorMetrics.spread > reactorMetrics.reputation) {
    return "传播动能更强，存在破圈机会，但需要承受更高不确定性。";
  }
  return "基础盘更稳，结果更依赖长线口碑和档期适配。";
}

function formatRange(min: number, max: number) {
  return `${min.toFixed(1)} 亿 — ${max.toFixed(1)} 亿`;
}

function uniqueItems(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function hasEvent(input: StudioOutcomeInput, eventIds: string[]) {
  return input.selectedChaosEvents.some((event) => eventIds.includes(event.id));
}

function hasAnyGenre(input: StudioOutcomeInput, genreIds: string[]) {
  return input.selectedGenreIds.some((genreId) => genreIds.includes(genreId));
}

function hasHighValueSample(input: StudioOutcomeInput) {
  return (input.activeSamples ?? []).some((sample) => sample.isTop15 || sample.score >= 72 || sample.tags.includes("高票房样本"));
}

function getSampleInfluenceSummary(input: StudioOutcomeInput): StudioSampleInfluenceSummary {
  const activeSamples = input.activeSamples ?? [];
  const activeCount = activeSamples.length;
  const highValueCount = activeSamples.filter((sample) => sample.isTop15 || sample.score >= 72 || sample.tags.includes("高票房样本")).length;
  const tagCounts = activeSamples.reduce<Record<string, number>>((counts, sample) => {
    sample.tags.forEach((tag) => {
      counts[tag] = (counts[tag] ?? 0) + 1;
    });
    if (sample.isTop15) counts["Top15 样本"] = (counts["Top15 样本"] ?? 0) + 1;
    return counts;
  }, {});
  const dominantTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count >= 2)
    .map(([tag]) => tag)
    .slice(0, 3);
  const hasFocusedReference = dominantTags.length > 0;
  const hasStrongReference = activeCount >= 6 && highValueCount >= 2 && hasFocusedReference;
  const hasMediumReference = (activeCount >= 3 && activeCount <= 5) || highValueCount >= 1;
  const referenceStrength: StudioSampleInfluenceSummary["referenceStrength"] = hasStrongReference ? "强" : hasMediumReference ? "中" : "弱";
  const baseImpact =
    referenceStrength === "强" || dominantTags.includes("同题材") || dominantTags.includes("同市场")
      ? "基础盘增强"
      : referenceStrength === "中"
        ? "基础盘稳定"
        : "参照不足";
  const ceilingImpact = highValueCount >= 2 || dominantTags.includes("高票房样本") || dominantTags.includes("Top15 样本") ? "破圈参照增强" : "上限参照有限";
  const riskImpact =
    activeCount < 3 || (activeCount >= 4 && !hasFocusedReference)
      ? "波动增加"
      : referenceStrength === "强" && hasFocusedReference
        ? "波动降低"
        : "风险中性";
  const influenceText =
    activeCount < 3
      ? "参与样本较少，结果更依赖混沌事件。"
      : referenceStrength === "强"
        ? "历史参照集中，基础区间更稳定。"
        : "样本池提供中等参照，仍需混沌事件决定上限。";

  return {
    referenceStrength,
    activeCount,
    dominantTags: dominantTags.length ? dominantTags : activeCount ? ["历史样本"] : ["参照不足"],
    influenceText,
    baseImpact,
    ceilingImpact,
    riskImpact,
  };
}

function getBreakoutTriggers(input: StudioOutcomeInput) {
  const triggers: string[] = [];
  const sampleSummary = getSampleInfluenceSummary(input);

  if (
    input.selectedMarketId === "china" &&
    hasAnyGenre(input, ["myth", "hero", "fantasy"]) &&
    (input.selectedSeasonId === "spring" || input.selectedSeasonId === "national")
  ) {
    triggers.push("文化共鸣放大");
  }

  if (
    (hasAnyGenre(input, ["family", "adventure", "comedy", "animal", "fantasy"]) &&
      (input.selectedSeasonId === "spring" || input.selectedSeasonId === "summer") &&
      input.selectedResourceId === "word-of-mouth") ||
    hasEvent(input, ["parent-word-of-mouth"])
  ) {
    triggers.push("亲子长线发酵");
  }

  if (
    hasAnyGenre(input, ["sci-fi", "myth", "adventure", "hero", "fantasy"]) &&
    ["imax", "china-giant", "3d"].includes(input.selectedFormatId ?? "") &&
    input.selectedResourceId === "preheat"
  ) {
    triggers.push("视觉奇观首周爆发");
  }

  if (
    input.selectedResourceId === "community" ||
    hasEvent(input, ["short-video-remix", "meme-boom", "character-line-viral", "theme-song-viral", "platform-algorithm-push"])
  ) {
    triggers.push("社交平台二次传播");
  }

  if (hasEvent(input, ["ip-nostalgia"]) || hasHighValueSample(input)) {
    triggers.push("IP 情怀回流");
  }

  if (input.selectedMarketId === "global" || hasEvent(input, ["award-nomination", "overseas-reverse-buzz"])) {
    triggers.push("海外评价反向带动");
  }

  if (hasEvent(input, ["social-controversy", "fan-review-control", "split-premiere-reviews", "over-marketing"])) {
    triggers.push("争议热度放大");
  }

  if (sampleSummary.ceilingImpact === "破圈参照增强") triggers.push("历史高位参照");
  if (sampleSummary.dominantTags.includes("同题材")) triggers.push("同题材爆款参照");
  if (sampleSummary.dominantTags.includes("同档期")) triggers.push("档期样本参照");
  if (sampleSummary.dominantTags.includes("传播型样本")) triggers.push("传播型样本参照");
  if (sampleSummary.dominantTags.includes("同题材") && hasAnyGenre(input, ["family", "animal", "comedy", "adventure", "healing"])) {
    triggers.push("亲子长线参照");
  }

  return uniqueItems(triggers);
}

function getBreakoutReasons(input: StudioOutcomeInput, triggers: string[]) {
  const reasons: string[] = [];
  if (triggers.includes("文化共鸣放大")) reasons.push("市场来源、题材和强档期形成情绪共振，上限来自更广泛的文化讨论。");
  if (triggers.includes("社交平台二次传播")) reasons.push("传播事件或社群资源提供二次扩散路径，可能把核心受众外的观众卷入。");
  if (triggers.includes("视觉奇观首周爆发")) reasons.push("高规格观看和宣发预热叠加，首周存在更强的集中转化机会。");
  if (triggers.includes("亲子长线发酵")) reasons.push("家庭观众和口碑维护能拉长生命周期，基础盘之外存在长尾抬升。");
  if (triggers.includes("IP 情怀回流")) reasons.push("历史高票房样本或情怀事件提供基本盘回流理由，但仍依赖新观众扩散。");
  if (triggers.includes("海外评价反向带动")) reasons.push("跨市场评价可能改变讨论路径，为上限提供额外话题入口。");
  if (triggers.includes("争议热度放大")) reasons.push("争议能制造短期声量，但更像不稳定的热度入口，不等于稳定转化。");
  if (triggers.includes("历史高位参照")) reasons.push("市场记忆池中保留了高位历史样本，为破圈上限提供参照。");
  if (triggers.includes("同题材爆款参照")) reasons.push("多个同题材样本仍在生成池中，说明基础受众和类型路径更清晰。");
  if (triggers.includes("档期样本参照")) reasons.push("同档期历史样本提供了更接近的市场时机参照。");
  if (triggers.includes("亲子长线参照")) reasons.push("样本池指向亲子或合家欢长线基本盘，能增强基础区间稳定性。");
  if (triggers.includes("传播型样本参照")) reasons.push("保留样本中存在传播型路径，能为社交扩散提供历史参照。");
  if (!reasons.length && hasHighValueSample(input)) reasons.push("市场记忆池中存在高票房参照，但尚未形成明确破圈链条。");
  return reasons.slice(0, 3);
}

function getRiskNotes(input: StudioOutcomeInput, breakoutScore: number, triggers: string[], reactorMetrics: StudioOutcomeEffects) {
  const notes: string[] = [];
  const sampleSummary = getSampleInfluenceSummary(input);
  if (triggers.includes("争议热度放大")) notes.push("争议热度会同时放大流失风险，上限不能视为稳定收益。");
  if (sampleSummary.activeCount < 3) notes.push("参与样本较少，历史参照不稳定。");
  if (sampleSummary.riskImpact === "波动增加" && sampleSummary.activeCount >= 3) notes.push("样本来源分散，结果更依赖混沌事件。");
  if (reactorMetrics.volatility >= 68) notes.push("波动值偏高，结果更依赖口碑和排片是否持续跟上。");
  if (input.selectedChaosEvents.filter((event) => event.type === "负向").length >= 2) notes.push("负向扰动较多，基础区间更可能靠近下沿。");
  if (breakoutScore > 85) notes.push("市场奇点路径需要多条传播链同时成立，属于低确定性高上限。");
  if (!notes.length) notes.push("暂无明显系统性风险，但破圈仍依赖观众自传播是否持续。");
  return notes.slice(0, 2);
}

function calculateBreakoutScore(input: StudioOutcomeInput, reactorMetrics: StudioOutcomeEffects, triggers: string[]) {
  const sampleSummary = getSampleInfluenceSummary(input);
  const strongSeason = ["spring", "summer", "national"].includes(input.selectedSeasonId ?? "");
  const premiumFormat = ["imax", "china-giant", "3d"].includes(input.selectedFormatId ?? "");
  const hasPositiveEvent = input.selectedChaosEvents.some((event) => event.type === "正向");
  const hasDoubleEdgedEvent = input.selectedChaosEvents.some((event) => event.type === "双刃剑");
  const supportCount = [
    reactorMetrics.spread >= 58,
    reactorMetrics.reputation >= 58,
    strongSeason,
    hasHighValueSample(input),
    hasPositiveEvent,
    triggers.length > 0,
  ].filter(Boolean).length;
  const rawScore =
    reactorMetrics.preheat * 0.16 +
    reactorMetrics.reputation * 0.18 +
    reactorMetrics.spread * 0.26 +
    Math.max(0, reactorMetrics.volatility - 36) * 0.08 +
    (strongSeason ? 8 : 0) +
    (premiumFormat ? 6 : 0) +
    (hasHighValueSample(input) ? 8 : 0) +
    (sampleSummary.referenceStrength === "强" ? 6 : sampleSummary.referenceStrength === "中" ? 3 : -5) +
    (sampleSummary.ceilingImpact === "破圈参照增强" ? 4 : 0) +
    (hasPositiveEvent ? 7 : 0) +
    (hasDoubleEdgedEvent ? 4 : 0) +
    Math.min(18, triggers.length * 6);
  const supportPenalty = supportCount < 2 ? 18 : supportCount < 3 ? 8 : 0;

  return Math.round(Math.max(0, Math.min(100, rawScore - supportPenalty)));
}

function getOutcomeExplanation(breakoutScore: number, triggers: string[]) {
  if (breakoutScore > 85) return `当前存在“市场奇点”路径：${triggers.slice(0, 2).join("、") || "多重传播链条"}抬高上限，但风险同步放大。`;
  if (breakoutScore >= 70) return `高上限来自${triggers.slice(0, 2).join("、") || "传播与口碑支撑"}，基础区间之外存在明显破圈可能。`;
  if (breakoutScore >= 55) return `存在轻度破圈空间，但需要传播、口碑或档期继续接力。`;
  return "本局更接近基础市场路径，尚未形成明确破圈引信。";
}

function getMarketScale(marketId: string | null) {
  if (marketId === "china") return { base: 1.16, floor: 1.08, ceiling: 1.2 };
  if (marketId === "western") return { base: 1.08, floor: 1.02, ceiling: 1.16 };
  if (marketId === "global") return { base: 1.03, floor: 0.96, ceiling: 1.26 };
  if (marketId === "japan") return { base: 0.9, floor: 0.88, ceiling: 1.08 };
  return { base: 0.82, floor: 0.82, ceiling: 0.92 };
}

function getSeasonScale(seasonId: string | null) {
  if (seasonId === "spring") return { base: 1.14, floor: 1.08, ceiling: 1.18 };
  if (seasonId === "summer") return { base: 1.12, floor: 1.02, ceiling: 1.24 };
  if (seasonId === "national") return { base: 1.18, floor: 1.06, ceiling: 1.26 };
  if (seasonId === "year-end") return { base: 1.04, floor: 1, ceiling: 1.14 };
  if (seasonId === "regular") return { base: 0.88, floor: 0.9, ceiling: 0.96 };
  return { base: 0.86, floor: 0.88, ceiling: 0.92 };
}

function getFormatScale(formatId: string | null) {
  if (formatId === "imax") return { base: 1.1, floor: 0.98, ceiling: 1.2 };
  if (formatId === "china-giant") return { base: 1.06, floor: 0.98, ceiling: 1.14 };
  if (formatId === "3d") return { base: 1.02, floor: 0.98, ceiling: 1.08 };
  if (formatId === "2d") return { base: 0.96, floor: 1.02, ceiling: 0.98 };
  return { base: 0.9, floor: 0.92, ceiling: 0.92 };
}

function getResourceScale(resourceId: string | null) {
  if (resourceId === "preheat") return { base: 1.08, floor: 0.96, ceiling: 1.24 };
  if (resourceId === "word-of-mouth") return { base: 1.02, floor: 1.08, ceiling: 1.12 };
  if (resourceId === "community") return { base: 1.04, floor: 0.96, ceiling: 1.22 };
  if (resourceId === "risk-control") return { base: 0.96, floor: 1.08, ceiling: 0.98 };
  return { base: 0.88, floor: 0.9, ceiling: 0.92 };
}

function getGenreScale(genreIds: string[]) {
  const genreWeights: Record<string, number> = {
    adventure: 0.14,
    comedy: 0.1,
    fantasy: 0.12,
    hero: 0.12,
    "sci-fi": 0.13,
    myth: 0.14,
    family: 0.09,
    music: 0.04,
    mystery: -0.03,
    animal: 0.06,
    healing: 0.02,
    youth: -0.01,
  };
  const genreLift = genreIds.reduce((total, genreId) => total + (genreWeights[genreId] ?? 0), 0);
  const mixedGenrePenalty = genreIds.length > 2 ? 0.07 : 0;
  const base = 1 + genreLift - mixedGenrePenalty;
  return {
    base: Math.max(0.78, Math.min(1.28, base)),
    floor: genreIds.includes("family") || genreIds.includes("healing") ? 1.08 : 0.98,
    ceiling: genreIds.includes("myth") || genreIds.includes("sci-fi") || genreIds.includes("hero") || genreIds.includes("fantasy") ? 1.16 : 1.02,
  };
}

export function createStudioOutcome(input: StudioOutcomeInput): StudioOutcome {
  const chaosEffects = sumChaosEffects(input.selectedChaosEvents);
  const hasStartedSelection = Boolean(
    input.selectedMarketId ||
      input.selectedSeasonId ||
      input.selectedFormatId ||
      input.selectedResourceId ||
      input.selectedGenreIds.length ||
      input.selectedChaosEvents.length,
  );
  const reactorMetrics: StudioOutcomeEffects = hasStartedSelection
    ? {
        preheat: clampMetric(28 + (input.selectedMarketId ? 12 : 0) + (input.selectedResourceId === "preheat" ? 26 : 0) + chaosEffects.heat),
        reputation: clampMetric(
          30 +
            (input.selectedGenreIds.includes("healing") || input.selectedGenreIds.includes("family") ? 18 : 0) +
            (input.selectedResourceId === "word-of-mouth" ? 24 : 0) +
            chaosEffects.reputation,
        ),
        spread: clampMetric(26 + Math.min(input.activeSampleCount, 8) * 3 + (input.selectedResourceId === "community" ? 24 : 0) + chaosEffects.spread),
        volatility: clampMetric(24 + input.selectedGenreIds.length * 7 + (input.selectedResourceId === "risk-control" ? -8 : 0) + chaosEffects.volatility),
      }
    : {
        preheat: 0,
        reputation: 0,
        spread: 0,
        volatility: 0,
      };
  const reactorMetricRows: StudioOutcomeMetricRows = [
    ["预热值", formatMetricValue(reactorMetrics.preheat), "bg-amber-300"],
    ["口碑值", formatMetricValue(reactorMetrics.reputation), "bg-emerald-300"],
    ["扩散值", formatMetricValue(reactorMetrics.spread), "bg-cyan-300"],
    ["波动值", formatMetricValue(reactorMetrics.volatility), "bg-fuchsia-300"],
  ];
  const strategyFingerprint = getStrategyFingerprint(input);
  const marketBias = getMarketBias(input);
  const marketScale = getMarketScale(input.selectedMarketId);
  const seasonScale = getSeasonScale(input.selectedSeasonId);
  const formatScale = getFormatScale(input.selectedFormatId);
  const resourceScale = getResourceScale(input.selectedResourceId);
  const genreScale = getGenreScale(input.selectedGenreIds);
  const sampleInfluenceSummary = getSampleInfluenceSummary(input);
  const sampleBaseScale =
    sampleInfluenceSummary.baseImpact === "基础盘增强" ? 1.1 : sampleInfluenceSummary.baseImpact === "基础盘稳定" ? 1.04 : 0.94;
  const sampleFloorScale =
    sampleInfluenceSummary.riskImpact === "波动降低" ? 1.08 : sampleInfluenceSummary.riskImpact === "波动增加" ? 0.9 : 1;
  const sampleCeilingScale = sampleInfluenceSummary.ceilingImpact === "破圈参照增强" ? 1.08 : sampleInfluenceSummary.activeCount < 3 ? 0.92 : 1;
  const choiceBaseScale = marketScale.base * seasonScale.base * formatScale.base * resourceScale.base * genreScale.base * sampleBaseScale;
  const choiceFloorScale = marketScale.floor * seasonScale.floor * formatScale.floor * resourceScale.floor * genreScale.floor * sampleFloorScale;
  const choiceCeilingScale = marketScale.ceiling * seasonScale.ceiling * formatScale.ceiling * resourceScale.ceiling * genreScale.ceiling * sampleCeilingScale;
  const breakoutTriggers = getBreakoutTriggers(input);
  const breakoutScore = calculateBreakoutScore(input, reactorMetrics, breakoutTriggers);
  const positiveChaosLift = input.selectedChaosEvents.filter((event) => event.type === "正向").length * 0.045;
  const negativeChaosDrag = input.selectedChaosEvents.filter((event) => event.type === "负向").length * 0.055;
  const boxOfficeBase =
    (2.8 + reactorMetrics.preheat * 0.046 + reactorMetrics.reputation * 0.058 + reactorMetrics.spread * 0.052 - reactorMetrics.volatility * 0.024) *
    choiceBaseScale;
  const boxOfficeFloor = Math.max(0.8, boxOfficeBase * (0.62 + Math.min(input.activeSampleCount, 10) * 0.018 + positiveChaosLift - negativeChaosDrag) * choiceFloorScale);
  const sampleRangeAdjustment = sampleInfluenceSummary.riskImpact === "波动降低" ? -0.12 : sampleInfluenceSummary.riskImpact === "波动增加" ? 0.16 : 0;
  const normalRatio =
    1.32 +
    Math.min(0.22, reactorMetrics.spread / 360) +
    Math.min(0.12, reactorMetrics.reputation / 520) -
    Math.min(0.1, reactorMetrics.volatility / 760) +
    sampleRangeAdjustment;
  const baseRatio = Math.max(1.25, Math.min(1.76, normalRatio));
  const baseRangeMax = Math.max(boxOfficeFloor * 1.25, Math.min(boxOfficeFloor * 1.8, boxOfficeFloor * baseRatio));
  const breakoutSupport = breakoutScore < 55 ? 0.08 : breakoutScore < 70 ? 0.24 : breakoutScore < 85 ? 0.46 : 0.72;
  const supportedCeilingScale = Math.min(1.8, Math.max(0.9, choiceCeilingScale));
  const breakoutRaw = baseRangeMax * (1 + breakoutSupport) * supportedCeilingScale;
  const breakoutCap = boxOfficeFloor + (breakoutScore < 55 ? 3.2 : breakoutScore < 70 ? 6.5 : breakoutScore < 85 ? 10 : 14);
  const breakoutValue = Math.max(baseRangeMax + 0.6, Math.min(breakoutRaw, breakoutCap));
  const baseRange = {
    min: boxOfficeFloor,
    max: baseRangeMax,
    display: formatRange(boxOfficeFloor, baseRangeMax),
  };
  const breakoutCeiling = {
    value: breakoutValue,
    display: breakoutScore < 55 || breakoutTriggers.length === 0 ? "暂无明显破圈触发" : `最高可能触达 ${breakoutValue.toFixed(1)} 亿`,
  };
  const breakoutReasons = getBreakoutReasons(input, breakoutTriggers);
  const riskNotes = getRiskNotes(input, breakoutScore, breakoutTriggers, reactorMetrics);
  const outcomeExplanation = getOutcomeExplanation(breakoutScore, breakoutTriggers);
  const marketFate = getDestinyType(reactorMetrics, strategyFingerprint);

  return {
    chaosEffects,
    reactorMetrics,
    reactorMetricRows,
    strategyFingerprint,
    marketBias,
    boxOfficeFloor: baseRange.min,
    boxOfficeCeiling: baseRange.max,
    baseRange,
    breakoutCeiling,
    breakoutScore,
    breakoutTriggers,
    breakoutReasons,
    riskNotes,
    sampleInfluenceSummary,
    marketFate,
    outcomeExplanation,
    destinyType: marketFate,
    destinyText: outcomeExplanation || getDestinyText(input, reactorMetrics),
  };
}

export const calculateStudioOutcome = createStudioOutcome;

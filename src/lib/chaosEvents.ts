import type { MarketChaosEvent } from "../types/movie";

export type ChaosDisturbanceLevel = "常见扰动" | "强扰动" | "异常扰动";

export const chaosEventLevels: Record<string, ChaosDisturbanceLevel> = {
  "short-video-remix": "强扰动",
  "audience-recommendation": "常见扰动",
  "line-goes-viral": "异常扰动",
  "rival-word-drop": "强扰动",
  "blockbuster-pressure": "强扰动",
  "expectation-backlash": "强扰动",
  "platform-controversy": "异常扰动",
  "low-first-week-screening": "常见扰动",
  "divided-audience": "常见扰动",
  "niche-recognition": "常见扰动",
  "low-confidence": "异常扰动",
  "critic-audience-gap": "强扰动",
};

export const responseTradeoffs = [
  { gain: "扩散 +12", cost: "波动 +10" },
  { gain: "口碑 +10", cost: "预热 -6" },
  { gain: "稳定 +8", cost: "上限 -8" },
];

export const chaosEventPool: MarketChaosEvent[] = [
  {
    id: "short-video-remix",
    name: "短视频二创扩散",
    type: "positive",
    description: "角色片段被大量剪辑、配音和再创作，作品开始脱离原本宣发节奏。",
    marketImpact: "可能放大初期关注度，并提升混沌路径的上行空间。",
    options: [
      { id: "amplify", label: "顺势放大素材", description: "释放更多可二创片段，允许热度快速扩散。" },
      { id: "guide", label: "引导核心话题", description: "把讨论导向角色与情绪记忆点。" },
      { id: "hold", label: "保持低干预", description: "减少官方介入，观察自发传播是否持续。" },
    ],
  },
  {
    id: "audience-recommendation",
    name: "观众自发安利",
    type: "positive",
    description: "首批观众开始主动推荐，口碑扩散从影院外部发生。",
    marketImpact: "可能增强口碑长尾，但扩散速度仍受档期竞争影响。",
    options: [
      { id: "screening", label: "追加点映场", description: "让更多早期观众参与扩散。" },
      { id: "quotes", label: "收集观众短评", description: "把真实反馈转化为传播材料。" },
      { id: "community", label: "维护核心社群", description: "优先稳定高认同观众圈层。" },
    ],
  },
  {
    id: "line-goes-viral",
    name: "角色台词出圈",
    type: "positive",
    description: "一句角色台词进入社交平台语境，被用于表情包和日常表达。",
    marketImpact: "可能提高作品识别度，但不必然转化为购票行为。",
    options: [
      { id: "meme", label: "开放表情素材", description: "降低传播门槛，让台词继续扩散。" },
      { id: "character", label: "强化角色露出", description: "把台词热度连接到角色记忆点。" },
      { id: "restrain", label: "避免过度消费", description: "防止观众对单一梗产生疲劳。" },
    ],
  },
  {
    id: "rival-word-drop",
    name: "同档期竞品口碑下滑",
    type: "positive",
    description: "同档期竞品评价回落，部分观众开始寻找替代选择。",
    marketImpact: "可能带来额外排片和转化，但窗口期通常很短。",
    options: [
      { id: "screen", label: "快速争取排片", description: "把短期机会转化为首周曝光。" },
      { id: "family", label: "突出适合人群", description: "明确告诉观众为何可以选择本片。" },
      { id: "steady", label: "维持原策略", description: "不因外部波动打乱自身节奏。" },
    ],
  },
  {
    id: "blockbuster-pressure",
    name: "同档期大片挤压",
    type: "negative",
    description: "强势影片占据注意力和排片，市场空间被压缩。",
    marketImpact: "可能降低首周曝光，保守路径权重上升。",
    options: [
      { id: "niche", label: "转向细分观众", description: "避开正面对抗，稳住核心人群。" },
      { id: "schedule", label: "集中黄金时段", description: "争取少量但更有效的场次。" },
      { id: "contrast", label: "强化差异卖点", description: "强调与大片不同的观看理由。" },
    ],
  },
  {
    id: "expectation-backlash",
    name: "预期过高导致口碑反噬",
    type: "negative",
    description: "前期热度过高，部分观众实际观影后产生落差。",
    marketImpact: "可能削弱口碑长尾，并加剧评价分化。",
    options: [
      { id: "reset", label: "降低话术强度", description: "减少绝对化宣传，重设观众预期。" },
      { id: "explain", label: "补充创作解释", description: "让观众理解作品目标与表达边界。" },
      { id: "listen", label: "回应核心争议", description: "优先处理最影响转化的负面反馈。" },
    ],
  },
  {
    id: "platform-controversy",
    name: "社交平台争议发酵",
    type: "negative",
    description: "讨论焦点偏离作品本身，争议内容开始占据搜索结果。",
    marketImpact: "可能抬高声量，也可能损伤大众观影意愿。",
    options: [
      { id: "clarify", label: "快速澄清事实", description: "先压低误解继续扩散的空间。" },
      { id: "shift", label: "转移到作品讨论", description: "用角色、音乐、情绪点重新组织话题。" },
      { id: "pause", label: "暂停高频投放", description: "避免争议期继续刺激反感情绪。" },
    ],
  },
  {
    id: "low-first-week-screening",
    name: "首周排片不足",
    type: "negative",
    description: "影院给到的初始场次有限，作品难以快速触达大众观众。",
    marketImpact: "可能限制高开，但若口碑稳定，仍可能形成慢热曲线。",
    options: [
      { id: "evidence", label: "用上座率争取场次", description: "把有效场次表现反馈给影院端。" },
      { id: "local", label: "集中重点城市", description: "先在转化更好的区域建立样本。" },
      { id: "longtail", label: "转向长尾节奏", description: "承认高开受限，优先保住后续扩散。" },
    ],
  },
  {
    id: "divided-audience",
    name: "观众评价分化",
    type: "neutral",
    description: "不同观众群体对影片的期待和评价出现明显分歧。",
    marketImpact: "结果可能向任一方向摆动，关键取决于哪类声音被放大。",
    options: [
      { id: "segment", label: "分群沟通", description: "对不同观众使用不同卖点。" },
      { id: "accept", label: "接受分化定位", description: "承认作品不是为所有观众设计。" },
      { id: "balance", label: "寻找共同情绪点", description: "提炼更普遍的情感入口。" },
    ],
  },
  {
    id: "niche-recognition",
    name: "小众圈层高度认同",
    type: "neutral",
    description: "特定圈层强烈认可作品，但大众市场尚未被充分触达。",
    marketImpact: "可能形成稳定口碑，也可能停留在小范围传播。",
    options: [
      { id: "protect", label: "保护圈层认同", description: "避免过度大众化稀释原有支持。" },
      { id: "bridge", label: "搭建大众入口", description: "把小众表达翻译成更易理解的卖点。" },
      { id: "event", label: "组织主题活动", description: "让核心观众成为传播节点。" },
    ],
  },
  {
    id: "low-confidence",
    name: "数据样本不足，模型置信度下降",
    type: "neutral",
    description: "历史邻近样本较少，模型无法稳定判断类似组合的市场走向。",
    marketImpact: "区间解释应更谨慎，混沌路径的不确定性更高。",
    options: [
      { id: "broaden", label: "扩大参照范围", description: "接受更松散的历史对照。" },
      { id: "test", label: "小范围测试反馈", description: "先获取真实观众反应再调整策略。" },
      { id: "risk", label: "保留高风险实验", description: "承认未知性，把它作为实验特征。" },
    ],
  },
  {
    id: "critic-audience-gap",
    name: "媒体评价与大众评价不一致",
    type: "neutral",
    description: "专业评价和普通观众反馈出现分离，市场信号不再统一。",
    marketImpact: "可能造成传播口径摇摆，需要判断谁更影响购票转化。",
    options: [
      { id: "audience", label: "优先大众反馈", description: "把传播重心放在普通观众体验。" },
      { id: "critic", label: "保留专业背书", description: "强调作品完成度和创作价值。" },
      { id: "dual", label: "双线表达", description: "分别维护口碑价值和观影爽点。" },
    ],
  },
];

export function drawChaosEvents(count = 2) {
  return [...chaosEventPool].sort(() => Math.random() - 0.5).slice(0, count);
}

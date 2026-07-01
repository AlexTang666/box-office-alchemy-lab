export type CountryChoice = "中国" | "美国" | "日本" | "其他";
export type SeasonChoice = "春节档" | "暑期档" | "国庆档" | "年末档" | "普通档";
export type PromotionChoice = "低成本口碑" | "粉丝预热" | "大规模宣发" | "IP 续作加持";
export type FormatChoice = "2D" | "3D" | "IMAX" | "中国巨幕";
export type BoxOfficeRange = [number, number];
export type SelectedPath = "conservative" | "normal" | "chaos";

export interface MarketEnergyAllocation {
  preheatPromotion: number;
  reputationBuild: number;
  screeningAccess: number;
  communitySpread: number;
}

export type ChaosEventType = "positive" | "negative" | "neutral";
export type ResponseType = "steady" | "spread" | "balanced";

export interface ChaosEventOption {
  id: string;
  label: string;
  description: string;
  responseType?: ResponseType;
}

export interface MarketChaosEvent {
  id: string;
  name: string;
  type: ChaosEventType;
  description: string;
  marketImpact: string;
  options: ChaosEventOption[];
}

export type ChaosEventResponses = Record<string, string>;

export interface PathFit {
  conservativeFit: number;
  normalFit: number;
  chaosFit: number;
}

export interface MovieRecord {
  id: string;
  name: string;
  releaseDate: string;
  country: string;
  countryGroup: CountryChoice;
  mainGenre: string;
  fullGenre: string;
  genres: string[];
  boxOffice: number;
  screenings: number;
  admissions: number;
  averageTicketPrice: number;
  audiencePerScreening: number;
  firstDayBoxOffice: number;
  firstWeekBoxOffice: number;
  firstWeekendBoxOffice: number;
  previewDays: number;
  previewBoxOffice: number;
  serviceFee: number;
  format: string;
  formats: string[];
  maoyanScore: number;
  wantToSee: number;
  releaseYear: number | null;
  releaseMonth: number | null;
  season: SeasonChoice;
  rank?: number;
}

export interface PlayerRecipe {
  country: CountryChoice | "";
  genres: string[];
  season: SeasonChoice | "";
  formats: FormatChoice[];
  promotion: PromotionChoice | "";
}

export interface SimulationMetrics {
  boxOfficeEnergy: number;
  reputationStability: number;
  preReleaseHeat: number;
  seasonFit: number;
  top15Probability: number;
}

export interface ChaosEvent {
  label: string;
  type: ChaosEventType;
}

export interface SimulationResult {
  title: string;
  recipe: Required<PlayerRecipe>;
  predictedBoxOffice: number;
  conservativeRange: BoxOfficeRange;
  normalRange: BoxOfficeRange;
  chaosRange: BoxOfficeRange;
  pathFit: PathFit;
  chaosEvents: ChaosEvent[];
  grade: string;
  metrics: SimulationMetrics;
  similarMovie: MovieRecord | null;
  selectedSampleSize: number;
  marketComment: string;
  playerTitle: string;
  top15Threshold: number;
  top15Potential: boolean;
  exceededMovie: MovieRecord | null;
  formulaNotes: string[];
}

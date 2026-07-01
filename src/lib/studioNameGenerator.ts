interface StudioNameInput {
  marketId: string | null;
  genreIds: string[];
  seasonId: string | null;
  formatId?: string | null;
  resourceId?: string | null;
  selectedEventIds: string[];
}

function stableIndex(seed: string, length: number) {
  const hash = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0) * 17, 0);
  return length ? Math.abs(hash) % length : 0;
}

const genreNamePools: Record<string, string[]> = {
  myth: ["《山海回声》", "《灵火少年》", "《归墟之门》"],
  oriental: ["《山海回声》", "《灵火少年》", "《归墟之门》"],
  music: ["《夏日音阶》", "《星轨练习曲》", "《告别前的旋律》"],
  youth: ["《夏日音阶》", "《星轨练习曲》", "《告别前的旋律》"],
  "sci-fi": ["《星际小队》", "《机械森林》", "《月球快递》"],
  hero: ["《星际小队》", "《机械森林》", "《月球快递》"],
  adventure: ["《云端旅人》", "《环游星球的孩子》", "《最后一张船票》"],
  family: ["《云端旅人》", "《环游星球的孩子》", "《最后一张船票》"],
  comedy: ["《笑声发射站》", "《彩虹便利店》", "《星期天怪兽》"],
  animal: ["《森林来信》", "《熊猫快递》", "《小尾巴联盟》"],
  "fairy-tale": ["《月光糖果屋》", "《风铃王国》", "《睡前星球》"],
  toy: ["《玩具星球》", "《盒子里的远方》", "《发条朋友》"],
  healing: ["《晚安云朵》", "《海边修理店》", "《慢慢亮起的灯》"],
  mystery: ["《雾中电影院》", "《第七张地图》", "《消失的片尾曲》"],
};

const marketFallbacks: Record<string, string[]> = {
  china: ["《山海回声》", "《灵火少年》", "《归墟之门》"],
  japan: ["《夏日音阶》", "《星轨练习曲》", "《告别前的旋律》"],
  western: ["《星际小队》", "《机械森林》", "《月球快递》"],
  global: ["《云端旅人》", "《环游星球的孩子》", "《最后一张船票》"],
};

export function generateStudioMovieName(input: StudioNameInput) {
  const primaryGenre = input.genreIds[0] ?? "";
  const pool = genreNamePools[primaryGenre] ?? marketFallbacks[input.marketId ?? ""] ?? ["《云图试映日》", "《银幕未定式》", "《回声放映计划》"];
  const seed = [
    input.marketId,
    input.genreIds.join("-"),
    input.seasonId,
    input.formatId,
    input.resourceId,
    input.selectedEventIds.join("-"),
  ].join("|");
  return pool[stableIndex(seed, pool.length)];
}

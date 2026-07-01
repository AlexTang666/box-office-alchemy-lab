import type { CountryChoice } from "../types/movie";

const names = {
  chinaMyth: ["星火小神仙", "龙影少年", "云海神灯", "天街小妖", "山海糖炉"],
  japanFantasy: ["月光列车", "樱色远征", "星之邮差", "风见小镇", "银河便当"],
  americaAdventure: ["疯狂小队", "银河宠物团", "奇妙都市", "霓虹玩具局", "太空甜甜圈"],
  history: ["长风万里", "少年与古城", "时间里的诗", "青铜风暴", "一页山河"],
  sciFi: ["机械月亮", "星际糖果店", "霓虹小宇宙", "光年修理铺", "蓝火航班"],
  family: ["灯火小屋", "周末魔法团", "暖星旅店", "一起看云", "屋顶电影院"],
  general: ["琥珀放映机", "梦境票根", "银幕炼金术", "小小反应炉", "第七码头"],
};

function pick(pool: string[]) {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateMovieName(country: CountryChoice, genres: string[]) {
  const genreText = genres.join("/");

  if (genreText.includes("历史")) return `《${pick(names.history)}》`;
  if (genreText.includes("科幻")) return `《${pick(names.sciFi)}》`;
  if (genreText.includes("家庭")) return `《${pick(names.family)}》`;
  if (country === "中国" && /(神话|奇幻|冒险)/.test(genreText)) return `《${pick(names.chinaMyth)}》`;
  if (country === "日本" && /(奇幻|冒险)/.test(genreText)) return `《${pick(names.japanFantasy)}》`;
  if (country === "美国" && /(喜剧|冒险)/.test(genreText)) return `《${pick(names.americaAdventure)}》`;

  return `《${pick(names.general)}》`;
}

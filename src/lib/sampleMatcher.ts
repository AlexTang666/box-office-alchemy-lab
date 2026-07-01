import type { CountryChoice, FormatChoice, MovieRecord, SeasonChoice } from "../types/movie";

export interface StudioMatchInput {
  marketId: string | null;
  genreIds: string[];
  seasonId: string | null;
  formatId: string | null;
  resourceId: string | null;
}

export interface StudioMatchedSample {
  id: string;
  name: string;
  year: number | null;
  country: string;
  genre: string;
  season: string;
  reason: string;
  tag: string;
  tags: string[];
  isTop15: boolean;
  score: number;
}

const marketToCountry: Record<string, CountryChoice | "全球"> = {
  china: "中国",
  japan: "日本",
  western: "美国",
  global: "全球",
};

const seasonMap: Record<string, SeasonChoice> = {
  spring: "春节档",
  summer: "暑期档",
  national: "国庆档",
  "year-end": "年末档",
  regular: "普通档",
};

const formatMap: Record<string, FormatChoice> = {
  "2d": "2D",
  "3d": "3D",
  imax: "IMAX",
  "china-giant": "中国巨幕",
};

const genreProfiles: Record<string, { tag: string; exact: string[]; related: string[] }> = {
  adventure: { tag: "冒险", exact: ["冒险"], related: ["奇幻", "动作", "探险"] },
  comedy: { tag: "喜剧", exact: ["喜剧"], related: ["合家欢", "幽默"] },
  fantasy: { tag: "奇幻", exact: ["奇幻"], related: ["童话", "魔法", "公主"] },
  hero: { tag: "动作英雄", exact: ["动作", "英雄", "武侠"], related: ["超级英雄", "侠", "冒险"] },
  "sci-fi": { tag: "科幻", exact: ["科幻"], related: ["未来", "太空", "机器人"] },
  myth: { tag: "神话/玄幻", exact: ["神话", "玄幻"], related: ["古装", "传说", "西游", "奇幻"] },
  family: { tag: "儿童/家庭", exact: ["儿童", "家庭", "亲情"], related: ["亲子", "合家欢", "喜剧"] },
  music: { tag: "音乐/歌舞", exact: ["音乐", "歌舞"], related: ["青春", "成长"] },
  mystery: { tag: "悬疑侦探", exact: ["悬疑", "侦探"], related: ["推理", "犯罪"] },
  animal: { tag: "动物角色", exact: ["动物"], related: ["萌宠", "熊", "熊猫", "兽"] },
  healing: { tag: "亲情治愈", exact: ["亲情", "家庭", "治愈"], related: ["成长", "温情"] },
  youth: { tag: "青春成长", exact: ["青春"], related: ["成长", "少年", "校园", "励志"] },
};

function getGenreText(movie: MovieRecord) {
  return [movie.name, movie.mainGenre, movie.fullGenre, ...movie.genres].join("/");
}

function getGenreScore(movie: MovieRecord, genreIds: string[]) {
  if (!genreIds.length) {
    return { score: 0, matchedTags: [] as string[] };
  }

  const genreText = getGenreText(movie);
  const matchedTags: string[] = [];
  const score = genreIds.reduce((total, id) => {
    const profile = genreProfiles[id];
    if (!profile) return total;

    if (profile.exact.some((keyword) => genreText.includes(keyword))) {
      matchedTags.push(profile.tag);
      return total + 24;
    }

    if (profile.related.some((keyword) => genreText.includes(keyword))) {
      matchedTags.push(profile.tag);
      return total + 12;
    }

    return total;
  }, 0);

  return { score: Math.min(score, 48), matchedTags: Array.from(new Set(matchedTags)) };
}

function hasFormat(movie: MovieRecord, format: FormatChoice) {
  return movie.formats.some((item) => item.includes(format) || format.includes(item));
}

function bestReason(scoreParts: { reason: string; tag: string; value: number }[]) {
  const best = [...scoreParts].sort((a, b) => b.value - a.value)[0];
  return best && best.value > 0 ? best : { reason: "使用更宽泛的历史参照", tag: "历史样本", value: 0 };
}

export function matchStudioSamples(
  movies: MovieRecord[],
  top15: MovieRecord[],
  input: StudioMatchInput,
  limit = 12,
) {
  const top15Names = new Set(top15.map((movie) => movie.name));
  const selectedCountry = input.marketId ? marketToCountry[input.marketId] : null;
  const selectedSeason = input.seasonId ? seasonMap[input.seasonId] : null;
  const selectedFormat = input.formatId ? formatMap[input.formatId] : null;

  const source = movies.length ? movies : top15;
  const scored = source.map((movie) => {
    const genreMatch = getGenreScore(movie, input.genreIds);
    const parts = [
      {
        reason: genreMatch.matchedTags.length ? `题材接近：${genreMatch.matchedTags.join("/")}` : "题材气质接近",
        tag: "同题材",
        value: genreMatch.score,
      },
      {
        reason: `${movie.season}样本`,
        tag: "同档期",
        value: selectedSeason && movie.season === selectedSeason ? 26 : 0,
      },
      {
        reason: `${movie.countryGroup}市场参照`,
        tag: "同市场",
        value: selectedCountry && selectedCountry !== "全球" && movie.countryGroup === selectedCountry ? 22 : 0,
      },
      {
        reason: "观看规格接近",
        tag: "同制式",
        value: selectedFormat && hasFormat(movie, selectedFormat) ? 12 : 0,
      },
      {
        reason: "历史高票房样本",
        tag: "高票房样本",
        value: top15Names.has(movie.name) ? 10 : 0,
      },
      {
        reason: "传播热度可参考",
        tag: "传播型样本",
        value: input.resourceId === "community" || input.resourceId === "preheat" ? Math.min(8, Math.log10(movie.wantToSee + 10)) : 0,
      },
    ];
    const best = bestReason(parts);

    const positiveTags = parts
      .filter((part) => part.value > 0)
      .map((part) => part.tag);

    return {
      movie,
      reason: best.reason,
      tag: best.tag,
      tags: Array.from(new Set(positiveTags)),
      score: parts.reduce((sum, part) => sum + part.value, 0),
    };
  });

  const matches = scored
    .sort((a, b) => b.score - a.score || b.movie.boxOffice - a.movie.boxOffice)
    .slice(0, limit)
    .map(({ movie, reason, tag, tags, score }) => ({
      id: movie.id,
      name: movie.name,
      year: movie.releaseYear,
      country: movie.countryGroup,
      genre: movie.genres.find((genre) => genre !== "动画") || movie.mainGenre || "动画",
      season: movie.season,
      reason,
      tag,
      tags: tags.length ? tags.slice(0, 4) : [tag],
      isTop15: top15Names.has(movie.name),
      score,
    }));

  return {
    samples: matches,
    fallback: matches.length === 0 || matches[0].score < 20,
  };
}

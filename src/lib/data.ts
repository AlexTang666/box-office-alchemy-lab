import type { MovieRecord } from "../types/movie";

export interface GameData {
  movies: MovieRecord[];
  top15: MovieRecord[];
}

async function fetchJson<T>(fileName: string): Promise<T> {
  const base = import.meta.env.BASE_URL || "/";
  const url = `${base.replace(/\/$/, "")}/data/${fileName}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`无法读取 ${fileName}`);
  }
  return response.json() as Promise<T>;
}

export async function loadGameData(): Promise<GameData> {
  const [movies, top15] = await Promise.all([
    fetchJson<MovieRecord[]>("movieData.json"),
    fetchJson<MovieRecord[]>("top15Data.json"),
  ]);

  return {
    movies: movies.filter((movie) => movie.boxOffice > 0),
    top15: top15.filter((movie) => movie.boxOffice > 0).sort((a, b) => b.boxOffice - a.boxOffice),
  };
}

export function formatBillionYuan(value: number) {
  const yi = value / 100_000_000;
  if (yi >= 10) return `${yi.toFixed(1)} 亿`;
  if (yi >= 1) return `${yi.toFixed(2)} 亿`;
  return `${yi.toFixed(3)} 亿`;
}

export function formatCount(value: number) {
  if (!value) return "暂无";
  if (value >= 10_000) return `${Math.round(value / 10_000).toLocaleString("zh-CN")} 万`;
  return Math.round(value).toLocaleString("zh-CN");
}

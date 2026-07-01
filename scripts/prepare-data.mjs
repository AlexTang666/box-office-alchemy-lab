import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const publicDataDir = path.join(rootDir, "public", "data");

const sources = {
  movie: path.join(dataDir, "2015-2025动画电影.xlsx"),
  top15: path.join(dataDir, "票房Top15动画电影.xlsx"),
};

const moneyFields = new Set([
  "票房",
  "首日票房",
  "首周票房",
  "首周末票房",
  "点映票房",
  "服务费",
]);

const peopleFields = new Set(["人次"]);
const countFields = new Set(["场次", "猫眼想看数", "点映天数"]);
const scoreFields = new Set(["平均票价", "场均人次", "猫眼评分"]);
const integerFields = new Set(["上映年份", "上映月份"]);

const cleanKey = (key) => String(key ?? "").trim();

function readWorkbookRows(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`找不到数据文件：${filePath}`);
  }

  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true }).map((row) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(row)) {
      cleaned[cleanKey(key)] = value;
    }
    return cleaned;
  });
}

function stripNumberText(value) {
  return String(value)
    .trim()
    .replace(/,/g, "")
    .replace(/，/g, "")
    .replace(/\s/g, "");
}

function parsePlainNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = stripNumberText(value);
  if (!text || text === "-" || text === "—") return null;
  const match = text.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function inferScale(rows, field, kind) {
  const values = rows
    .map((row) => row[field])
    .filter((value) => value !== null && value !== undefined && value !== "")
    .filter((value) => typeof value === "number")
    .filter((value) => Number.isFinite(value));

  if (!values.length) return 1;
  const max = Math.max(...values);

  if (kind === "money") {
    const grossValues = rows
      .map((row) => row["票房"])
      .filter((value) => typeof value === "number")
      .filter((value) => Number.isFinite(value));
    const grossMax = grossValues.length ? Math.max(...grossValues) : 0;
    if (grossMax >= 100_000_000) return 1;
    if (max >= 100_000_000) return 1;
    if (max >= 1_000) return 10_000;
    if (max >= 10) return 100_000_000;
    return 10_000;
  }

  if (kind === "people") {
    return max >= 1_000_000 ? 1 : 10_000;
  }

  if (kind === "count") {
    if (field === "场次") return max >= 1_000_000 ? 1 : 10_000;
    if (field === "猫眼想看数") return max >= 100_000 ? 1 : 10_000;
  }

  return 1;
}

function parseScaledNumber(value, scale = 1) {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value * scale;

  const text = stripNumberText(value);
  if (!text || text === "-" || text === "—") return null;
  const plain = parsePlainNumber(text);
  if (plain === null) return null;

  if (text.includes("亿")) return plain * 100_000_000;
  if (text.includes("万")) return plain * 10_000;
  return plain * scale;
}

function parseDateValue(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number" && value > 20_000 && value < 80_000) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const month = String(parsed.m).padStart(2, "0");
      const day = String(parsed.d).padStart(2, "0");
      return `${parsed.y}-${month}-${day}`;
    }
  }
  return value ? String(value).trim() : "";
}

function splitList(value) {
  if (!value) return [];
  return String(value)
    .split(/[\/、,，;；]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function countryGroup(country) {
  const text = String(country ?? "").trim();
  if (text.includes("中国")) return "中国";
  if (text.includes("美国")) return "美国";
  if (text.includes("日本")) return "日本";
  return "其他";
}

function seasonFromMonth(month) {
  const numericMonth = Number(month);
  if ([1, 2].includes(numericMonth)) return "春节档";
  if ([7, 8].includes(numericMonth)) return "暑期档";
  if ([9, 10].includes(numericMonth)) return "国庆档";
  if ([11, 12].includes(numericMonth)) return "年末档";
  return "普通档";
}

function normalizeRows(rows) {
  const scales = {};
  for (const field of moneyFields) scales[field] = inferScale(rows, field, "money");
  for (const field of peopleFields) scales[field] = inferScale(rows, field, "people");
  for (const field of countFields) scales[field] = inferScale(rows, field, "count");

  return rows
    .map((row, index) => {
      const normalized = {};

      for (const [key, value] of Object.entries(row)) {
        if (moneyFields.has(key) || peopleFields.has(key) || countFields.has(key)) {
          normalized[key] = parseScaledNumber(value, scales[key] ?? 1);
        } else if (scoreFields.has(key)) {
          normalized[key] = parsePlainNumber(value);
        } else if (integerFields.has(key)) {
          const number = parsePlainNumber(value);
          normalized[key] = number === null ? null : Math.round(number);
        } else if (key === "上映时间") {
          normalized[key] = parseDateValue(value);
        } else {
          normalized[key] = value === null || value === undefined ? "" : String(value).trim();
        }
      }

      const month =
        normalized["上映月份"] ??
        (normalized["上映时间"] ? Number(String(normalized["上映时间"]).slice(5, 7)) : null);
      const genres = splitList(normalized["完整类型"] || normalized["主类型"]);
      const formats = splitList(normalized["影片制式"]);
      const boxOffice = normalized["票房"] ?? 0;

      return {
        id: `${normalized["影片名称"] || "未命名影片"}-${normalized["上映年份"] || "未知"}-${index}`,
        name: normalized["影片名称"] || "未命名影片",
        releaseDate: normalized["上映时间"] || "",
        country: normalized["国别"] || "",
        countryGroup: countryGroup(normalized["国别"]),
        mainGenre: normalized["主类型"] || genres[0] || "",
        fullGenre: normalized["完整类型"] || normalized["主类型"] || "",
        genres,
        boxOffice,
        screenings: normalized["场次"] ?? 0,
        admissions: normalized["人次"] ?? 0,
        averageTicketPrice: normalized["平均票价"] ?? 0,
        audiencePerScreening: normalized["场均人次"] ?? 0,
        firstDayBoxOffice: normalized["首日票房"] ?? 0,
        firstWeekBoxOffice: normalized["首周票房"] ?? 0,
        firstWeekendBoxOffice: normalized["首周末票房"] ?? 0,
        previewDays: normalized["点映天数"] ?? 0,
        previewBoxOffice: normalized["点映票房"] ?? 0,
        serviceFee: normalized["服务费"] ?? 0,
        format: normalized["影片制式"] || "",
        formats,
        maoyanScore: normalized["猫眼评分"] ?? 0,
        wantToSee: normalized["猫眼想看数"] ?? 0,
        releaseYear: normalized["上映年份"] ?? null,
        releaseMonth: month,
        season: seasonFromMonth(month),
      };
    })
    .filter((movie) => movie.name && movie.boxOffice > 0)
    .sort((a, b) => b.boxOffice - a.boxOffice);
}

function writeJson(fileName, rows) {
  fs.mkdirSync(publicDataDir, { recursive: true });
  const outputPath = path.join(publicDataDir, fileName);
  fs.writeFileSync(outputPath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  return outputPath;
}

const movieData = normalizeRows(readWorkbookRows(sources.movie));
const top15Data = normalizeRows(readWorkbookRows(sources.top15)).map((movie, index) => ({
  ...movie,
  rank: index + 1,
}));

const movieOutput = writeJson("movieData.json", movieData);
const top15Output = writeJson("top15Data.json", top15Data);

console.log(`已生成 ${movieOutput}，共 ${movieData.length} 条基础电影数据。`);
console.log(`已生成 ${top15Output}，共 ${top15Data.length} 条 Top15 数据。`);

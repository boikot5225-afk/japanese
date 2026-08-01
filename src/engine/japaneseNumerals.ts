const digitValues: Record<string, number> = {
  "〇": 0,
  "零": 0,
  "一": 1,
  "二": 2,
  "三": 3,
  "四": 4,
  "五": 5,
  "六": 6,
  "七": 7,
  "八": 8,
  "九": 9,
};

const smallUnitValues: Record<string, number> = {
  "十": 10,
  "百": 100,
  "千": 1000,
};

const japaneseNumeralPattern = /^[〇零一二三四五六七八九十百千万]+$/u;
const positionalKanjiPattern = /^[〇零一二三四五六七八九]+$/u;

const cleanNumericText = (value: string): string =>
  value
    .trim()
    .normalize("NFKC")
    .replace(/[\s　,，._]/gu, "");

const safeInteger = (value: number): number | null =>
  Number.isSafeInteger(value) && value >= 0 ? value : null;

export function parseJapaneseInteger(value: string): number | null {
  const text = cleanNumericText(value);
  if (!text) return null;

  if (/^\d+$/u.test(text)) {
    return safeInteger(Number(text));
  }

  if (!japaneseNumeralPattern.test(text)) return null;

  if (positionalKanjiPattern.test(text)) {
    const digits = [...text].map((character) => digitValues[character]);
    if (digits.some((digit) => digit === undefined)) return null;
    return safeInteger(Number(digits.join("")));
  }

  let total = 0;
  let section = 0;
  let pendingDigit: number | null = null;
  let previousSmallUnit = Number.POSITIVE_INFINITY;

  for (const character of text) {
    const digit = digitValues[character];
    if (digit !== undefined) {
      if (pendingDigit !== null) return null;
      pendingDigit = digit;
      continue;
    }

    if (character === "万") {
      section += pendingDigit ?? 0;
      if (section === 0) section = 1;
      total += section * 10_000;
      section = 0;
      pendingDigit = null;
      previousSmallUnit = Number.POSITIVE_INFINITY;
      continue;
    }

    const unit = smallUnitValues[character];
    if (unit === undefined || unit >= previousSmallUnit) return null;
    section += (pendingDigit ?? 1) * unit;
    pendingDigit = null;
    previousSmallUnit = unit;
  }

  return safeInteger(total + section + (pendingDigit ?? 0));
}

export function replaceJapaneseNumeralsWithArabic(value: string): string {
  return value.replace(/[〇零一二三四五六七八九十百千万]+/gu, (token) => {
    const parsed = parseJapaneseInteger(token);
    return parsed === null ? token : String(parsed);
  });
}

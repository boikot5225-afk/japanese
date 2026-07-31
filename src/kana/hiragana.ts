export type HiraganaRowId =
  | "vowels"
  | "k"
  | "s"
  | "t"
  | "n"
  | "h"
  | "m"
  | "y"
  | "r"
  | "w"
  | "n-final";

export interface KanaSymbol {
  id: string;
  kana: string;
  romaji: string;
  rowId: HiraganaRowId;
}

export interface HiraganaRow {
  id: HiraganaRowId;
  label: string;
  symbols: KanaSymbol[];
}

const symbol = (rowId: HiraganaRowId, kana: string, romaji: string): KanaSymbol => ({
  id: `hiragana-${romaji}`,
  kana,
  romaji,
  rowId,
});

export const hiraganaRows: readonly HiraganaRow[] = [
  {
    id: "vowels",
    label: "Гласные",
    symbols: [
      symbol("vowels", "あ", "a"),
      symbol("vowels", "い", "i"),
      symbol("vowels", "う", "u"),
      symbol("vowels", "え", "e"),
      symbol("vowels", "お", "o"),
    ],
  },
  {
    id: "k",
    label: "K",
    symbols: [
      symbol("k", "か", "ka"),
      symbol("k", "き", "ki"),
      symbol("k", "く", "ku"),
      symbol("k", "け", "ke"),
      symbol("k", "こ", "ko"),
    ],
  },
  {
    id: "s",
    label: "S",
    symbols: [
      symbol("s", "さ", "sa"),
      symbol("s", "し", "shi"),
      symbol("s", "す", "su"),
      symbol("s", "せ", "se"),
      symbol("s", "そ", "so"),
    ],
  },
  {
    id: "t",
    label: "T",
    symbols: [
      symbol("t", "た", "ta"),
      symbol("t", "ち", "chi"),
      symbol("t", "つ", "tsu"),
      symbol("t", "て", "te"),
      symbol("t", "と", "to"),
    ],
  },
  {
    id: "n",
    label: "N",
    symbols: [
      symbol("n", "な", "na"),
      symbol("n", "に", "ni"),
      symbol("n", "ぬ", "nu"),
      symbol("n", "ね", "ne"),
      symbol("n", "の", "no"),
    ],
  },
  {
    id: "h",
    label: "H",
    symbols: [
      symbol("h", "は", "ha"),
      symbol("h", "ひ", "hi"),
      symbol("h", "ふ", "fu"),
      symbol("h", "へ", "he"),
      symbol("h", "ほ", "ho"),
    ],
  },
  {
    id: "m",
    label: "M",
    symbols: [
      symbol("m", "ま", "ma"),
      symbol("m", "み", "mi"),
      symbol("m", "む", "mu"),
      symbol("m", "め", "me"),
      symbol("m", "も", "mo"),
    ],
  },
  {
    id: "y",
    label: "Y",
    symbols: [
      symbol("y", "や", "ya"),
      symbol("y", "ゆ", "yu"),
      symbol("y", "よ", "yo"),
    ],
  },
  {
    id: "r",
    label: "R",
    symbols: [
      symbol("r", "ら", "ra"),
      symbol("r", "り", "ri"),
      symbol("r", "る", "ru"),
      symbol("r", "れ", "re"),
      symbol("r", "ろ", "ro"),
    ],
  },
  {
    id: "w",
    label: "W",
    symbols: [symbol("w", "わ", "wa"), symbol("w", "を", "wo")],
  },
  {
    id: "n-final",
    label: "Финальная N",
    symbols: [symbol("n-final", "ん", "n")],
  },
];

export const basicHiragana: readonly KanaSymbol[] = hiraganaRows.flatMap((row) => row.symbols);

export function findHiraganaSymbol(symbolId: string): KanaSymbol | undefined {
  return basicHiragana.find((item) => item.id === symbolId);
}

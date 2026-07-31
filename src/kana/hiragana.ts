export type KanaSetId = "basic" | "voiced" | "contracted";

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
  | "n-final"
  | "g"
  | "z"
  | "d"
  | "b"
  | "p"
  | "ky"
  | "gy"
  | "sh"
  | "j"
  | "ch"
  | "ny"
  | "hy"
  | "by"
  | "py"
  | "my"
  | "ry";

export interface KanaSymbol {
  id: string;
  kana: string;
  romaji: string;
  rowId: HiraganaRowId;
  setId: KanaSetId;
  acceptableRomaji?: string[];
  noteRu?: string;
}

export interface HiraganaRow {
  id: HiraganaRowId;
  label: string;
  setId: KanaSetId;
  symbols: KanaSymbol[];
}

const symbol = (
  rowId: HiraganaRowId,
  setId: KanaSetId,
  kana: string,
  romaji: string,
  options: {
    idSuffix?: string;
    acceptableRomaji?: string[];
    noteRu?: string;
  } = {},
): KanaSymbol => ({
  id:
    setId === "basic"
      ? `hiragana-${options.idSuffix ?? romaji}`
      : `hiragana-${setId}-${options.idSuffix ?? romaji}`,
  kana,
  romaji,
  rowId,
  setId,
  acceptableRomaji: options.acceptableRomaji,
  noteRu: options.noteRu,
});

export const hiraganaRows: readonly HiraganaRow[] = [
  {
    id: "vowels",
    label: "Гласные",
    setId: "basic",
    symbols: [
      symbol("vowels", "basic", "あ", "a"),
      symbol("vowels", "basic", "い", "i"),
      symbol("vowels", "basic", "う", "u"),
      symbol("vowels", "basic", "え", "e"),
      symbol("vowels", "basic", "お", "o"),
    ],
  },
  {
    id: "k",
    label: "K",
    setId: "basic",
    symbols: [
      symbol("k", "basic", "か", "ka"),
      symbol("k", "basic", "き", "ki"),
      symbol("k", "basic", "く", "ku"),
      symbol("k", "basic", "け", "ke"),
      symbol("k", "basic", "こ", "ko"),
    ],
  },
  {
    id: "s",
    label: "S",
    setId: "basic",
    symbols: [
      symbol("s", "basic", "さ", "sa"),
      symbol("s", "basic", "し", "shi", { acceptableRomaji: ["si"] }),
      symbol("s", "basic", "す", "su"),
      symbol("s", "basic", "せ", "se"),
      symbol("s", "basic", "そ", "so"),
    ],
  },
  {
    id: "t",
    label: "T",
    setId: "basic",
    symbols: [
      symbol("t", "basic", "た", "ta"),
      symbol("t", "basic", "ち", "chi", { acceptableRomaji: ["ti"] }),
      symbol("t", "basic", "つ", "tsu", { acceptableRomaji: ["tu"] }),
      symbol("t", "basic", "て", "te"),
      symbol("t", "basic", "と", "to"),
    ],
  },
  {
    id: "n",
    label: "N",
    setId: "basic",
    symbols: [
      symbol("n", "basic", "な", "na"),
      symbol("n", "basic", "に", "ni"),
      symbol("n", "basic", "ぬ", "nu"),
      symbol("n", "basic", "ね", "ne"),
      symbol("n", "basic", "の", "no"),
    ],
  },
  {
    id: "h",
    label: "H",
    setId: "basic",
    symbols: [
      symbol("h", "basic", "は", "ha"),
      symbol("h", "basic", "ひ", "hi"),
      symbol("h", "basic", "ふ", "fu", { acceptableRomaji: ["hu"] }),
      symbol("h", "basic", "へ", "he"),
      symbol("h", "basic", "ほ", "ho"),
    ],
  },
  {
    id: "m",
    label: "M",
    setId: "basic",
    symbols: [
      symbol("m", "basic", "ま", "ma"),
      symbol("m", "basic", "み", "mi"),
      symbol("m", "basic", "む", "mu"),
      symbol("m", "basic", "め", "me"),
      symbol("m", "basic", "も", "mo"),
    ],
  },
  {
    id: "y",
    label: "Y",
    setId: "basic",
    symbols: [
      symbol("y", "basic", "や", "ya"),
      symbol("y", "basic", "ゆ", "yu"),
      symbol("y", "basic", "よ", "yo"),
    ],
  },
  {
    id: "r",
    label: "R",
    setId: "basic",
    symbols: [
      symbol("r", "basic", "ら", "ra"),
      symbol("r", "basic", "り", "ri"),
      symbol("r", "basic", "る", "ru"),
      symbol("r", "basic", "れ", "re"),
      symbol("r", "basic", "ろ", "ro"),
    ],
  },
  {
    id: "w",
    label: "W",
    setId: "basic",
    symbols: [symbol("w", "basic", "わ", "wa"), symbol("w", "basic", "を", "wo")],
  },
  {
    id: "n-final",
    label: "Финальная N",
    setId: "basic",
    symbols: [symbol("n-final", "basic", "ん", "n")],
  },
];

export const voicedHiraganaRows: readonly HiraganaRow[] = [
  {
    id: "g",
    label: "G · дакутэн",
    setId: "voiced",
    symbols: [
      symbol("g", "voiced", "が", "ga"),
      symbol("g", "voiced", "ぎ", "gi"),
      symbol("g", "voiced", "ぐ", "gu"),
      symbol("g", "voiced", "げ", "ge"),
      symbol("g", "voiced", "ご", "go"),
    ],
  },
  {
    id: "z",
    label: "Z/J · дакутэн",
    setId: "voiced",
    symbols: [
      symbol("z", "voiced", "ざ", "za"),
      symbol("z", "voiced", "じ", "ji", { acceptableRomaji: ["zi"] }),
      symbol("z", "voiced", "ず", "zu"),
      symbol("z", "voiced", "ぜ", "ze"),
      symbol("z", "voiced", "ぞ", "zo"),
    ],
  },
  {
    id: "d",
    label: "D · дакутэн",
    setId: "voiced",
    symbols: [
      symbol("d", "voiced", "だ", "da"),
      symbol("d", "voiced", "ぢ", "di", {
        acceptableRomaji: ["ji"],
        noteRu: "Редкий знак. Обычно произносится почти как じ; di удобно использовать при вводе.",
      }),
      symbol("d", "voiced", "づ", "du", {
        acceptableRomaji: ["zu"],
        noteRu: "Редкий знак. Обычно произносится почти как ず; du удобно использовать при вводе.",
      }),
      symbol("d", "voiced", "で", "de"),
      symbol("d", "voiced", "ど", "do"),
    ],
  },
  {
    id: "b",
    label: "B · дакутэн",
    setId: "voiced",
    symbols: [
      symbol("b", "voiced", "ば", "ba"),
      symbol("b", "voiced", "び", "bi"),
      symbol("b", "voiced", "ぶ", "bu"),
      symbol("b", "voiced", "べ", "be"),
      symbol("b", "voiced", "ぼ", "bo"),
    ],
  },
  {
    id: "p",
    label: "P · хандакутэн",
    setId: "voiced",
    symbols: [
      symbol("p", "voiced", "ぱ", "pa"),
      symbol("p", "voiced", "ぴ", "pi"),
      symbol("p", "voiced", "ぷ", "pu"),
      symbol("p", "voiced", "ぺ", "pe"),
      symbol("p", "voiced", "ぽ", "po"),
    ],
  },
];

export const contractedHiraganaRows: readonly HiraganaRow[] = [
  {
    id: "ky",
    label: "KY",
    setId: "contracted",
    symbols: [
      symbol("ky", "contracted", "きゃ", "kya"),
      symbol("ky", "contracted", "きゅ", "kyu"),
      symbol("ky", "contracted", "きょ", "kyo"),
    ],
  },
  {
    id: "gy",
    label: "GY",
    setId: "contracted",
    symbols: [
      symbol("gy", "contracted", "ぎゃ", "gya"),
      symbol("gy", "contracted", "ぎゅ", "gyu"),
      symbol("gy", "contracted", "ぎょ", "gyo"),
    ],
  },
  {
    id: "sh",
    label: "SH",
    setId: "contracted",
    symbols: [
      symbol("sh", "contracted", "しゃ", "sha", { acceptableRomaji: ["sya"] }),
      symbol("sh", "contracted", "しゅ", "shu", { acceptableRomaji: ["syu"] }),
      symbol("sh", "contracted", "しょ", "sho", { acceptableRomaji: ["syo"] }),
    ],
  },
  {
    id: "j",
    label: "J",
    setId: "contracted",
    symbols: [
      symbol("j", "contracted", "じゃ", "ja", { acceptableRomaji: ["jya", "zya"] }),
      symbol("j", "contracted", "じゅ", "ju", { acceptableRomaji: ["jyu", "zyu"] }),
      symbol("j", "contracted", "じょ", "jo", { acceptableRomaji: ["jyo", "zyo"] }),
    ],
  },
  {
    id: "ch",
    label: "CH",
    setId: "contracted",
    symbols: [
      symbol("ch", "contracted", "ちゃ", "cha", { acceptableRomaji: ["tya"] }),
      symbol("ch", "contracted", "ちゅ", "chu", { acceptableRomaji: ["tyu"] }),
      symbol("ch", "contracted", "ちょ", "cho", { acceptableRomaji: ["tyo"] }),
    ],
  },
  {
    id: "ny",
    label: "NY",
    setId: "contracted",
    symbols: [
      symbol("ny", "contracted", "にゃ", "nya"),
      symbol("ny", "contracted", "にゅ", "nyu"),
      symbol("ny", "contracted", "にょ", "nyo"),
    ],
  },
  {
    id: "hy",
    label: "HY",
    setId: "contracted",
    symbols: [
      symbol("hy", "contracted", "ひゃ", "hya"),
      symbol("hy", "contracted", "ひゅ", "hyu"),
      symbol("hy", "contracted", "ひょ", "hyo"),
    ],
  },
  {
    id: "by",
    label: "BY",
    setId: "contracted",
    symbols: [
      symbol("by", "contracted", "びゃ", "bya"),
      symbol("by", "contracted", "びゅ", "byu"),
      symbol("by", "contracted", "びょ", "byo"),
    ],
  },
  {
    id: "py",
    label: "PY",
    setId: "contracted",
    symbols: [
      symbol("py", "contracted", "ぴゃ", "pya"),
      symbol("py", "contracted", "ぴゅ", "pyu"),
      symbol("py", "contracted", "ぴょ", "pyo"),
    ],
  },
  {
    id: "my",
    label: "MY",
    setId: "contracted",
    symbols: [
      symbol("my", "contracted", "みゃ", "mya"),
      symbol("my", "contracted", "みゅ", "myu"),
      symbol("my", "contracted", "みょ", "myo"),
    ],
  },
  {
    id: "ry",
    label: "RY",
    setId: "contracted",
    symbols: [
      symbol("ry", "contracted", "りゃ", "rya"),
      symbol("ry", "contracted", "りゅ", "ryu"),
      symbol("ry", "contracted", "りょ", "ryo"),
    ],
  },
];

export const basicHiragana: readonly KanaSymbol[] = hiraganaRows.flatMap((row) => row.symbols);
export const voicedHiragana: readonly KanaSymbol[] = voicedHiraganaRows.flatMap(
  (row) => row.symbols,
);
export const contractedHiragana: readonly KanaSymbol[] = contractedHiraganaRows.flatMap(
  (row) => row.symbols,
);
export const allHiraganaUnits: readonly KanaSymbol[] = [
  ...basicHiragana,
  ...voicedHiragana,
  ...contractedHiragana,
];

export const hiraganaRowsBySet: Record<KanaSetId, readonly HiraganaRow[]> = {
  basic: hiraganaRows,
  voiced: voicedHiraganaRows,
  contracted: contractedHiraganaRows,
};

export const hiraganaUnitsBySet: Record<KanaSetId, readonly KanaSymbol[]> = {
  basic: basicHiragana,
  voiced: voicedHiragana,
  contracted: contractedHiragana,
};

export function findHiraganaSymbol(symbolId: string): KanaSymbol | undefined {
  return allHiraganaUnits.find((item) => item.id === symbolId);
}

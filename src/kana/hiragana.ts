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
  inputRomaji?: string;
  acceptableRomaji?: string[];
  acceptableInput?: string[];
  listeningEligible?: boolean;
  noteRu?: string;
}

export interface HiraganaRow {
  id: HiraganaRowId;
  label: string;
  setId: KanaSetId;
  symbols: KanaSymbol[];
}

interface SymbolOptions {
  idSuffix?: string;
  inputRomaji?: string;
  acceptableRomaji?: string[];
  acceptableInput?: string[];
  listeningEligible?: boolean;
  noteRu?: string;
}

const symbol = (
  rowId: HiraganaRowId,
  setId: KanaSetId,
  kana: string,
  romaji: string,
  options: SymbolOptions = {},
): KanaSymbol => ({
  id:
    setId === "basic"
      ? `hiragana-${options.idSuffix ?? options.inputRomaji ?? romaji}`
      : `hiragana-${setId}-${options.idSuffix ?? options.inputRomaji ?? romaji}`,
  kana,
  romaji,
  rowId,
  setId,
  inputRomaji: options.inputRomaji,
  acceptableRomaji: options.acceptableRomaji,
  acceptableInput: options.acceptableInput,
  listeningEligible: options.listeningEligible,
  noteRu: options.noteRu,
});

const row = (
  id: HiraganaRowId,
  label: string,
  setId: KanaSetId,
  symbols: KanaSymbol[],
): HiraganaRow => ({ id, label, setId, symbols });

export const hiraganaRows: readonly HiraganaRow[] = [
  row("vowels", "Гласные", "basic", [
    symbol("vowels", "basic", "あ", "a"),
    symbol("vowels", "basic", "い", "i"),
    symbol("vowels", "basic", "う", "u"),
    symbol("vowels", "basic", "え", "e"),
    symbol("vowels", "basic", "お", "o"),
  ]),
  row("k", "K", "basic", [
    symbol("k", "basic", "か", "ka"),
    symbol("k", "basic", "き", "ki"),
    symbol("k", "basic", "く", "ku"),
    symbol("k", "basic", "け", "ke"),
    symbol("k", "basic", "こ", "ko"),
  ]),
  row("s", "S", "basic", [
    symbol("s", "basic", "さ", "sa"),
    symbol("s", "basic", "し", "shi", { acceptableRomaji: ["si"], acceptableInput: ["si"] }),
    symbol("s", "basic", "す", "su"),
    symbol("s", "basic", "せ", "se"),
    symbol("s", "basic", "そ", "so"),
  ]),
  row("t", "T", "basic", [
    symbol("t", "basic", "た", "ta"),
    symbol("t", "basic", "ち", "chi", { acceptableRomaji: ["ti"], acceptableInput: ["ti"] }),
    symbol("t", "basic", "つ", "tsu", { acceptableRomaji: ["tu"], acceptableInput: ["tu"] }),
    symbol("t", "basic", "て", "te"),
    symbol("t", "basic", "と", "to"),
  ]),
  row("n", "N", "basic", [
    symbol("n", "basic", "な", "na"),
    symbol("n", "basic", "に", "ni"),
    symbol("n", "basic", "ぬ", "nu"),
    symbol("n", "basic", "ね", "ne"),
    symbol("n", "basic", "の", "no"),
  ]),
  row("h", "H", "basic", [
    symbol("h", "basic", "は", "ha"),
    symbol("h", "basic", "ひ", "hi"),
    symbol("h", "basic", "ふ", "fu", { acceptableRomaji: ["hu"], acceptableInput: ["hu"] }),
    symbol("h", "basic", "へ", "he"),
    symbol("h", "basic", "ほ", "ho"),
  ]),
  row("m", "M", "basic", [
    symbol("m", "basic", "ま", "ma"),
    symbol("m", "basic", "み", "mi"),
    symbol("m", "basic", "む", "mu"),
    symbol("m", "basic", "め", "me"),
    symbol("m", "basic", "も", "mo"),
  ]),
  row("y", "Y", "basic", [
    symbol("y", "basic", "や", "ya"),
    symbol("y", "basic", "ゆ", "yu"),
    symbol("y", "basic", "よ", "yo"),
  ]),
  row("r", "R", "basic", [
    symbol("r", "basic", "ら", "ra"),
    symbol("r", "basic", "り", "ri"),
    symbol("r", "basic", "る", "ru"),
    symbol("r", "basic", "れ", "re"),
    symbol("r", "basic", "ろ", "ro"),
  ]),
  row("w", "W", "basic", [
    symbol("w", "basic", "わ", "wa"),
    symbol("w", "basic", "を", "o", {
      idSuffix: "wo",
      inputRomaji: "wo",
      acceptableRomaji: ["wo"],
      listeningEligible: false,
      noteRu:
        "В современной стандартной речи を произносится как o и обычно служит частицей. Чтобы набрать именно を, используют код wo. От お на слух в изоляции его не отличить.",
    }),
  ]),
  row("n-final", "Носовой ん", "basic", [
    symbol("n-final", "basic", "ん", "n", {
      noteRu:
        "ん — носовая мора, а не только конечная буква. Она встречается и внутри слов: せんせい. Перед гласной при вводе часто требуется nn или n'.",
    }),
  ]),
];

export const voicedHiraganaRows: readonly HiraganaRow[] = [
  row("g", "G · дакутэн", "voiced", [
    symbol("g", "voiced", "が", "ga"),
    symbol("g", "voiced", "ぎ", "gi"),
    symbol("g", "voiced", "ぐ", "gu"),
    symbol("g", "voiced", "げ", "ge"),
    symbol("g", "voiced", "ご", "go"),
  ]),
  row("z", "Z/J · дакутэн", "voiced", [
    symbol("z", "voiced", "ざ", "za"),
    symbol("z", "voiced", "じ", "ji", { acceptableRomaji: ["zi"], acceptableInput: ["zi"] }),
    symbol("z", "voiced", "ず", "zu"),
    symbol("z", "voiced", "ぜ", "ze"),
    symbol("z", "voiced", "ぞ", "zo"),
  ]),
  row("d", "D · дакутэн", "voiced", [
    symbol("d", "voiced", "だ", "da"),
    symbol("d", "voiced", "ぢ", "ji", {
      idSuffix: "di",
      inputRomaji: "di",
      listeningEligible: false,
      noteRu:
        "Редкий знак. В современной стандартной речи произносится так же, как じ. Написание зависит от слова и морфологии; для ввода именно ぢ используют di.",
    }),
    symbol("d", "voiced", "づ", "zu", {
      idSuffix: "du",
      inputRomaji: "du",
      listeningEligible: false,
      noteRu:
        "Редкий знак. В современной стандартной речи произносится так же, как ず. Написание зависит от слова и морфологии; для ввода именно づ используют du.",
    }),
    symbol("d", "voiced", "で", "de"),
    symbol("d", "voiced", "ど", "do"),
  ]),
  row("b", "B · дакутэн", "voiced", [
    symbol("b", "voiced", "ば", "ba"),
    symbol("b", "voiced", "び", "bi"),
    symbol("b", "voiced", "ぶ", "bu"),
    symbol("b", "voiced", "べ", "be"),
    symbol("b", "voiced", "ぼ", "bo"),
  ]),
  row("p", "P · хандакутэн", "voiced", [
    symbol("p", "voiced", "ぱ", "pa"),
    symbol("p", "voiced", "ぴ", "pi"),
    symbol("p", "voiced", "ぷ", "pu"),
    symbol("p", "voiced", "ぺ", "pe"),
    symbol("p", "voiced", "ぽ", "po"),
  ]),
];

export const contractedHiraganaRows: readonly HiraganaRow[] = [
  row("ky", "KY", "contracted", [
    symbol("ky", "contracted", "きゃ", "kya"),
    symbol("ky", "contracted", "きゅ", "kyu"),
    symbol("ky", "contracted", "きょ", "kyo"),
  ]),
  row("gy", "GY", "contracted", [
    symbol("gy", "contracted", "ぎゃ", "gya"),
    symbol("gy", "contracted", "ぎゅ", "gyu"),
    symbol("gy", "contracted", "ぎょ", "gyo"),
  ]),
  row("sh", "SH", "contracted", [
    symbol("sh", "contracted", "しゃ", "sha", { acceptableRomaji: ["sya"], acceptableInput: ["sya"] }),
    symbol("sh", "contracted", "しゅ", "shu", { acceptableRomaji: ["syu"], acceptableInput: ["syu"] }),
    symbol("sh", "contracted", "しょ", "sho", { acceptableRomaji: ["syo"], acceptableInput: ["syo"] }),
  ]),
  row("j", "J", "contracted", [
    symbol("j", "contracted", "じゃ", "ja", { acceptableRomaji: ["jya", "zya"], acceptableInput: ["jya", "zya"] }),
    symbol("j", "contracted", "じゅ", "ju", { acceptableRomaji: ["jyu", "zyu"], acceptableInput: ["jyu", "zyu"] }),
    symbol("j", "contracted", "じょ", "jo", { acceptableRomaji: ["jyo", "zyo"], acceptableInput: ["jyo", "zyo"] }),
  ]),
  row("ch", "CH", "contracted", [
    symbol("ch", "contracted", "ちゃ", "cha", { acceptableRomaji: ["tya"], acceptableInput: ["tya"] }),
    symbol("ch", "contracted", "ちゅ", "chu", { acceptableRomaji: ["tyu"], acceptableInput: ["tyu"] }),
    symbol("ch", "contracted", "ちょ", "cho", { acceptableRomaji: ["tyo"], acceptableInput: ["tyo"] }),
  ]),
  row("ny", "NY", "contracted", [
    symbol("ny", "contracted", "にゃ", "nya"),
    symbol("ny", "contracted", "にゅ", "nyu"),
    symbol("ny", "contracted", "にょ", "nyo"),
  ]),
  row("hy", "HY", "contracted", [
    symbol("hy", "contracted", "ひゃ", "hya"),
    symbol("hy", "contracted", "ひゅ", "hyu"),
    symbol("hy", "contracted", "ひょ", "hyo"),
  ]),
  row("by", "BY", "contracted", [
    symbol("by", "contracted", "びゃ", "bya"),
    symbol("by", "contracted", "びゅ", "byu"),
    symbol("by", "contracted", "びょ", "byo"),
  ]),
  row("py", "PY", "contracted", [
    symbol("py", "contracted", "ぴゃ", "pya"),
    symbol("py", "contracted", "ぴゅ", "pyu"),
    symbol("py", "contracted", "ぴょ", "pyo"),
  ]),
  row("my", "MY", "contracted", [
    symbol("my", "contracted", "みゃ", "mya"),
    symbol("my", "contracted", "みゅ", "myu"),
    symbol("my", "contracted", "みょ", "myo"),
  ]),
  row("ry", "RY", "contracted", [
    symbol("ry", "contracted", "りゃ", "rya"),
    symbol("ry", "contracted", "りゅ", "ryu"),
    symbol("ry", "contracted", "りょ", "ryo"),
  ]),
];

export const basicHiragana: readonly KanaSymbol[] = hiraganaRows.flatMap((item) => item.symbols);
export const voicedHiragana: readonly KanaSymbol[] = voicedHiraganaRows.flatMap((item) => item.symbols);
export const contractedHiragana: readonly KanaSymbol[] = contractedHiraganaRows.flatMap((item) => item.symbols);
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

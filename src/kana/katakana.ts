import type { HiraganaRow, KanaSymbol } from "./hiragana";

export type KatakanaSetId = "basic" | "voiced" | "contracted" | "loan" | "contrast";

interface SymbolOptions {
  idSuffix?: string;
  inputRomaji?: string;
  acceptableRomaji?: string[];
  acceptableInput?: string[];
  listeningEligible?: boolean;
  noteRu?: string;
}

const symbol = (
  rowId: KanaSymbol["rowId"],
  setId: KanaSymbol["setId"],
  kana: string,
  romaji: string,
  options: SymbolOptions = {},
): KanaSymbol => ({
  id: `katakana-${options.idSuffix ?? options.inputRomaji ?? romaji}`,
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
  id: HiraganaRow["id"],
  label: string,
  setId: HiraganaRow["setId"],
  symbols: KanaSymbol[],
): HiraganaRow => ({ id, label, setId, symbols });

export const katakanaRows: readonly HiraganaRow[] = [
  row("vowels", "Гласные", "basic", [
    symbol("vowels", "basic", "ア", "a"),
    symbol("vowels", "basic", "イ", "i"),
    symbol("vowels", "basic", "ウ", "u"),
    symbol("vowels", "basic", "エ", "e"),
    symbol("vowels", "basic", "オ", "o"),
  ]),
  row("k", "K", "basic", [
    symbol("k", "basic", "カ", "ka"),
    symbol("k", "basic", "キ", "ki"),
    symbol("k", "basic", "ク", "ku"),
    symbol("k", "basic", "ケ", "ke"),
    symbol("k", "basic", "コ", "ko"),
  ]),
  row("s", "S", "basic", [
    symbol("s", "basic", "サ", "sa"),
    symbol("s", "basic", "シ", "shi", { acceptableRomaji: ["si"] }),
    symbol("s", "basic", "ス", "su"),
    symbol("s", "basic", "セ", "se"),
    symbol("s", "basic", "ソ", "so"),
  ]),
  row("t", "T", "basic", [
    symbol("t", "basic", "タ", "ta"),
    symbol("t", "basic", "チ", "chi", { acceptableRomaji: ["ti"] }),
    symbol("t", "basic", "ツ", "tsu", { acceptableRomaji: ["tu"] }),
    symbol("t", "basic", "テ", "te"),
    symbol("t", "basic", "ト", "to"),
  ]),
  row("n", "N", "basic", [
    symbol("n", "basic", "ナ", "na"),
    symbol("n", "basic", "ニ", "ni"),
    symbol("n", "basic", "ヌ", "nu"),
    symbol("n", "basic", "ネ", "ne"),
    symbol("n", "basic", "ノ", "no"),
  ]),
  row("h", "H", "basic", [
    symbol("h", "basic", "ハ", "ha"),
    symbol("h", "basic", "ヒ", "hi"),
    symbol("h", "basic", "フ", "fu", { acceptableRomaji: ["hu"] }),
    symbol("h", "basic", "ヘ", "he"),
    symbol("h", "basic", "ホ", "ho"),
  ]),
  row("m", "M", "basic", [
    symbol("m", "basic", "マ", "ma"),
    symbol("m", "basic", "ミ", "mi"),
    symbol("m", "basic", "ム", "mu"),
    symbol("m", "basic", "メ", "me"),
    symbol("m", "basic", "モ", "mo"),
  ]),
  row("y", "Y", "basic", [
    symbol("y", "basic", "ヤ", "ya"),
    symbol("y", "basic", "ユ", "yu"),
    symbol("y", "basic", "ヨ", "yo"),
  ]),
  row("r", "R", "basic", [
    symbol("r", "basic", "ラ", "ra"),
    symbol("r", "basic", "リ", "ri"),
    symbol("r", "basic", "ル", "ru"),
    symbol("r", "basic", "レ", "re"),
    symbol("r", "basic", "ロ", "ro"),
  ]),
  row("w", "W", "basic", [
    symbol("w", "basic", "ワ", "wa"),
    symbol("w", "basic", "ヲ", "o", {
      inputRomaji: "wo",
      acceptableRomaji: ["wo"],
      listeningEligible: false,
      noteRu: "В современной речи обычно произносится как o. Код wo нужен, чтобы набрать именно ヲ.",
    }),
  ]),
  row("n-final", "Носовой ン", "basic", [
    symbol("n-final", "basic", "ン", "n", {
      acceptableInput: ["nn", "n'"],
      noteRu: "Перед гласной или ヤ／ユ／ヨ для точного ввода иногда нужны nn или n'.",
    }),
  ]),
];

export const voicedKatakanaRows: readonly HiraganaRow[] = [
  row("g", "G · дакутэн", "voiced", [
    symbol("g", "voiced", "ガ", "ga", { idSuffix: "voiced-ga" }),
    symbol("g", "voiced", "ギ", "gi", { idSuffix: "voiced-gi" }),
    symbol("g", "voiced", "グ", "gu", { idSuffix: "voiced-gu" }),
    symbol("g", "voiced", "ゲ", "ge", { idSuffix: "voiced-ge" }),
    symbol("g", "voiced", "ゴ", "go", { idSuffix: "voiced-go" }),
  ]),
  row("z", "Z/J · дакутэн", "voiced", [
    symbol("z", "voiced", "ザ", "za", { idSuffix: "voiced-za" }),
    symbol("z", "voiced", "ジ", "ji", { idSuffix: "voiced-ji", acceptableRomaji: ["zi"] }),
    symbol("z", "voiced", "ズ", "zu", { idSuffix: "voiced-zu" }),
    symbol("z", "voiced", "ゼ", "ze", { idSuffix: "voiced-ze" }),
    symbol("z", "voiced", "ゾ", "zo", { idSuffix: "voiced-zo" }),
  ]),
  row("d", "D · дакутэн", "voiced", [
    symbol("d", "voiced", "ダ", "da", { idSuffix: "voiced-da" }),
    symbol("d", "voiced", "ヂ", "ji", {
      idSuffix: "voiced-di",
      inputRomaji: "di",
      acceptableRomaji: ["di"],
      listeningEligible: false,
      noteRu: "В стандартной речи звучит как ジ. Код di нужен, чтобы набрать именно ヂ.",
    }),
    symbol("d", "voiced", "ヅ", "zu", {
      idSuffix: "voiced-du",
      inputRomaji: "du",
      acceptableRomaji: ["du"],
      listeningEligible: false,
      noteRu: "В стандартной речи звучит как ズ. Код du нужен, чтобы набрать именно ヅ.",
    }),
    symbol("d", "voiced", "デ", "de", { idSuffix: "voiced-de" }),
    symbol("d", "voiced", "ド", "do", { idSuffix: "voiced-do" }),
  ]),
  row("b", "B · дакутэн", "voiced", [
    symbol("b", "voiced", "バ", "ba", { idSuffix: "voiced-ba" }),
    symbol("b", "voiced", "ビ", "bi", { idSuffix: "voiced-bi" }),
    symbol("b", "voiced", "ブ", "bu", { idSuffix: "voiced-bu" }),
    symbol("b", "voiced", "ベ", "be", { idSuffix: "voiced-be" }),
    symbol("b", "voiced", "ボ", "bo", { idSuffix: "voiced-bo" }),
  ]),
  row("p", "P · хандакутэн", "voiced", [
    symbol("p", "voiced", "パ", "pa", { idSuffix: "voiced-pa" }),
    symbol("p", "voiced", "ピ", "pi", { idSuffix: "voiced-pi" }),
    symbol("p", "voiced", "プ", "pu", { idSuffix: "voiced-pu" }),
    symbol("p", "voiced", "ペ", "pe", { idSuffix: "voiced-pe" }),
    symbol("p", "voiced", "ポ", "po", { idSuffix: "voiced-po" }),
  ]),
];

const contracted = (
  rowId: KanaSymbol["rowId"],
  label: string,
  values: Array<[string, string, string[]?]>,
): HiraganaRow =>
  row(
    rowId,
    label,
    "contracted",
    values.map(([kana, romaji, acceptableRomaji]) =>
      symbol(rowId, "contracted", kana, romaji, {
        idSuffix: `contracted-${romaji}`,
        acceptableRomaji,
      }),
    ),
  );

export const contractedKatakanaRows: readonly HiraganaRow[] = [
  contracted("ky", "KY", [["キャ", "kya"], ["キュ", "kyu"], ["キョ", "kyo"]]),
  contracted("gy", "GY", [["ギャ", "gya"], ["ギュ", "gyu"], ["ギョ", "gyo"]]),
  contracted("sh", "SH", [["シャ", "sha", ["sya"]], ["シュ", "shu", ["syu"]], ["ショ", "sho", ["syo"]]]),
  contracted("j", "J", [["ジャ", "ja", ["jya", "zya"]], ["ジュ", "ju", ["jyu", "zyu"]], ["ジョ", "jo", ["jyo", "zyo"]]]),
  contracted("ch", "CH", [["チャ", "cha", ["tya"]], ["チュ", "chu", ["tyu"]], ["チョ", "cho", ["tyo"]]]),
  contracted("ny", "NY", [["ニャ", "nya"], ["ニュ", "nyu"], ["ニョ", "nyo"]]),
  contracted("hy", "HY", [["ヒャ", "hya"], ["ヒュ", "hyu"], ["ヒョ", "hyo"]]),
  contracted("by", "BY", [["ビャ", "bya"], ["ビュ", "byu"], ["ビョ", "byo"]]),
  contracted("py", "PY", [["ピャ", "pya"], ["ピュ", "pyu"], ["ピョ", "pyo"]]),
  contracted("my", "MY", [["ミャ", "mya"], ["ミュ", "myu"], ["ミョ", "myo"]]),
  contracted("ry", "RY", [["リャ", "rya"], ["リュ", "ryu"], ["リョ", "ryo"]]),
];

export const loanKatakanaRows: readonly HiraganaRow[] = [
  row("h", "F · маленькие гласные", "contracted", [
    symbol("h", "contracted", "ファ", "fa", { idSuffix: "loan-fa" }),
    symbol("h", "contracted", "フィ", "fi", { idSuffix: "loan-fi" }),
    symbol("h", "contracted", "フェ", "fe", { idSuffix: "loan-fe" }),
    symbol("h", "contracted", "フォ", "fo", { idSuffix: "loan-fo" }),
  ]),
  row("w", "W · современные сочетания", "contracted", [
    symbol("w", "contracted", "ウィ", "wi", { idSuffix: "loan-wi" }),
    symbol("w", "contracted", "ウェ", "we", { idSuffix: "loan-we" }),
    symbol("w", "contracted", "ウォ", "wo", { idSuffix: "loan-wo" }),
  ]),
  row("t", "T/D · современные сочетания", "contracted", [
    symbol("t", "contracted", "ティ", "ti", { idSuffix: "loan-ti" }),
    symbol("t", "contracted", "ディ", "di", { idSuffix: "loan-di" }),
  ]),
  row("j", "SH/CH/J", "contracted", [
    symbol("j", "contracted", "シェ", "she", { idSuffix: "loan-she" }),
    symbol("j", "contracted", "チェ", "che", { idSuffix: "loan-che" }),
    symbol("j", "contracted", "ジェ", "je", { idSuffix: "loan-je" }),
  ]),
  row("vowels", "V · ヴ", "contracted", [
    symbol("vowels", "contracted", "ヴ", "vu", { idSuffix: "loan-vu" }),
    symbol("vowels", "contracted", "ヴァ", "va", { idSuffix: "loan-va" }),
    symbol("vowels", "contracted", "ヴィ", "vi", { idSuffix: "loan-vi" }),
    symbol("vowels", "contracted", "ヴェ", "ve", { idSuffix: "loan-ve" }),
    symbol("vowels", "contracted", "ヴォ", "vo", { idSuffix: "loan-vo" }),
  ]),
];

export const basicKatakana: readonly KanaSymbol[] = katakanaRows.flatMap((item) => item.symbols);
export const voicedKatakana: readonly KanaSymbol[] = voicedKatakanaRows.flatMap((item) => item.symbols);
export const contractedKatakana: readonly KanaSymbol[] = contractedKatakanaRows.flatMap((item) => item.symbols);
export const loanKatakana: readonly KanaSymbol[] = loanKatakanaRows.flatMap((item) => item.symbols);

const findBasic = (kana: string): KanaSymbol => {
  const found = basicKatakana.find((item) => item.kana === kana);
  if (!found) throw new Error(`Не найдена катакана ${kana}`);
  return found;
};

export const katakanaContrastRows: readonly HiraganaRow[] = [
  row("s", "Похожие штрихи", "basic", [findBasic("シ"), findBasic("ツ"), findBasic("ソ"), findBasic("ン")]),
];
export const katakanaContrastUnits: readonly KanaSymbol[] = katakanaContrastRows[0]?.symbols ?? [];

export const katakanaRowsBySet: Record<KatakanaSetId, readonly HiraganaRow[]> = {
  basic: katakanaRows,
  voiced: voicedKatakanaRows,
  contracted: contractedKatakanaRows,
  loan: loanKatakanaRows,
  contrast: katakanaContrastRows,
};

export const katakanaUnitsBySet: Record<KatakanaSetId, readonly KanaSymbol[]> = {
  basic: basicKatakana,
  voiced: voicedKatakana,
  contracted: contractedKatakana,
  loan: loanKatakana,
  contrast: katakanaContrastUnits,
};

export const allKatakanaUnits: readonly KanaSymbol[] = [
  ...basicKatakana,
  ...voicedKatakana,
  ...contractedKatakana,
  ...loanKatakana,
];

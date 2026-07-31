export type KanaPattern = "dakuten" | "handakuten" | "yoon" | "sokuon" | "long-vowel";

export interface KanaWord {
  id: string;
  kana: string;
  romaji: string;
  meaningRu: string;
  tokens: string[];
  distractors: string[];
  patterns: KanaPattern[];
  explanationRu: string;
}

export const kanaWords: readonly KanaWord[] = [
  {
    id: "kana-word-gakkou",
    kana: "がっこう",
    romaji: "gakkou",
    meaningRu: "школа",
    tokens: ["が", "っ", "こ", "う"],
    distractors: ["か", "つ", "お"],
    patterns: ["dakuten", "sokuon", "long-vowel"],
    explanationRu:
      "が содержит дакутэн. Маленькая っ обозначает задержку перед k; при записи ромадзи согласная удваивается: kk. В こう сочетание お／о-звука с う передаёт долгий ō; для ввода обычно набирают ou.",
  },
  {
    id: "kana-word-zasshi",
    kana: "ざっし",
    romaji: "zasshi",
    meaningRu: "журнал",
    tokens: ["ざ", "っ", "し"],
    distractors: ["さ", "つ", "じ"],
    patterns: ["dakuten", "sokuon"],
    explanationRu:
      "ざ — звонкий вариант さ. Маленькая っ обозначает задержку перед し; в записи zasshi это видно как ss перед sh. Большая つ дала бы отдельный слог tsu.",
  },
  {
    id: "kana-word-kippu",
    kana: "きっぷ",
    romaji: "kippu",
    meaningRu: "билет",
    tokens: ["き", "っ", "ぷ"],
    distractors: ["つ", "ふ", "ぶ"],
    patterns: ["handakuten", "sokuon"],
    explanationRu:
      "Маленькая っ обозначает задержку перед p, поэтому в ромадзи появляется pp. ぷ образовано от ふ с кружком хандакутэн.",
  },
  {
    id: "kana-word-shashin",
    kana: "しゃしん",
    romaji: "shashin",
    meaningRu: "фотография",
    tokens: ["し", "ゃ", "し", "ん"],
    distractors: ["や", "ち", "ゅ"],
    patterns: ["yoon"],
    explanationRu:
      "Маленькая ゃ соединяется с し в одну мору しゃ — sha. Запись しや с большой や читалась бы раздельно: shi-ya.",
  },
  {
    id: "kana-word-byouin",
    kana: "びょういん",
    romaji: "byouin",
    meaningRu: "больница",
    tokens: ["び", "ょ", "う", "い", "ん"],
    distractors: ["ひ", "よ", "お"],
    patterns: ["dakuten", "yoon", "long-vowel"],
    explanationRu:
      "び — звонкий вариант ひ. Маленькая ょ образует びょ — byo, а следующая う удлиняет гласный: byō. Затем отдельно читается いん — in.",
  },
  {
    id: "kana-word-ryokou",
    kana: "りょこう",
    romaji: "ryokou",
    meaningRu: "путешествие; поездка",
    tokens: ["り", "ょ", "こ", "う"],
    distractors: ["よ", "ろ", "お"],
    patterns: ["yoon", "long-vowel"],
    explanationRu:
      "り + маленькая ょ образуют одну мору りょ — ryo. В こう следующая う удлиняет звук о: kō.",
  },
  {
    id: "kana-word-gyuunyuu",
    kana: "ぎゅうにゅう",
    romaji: "gyuunyuu",
    meaningRu: "молоко",
    tokens: ["ぎ", "ゅ", "う", "に", "ゅ", "う"],
    distractors: ["き", "ゆ", "ぬ"],
    patterns: ["dakuten", "yoon", "long-vowel"],
    explanationRu:
      "ぎゅ и にゅ образованы с маленькой ゅ. В обоих случаях следующая う удлиняет звук у: gyūnyū. Здесь действительно нужны две ゅ и две う.",
  },
  {
    id: "kana-word-chotto",
    kana: "ちょっと",
    romaji: "chotto",
    meaningRu: "немного; минутку",
    tokens: ["ち", "ょ", "っ", "と"],
    distractors: ["よ", "つ", "ど"],
    patterns: ["yoon", "sokuon"],
    explanationRu:
      "ち + маленькая ょ дают одну мору ちょ — cho. Маленькая っ обозначает задержку перед と; в ромадзи появляется tt: chotto.",
  },
  {
    id: "kana-word-benkyou",
    kana: "べんきょう",
    romaji: "benkyou",
    meaningRu: "учёба; изучение",
    tokens: ["べ", "ん", "き", "ょ", "う"],
    distractors: ["へ", "よ", "お"],
    patterns: ["dakuten", "yoon", "long-vowel"],
    explanationRu:
      "べ содержит дакутэн. き + маленькая ょ образуют きょ — kyo, а следующая う удлиняет звук о: kyō.",
  },
  {
    id: "kana-word-kitte",
    kana: "きって",
    romaji: "kitte",
    meaningRu: "почтовая марка",
    tokens: ["き", "っ", "て"],
    distractors: ["つ", "で", "け"],
    patterns: ["sokuon"],
    explanationRu:
      "Маленькая っ обозначает задержку перед て; в ромадзи появляется tt: kitte. Большая つ читалась бы как отдельная mora tsu.",
  },
  {
    id: "kana-word-shukudai",
    kana: "しゅくだい",
    romaji: "shukudai",
    meaningRu: "домашнее задание",
    tokens: ["し", "ゅ", "く", "だ", "い"],
    distractors: ["ゆ", "た", "す"],
    patterns: ["yoon", "dakuten"],
    explanationRu:
      "し + маленькая ゅ дают одну мору しゅ — shu. だ — знак た с дакутэном.",
  },
  {
    id: "kana-word-jugyou",
    kana: "じゅぎょう",
    romaji: "jugyou",
    meaningRu: "урок; учебное занятие",
    tokens: ["じ", "ゅ", "ぎ", "ょ", "う"],
    distractors: ["し", "ゆ", "き", "よ"],
    patterns: ["dakuten", "yoon", "long-vowel"],
    explanationRu:
      "じゅ — ju, ぎょ — gyo. Оба сочетания используют маленькую кану, а следующая после ぎょ буква う удлиняет звук о: gyō.",
  },
];

export function findKanaWord(wordId: string): KanaWord | undefined {
  return kanaWords.find((word) => word.id === wordId);
}

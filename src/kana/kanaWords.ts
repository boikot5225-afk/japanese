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
      "が содержит дакутэн. Маленькая っ удваивает следующий согласный: kk. Конечное こう передаёт долгий звук ō и в ромадзи здесь записано как ou.",
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
      "ざ — звонкий вариант さ. Маленькая っ перед し удваивает согласный: ssh.",
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
      "Маленькая っ создаёт удвоение pp. Знак ぷ образован от ふ с кружком хандакутэн.",
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
      "Маленькая ゃ соединяется с し в один слог しゃ — sha. Большая や дала бы отдельный слог shiya.",
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
      "び — звонкий вариант ひ. Маленькая ょ образует びょ — byo, а следующая う удлиняет гласный: byō.",
  },
  {
    id: "kana-word-ryokou",
    kana: "りょこう",
    romaji: "ryokou",
    meaningRu: "путешествие",
    tokens: ["り", "ょ", "こ", "う"],
    distractors: ["よ", "ろ", "お"],
    patterns: ["yoon", "long-vowel"],
    explanationRu:
      "り + маленькая ょ образуют единый слог りょ — ryo. В こう гласный о удлиняется с помощью う.",
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
      "ぎゅ и にゅ образованы маленькой ゅ. В обоих случаях следующая う удлиняет гласный: gyūnyū.",
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
      "ち + маленькая ょ дают ちょ — cho. Маленькая っ перед と удваивает t: chotto.",
  },
  {
    id: "kana-word-benkyou",
    kana: "べんきょう",
    romaji: "benkyou",
    meaningRu: "учёба",
    tokens: ["べ", "ん", "き", "ょ", "う"],
    distractors: ["へ", "よ", "お"],
    patterns: ["dakuten", "yoon", "long-vowel"],
    explanationRu:
      "べ содержит дакутэн. き + маленькая ょ образуют きょ — kyo, а う удлиняет гласный.",
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
      "Маленькая っ перед て показывает паузу и удвоение t: kitte. Большая つ читалась бы как отдельный слог tsu.",
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
      "し + маленькая ゅ дают しゅ — shu. だ — звонкий вариант た.",
  },
  {
    id: "kana-word-jugyou",
    kana: "じゅぎょう",
    romaji: "jugyou",
    meaningRu: "урок; занятие",
    tokens: ["じ", "ゅ", "ぎ", "ょ", "う"],
    distractors: ["し", "ゆ", "き", "よ"],
    patterns: ["dakuten", "yoon", "long-vowel"],
    explanationRu:
      "じゅ — ju, ぎょ — gyo. Оба сочетания используют маленькую кану, а конечная う удлиняет гласный о.",
  },
];

export function findKanaWord(wordId: string): KanaWord | undefined {
  return kanaWords.find((word) => word.id === wordId);
}

import type { KanaWord } from "./kanaWords";

export const katakanaWords: readonly KanaWord[] = [
  {
    id: "katakana-word-koohii",
    kana: "コーヒー",
    romaji: "koohii",
    meaningRu: "кофе",
    tokens: ["コ", "ー", "ヒ", "ー"],
    distractors: ["ホ", "イ", "ウ"],
    patterns: ["long-vowel"],
    explanationRu:
      "Знак ー удлиняет предыдущую гласную. В コー удлиняется o, а в ヒー — i: kōhī.",
  },
  {
    id: "katakana-word-terebi",
    kana: "テレビ",
    romaji: "terebi",
    meaningRu: "телевизор; телевидение",
    tokens: ["テ", "レ", "ビ"],
    distractors: ["デ", "リ", "ヒ"],
    patterns: ["dakuten"],
    explanationRu:
      "テレビ — японское сокращение от английского television. ビ — звонкий вариант ヒ.",
  },
  {
    id: "katakana-word-hoteru",
    kana: "ホテル",
    romaji: "hoteru",
    meaningRu: "отель",
    tokens: ["ホ", "テ", "ル"],
    distractors: ["コ", "デ", "ロ"],
    patterns: [],
    explanationRu:
      "ホテル передаёт заимствованное слово японскими морами: ho-te-ru. Конечная согласная заменяется слогом ル.",
  },
  {
    id: "katakana-word-resutoran",
    kana: "レストラン",
    romaji: "resutoran",
    meaningRu: "ресторан",
    tokens: ["レ", "ス", "ト", "ラ", "ン"],
    distractors: ["ソ", "ロ", "ヌ"],
    patterns: [],
    explanationRu:
      "В японском между большинством согласных появляются гласные: resutoran. Последний ン передаёт носовой звук.",
  },
  {
    id: "katakana-word-takushii",
    kana: "タクシー",
    romaji: "takushii",
    meaningRu: "такси",
    tokens: ["タ", "ク", "シ", "ー"],
    distractors: ["ツ", "ソ", "イ"],
    patterns: ["long-vowel"],
    explanationRu:
      "В конце シー знак ー удлиняет i: shī. Обрати внимание на シ, который легко спутать с ツ.",
  },
  {
    id: "katakana-word-chiketto",
    kana: "チケット",
    romaji: "chiketto",
    meaningRu: "билет",
    tokens: ["チ", "ケ", "ッ", "ト"],
    distractors: ["ツ", "ク", "テ"],
    patterns: ["sokuon"],
    explanationRu:
      "Маленькая ッ создаёт задержку перед ト. В ромадзи это отражается удвоением t: chiketto.",
  },
  {
    id: "katakana-word-nyuusu",
    kana: "ニュース",
    romaji: "nyuusu",
    meaningRu: "новости",
    tokens: ["ニ", "ュ", "ー", "ス"],
    distractors: ["ユ", "ヌ", "ソ"],
    patterns: ["yoon", "long-vowel"],
    explanationRu:
      "ニ + маленькая ュ образуют ニュ — nyu. Знак ー удлиняет u: nyūsu.",
  },
  {
    id: "katakana-word-suupaa",
    kana: "スーパー",
    romaji: "suupaa",
    meaningRu: "супермаркет",
    tokens: ["ス", "ー", "パ", "ー"],
    distractors: ["ソ", "ハ", "ア"],
    patterns: ["handakuten", "long-vowel"],
    explanationRu:
      "スーパー — сокращение от スーパーマーケット. Обе черты ー обозначают долгие гласные: sūpā.",
  },
  {
    id: "katakana-word-konpyuutaa",
    kana: "コンピューター",
    romaji: "konpyuutaa",
    meaningRu: "компьютер",
    tokens: ["コ", "ン", "ピ", "ュ", "ー", "タ", "ー"],
    distractors: ["ソ", "ニ", "ユ", "ダ"],
    patterns: ["handakuten", "yoon", "long-vowel"],
    explanationRu:
      "ピ + маленькая ュ образуют ピュ — pyu. Обе черты ー удлиняют гласные: konpyūtā.",
  },
  {
    id: "katakana-word-sumaatofon",
    kana: "スマートフォン",
    romaji: "sumaatofon",
    meaningRu: "смартфон",
    tokens: ["ス", "マ", "ー", "ト", "フ", "ォ", "ン"],
    distractors: ["ソ", "ア", "オ", "ホ"],
    patterns: ["long-vowel"],
    explanationRu:
      "В スマー знак ー удлиняет a. Ф + маленькая ォ образуют современное сочетание フォ — fo.",
  },
  {
    id: "katakana-word-kamera",
    kana: "カメラ",
    romaji: "kamera",
    meaningRu: "камера; фотоаппарат",
    tokens: ["カ", "メ", "ラ"],
    distractors: ["ケ", "マ", "レ"],
    patterns: [],
    explanationRu:
      "カメラ состоит из трёх простых мор: ka-me-ra. Здесь нет ни долготы, ни маленькой каны.",
  },
  {
    id: "katakana-word-aisukuriimu",
    kana: "アイスクリーム",
    romaji: "aisukuriimu",
    meaningRu: "мороженое",
    tokens: ["ア", "イ", "ス", "ク", "リ", "ー", "ム"],
    distractors: ["ソ", "ケ", "ル"],
    patterns: ["long-vowel"],
    explanationRu:
      "アイスクリーム буквально передаёт ice cream японскими морами. В リー знак ー удлиняет i.",
  },
];

export function findKatakanaWord(wordId: string): KanaWord | undefined {
  return katakanaWords.find((word) => word.id === wordId);
}

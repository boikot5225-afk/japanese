import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const read = (path) => readFileSync(path, "utf8");
const write = (path, content) => writeFileSync(path, content, "utf8");

const replaceExact = (path, before, after, expectedCount = 1) => {
  const source = read(path);
  const count = source.split(before).length - 1;
  if (count !== expectedCount) {
    throw new Error(`${path}: expected ${expectedCount} occurrences, found ${count}: ${before}`);
  }
  write(path, source.split(before).join(after));
};

const replaceRegex = (path, pattern, replacement, expectedCount = 1) => {
  const source = read(path);
  const matches = source.match(pattern) ?? [];
  if (matches.length !== expectedCount) {
    throw new Error(`${path}: expected ${expectedCount} regex matches, found ${matches.length}: ${pattern}`);
  }
  write(path, source.replace(pattern, replacement));
};

const replaceAllInFile = (path, before, after) => {
  const source = read(path);
  if (!source.includes(before)) return 0;
  const count = source.split(before).length - 1;
  write(path, source.split(before).join(after));
  return count;
};

replaceExact(
  "src/domain/course.ts",
  "  reading: string;\n  meaningsRu: string[];",
  "  reading: string;\n  alternativeReadings?: string[];\n  meaningsRu: string[];",
);

replaceExact(
  "src/content/lesson002.ts",
  '    translationRu: "Это моя книга. Предмет находится рядом с говорящим.",',
  '    translationRu: "Это моя книга.",',
);
replaceExact(
  "src/content/lesson002.ts",
  '    translationRu: "Это книга на японском языке. Предмет находится рядом с собеседником.",',
  '    translationRu: "Это книга на японском языке.",',
);

replaceExact(
  "src/content/lesson005.ts",
  '    translationRu: "Я ем хлеб / буду есть хлеб — в зависимости от контекста.",',
  '    translationRu: "Я ем хлеб.",',
);
replaceExact(
  "src/content/lesson005.ts",
  '    translationRu: "Я пью воду / буду пить воду — в зависимости от контекста.",',
  '    translationRu: "Я пью воду.",',
);

for (const [oldReading, primary, alternative] of [
  ["よん／し", "よん", "し"],
  ["なな／しち", "なな", "しち"],
  ["きゅう／く", "きゅう", "く"],
]) {
  replaceExact(
    "src/content/lesson007.ts",
    `    reading: "${oldReading}",\n    meaningsRu:`,
    `    reading: "${primary}",\n    alternativeReadings: ["${alternative}"],\n    meaningsRu:`,
  );
}

replaceExact(
  "src/content/lesson006.ts",
  '    writtenForm: "行きます",\n    reading: "いきます",\n    meaningsRu: ["идти", "ехать"],\n    partOfSpeech: ["глагол"],',
  '    writtenForm: "行きます",\n    reading: "いきます",\n    meaningsRu: ["идти", "ехать"],\n    partOfSpeech: ["глагол", "вежливая форма"],',
);
replaceExact(
  "src/content/lesson006.ts",
  '    writtenForm: "勉強します",\n    reading: "べんきょうします",\n    meaningsRu: ["учиться", "заниматься"],\n    partOfSpeech: ["глагол"],',
  '    writtenForm: "勉強します",\n    reading: "べんきょうします",\n    meaningsRu: ["учиться", "заниматься"],\n    partOfSpeech: ["глагол", "вежливая форма"],',
);

replaceRegex(
  "src/content/lesson022.ts",
  /\n  \{ id: "word-kyou-22"[^\n]+\},/gu,
  "",
);
replaceAllInFile("src/content/lesson022.ts", '"word-kyou-22"', '"word-kyou"');

replaceRegex(
  "src/content/lesson023.ts",
  /\n  \{ id: "word-eiga-23"[^\n]+\},/gu,
  "",
);
replaceAllInFile("src/content/lesson023.ts", '"word-eiga-23"', '"word-eiga"');
replaceAllInFile("src/content/lesson023.ts", '"word-kyou-22"', '"word-kyou"');
replaceExact(
  "src/content/lesson023.ts",
  '  { id: "word-nani-23", type: "vocabulary", writtenForm: "何", reading: "なに／なん", meaningsRu: ["что"], partOfSpeech: ["вопросительное слово"], jlptLevel: "N5" },',
  '  { id: "word-nani-23", type: "vocabulary", writtenForm: "何", reading: "なに", alternativeReadings: ["なん"], meaningsRu: ["что"], partOfSpeech: ["вопросительное слово"], jlptLevel: "N5", tags: ["чтение зависит от следующего слова"] },',
);

replaceExact(
  "src/content/lesson025.ts",
  "～た-форма — простое прошедшее время глагола и невежливая пара к ～ました",
  "～た-форма — простое прошедшее время глагола; в вежливом стиле ей соответствует ～ました",
);
replaceExact(
  "src/content/lesson026.ts",
  "～なかった — простая отрицательная прошедшая форма и невежливая пара к ～ませんでした",
  "～なかった — простая отрицательная прошедшая форма; в вежливом стиле ей соответствует ～ませんでした",
);

const diversityPath = "src/content/practiceDiversity.ts";
replaceExact(
  diversityPath,
  "const unique = (values: readonly string[]): string[] =>\n  [...new Set(values.map((value) => value.trim()).filter(Boolean))];\n",
  "const unique = (values: readonly string[]): string[] =>\n  [...new Set(values.map((value) => value.trim()).filter(Boolean))];\n\nconst getWordReadings = (word: VocabularyItem): string[] =>\n  unique([word.reading, ...(word.alternativeReadings ?? [])]);\n\nconst getWordReadingLabel = (word: VocabularyItem): string =>\n  getWordReadings(word).join(\" / \");\n",
);
replaceExact(
  diversityPath,
  "  const reading = normalizeText(word.reading);\n  const written = normalizeText(word.writtenForm);",
  "  const readings = getWordReadings(word).map(normalizeText);\n  const written = normalizeText(word.writtenForm);",
);
replaceExact(
  diversityPath,
  "  if (answers.includes(reading)) return `vocabulary:${word.id}:reading`;",
  "  if (answers.some((answer) => readings.includes(answer))) {\n    return `vocabulary:${word.id}:reading`;\n  }",
);
replaceExact(
  diversityPath,
  "  const words = allBundles.flatMap((item) => item.vocabulary);\n  const meaning = word.meaningsRu[0] ?? word.writtenForm;\n  const meaningPool = words.flatMap((item) => item.meaningsRu);\n  const readingPool = words.map((item) => item.reading);",
  "  const words = allBundles.flatMap((item) => item.vocabulary);\n  const readings = getWordReadings(word);\n  const primaryReading = readings[0] ?? word.reading;\n  const readingLabel = getWordReadingLabel(word);\n  const meaning = word.meaningsRu[0] ?? word.writtenForm;\n  const meaningPool = words.flatMap((item) => item.meaningsRu);\n  const readingPool = words.flatMap(getWordReadings);",
);
replaceExact(
  diversityPath,
  "      explanationRu: `${word.writtenForm}（${word.reading}）— ${word.meaningsRu.join(\", \")}.`,",
  "      explanationRu: `${word.writtenForm}（${readingLabel}）— ${word.meaningsRu.join(\", \")}.`,",
  2,
);
replaceExact(
  diversityPath,
  "      audioText: word.reading || word.writtenForm,",
  "      audioText: primaryReading || word.writtenForm,",
  2,
);
replaceExact(
  diversityPath,
  "      prompt: `Выбери чтение слова ${word.writtenForm}.`,\n      targetItemIds: [word.id],\n      correctAnswers: [word.reading],\n      distractors: takeDistractors(readingPool, [word.reading]),\n      explanationRu: `${word.writtenForm} читается ${word.reading}.`,",
  "      prompt:\n        readings.length > 1\n          ? `Выбери основное чтение слова ${word.writtenForm}.`\n          : `Выбери чтение слова ${word.writtenForm}.`,\n      targetItemIds: [word.id],\n      correctAnswers: [primaryReading],\n      distractors: takeDistractors(readingPool, readings),\n      explanationRu: `${word.writtenForm}: ${readingLabel}.`,",
);
replaceExact(
  diversityPath,
  "      prompt: `Напиши хираганой чтение слова ${word.writtenForm}.`,\n      targetItemIds: [word.id],\n      correctAnswers: [word.reading],\n      explanationRu: `${word.writtenForm} читается ${word.reading}.`,",
  "      prompt:\n        readings.length > 1\n          ? `Напиши одно из допустимых чтений слова ${word.writtenForm}.`\n          : `Напиши чтение слова ${word.writtenForm}.`,\n      targetItemIds: [word.id],\n      correctAnswers: [primaryReading],\n      acceptableAnswers: readings.length > 1 ? readings.slice(1) : undefined,\n      explanationRu: `${word.writtenForm}: ${readingLabel}.`,",
);
replaceExact(
  diversityPath,
  "      explanationRu: `${meaning} — ${word.writtenForm}（${word.reading}）.`,",
  "      explanationRu: `${meaning} — ${word.writtenForm}（${readingLabel}）.`,",
);
replaceExact(
  diversityPath,
  "      explanationRu: `${word.reading} — ${word.writtenForm}.`,",
  "      explanationRu: `${primaryReading} — ${word.writtenForm}.`,",
);
replaceExact(
  diversityPath,
  "      prompt: `Выбери тему, которая ${grammar.meaningRu}.`,",
  "      prompt: `Какой грамматической теме соответствует описание: «${grammar.meaningRu}»?`,",
);

replaceExact(
  "src/screens/TrainingScreens.tsx",
  "                    <Text style={styles.wordReading}>{word.reading}</Text>",
  "                    <Text style={styles.wordReading}>\n                      {[word.reading, ...(word.alternativeReadings ?? [])].join(\" / \")}\n                    </Text>",
);

const lessonDir = "src/content";
let manualReadingPromptCount = 0;
for (const file of readdirSync(lessonDir)) {
  if (!/^lesson\d{3}\.ts$/u.test(file)) continue;
  manualReadingPromptCount += replaceAllInFile(
    join(lessonDir, file),
    "Напиши хираганой чтение слова",
    "Напиши чтение слова",
  );
}
if (manualReadingPromptCount < 4) {
  throw new Error(`Expected at least four authored reading prompts, changed ${manualReadingPromptCount}`);
}

console.log(`Editorial corrections applied; updated ${manualReadingPromptCount} authored reading prompts.`);

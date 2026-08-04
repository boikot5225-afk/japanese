import fs from "node:fs";

const replaceOnce = (path, before, after) => {
  const source = fs.readFileSync(path, "utf8");
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`${path}: target not found`);
  if (source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`${path}: target is not unique`);
  }
  fs.writeFileSync(path, source.slice(0, first) + after + source.slice(first + before.length));
};

replaceOnce(
  "src/content/kanjiCurriculum.ts",
  `export const maskKanjiInExample = (item: KanjiItem): string => {\n  const written = item.examples[0]?.written ?? "";\n  const index = written.indexOf(item.literal);\n  if (index < 0) return "□";\n  return \`${"${written.slice(0, index)}"}□${"${written.slice(index + item.literal.length)}"}\`;\n};\n`,
  `export const maskKanjiInExample = (item: KanjiItem): string => {\n  const written = item.examples[0]?.written ?? "";\n  const index = written.indexOf(item.literal);\n  if (index < 0) return "□";\n  return \`${"${written.slice(0, index)}"}□${"${written.slice(index + item.literal.length)}"}\`;\n};\n\nexport interface KanjiDefinitionPresentation {\n  contextual: boolean;\n  prompt: string;\n  written: string;\n  answer: string;\n  detail: string;\n}\n\nexport const getKanjiDefinitionPresentation = (\n  item: KanjiItem,\n): KanjiDefinitionPresentation => {\n  const example = item.examples[0];\n  if (item.contextualOnly && example) {\n    return {\n      contextual: true,\n      prompt: "Что означает это слово?",\n      written: example.written,\n      answer: example.meaningRu,\n      detail: \`Сейчас изучается знак ${"${item.literal}"} внутри слова ${"${example.written}"}（${"${example.reading}"}）. Значение «${"${example.meaningRu}"}» относится ко всему слову, а не к ${"${item.literal}"} отдельно.\`,\n    };\n  }\n\n  return {\n    contextual: false,\n    prompt: "Что означает этот кандзи?",\n    written: item.literal,\n    answer: item.meaningsRu.join(", "),\n    detail: example\n      ? \`${"${example.written}"}（${"${example.reading}"}）— ${"${example.meaningRu}"}\`\n      : \`${"${item.literal}"} — ${"${item.meaningsRu.join(", ")}"}.\`,\n  };\n};\n`,
);

replaceOnce(
  "src/components/KanjiStudyPanel.tsx",
  `import { maskKanjiInExample } from "../content/kanjiCurriculum";`,
  `import {\n  getKanjiDefinitionPresentation,\n  maskKanjiInExample,\n} from "../content/kanjiCurriculum";`,
);

replaceOnce(
  "src/components/KanjiStudyPanel.tsx",
  `  const example = item?.examples[0];\n  const writingMode = card ? writingModeForPart(card.part) : null;`,
  `  const example = item?.examples[0];\n  const definitionPresentation = item\n    ? getKanjiDefinitionPresentation(item)\n    : undefined;\n  const writingMode = card ? writingModeForPart(card.part) : null;`,
);

replaceOnce(
  "src/components/KanjiStudyPanel.tsx",
  `      {card.part === "preview" && (\n        <View style={styles.studyCard}>\n          <Text style={styles.previewGlyph}>{item.literal}</Text>\n          <Text style={styles.previewMeaning}>{item.meaningsRu.join(", ")}</Text>`,
  `      {card.part === "preview" && (\n        <View style={styles.studyCard}>\n          {item.contextualOnly && example ? (\n            <>\n              <Text style={styles.promptLabel}>\n                Изучаем знак {item.literal} внутри слова\n              </Text>\n              <ReadingWord written={example.written} literal={item.literal} />\n              <Text style={styles.previewMeaning}>{example.meaningRu}</Text>\n              <Text style={styles.contextualNote}>\n                Значение относится ко всему сочетанию. На письме будет\n                отрабатываться выделенный знак.\n              </Text>\n            </>\n          ) : (\n            <>\n              <Text style={styles.previewGlyph}>{item.literal}</Text>\n              <Text style={styles.previewMeaning}>{item.meaningsRu.join(", ")}</Text>\n            </>\n          )}`,
);

replaceOnce(
  "src/components/KanjiStudyPanel.tsx",
  `      {card.part === "definition" && (\n        <View style={styles.studyCard}>\n          <Text style={styles.promptLabel}>Что означает этот кандзи?</Text>\n          <Text style={styles.questionGlyph}>{item.literal}</Text>\n          {!revealed ? (\n            <TouchableOpacity style={styles.revealButton} onPress={() => setRevealed(true)}>\n              <Text style={styles.revealButtonText}>Показать ответ</Text>\n            </TouchableOpacity>\n          ) : (\n            <View style={styles.revealedArea}>\n              <View style={styles.answerBox}>\n                <Text style={styles.answerTitle}>{item.meaningsRu.join(", ")}</Text>\n                {example && (\n                  <Text style={styles.answerDetail}>\n                    {example.written}（{example.reading}）— {example.meaningRu}\n                  </Text>\n                )}\n              </View>\n              {mode === "learn" ? (\n                <TouchableOpacity style={styles.primaryButton} onPress={advanceLearn}>\n                  <Text style={styles.primaryButtonText}>Дальше</Text>\n                </TouchableOpacity>\n              ) : (\n                <BasicGradeButtons onGrade={finishReviewCard} />\n              )}\n            </View>\n          )}\n        </View>\n      )}`,
  `      {card.part === "definition" && definitionPresentation && (\n        <View style={styles.studyCard}>\n          <Text style={styles.promptLabel}>{definitionPresentation.prompt}</Text>\n          {definitionPresentation.contextual && example ? (\n            <ReadingWord written={definitionPresentation.written} literal={item.literal} />\n          ) : (\n            <Text style={styles.questionGlyph}>{definitionPresentation.written}</Text>\n          )}\n          {!revealed ? (\n            <TouchableOpacity style={styles.revealButton} onPress={() => setRevealed(true)}>\n              <Text style={styles.revealButtonText}>Показать ответ</Text>\n            </TouchableOpacity>\n          ) : (\n            <View style={styles.revealedArea}>\n              <View style={styles.answerBox}>\n                <Text style={styles.answerTitle}>{definitionPresentation.answer}</Text>\n                <Text style={styles.answerDetail}>{definitionPresentation.detail}</Text>\n              </View>\n              {mode === "learn" ? (\n                <TouchableOpacity style={styles.primaryButton} onPress={advanceLearn}>\n                  <Text style={styles.primaryButtonText}>Дальше</Text>\n                </TouchableOpacity>\n              ) : (\n                <BasicGradeButtons onGrade={finishReviewCard} />\n              )}\n            </View>\n          )}\n        </View>\n      )}`,
);

replaceOnce(
  "src/components/KanjiStudyPanel.tsx",
  `  previewMeaning: { textAlign: "center", color: "#15202b", fontSize: 22, fontWeight: "900" },`,
  `  previewMeaning: { textAlign: "center", color: "#15202b", fontSize: 22, fontWeight: "900" },\n  contextualNote: {\n    textAlign: "center",\n    color: "#66788a",\n    fontSize: 14,\n    lineHeight: 20,\n  },`,
);

replaceOnce(
  "src/content/kanjiCurriculum.test.ts",
  `  extractKanjiLiterals,\n  getRequiredLessonKanjiLiterals,`,
  `  extractKanjiLiterals,\n  getKanjiDefinitionPresentation,\n  getRequiredLessonKanjiLiterals,`,
);

replaceOnce(
  "src/content/kanjiCurriculum.test.ts",
  `test("language practice stays compact while every new lesson kanji gets three review skills", () => {`,
  `test("context-only kanji cards show the complete compound instead of lying about one glyph", () => {\n  const lesson13 = lessonBundles.find((bundle) => bundle.lesson.id === "lesson-013");\n  assert.ok(lesson13);\n  const yu = lesson13.kanji?.find((item) => item.literal === "有");\n  assert.ok(yu);\n  assert.equal(yu.contextualOnly, true);\n\n  const presentation = getKanjiDefinitionPresentation(yu);\n  assert.equal(presentation.contextual, true);\n  assert.equal(presentation.written, "有名");\n  assert.equal(presentation.answer, yu.examples[0]?.meaningRu);\n  assert.match(presentation.detail, /относится ко всему слову/u);\n  assert.doesNotMatch(presentation.prompt, /этот кандзи/u);\n});\n\ntest("language practice stays compact while every new lesson kanji gets three review skills", () => {`,
);

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
packageJson.version = "0.22.6";
fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2) + "\n");

const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
appJson.expo.version = "0.22.6";
appJson.expo.android.versionCode = 52;
fs.writeFileSync("app.json", JSON.stringify(appJson, null, 2) + "\n");

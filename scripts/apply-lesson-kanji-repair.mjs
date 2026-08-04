import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const write = (relative, content) => fs.writeFileSync(path.join(root, relative), content, "utf8");

const replaceOnce = (relative, before, after) => {
  const source = read(relative);
  if (!source.includes(before)) {
    throw new Error(`Expected block not found in ${relative}: ${before.slice(0, 120)}`);
  }
  write(relative, source.replace(before, after));
};

const replaceRegex = (relative, pattern, replacement) => {
  const source = read(relative);
  if (!pattern.test(source)) {
    throw new Error(`Expected pattern not found in ${relative}: ${pattern}`);
  }
  write(relative, source.replace(pattern, replacement));
};

// Integrate the curriculum as one ordered sequence. A kanji is introduced in
// the first lesson that actually uses it; later lessons reuse the same SRS id.
replaceOnce(
  "src/content/courseCatalog.ts",
  'import { integrateKanjiCurriculum } from "./kanjiCurriculum";',
  'import { integrateKanjiCurriculumSequence } from "./kanjiCurriculum";',
);
replaceOnce(
  "src/content/courseCatalog.ts",
  `export const lessonBundles: readonly LessonBundle[] = expandedLessonBundles\n  .map((bundle) => diversifyLessonPractice(bundle, expandedLessonBundles))\n  .map(integrateKanjiCurriculum)\n  .map(withReviewedDuration);`,
  `const diversifiedLessonBundles: readonly LessonBundle[] = expandedLessonBundles\n  .map((bundle) => diversifyLessonPractice(bundle, expandedLessonBundles));\n\nexport const lessonBundles: readonly LessonBundle[] = integrateKanjiCurriculumSequence(\n  diversifiedLessonBundles,\n).map(withReviewedDuration);`,
);

// The lesson list must describe actual lesson context rather than falsely label
// every required glyph as standalone JLPT N5 material.
replaceOnce(
  "src/components/KanjiLessonStage.tsx",
  `      <Text style={styles.intro}>\n        Каждый новый знак проходит полный цикл: Preview → значение → чтение →\n        Writing Teach → Writing Snap → Writing Recall. До завершения всех шести\n        этапов знание не считается изученным и не попадает в SRS.\n      </Text>`,
  `      <Text style={styles.intro}>\n        Каждый новый знак, который встретится в словах, примерах или тестах\n        этого урока, проходит полный цикл: Preview → значение → чтение →\n        Writing Teach → Writing Snap → Writing Recall. Уже изученные знаки\n        повторно с нуля не вводятся.\n      </Text>`,
);
replaceOnce(
  "src/components/KanjiLessonStage.tsx",
  `                  JLPT N5 · {complete ? "цикл завершён" : "ожидает полного цикла"}`,
  `                  Материал урока · {complete ? "цикл завершён" : "ожидает полного цикла"}`,
);
replaceOnce(
  "src/components/KanjiLessonStage.tsx",
  `                <Text style={styles.focusLabel}>Чтение знака в этом слове</Text>\n                <Text style={styles.focusReading}>{example.kanjiReading}</Text>`,
  `                <Text style={styles.focusLabel}>\n                  {example.readingScope === "word"\n                    ? "Чтение слова целиком"\n                    : "Чтение знака в этом слове"}\n                </Text>\n                <Text style={styles.focusReading}>\n                  {example.readingScope === "word"\n                    ? example.reading\n                    : example.kanjiReading}\n                </Text>`,
);

// Make the six-stage panel honest when a compound cannot be split reliably.
replaceOnce(
  "src/components/KanjiStudyPanel.tsx",
  'import { getKanjiStrokeData } from "../content/kanjiStrokeData";',
  'import { maskKanjiInExample } from "../content/kanjiCurriculum";\nimport { getKanjiStrokeData } from "../content/kanjiStrokeData";',
);
replaceRegex(
  "src/components/KanjiStudyPanel.tsx",
  /function WritingPrompt\([\s\S]*?\n}\n\nexport function KanjiStudyPanel/u,
  `function WritingPrompt({\n  item,\n  mode,\n}: {\n  item: KanjiItem;\n  mode: SkritterExactWritingMode;\n}) {\n  const example = item.examples[0];\n  const recall = mode === "recall";\n  const maskedExample = maskKanjiInExample(item);\n\n  return (\n    <View style={styles.writingPrompt}>\n      <View style={styles.writingPromptCopy}>\n        <Text style={styles.writingPromptLabel}>\n          {recall ? "Какой кандзи нужно написать" : "Текущий кандзи"}\n        </Text>\n        {!recall && <Text style={styles.writingPromptGlyph}>{item.literal}</Text>}\n        <Text style={styles.writingPromptMeaning}>\n          {item.contextualOnly && example\n            ? \`Подсказка: \${recall ? maskedExample : example.written}\`\n            : item.meaningsRu.join(", ")}\n        </Text>\n        {example && (\n          <>\n            <Text style={styles.writingPromptReading}>\n              {example.readingScope === "word"\n                ? \`Чтение слова: \${example.reading}\`\n                : \`Чтение знака: \${example.kanjiReading}\`}\n            </Text>\n            <Text style={styles.writingPromptContext}>\n              {recall ? maskedExample : example.written}（{example.reading}）— {example.meaningRu}\n            </Text>\n          </>\n        )}\n      </View>\n      {example && (\n        <TouchableOpacity\n          accessibilityLabel="Прослушать подсказку"\n          style={styles.soundButton}\n          onPress={() => void speakJapanese(example.reading)}\n        >\n          <Text style={styles.soundButtonText}>🔊</Text>\n        </TouchableOpacity>\n      )}\n    </View>\n  );\n}\n\nexport function KanjiStudyPanel`,
);
replaceOnce(
  "src/components/KanjiStudyPanel.tsx",
  `{mode === "learn" ? "Learn · JLPT N5" : "Review · JLPT N5"}`,
  `{mode === "learn" ? "Learn · кандзи урока" : "Review · кандзи"}`,
);
replaceOnce(
  "src/components/KanjiStudyPanel.tsx",
  `            ? "Все 103 кандзи списка JLPT N5 введены в повторение."`,
  `            ? "Все новые кандзи этого урока введены в повторение."`,
);
replaceOnce(
  "src/components/KanjiStudyPanel.tsx",
  `<Text style={styles.primaryButtonText}>К списку N5</Text>`,
  `<Text style={styles.primaryButtonText}>К списку</Text>`,
);
replaceOnce(
  "src/components/KanjiStudyPanel.tsx",
  `              <Text style={styles.focusReading}>\n                {item.literal} здесь читается {example.kanjiReading}\n              </Text>`,
  `              <Text style={styles.focusReading}>\n                {example.readingScope === "word"\n                  ? \`Слово целиком читается \${example.reading}\`\n                  : \`\${item.literal} здесь читается \${example.kanjiReading}\`}\n              </Text>`,
);
replaceRegex(
  "src/components/KanjiStudyPanel.tsx",
  /      \{card\.part === "reading" && \([\s\S]*?\n      \)\}\n\n      \{writingMode &&/u,
  `      {card.part === "reading" && (\n        <View style={styles.studyCard}>\n          <Text style={styles.promptLabel}>\n            {example?.readingScope === "word"\n              ? "Как читается это слово?"\n              : "Как читается выделенный знак?"}\n          </Text>\n          {example?.readingScope === "word" ? (\n            <Text style={styles.questionWord}>{example.written}</Text>\n          ) : (\n            <ReadingWord written={example?.written ?? item.literal} literal={item.literal} />\n          )}\n          {example && <Text style={styles.translation}>{example.meaningRu}</Text>}\n          {!revealed ? (\n            <TouchableOpacity style={styles.revealButton} onPress={() => setRevealed(true)}>\n              <Text style={styles.revealButtonText}>Показать чтение</Text>\n            </TouchableOpacity>\n          ) : (\n            <View style={styles.revealedArea}>\n              <View style={styles.answerBox}>\n                <View style={styles.wordRow}>\n                  <View style={styles.wordCopy}>\n                    <Text style={styles.answerTitle}>\n                      {example?.readingScope === "word"\n                        ? example?.reading ?? "—"\n                        : example?.kanjiReading ?? "—"}\n                    </Text>\n                    <Text style={styles.answerDetail}>\n                      Всё слово: {example?.reading ?? item.literal}\n                    </Text>\n                  </View>\n                  {example && (\n                    <TouchableOpacity\n                      style={styles.soundButton}\n                      onPress={() => void speakJapanese(example.reading)}\n                    >\n                      <Text style={styles.soundButtonText}>🔊</Text>\n                    </TouchableOpacity>\n                  )}\n                </View>\n              </View>\n              {mode === "learn" ? (\n                <TouchableOpacity style={styles.primaryButton} onPress={advanceLearn}>\n                  <Text style={styles.primaryButtonText}>Дальше</Text>\n                </TouchableOpacity>\n              ) : (\n                <BasicGradeButtons onGrade={finishReviewCard} />\n              )}\n            </View>\n          )}\n        </View>\n      )}\n\n      {writingMode &&`,
);

// Generate verified stroke geometry for every Han character used anywhere in
// course content, not merely the old fixed 103-item standalone catalog.
replaceRegex(
  "scripts/generate-kanji-strokes.mjs",
  /const extractLiterals = \(\) => \{[\s\S]*?\n\};\n\nconst tokenizePath/u,
  `const extractLiterals = () => {\n  const contentDirectory = path.join(repositoryRoot, "src/content");\n  const sourceFiles = fs.readdirSync(contentDirectory)\n    .filter((name) => name.endsWith(".ts"))\n    .filter((name) => !name.endsWith(".test.ts"))\n    .filter((name) => name !== "kanjiStrokeData.ts");\n  const source = sourceFiles\n    .map((name) => fs.readFileSync(path.join(contentDirectory, name), "utf8"))\n    .join("\\n");\n  return [...new Set(source.match(/\\p{Script=Han}/gu) ?? [])];\n};\n\nconst tokenizePath`,
);

const curriculumTest = String.raw`import assert from "node:assert/strict";
import test from "node:test";

import { inferExerciseSkill } from "../engine/reviewEngine";
import { lessonBundles } from "./courseCatalog.ts";
import { n5KanjiCatalog } from "./kanjiCatalog.ts";
import {
  extractKanjiLiterals,
  getRequiredLessonKanjiLiterals,
} from "./kanjiCurriculum.ts";

const expectedN5 =
  "安一飲右雨駅円火花下何会外学間気九休魚金空月見言古五後午語校口行高国今左三山四子耳時七車社手週十出書女小少上食新人水生西川千先前足多大男中長天店電土東道読南二日入年買白八半百父分聞母北木本毎万名目友来立六話";

test("standalone N5 catalog remains the complete 103-character benchmark", () => {
  assert.equal(n5KanjiCatalog.length, 103);
  assert.equal(new Set(n5KanjiCatalog.map((item) => item.literal)).size, 103);
  assert.deepEqual(
    [...n5KanjiCatalog.map((item) => item.literal)].sort(),
    [...expectedN5].sort(),
  );
});

test("lesson kanji are introduced on first actual use and never assigned arbitrarily", () => {
  const introduced = new Set<string>();
  const owners = new Map<string, string>();

  lessonBundles.forEach((bundle) => {
    const required = getRequiredLessonKanjiLiterals(bundle);
    const expectedNew = required.filter((literal) => !introduced.has(literal));
    const actual = (bundle.kanji ?? []).map((item) => item.literal);

    assert.deepEqual(actual, expectedNew, bundle.lesson.id + " has unrelated or missing kanji");
    assert.equal(new Set(actual).size, actual.length, bundle.lesson.id + " repeats a glyph");

    (bundle.kanji ?? []).forEach((item) => {
      assert.equal(item.introducedInLessonId, bundle.lesson.id);
      assert.equal(item.id, "kanji-" + item.literal);
      assert.ok(item.examples[0]?.written.includes(item.literal));
      assert.equal(owners.has(item.literal), false, item.literal + " introduced twice");
      owners.set(item.literal, bundle.lesson.id);
      introduced.add(item.literal);
    });

    bundle.exercises.forEach((exercise) => {
      const visible = [
        exercise.prompt,
        ...exercise.correctAnswers,
        ...(exercise.acceptableAnswers ?? []),
        ...(exercise.distractors ?? []),
      ].flatMap(extractKanjiLiterals);
      visible.forEach((literal) => {
        assert.ok(
          introduced.has(literal),
          bundle.lesson.id + "/" + exercise.id + " tests " + literal + " before writing introduction",
        );
      });
    });
  });

  n5KanjiCatalog.forEach((item) => {
    assert.ok(introduced.has(item.literal), "N5 glyph never used by course: " + item.literal);
  });
});

test("lesson 13 words are covered by cumulative writing introduction", () => {
  const lesson13Index = lessonBundles.findIndex((bundle) => bundle.lesson.id === "lesson-013");
  assert.ok(lesson13Index >= 0);
  const cumulative = new Set(
    lessonBundles
      .slice(0, lesson13Index + 1)
      .flatMap((bundle) => (bundle.kanji ?? []).map((item) => item.literal)),
  );
  const lesson13 = lessonBundles[lesson13Index];
  assert.ok(lesson13);
  const visibleWordKanji = lesson13.vocabulary.flatMap((item) =>
    extractKanjiLiterals(item.writtenForm),
  );
  visibleWordKanji.forEach((literal) => {
    assert.ok(cumulative.has(literal), "lesson 13 did not introduce " + literal);
  });
  "静元気有名便利町公園図書館".split("").forEach((literal) => {
    assert.ok(cumulative.has(literal), "expected lesson context glyph missing: " + literal);
  });
});

test("language practice stays compact while every new lesson kanji gets three review skills", () => {
  lessonBundles.forEach((bundle) => {
    assert.equal(bundle.exercises.length, 12, bundle.lesson.id + " no longer has compact practice");
    assert.equal(
      bundle.exercises.filter((exercise) => exercise.contentKey?.startsWith("kanji:")).length,
      0,
      bundle.lesson.id + " contains obsolete inline kanji quizzes",
    );

    const reviewExercises = bundle.reviewExercises ?? [];
    assert.equal(
      reviewExercises.length,
      12 + 3 * (bundle.kanji?.length ?? 0),
      bundle.lesson.id + " review pool has incomplete kanji skills",
    );

    (bundle.kanji ?? []).forEach((item) => {
      const skills = new Set(
        reviewExercises
          .filter((exercise) =>
            exercise.targetItemIds.includes(item.id) &&
            exercise.contentKey?.startsWith("kanji:" + item.literal + ":"),
          )
          .map(inferExerciseSkill),
      );
      assert.deepEqual(skills, new Set(["recognition", "reading", "writing"]));
    });
  });
});

test("kanji recall prompts never print the missing glyph or parenthesized answer", () => {
  const reviewExercises = lessonBundles.flatMap(
    (bundle) => bundle.reviewExercises ?? bundle.exercises,
  );
  reviewExercises
    .filter((exercise) => exercise.skill === "reading" && exercise.contentKey?.startsWith("kanji:"))
    .forEach((exercise) => assert.doesNotMatch(exercise.prompt, /（[^）]+）/u));
  reviewExercises
    .filter((exercise) => exercise.skill === "writing" && exercise.contentKey?.startsWith("kanji:"))
    .forEach((exercise) => {
      const literal = exercise.correctAnswers[0];
      assert.ok(literal);
      assert.equal(exercise.prompt.includes(literal), false, exercise.id + " reveals " + literal);
    });
});

test("explicit reading skill overrides generic text input interaction", () => {
  const reading = lessonBundles
    .flatMap((bundle) => bundle.reviewExercises ?? bundle.exercises)
    .find((exercise) => exercise.skill === "reading" && exercise.type === "text-input");
  assert.ok(reading);
  assert.equal(inferExerciseSkill(reading), "reading");
});
`;
write("src/content/kanjiCurriculum.test.ts", curriculumTest);

const strokeTest = String.raw`import assert from "node:assert/strict";
import test from "node:test";

import { lessonBundles } from "./courseCatalog.ts";
import { n5KanjiCatalog } from "./kanjiCatalog.ts";
import { kanjiStrokeDataByLiteral } from "./kanjiStrokeData.ts";

test("every catalog and lesson-required kanji has usable KanjiVG stroke data", () => {
  const required = new Set([
    ...n5KanjiCatalog.map((item) => item.literal),
    ...lessonBundles.flatMap((bundle) => (bundle.kanji ?? []).map((item) => item.literal)),
  ]);
  const missing = [...required].filter((literal) => !kanjiStrokeDataByLiteral[literal]);
  assert.deepEqual(missing, [], "missing stroke geometry: " + missing.join(" "));

  required.forEach((literal) => {
    const data = kanjiStrokeDataByLiteral[literal];
    assert.ok(data, literal + " has no stroke data");
    assert.equal(data.literal, literal);
    assert.equal(data.source, "KanjiVG");
    assert.deepEqual(data.viewBox, [0, 0, 109, 109]);
    assert.ok(data.strokes.length > 0, literal + " has no strokes");

    data.strokes.forEach((stroke, index) => {
      assert.ok(stroke.path.trim(), literal + " stroke " + (index + 1) + " has no SVG path");
      assert.ok(stroke.length > 0, literal + " stroke " + (index + 1) + " has no length");
      assert.equal(stroke.samples.length, 28);
      assert.deepEqual(stroke.samples[0], stroke.start);
      assert.deepEqual(stroke.samples.at(-1), stroke.end);
      stroke.samples.forEach((point) => {
        assert.ok(Number.isFinite(point.x));
        assert.ok(Number.isFinite(point.y));
      });
    });
  });
});
`;
write("src/content/kanjiStrokeData.test.ts", strokeTest);

// Release metadata.
const packageJson = JSON.parse(read("package.json"));
packageJson.version = "0.22.5";
write("package.json", JSON.stringify(packageJson, null, 2) + "\n");
const appJson = JSON.parse(read("app.json"));
appJson.expo.version = "0.22.5";
appJson.expo.android.versionCode = Math.max(51, Number(appJson.expo.android.versionCode ?? 0) + 1);
write("app.json", JSON.stringify(appJson, null, 2) + "\n");

// Generate all verified paths from a fresh public KanjiVG checkout prepared by
// the workflow. The resulting large file is committed by git, bypassing the
// one-megabyte Contents API limitation.
execFileSync(process.execPath, [path.join(root, "scripts/generate-kanji-strokes.mjs")], {
  cwd: root,
  stdio: "inherit",
});

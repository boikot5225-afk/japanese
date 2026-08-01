import assert from "node:assert/strict";
import test from "node:test";

import type { Lesson, VocabularyItem } from "../domain/course.ts";
import { lessonBundles } from "./courseCatalog.ts";
import { diversifyLessonPractice } from "./practiceDiversity.ts";
import type { LessonBundle } from "./lessonBundle.ts";

const compact = (value: string): string =>
  value.trim().normalize("NFKC").replace(/\s+/gu, "");

const allVocabulary = lessonBundles.flatMap((bundle) =>
  bundle.vocabulary.map((word) => ({
    lessonId: bundle.lesson.id,
    word,
  })),
);

const allTeachingText = lessonBundles.flatMap((bundle) => [
  bundle.lesson.title,
  bundle.lesson.description,
  ...bundle.grammar.flatMap((grammar) => [
    grammar.title,
    grammar.meaningRu,
    grammar.explanationRu,
    ...grammar.formation,
    ...(grammar.cautions ?? []),
  ]),
  ...bundle.sentences.map((sentence) => sentence.translationRu),
  ...bundle.exercises.flatMap((exercise) => [
    exercise.prompt,
    exercise.explanationRu ?? "",
  ]),
]);

test("the course has one canonical vocabulary card per written form and primary reading", () => {
  const owners = new Map<string, string[]>();

  allVocabulary.forEach(({ lessonId, word }) => {
    const key = `${compact(word.writtenForm)}::${compact(word.reading)}`;
    owners.set(key, [...(owners.get(key) ?? []), `${lessonId}/${word.id}`]);
  });

  const duplicates = [...owners.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([key, entries]) => `${key} => ${entries.join(", ")}`);

  assert.deepEqual(duplicates, [], `duplicate vocabulary cards:\n${duplicates.join("\n")}`);
});

test("primary readings are single speakable readings", () => {
  const malformed = allVocabulary
    .filter(({ word }) => /[／/|]/u.test(word.reading))
    .map(({ lessonId, word }) => `${lessonId}/${word.id}: ${word.reading}`);

  assert.deepEqual(malformed, [], `compound primary readings:\n${malformed.join("\n")}`);
});

test("alternative readings are unique and separate from the primary reading", () => {
  const malformed = allVocabulary.flatMap(({ lessonId, word }) => {
    const alternatives = word.alternativeReadings ?? [];
    const normalized = alternatives.map(compact);
    const issues: string[] = [];
    if (new Set(normalized).size !== normalized.length) {
      issues.push(`${lessonId}/${word.id}: duplicate alternatives`);
    }
    if (normalized.includes(compact(word.reading))) {
      issues.push(`${lessonId}/${word.id}: primary repeated as alternative`);
    }
    if (alternatives.some((reading) => /[／/|]/u.test(reading))) {
      issues.push(`${lessonId}/${word.id}: compound alternative reading`);
    }
    return issues;
  });

  assert.deepEqual(malformed, [], malformed.join("\n"));
});

test("generated vocabulary practice accepts every alternative reading without speaking a separator", () => {
  const word: VocabularyItem = {
    id: "audit-word-nani",
    type: "vocabulary",
    writtenForm: "何",
    reading: "なに",
    alternativeReadings: ["なん"],
    meaningsRu: ["что"],
    partOfSpeech: ["вопросительное слово"],
    jlptLevel: "N5",
  };
  const lesson: Lesson = {
    id: "audit-lesson",
    unitId: "audit-unit",
    order: 999,
    title: "Audit",
    description: "Audit",
    theory: [],
    itemIds: [word.id],
    exerciseIds: [],
    estimatedMinutes: 1,
  };
  const bundle: LessonBundle = {
    lesson,
    vocabulary: [word],
    grammar: [],
    sentences: [],
    exercises: [],
    outcomes: [],
  };

  const diversified = diversifyLessonPractice(bundle, [bundle]);
  const readingInput = diversified.exercises.find(
    (exercise) => exercise.contentKey === "vocabulary:audit-word-nani:reading" && exercise.type === "text-input",
  );
  assert.ok(readingInput);
  assert.deepEqual(readingInput.correctAnswers, ["なに"]);
  assert.deepEqual(readingInput.acceptableAnswers, ["なん"]);

  diversified.exercises
    .filter((exercise) => exercise.audioText)
    .forEach((exercise) => {
      assert.ok(!/[／/|]/u.test(exercise.audioText ?? ""), exercise.id);
    });
});

test("example translations contain translations, not editorial stage directions", () => {
  const forbidden = [
    /Предмет находится/u,
    /в зависимости от контекста/iu,
    /\s\/\s/u,
  ];
  const polluted = lessonBundles.flatMap((bundle) =>
    bundle.sentences
      .filter((sentence) => forbidden.some((pattern) => pattern.test(sentence.translationRu)))
      .map((sentence) => `${bundle.lesson.id}/${sentence.id}: ${sentence.translationRu}`),
  );

  assert.deepEqual(polluted, [], `polluted translations:\n${polluted.join("\n")}`);
});

test("the course uses neutral terminology for plain forms", () => {
  const deprecated = allTeachingText.filter((text) => /невежлив/iu.test(text));
  assert.deepEqual(deprecated, [], `deprecated terminology:\n${deprecated.join("\n")}`);
});

test("reading prompts do not demand hiragana for every script", () => {
  const misleading = lessonBundles.flatMap((bundle) =>
    bundle.exercises
      .filter((exercise) => /Напиши хираганой чтение/u.test(exercise.prompt))
      .map((exercise) => `${bundle.lesson.id}/${exercise.id}: ${exercise.prompt}`),
  );

  assert.deepEqual(misleading, [], `misleading reading prompts:\n${misleading.join("\n")}`);
});

test("vocabulary audio never contains a printed alternative-reading separator", () => {
  const malformed = lessonBundles.flatMap((bundle) =>
    bundle.exercises
      .filter((exercise) => exercise.audioText && /[／/|]/u.test(exercise.audioText))
      .map((exercise) => `${bundle.lesson.id}/${exercise.id}: ${exercise.audioText}`),
  );

  assert.deepEqual(malformed, [], `unspeakable audio text:\n${malformed.join("\n")}`);
});

test("a task requesting tai desu does not accept the plain tai form", () => {
  const lesson23 = lessonBundles.find((bundle) => bundle.lesson.id === "lesson-023");
  assert.ok(lesson23);
  const exercise = lesson23.exercises.find((item) => item.id === "exercise-23-tabetai");
  assert.ok(exercise);
  assert.deepEqual(exercise.correctAnswers, ["食べたいです"]);
  assert.ok(exercise.acceptableAnswers?.includes("たべたいです"));
  assert.ok(!exercise.acceptableAnswers?.includes("食べたい"));
  assert.ok(!exercise.acceptableAnswers?.includes("たべたい"));
});

test("te kara is not presented as automatically immediate", () => {
  const lesson27 = lessonBundles.find((bundle) => bundle.lesson.id === "lesson-027");
  assert.ok(lesson27);
  const contrast = lesson27.grammar.find((item) => item.id === "grammar-ato-de-vs-te-kara");
  assert.ok(contrast);
  assert.match(contrast.explanationRu, /не требует.+немедленно/iu);
  assert.ok(!contrast.relatedGrammarIds?.includes("grammar-time-ni"));
});

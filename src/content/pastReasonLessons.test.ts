import assert from "node:assert/strict";
import test from "node:test";

import type { LessonBundle } from "./lessonBundle";
import { lesson025Bundle } from "./lesson025.ts";
import { lesson026Bundle } from "./lesson026.ts";
import { lesson027Bundle } from "./lesson027.ts";
import { lesson028Bundle } from "./lesson028.ts";

const bundles: LessonBundle[] = [
  lesson025Bundle,
  lesson026Bundle,
  lesson027Bundle,
  lesson028Bundle,
];
const byId = new Map(bundles.map((bundle) => [bundle.lesson.id, bundle]));
const answersFor = (lessonId: string): string[] =>
  (byId.get(lessonId)?.exercises ?? []).flatMap((exercise) => [
    ...exercise.correctAnswers,
    ...(exercise.acceptableAnswers ?? []),
  ]);

test("the past and reasons unit contains four contiguous lessons", () => {
  assert.deepEqual(
    bundles.map((bundle) => bundle.lesson.order),
    [25, 26, 27, 28],
  );
  assert.ok(bundles.every((bundle) => bundle.lesson.unitId === "unit-008"));
});

test("lesson 25 converts te and de endings into ta and da", () => {
  const answers = answersFor("lesson-025");
  ["読んだ", "書いた", "行った", "食べた"].forEach((form) =>
    assert.ok(answers.includes(form), `missing ${form}`),
  );
  ["読んで", "書いて", "行って", "食べて", "読んた"].forEach((form) =>
    assert.ok(!answers.includes(form), `accepted non-past or invalid form ${form}`),
  );
});

test("lesson 26 derives past negatives from nai forms", () => {
  const answers = answersFor("lesson-026");
  ["読まなかった", "行かなかった", "しなかった"].forEach((form) =>
    assert.ok(answers.includes(form), `missing ${form}`),
  );
  ["読まないかった", "行きなかった", "するなかった"].forEach((form) =>
    assert.ok(!answers.includes(form), `accepted invalid negative past ${form}`),
  );

  const meaningExercise = byId
    .get("lesson-026")
    ?.exercises.find((exercise) => exercise.id === "exercise-26-meaning");
  assert.ok(meaningExercise);
  assert.deepEqual(meaningExercise.correctAnswers, ["Не смотрел телевизор"]);
  assert.ok(!meaningExercise.correctAnswers.includes("Не хочу смотреть телевизор"));
});

test("lesson 27 keeps dictionary form before mae and ta form before ato", () => {
  const lesson = byId.get("lesson-027");
  assert.ok(lesson);
  assert.ok(
    lesson.sentences.some((sentence) => sentence.japanese.includes("寝る前に")),
  );
  assert.ok(
    lesson.sentences.some((sentence) => sentence.japanese.includes("食べた後で")),
  );
  assert.ok(
    lesson.sentences.some((sentence) => sentence.japanese.includes("帰った後で")),
  );

  const answers = answersFor("lesson-027");
  assert.ok(answers.includes("寝る"));
  assert.ok(answers.includes("食べた"));
  assert.ok(!answers.includes("寝た"));
  assert.ok(!answers.includes("食べる"));
});

test("lesson 28 distinguishes reason kara from time kara and te kara", () => {
  const lesson = byId.get("lesson-028");
  assert.ok(lesson);
  const grammar = lesson.grammar.find(
    (item) => item.id === "grammar-kara-three-meanings",
  );
  assert.ok(grammar);
  assert.ok(grammar.formation.includes("九時から — с девяти"));
  assert.ok(grammar.formation.includes("食べてから — после того как поел"));
  assert.ok(grammar.formation.includes("忙しいから — потому что занят"));

  const answers = answersFor("lesson-028");
  assert.ok(answers.includes("風邪だから"));
  assert.ok(answers.includes("雨ですから"));
  assert.ok(answers.includes("朝ご飯を食べてから、学校へ行きます"));
  assert.ok(!answers.includes("風邪から"));
});

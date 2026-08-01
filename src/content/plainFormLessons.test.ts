import assert from "node:assert/strict";
import test from "node:test";

import type { LessonBundle } from "./lessonBundle";
import { lesson021Bundle } from "./lesson021.ts";
import { lesson022Bundle } from "./lesson022.ts";
import { lesson023Bundle } from "./lesson023.ts";
import { lesson024Bundle } from "./lesson024.ts";

const bundles: LessonBundle[] = [
  lesson021Bundle,
  lesson022Bundle,
  lesson023Bundle,
  lesson024Bundle,
];
const byId = new Map(bundles.map((bundle) => [bundle.lesson.id, bundle]));
const answersFor = (lessonId: string): string[] =>
  (byId.get(lessonId)?.exercises ?? []).flatMap((exercise) => [
    ...exercise.correctAnswers,
    ...(exercise.acceptableAnswers ?? []),
  ]);

test("the plain-form unit contains four contiguous lessons", () => {
  assert.deepEqual(
    bundles.map((bundle) => bundle.lesson.order),
    [21, 22, 23, 24],
  );
  assert.ok(bundles.every((bundle) => bundle.lesson.unitId === "unit-007"));
});

test("lesson 21 keeps dictionary forms separate from te forms", () => {
  const answers = answersFor("lesson-021");
  ["読む", "話す", "食べる", "勉強する"].forEach((form) =>
    assert.ok(answers.includes(form), `missing ${form}`),
  );
  ["読んで", "話して", "食べて", "勉強して"].forEach((form) =>
    assert.ok(!answers.includes(form), `accepted te form ${form}`),
  );
});

test("lesson 22 handles the u to wa exception and irregular negatives", () => {
  const answers = answersFor("lesson-022");
  ["読まない", "買わない", "見ない", "しない"].forEach((form) =>
    assert.ok(answers.includes(form), `missing ${form}`),
  );
  ["読みない", "買あない", "見るない", "するない"].forEach((form) =>
    assert.ok(!answers.includes(form), `accepted invalid negative ${form}`),
  );
});

test("lesson 23 distinguishes not doing from not wanting to do", () => {
  const lesson = byId.get("lesson-023");
  assert.ok(lesson);
  assert.ok(lesson.grammar.some((item) => item.id === "grammar-takunai"));
  assert.ok(
    lesson.sentences.some((sentence) => sentence.japanese.includes("見たくないです")),
  );
  const meaningExercise = lesson.exercises.find(
    (exercise) => exercise.id === "exercise-23-takunai-meaning",
  );
  assert.ok(meaningExercise);
  assert.deepEqual(meaningExercise.correctAnswers, ["Не хочу смотреть фильм"]);
  assert.ok(!meaningExercise.correctAnswers.includes("Не смотрю фильмы"));
});

test("lesson 24 requires dictionary form before koto ga dekimasu", () => {
  const lesson = byId.get("lesson-024");
  assert.ok(lesson);
  ["読むことができます", "話すことができます", "泳ぐことができません", "弾くことができますか"].forEach(
    (fragment) =>
      assert.ok(
        lesson.sentences.some((sentence) => sentence.japanese.includes(fragment)),
        `missing ${fragment}`,
      ),
  );
  const answers = answersFor("lesson-024");
  assert.ok(!answers.some((answer) => answer.includes("読みますこと")));
  assert.ok(!answers.some((answer) => answer.includes("泳ぎますこと")));
});

test("lesson 24 separates ability from skill quality", () => {
  const lesson = byId.get("lesson-024");
  assert.ok(lesson);
  const exercise = lesson.exercises.find(
    (item) => item.id === "exercise-24-dekiru-jouzu",
  );
  assert.ok(exercise);
  assert.deepEqual(exercise.correctAnswers, ["料理をすることができます"]);
  assert.ok(exercise.distractors?.includes("料理が上手です"));
});

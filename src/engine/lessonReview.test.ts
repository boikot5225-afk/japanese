import assert from "node:assert/strict";
import test from "node:test";

import type { Exercise } from "../domain/course.ts";
import { commitLessonReviewItems } from "./lessonReview.ts";

const exercises: Exercise[] = [
  {
    id: "exercise-one",
    type: "text-input",
    prompt: "Первое",
    targetItemIds: ["word-one"],
    correctAnswers: ["一"],
  },
  {
    id: "exercise-two",
    type: "text-input",
    prompt: "Второе",
    targetItemIds: ["word-two", "grammar-counter"],
    correctAnswers: ["二"],
  },
  {
    id: "exercise-one-again",
    type: "text-input",
    prompt: "Первое ещё раз",
    targetItemIds: ["word-one"],
    correctAnswers: ["一"],
  },
];

const attempts = [
  { exerciseId: "exercise-one", status: "correct" as const },
  { exerciseId: "exercise-two", status: "acceptable" as const },
  { exerciseId: "exercise-one-again", status: "correct" as const },
];
const now = new Date("2026-07-31T10:00:00.000Z");

test("успешно завершённый новый урок добавляет знания и навыки в SRS", () => {
  const items = commitLessonReviewItems({
    items: [],
    exercises,
    attempts,
    lessonId: "lesson-test",
    mode: "learning",
    passed: true,
    now,
  });

  assert.equal(items.length, 3);
  assert.ok(items.every((item) => item.lessonId === "lesson-test"));
  assert.ok(items.every((item) => item.intervalDays === 1));
  assert.ok(items.every((item) => item.skill === "recall"));
  assert.deepEqual(
    new Set(items.map((item) => item.itemId)),
    new Set(["word-one", "word-two", "grammar-counter"]),
  );
  assert.equal(items.find((item) => item.itemId === "word-one")?.streak, 1);
});

test("несколько заданий одного урока не накручивают интервал одного знания", () => {
  const items = commitLessonReviewItems({
    items: [],
    exercises,
    attempts: [
      { exerciseId: "exercise-one", status: "correct" },
      { exerciseId: "exercise-one-again", status: "incorrect" },
    ],
    lessonId: "lesson-test",
    mode: "learning",
    passed: true,
    now,
  });

  assert.equal(items.length, 1);
  assert.equal(items[0]?.itemId, "word-one");
  assert.equal(items[0]?.lastStatus, "incorrect");
  assert.equal(items[0]?.intervalDays, 0);
});

test("незавершённый урок не засоряет долгосрочную очередь", () => {
  const items = commitLessonReviewItems({
    items: [],
    exercises,
    attempts,
    lessonId: "lesson-test",
    mode: "learning",
    passed: false,
    now,
  });

  assert.deepEqual(items, []);
});

test("свободное повторение пройденного урока не меняет SRS", () => {
  const existing = commitLessonReviewItems({
    items: [],
    exercises,
    attempts: [{ exerciseId: "exercise-one", status: "correct" }],
    lessonId: "lesson-test",
    mode: "learning",
    passed: true,
    now,
  });

  const afterPractice = commitLessonReviewItems({
    items: existing,
    exercises,
    attempts: [{ exerciseId: "exercise-one", status: "incorrect" }],
    lessonId: "lesson-test",
    mode: "practice",
    passed: true,
    now: new Date("2026-08-01T10:00:00.000Z"),
  });

  assert.deepEqual(afterPractice, existing);
});

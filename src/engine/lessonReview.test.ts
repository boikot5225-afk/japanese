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
    targetItemIds: ["word-two"],
    correctAnswers: ["二"],
  },
];

const attempts = [
  { exerciseId: "exercise-one", status: "correct" as const },
  { exerciseId: "exercise-two", status: "acceptable" as const },
];
const now = new Date("2026-07-31T10:00:00.000Z");

test("успешно завершённый новый урок добавляет задания в SRS", () => {
  const items = commitLessonReviewItems({
    items: [],
    exercises,
    attempts,
    lessonId: "lesson-test",
    mode: "learning",
    passed: true,
    now,
  });

  assert.equal(items.length, 2);
  assert.ok(items.every((item) => item.lessonId === "lesson-test"));
  assert.ok(items.every((item) => item.intervalDays === 1));
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
    attempts: [attempts[0]],
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

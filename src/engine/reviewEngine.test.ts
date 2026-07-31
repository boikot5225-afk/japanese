import assert from "node:assert/strict";
import test from "node:test";

import type { Exercise } from "../domain/course.ts";
import {
  getDueReviewItems,
  getWeakTargetIds,
  scheduleExerciseReview,
} from "./reviewEngine.ts";

const exercise: Exercise = {
  id: "exercise-test",
  type: "text-input",
  prompt: "Тест",
  targetItemIds: ["grammar-test"],
  correctAnswers: ["正解"],
};

const now = new Date("2026-07-30T18:00:00.000Z");

test("правильные ответы увеличивают интервалы 1 → 3 → 7+ дней", () => {
  const first = scheduleExerciseReview(undefined, exercise, "lesson-test", "correct", now);
  assert.equal(first.intervalDays, 1);

  const second = scheduleExerciseReview(
    first,
    exercise,
    "lesson-test",
    "correct",
    new Date(first.dueAt),
  );
  assert.equal(second.intervalDays, 3);

  const third = scheduleExerciseReview(
    second,
    exercise,
    "lesson-test",
    "correct",
    new Date(second.dueAt),
  );
  assert.ok(third.intervalDays >= 7);
});

test("ошибка возвращает задание в сегодняшнюю очередь", () => {
  const failed = scheduleExerciseReview(undefined, exercise, "lesson-test", "incorrect", now);
  assert.equal(failed.intervalDays, 0);
  assert.equal(failed.dueAt, now.toISOString());
  assert.equal(getDueReviewItems([failed], now).length, 1);
});

test("при одинаковом сроке более слабое задание идёт первым", () => {
  const weak = {
    ...scheduleExerciseReview(undefined, exercise, "lesson-test", "incorrect", now),
    exerciseId: "weak",
    incorrectCount: 3,
    lapseCount: 3,
  };
  const strong = {
    ...scheduleExerciseReview(undefined, exercise, "lesson-test", "incorrect", now),
    exerciseId: "strong",
    incorrectCount: 1,
    lapseCount: 1,
  };

  const queue = getDueReviewItems([strong, weak], now);
  assert.equal(queue[0]?.exerciseId, "weak");
});

test("ошибочный элемент перестаёт считаться слабым после трёх уверенных ответов", () => {
  const failed = scheduleExerciseReview(undefined, exercise, "lesson-test", "incorrect", now);
  assert.deepEqual(getWeakTargetIds([failed]), ["grammar-test"]);

  const firstRecovery = scheduleExerciseReview(
    failed,
    exercise,
    "lesson-test",
    "correct",
    new Date("2026-07-31T18:00:00.000Z"),
  );
  const secondRecovery = scheduleExerciseReview(
    firstRecovery,
    exercise,
    "lesson-test",
    "correct",
    new Date("2026-08-03T18:00:00.000Z"),
  );
  assert.deepEqual(getWeakTargetIds([secondRecovery]), ["grammar-test"]);

  const thirdRecovery = scheduleExerciseReview(
    secondRecovery,
    exercise,
    "lesson-test",
    "correct",
    new Date("2026-08-10T18:00:00.000Z"),
  );
  assert.deepEqual(getWeakTargetIds([thirdRecovery]), []);
});

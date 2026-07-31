import assert from "node:assert/strict";
import test from "node:test";

import type { Exercise } from "../domain/course.ts";
import {
  getDueReviewItems,
  getWeakTargetIds,
  migrateLegacyReviewItems,
  scheduleExerciseReview,
  scheduleItemReview,
  selectExerciseForReview,
  upsertReviewItem,
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

test("ошибка возвращает знание в сегодняшнюю очередь", () => {
  const failed = scheduleExerciseReview(undefined, exercise, "lesson-test", "incorrect", now);
  assert.equal(failed.intervalDays, 0);
  assert.equal(failed.dueAt, now.toISOString());
  assert.equal(getDueReviewItems([failed], now).length, 1);
});

test("при одинаковом сроке более слабое знание идёт первым", () => {
  const weak = {
    ...scheduleItemReview(
      undefined,
      "grammar-weak",
      "recall",
      exercise,
      "lesson-test",
      "incorrect",
      now,
    ),
    incorrectCount: 3,
    lapseCount: 3,
  };
  const strong = {
    ...scheduleItemReview(
      undefined,
      "grammar-strong",
      "recall",
      exercise,
      "lesson-test",
      "incorrect",
      now,
    ),
    incorrectCount: 1,
    lapseCount: 1,
  };

  const queue = getDueReviewItems([strong, weak], now);
  assert.equal(queue[0]?.itemId, "grammar-weak");
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

test("одно слово хранит отдельные интервалы для разных навыков", () => {
  const recognitionExercise: Exercise = {
    ...exercise,
    id: "recognize-word",
    type: "multiple-choice",
    targetItemIds: ["word-neko"],
  };
  const recallExercise: Exercise = {
    ...exercise,
    id: "recall-word",
    type: "text-input",
    targetItemIds: ["word-neko"],
  };

  const recognition = scheduleItemReview(
    undefined,
    "word-neko",
    "recognition",
    recognitionExercise,
    "lesson-test",
    "correct",
    now,
  );
  const recall = scheduleItemReview(
    undefined,
    "word-neko",
    "recall",
    recallExercise,
    "lesson-test",
    "incorrect",
    now,
  );
  const items = upsertReviewItem(upsertReviewItem([], recognition), recall);

  assert.equal(items.length, 2);
  assert.deepEqual(new Set(items.map((item) => item.skill)), new Set(["recognition", "recall"]));
});

test("повторение вращает разные упражнения одного знания", () => {
  const firstExercise: Exercise = {
    ...exercise,
    id: "usage-one",
    type: "sentence-builder",
    targetItemIds: ["grammar-wa"],
  };
  const secondExercise: Exercise = {
    ...exercise,
    id: "usage-two",
    type: "particle-gap",
    targetItemIds: ["grammar-wa"],
  };
  const item = scheduleItemReview(
    undefined,
    "grammar-wa",
    "usage",
    firstExercise,
    "lesson-test",
    "correct",
    now,
  );

  assert.equal(selectExerciseForReview(item, [firstExercise, secondExercise])?.id, "usage-two");
});

test("старые записи упражнений разворачиваются в отдельные знания", () => {
  const multiTargetExercise: Exercise = {
    ...exercise,
    id: "legacy-exercise",
    targetItemIds: ["word-neko", "grammar-imasu"],
  };
  const migrated = migrateLegacyReviewItems([
    {
      exerciseId: "legacy-exercise",
      lessonId: "lesson-test",
      targetItemIds: ["word-neko", "grammar-imasu"],
      dueAt: now.toISOString(),
      intervalDays: 0,
      ease: 2.1,
      streak: 0,
      correctCount: 0,
      incorrectCount: 1,
      lapseCount: 1,
      lastStatus: "incorrect",
      lastAnsweredAt: now.toISOString(),
    },
  ], [multiTargetExercise]);

  assert.equal(migrated.length, 2);
  assert.deepEqual(
    new Set(migrated.map((item) => item.itemId)),
    new Set(["word-neko", "grammar-imasu"]),
  );
});

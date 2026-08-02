import assert from "node:assert/strict";
import test from "node:test";

import type { Exercise } from "../domain/course.ts";
import { scheduleItemReview } from "./reviewEngine.ts";

const now = new Date("2026-08-02T00:00:00.000Z");

const exerciseForGrade = (grade: 1 | 2 | 3 | 4): Exercise => ({
  id: `kanji-day-reading-${grade}`,
  type: "text-input",
  prompt: "Как читается 日?",
  targetItemIds: ["kanji-日"],
  correctAnswers: ["にち"],
  skill: "reading",
  variantGroup: `kanji-self-grade:${grade}`,
});

const secondsUntilDue = (dueAt: string): number =>
  Math.round((new Date(dueAt).getTime() - now.getTime()) / 1000);

test("Skritter Classic schedules forgotten kanji knowledge after 30 seconds", () => {
  const result = scheduleItemReview(
    undefined,
    "kanji-日",
    "reading",
    exerciseForGrade(1),
    "lesson-001",
    "incorrect",
    now,
  );
  assert.equal(secondsUntilDue(result.dueAt), 30);
  assert.equal(result.correctCount, 0);
  assert.equal(result.incorrectCount, 1);
  assert.equal(result.lapseCount, 1);
  assert.equal(result.streak, 0);
});

test("Skritter Classic treats hard and got-it as one-day successes for new knowledge", () => {
  const hard = scheduleItemReview(
    undefined,
    "kanji-日",
    "reading",
    exerciseForGrade(2),
    "lesson-001",
    "acceptable",
    now,
  );
  const gotIt = scheduleItemReview(
    undefined,
    "kanji-日",
    "reading",
    exerciseForGrade(3),
    "lesson-001",
    "correct",
    now,
  );

  [hard, gotIt].forEach((result) => {
    assert.equal(result.intervalDays, 1);
    assert.equal(result.correctCount, 1);
    assert.equal(result.incorrectCount, 0);
    assert.equal(result.lapseCount, 0);
    assert.equal(result.streak, 1);
  });
});

test("Skritter Classic easy introduces new knowledge at roughly four weeks", () => {
  const easy = scheduleItemReview(
    undefined,
    "kanji-日",
    "reading",
    exerciseForGrade(4),
    "lesson-001",
    "correct",
    now,
  );
  assert.ok(easy.intervalDays >= 25 && easy.intervalDays <= 31);
  assert.equal(easy.correctCount, 1);
  assert.equal(easy.streak, 1);
});

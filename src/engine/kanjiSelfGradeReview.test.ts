import assert from "node:assert/strict";
import test from "node:test";

import type { Exercise } from "../domain/course";
import { scheduleItemReview } from "./reviewEngine";

const now = new Date("2026-08-02T12:00:00.000Z");

const exerciseForGrade = (grade: 1 | 2 | 3 | 4): Exercise => ({
  id: `lesson-001-kanji-人-reading`,
  type: "text-input",
  prompt: "Как читается 人?",
  targetItemIds: ["kanji-person"],
  correctAnswers: ["ひと"],
  skill: "reading",
  contentKey: "kanji:人:reading",
  variantGroup: `kanji-self-grade:${grade}`,
  difficulty: grade,
});

const schedule = (grade: 1 | 2 | 3 | 4) =>
  scheduleItemReview(
    undefined,
    "kanji-person",
    "reading",
    exerciseForGrade(grade),
    "lesson-001",
    grade <= 2 ? "incorrect" : grade === 3 ? "acceptable" : "correct",
    now,
  );

test("kanji self-grades create four distinct first intervals", () => {
  const forgot = schedule(1);
  const hard = schedule(2);
  const known = schedule(3);
  const easy = schedule(4);

  assert.equal(new Date(forgot.dueAt).getTime() - now.getTime(), 10 * 60 * 1000);
  assert.equal(new Date(hard.dueAt).getTime() - now.getTime(), 8 * 60 * 60 * 1000);
  assert.equal(known.intervalDays, 1);
  assert.equal(easy.intervalDays, 4);

  assert.equal(forgot.streak, 0);
  assert.equal(hard.streak, 0);
  assert.equal(known.streak, 1);
  assert.equal(easy.streak, 1);

  assert.ok(forgot.ease < hard.ease);
  assert.ok(hard.ease < known.ease);
  assert.ok(known.ease < easy.ease);
});

test("ordinary non-kanji failures keep the existing immediate schedule", () => {
  const ordinaryExercise: Exercise = {
    ...exerciseForGrade(2),
    id: "ordinary-reading",
    variantGroup: "ordinary-reading",
    contentKey: "ordinary:reading",
  };
  const result = scheduleItemReview(
    undefined,
    "ordinary-item",
    "reading",
    ordinaryExercise,
    "lesson-001",
    "incorrect",
    now,
  );
  assert.equal(result.dueAt, now.toISOString());
  assert.equal(result.intervalDays, 0);
});

import assert from "node:assert/strict";
import test from "node:test";

import type { Exercise } from "../domain/course.ts";
import { checkAnswer } from "../engine/checkAnswer.ts";
import {
  getHandwritingAssessmentAnswer,
  getPracticeInteractionMode,
} from "../engine/practiceInteraction.ts";
import {
  isSwipeNavigationCandidate,
  resolveSwipeNavigation,
} from "../engine/swipeNavigation.ts";

const exercise = (type: Exercise["type"]): Exercise => ({
  id: `interaction-${type}`,
  type,
  prompt: "Тест",
  targetItemIds: ["word-test"],
  correctAnswers: ["字"],
});

test("handwriting is an explicit interactive practice mode", () => {
  assert.equal(getPracticeInteractionMode(exercise("handwriting")), "handwriting");
  assert.equal(getPracticeInteractionMode(exercise("sentence-builder")), "builder");
  assert.equal(getPracticeInteractionMode(exercise("listening")), "choice");
  assert.equal(getPracticeInteractionMode(exercise("text-input")), "text");
});

test("handwriting self-check records success or schedules honest remediation", () => {
  const task = exercise("handwriting");
  const accepted = getHandwritingAssessmentAnswer(task, true);
  const retry = getHandwritingAssessmentAnswer(task, false);

  assert.equal(checkAnswer(accepted, task.correctAnswers).status, "correct");
  assert.equal(checkAnswer(retry, task.correctAnswers).status, "incorrect");
});

test("edge swipe goes back without stealing an interior handwriting stroke", () => {
  const options = {
    allowBack: true,
    allowForward: false,
    backEdgeOnly: true,
    edgeWidth: 24,
  };

  assert.equal(
    resolveSwipeNavigation(
      { startX: 12, dx: 96, dy: 8, velocityX: 0.3 },
      options,
    ),
    "back",
  );
  assert.equal(
    resolveSwipeNavigation(
      { startX: 80, dx: 110, dy: 4, velocityX: 0.7 },
      options,
    ),
    null,
  );
});

test("vertical scrolling and short accidental movement never navigate", () => {
  const options = {
    allowBack: true,
    allowForward: true,
    backEdgeOnly: false,
  };

  assert.equal(
    isSwipeNavigationCandidate(
      { startX: 60, dx: 24, dy: 80, velocityX: 0.8 },
      options,
    ),
    false,
  );
  assert.equal(
    resolveSwipeNavigation(
      { startX: 60, dx: -30, dy: 4, velocityX: -0.2 },
      options,
    ),
    null,
  );
});

test("lesson pages support deliberate left swipe forward", () => {
  assert.equal(
    resolveSwipeNavigation(
      { startX: 240, dx: -90, dy: 10, velocityX: -0.4 },
      { allowBack: true, allowForward: true, backEdgeOnly: false },
    ),
    "forward",
  );
});

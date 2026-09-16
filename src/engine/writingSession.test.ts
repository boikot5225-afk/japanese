import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveAutomaticWritingGrade,
  getHiddenLearnWritingGrade,
  getInitialWritingMode,
  getMaximumWritingGrade,
  isPassingWritingGrade,
  nextLearningWritingMode,
} from "./writingSession";

const baseMetrics = {
  mode: "recall" as const,
  strokeCount: 8,
  mistakes: 0,
  attempts: 8,
  hints: 0,
  revealAll: false,
  completed: true,
};

test("clean recall defaults to got-it rather than easy", () => {
  assert.equal(deriveAutomaticWritingGrade(baseMetrics), 3);
});

test("guidance fades without trapping progress", () => {
  assert.equal(deriveAutomaticWritingGrade({ ...baseMetrics, mode: "teach" }), 2);
  assert.equal(getMaximumWritingGrade({ ...baseMetrics, mode: "teach" }), 2);
  assert.equal(deriveAutomaticWritingGrade({ ...baseMetrics, mode: "guided" }), 3);
  assert.equal(getMaximumWritingGrade({ ...baseMetrics, mode: "guided" }), 3);
});

test("manual grades are capped by revealed evidence", () => {
  assert.equal(getMaximumWritingGrade(baseMetrics), 4);
  assert.equal(getMaximumWritingGrade({ ...baseMetrics, mistakes: 1 }), 2);
  assert.equal(getMaximumWritingGrade({ ...baseMetrics, hints: 1 }), 2);
  assert.equal(getMaximumWritingGrade({ ...baseMetrics, revealAll: true }), 1);
  assert.equal(getMaximumWritingGrade({ ...baseMetrics, hints: 2 }), 1);
});

test("a correction or single hint defaults to hard", () => {
  assert.equal(
    deriveAutomaticWritingGrade({ ...baseMetrics, mistakes: 1, attempts: 9 }),
    2,
  );
  assert.equal(deriveAutomaticWritingGrade({ ...baseMetrics, hints: 1 }), 2);
});

test("revealing the answer or repeated hints is forgotten", () => {
  assert.equal(deriveAutomaticWritingGrade({ ...baseMetrics, revealAll: true }), 1);
  assert.equal(deriveAutomaticWritingGrade({ ...baseMetrics, hints: 2 }), 1);
});

test("mistake threshold scales with character complexity", () => {
  assert.equal(
    deriveAutomaticWritingGrade({ ...baseMetrics, strokeCount: 2, mistakes: 2 }),
    1,
  );
  assert.equal(
    deriveAutomaticWritingGrade({ ...baseMetrics, strokeCount: 5, mistakes: 3 }),
    1,
  );
  assert.equal(
    deriveAutomaticWritingGrade({ ...baseMetrics, strokeCount: 12, mistakes: 4 }),
    1,
  );
});

test("unfinished sessions never pass", () => {
  assert.equal(deriveAutomaticWritingGrade({ ...baseMetrics, completed: false }), 1);
});

test("only grades three and four pass", () => {
  assert.equal(isPassingWritingGrade(1), false);
  assert.equal(isPassingWritingGrade(2), false);
  assert.equal(isPassingWritingGrade(3), true);
  assert.equal(isPassingWritingGrade(4), true);
});

test("hidden Learn grade records automatic help and repeated failures as forgotten", () => {
  assert.equal(getHiddenLearnWritingGrade(baseMetrics), 3);
  assert.equal(getHiddenLearnWritingGrade({ ...baseMetrics, hints: 1 }), 1);
  assert.equal(getHiddenLearnWritingGrade({ ...baseMetrics, revealAll: true }), 1);
  assert.equal(getHiddenLearnWritingGrade({ ...baseMetrics, mistakes: 4, attempts: 12 }), 1);
  assert.equal(getHiddenLearnWritingGrade({ ...baseMetrics, completed: false }), 1);
});

test("learning stages fade guidance with experience", () => {
  assert.equal(getInitialWritingMode(0, 0), "teach");
  assert.equal(getInitialWritingMode(2, 70), "guided");
  assert.equal(getInitialWritingMode(5, 40), "guided");
  assert.equal(getInitialWritingMode(5, 70), "recall");
  assert.equal(nextLearningWritingMode("teach"), "guided");
  assert.equal(nextLearningWritingMode("guided"), "recall");
  assert.equal(nextLearningWritingMode("recall"), null);
});

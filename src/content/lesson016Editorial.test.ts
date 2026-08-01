import assert from "node:assert/strict";
import test from "node:test";

import { checkAnswer } from "../engine/checkAnswer.ts";
import { lesson016Exercises } from "./lesson016.ts";

const requireExercise = (exerciseId: string) => {
  const exercise = lesson016Exercises.find((item) => item.id === exerciseId);
  assert.ok(exercise, `${exerciseId} is missing`);
  return exercise;
};

test("lesson 16 accepts reviewed group-superlative patterns only", () => {
  const choice = requireExercise("exercise-ichiban-choice");
  const input = requireExercise("exercise-kisetsu-ichiban-input");

  [choice, input].forEach((exercise) => {
    assert.notEqual(
      checkAnswer(
        "季節の中では春が一番好きです",
        exercise.correctAnswers,
        exercise.acceptableAnswers,
      ).status,
      "incorrect",
    );
    assert.equal(
      checkAnswer(
        "季節で春が一番好きです",
        exercise.correctAnswers,
        exercise.acceptableAnswers,
      ).status,
      "incorrect",
    );
  });
});

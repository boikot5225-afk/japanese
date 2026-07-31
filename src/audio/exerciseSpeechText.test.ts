import assert from "node:assert/strict";
import test from "node:test";

import type { Exercise } from "../domain/course.ts";
import { getExerciseSpeechText } from "./exerciseSpeechText.ts";

const exercise = (overrides: Partial<Exercise>): Exercise => ({
  id: "test-exercise",
  type: "multiple-choice",
  prompt: "",
  targetItemIds: [],
  correctAnswers: [],
  ...overrides,
});

test("particle choices are spoken inside the complete sentence", () => {
  assert.equal(
    getExerciseSpeechText(
      exercise({
        prompt: "Выбери частицу: 学校 __ 行きます。",
        correctAnswers: ["へ"],
      }),
    ),
    "学校 へ 行きます。",
  );
});

test("multiple particle gaps reconstruct the complete sentence", () => {
  assert.equal(
    getExerciseSpeechText(
      exercise({
        type: "particle-gap",
        prompt: "Вставь частицы: 家 __ 日本語 __ 勉強します。",
        correctAnswers: ["で を"],
      }),
    ),
    "家 で 日本語 を 勉強します。",
  );
});

test("mixed Russian answer labels are never offered to Japanese TTS", () => {
  assert.equal(
    getExerciseSpeechText(
      exercise({
        prompt: "Какая строка правильная?",
        correctAnswers: ["に／へ — направление; で — место действия"],
      }),
    ),
    "",
  );
});

test("sentence builders are spoken as one sentence", () => {
  assert.equal(
    getExerciseSpeechText(
      exercise({
        type: "sentence-builder",
        prompt: "Собери предложение",
        correctAnswers: ["駅|に|行きます"],
      }),
    ),
    "駅に行きます",
  );
});

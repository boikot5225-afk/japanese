import assert from "node:assert/strict";
import test from "node:test";

import type { Exercise, Skill } from "../domain/course";
import { buildReviewHeaderPresentation } from "./reviewPresentation";

const exercise = (
  skill: Skill,
  contentKey?: string,
  correctAnswer = "",
): Exercise => ({
  id: `test-${skill}-${contentKey ?? "generic"}`,
  type: skill === "writing" ? "handwriting" : "multiple-choice",
  prompt: "Тестовое задание",
  targetItemIds: ["test-item"],
  correctAnswers: [correctAnswer],
  skill,
  ...(contentKey ? { contentKey } : {}),
});

test("kanji meaning review does not reveal the Russian answer in the header", () => {
  const header = buildReviewHeaderPresentation(
    exercise("recognition", "kanji:学:recognition", "учёба"),
    "Случайный урок",
    "学 — учёба · узнавание",
  );

  assert.equal(header.title, "Кандзи 学");
  assert.equal(header.focus, "Сейчас проверяем: значение знака");
  assert.equal(header.title.includes("учёба"), false);
  assert.equal(header.focus.includes("учёба"), false);
});

test("kanji reading review keeps the literal but hides unrelated meaning copy", () => {
  const header = buildReviewHeaderPresentation(
    exercise("reading", "kanji:友:reading", "とも"),
    "Случайный урок",
    "友 — друг · чтение",
  );

  assert.deepEqual(header, {
    title: "Кандзи 友",
    focus: "Сейчас проверяем: чтение в слове",
  });
  assert.equal(`${header.title}${header.focus}`.includes("друг"), false);
});

test("kanji writing keeps the intended meaning cue but hides the literal", () => {
  const header = buildReviewHeaderPresentation(
    exercise("writing", "kanji:本:writing", "本"),
    "Случайный урок",
    "本 — книга · письмо",
  );

  assert.equal(header.title, "Письмо по памяти");
  assert.equal(header.focus, "Сейчас проверяем: книга · письмо");
  assert.equal(`${header.title}${header.focus}`.includes("本"), false);
});

test("ordinary recognition reviews also hide item labels that can contain answers", () => {
  const header = buildReviewHeaderPresentation(
    exercise("recognition", undefined, "школа"),
    "Место и действие",
    "学校 — школа · узнавание",
  );

  assert.deepEqual(header, {
    title: "Узнавание",
    focus: "Сейчас проверяем навык: узнавание",
  });
  assert.equal(`${header.title}${header.focus}`.includes("школа"), false);
});

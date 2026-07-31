import assert from "node:assert/strict";
import test from "node:test";

import { normalizeJapaneseSpeechText } from "./japaneseSpeechText.ts";

test("удаляет русские заполнители из грамматической формулы", () => {
  const result = normalizeJapaneseSpeechText("[место] に [предмет] が あります");

  assert.equal(result, "に が あります");
  assert.doesNotMatch(result, /[А-Яа-яЁё]/);
});

test("оставляет только японскую часть смешанного заголовка", () => {
  assert.equal(normalizeJapaneseSpeechText("あります и います"), "あります います");
});

test("не меняет естественное японское предложение", () => {
  assert.equal(normalizeJapaneseSpeechText("ここは学校です。"), "ここは学校です。");
  assert.equal(normalizeJapaneseSpeechText("7時に起きます。"), "7時に起きます。");
});

test("не запускает японский голос для текста без японских символов", () => {
  assert.equal(normalizeJapaneseSpeechText("место и предмет"), "");
});

import assert from "node:assert/strict";
import test from "node:test";

import { n5KanjiCatalog } from "../content/kanjiCatalog";
import { buildKanjiReviewExercises } from "../content/kanjiCurriculum";
import {
  buildKanjiStudyQuestions,
  checkKanjiStudyAnswer,
} from "./kanjiStudySession";

const person = n5KanjiCatalog.find((item) => item.literal === "人");
if (!person) throw new Error("Test kanji 人 is missing");
const exercises = buildKanjiReviewExercises(person.introducedInLessonId, [person]);

test("builds a complete meaning-to-reading study sequence", () => {
  const questions = buildKanjiStudyQuestions(person, exercises, n5KanjiCatalog);
  assert.deepEqual(
    questions.map((question) => question.kind),
    ["meaning", "reading-guided", "reading-recall"],
  );
  assert.equal(questions[0]?.recordResult, true);
  assert.equal(questions[1]?.recordResult, false);
  assert.equal(questions[2]?.recordResult, true);
  assert.equal(questions[0]?.exercise.skill, "recognition");
  assert.equal(questions[2]?.exercise.skill, "reading");
});

test("keeps correct answers among unique choices without pinning every answer first", () => {
  const answerIndexes = n5KanjiCatalog.slice(0, 12).map((item) => {
    const lessonExercises = buildKanjiReviewExercises(item.introducedInLessonId, [item]);
    const question = buildKanjiStudyQuestions(item, lessonExercises, n5KanjiCatalog)[0];
    const answer = question?.exercise.correctAnswers[0];
    assert.ok(question && answer);
    assert.equal(new Set(question.choices).size, question.choices.length);
    return question.choices.indexOf(answer);
  });
  assert.ok(answerIndexes.some((index) => index > 0));
  assert.ok(new Set(answerIndexes).size > 1);
});

test("checks meaning and contextual reading through the normal answer engine", () => {
  const questions = buildKanjiStudyQuestions(person, exercises, n5KanjiCatalog);
  assert.equal(checkKanjiStudyAnswer(questions[0]!, "человек"), "correct");
  assert.equal(checkKanjiStudyAnswer(questions[0]!, "страна"), "incorrect");
  assert.equal(checkKanjiStudyAnswer(questions[2]!, "じん"), "correct");
});

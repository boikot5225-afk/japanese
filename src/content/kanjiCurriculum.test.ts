import assert from "node:assert/strict";
import test from "node:test";

import { inferExerciseSkill } from "../engine/reviewEngine";
import { lessonBundles } from "./courseCatalog.ts";
import { n5KanjiCatalog } from "./kanjiCatalog.ts";

const expectedN5 =
  "安一飲右雨駅円火花下何会外学間気九休魚金空月見言古五後午語校口行高国今左三山四子耳時七車社手週十出書女小少上食新人水生西川千先前足多大男中長天店電土東道読南二日入年買白八半百父分聞母北木本毎万名目友来立六話";

test("N5 kanji catalog contains the full 103-character benchmark once", () => {
  assert.equal(n5KanjiCatalog.length, 103);
  assert.equal(new Set(n5KanjiCatalog.map((item) => item.literal)).size, 103);
  assert.deepEqual(
    [...n5KanjiCatalog.map((item) => item.literal)].sort(),
    [...expectedN5].sort(),
  );

  n5KanjiCatalog.forEach((item) => {
    assert.equal(item.id, `kanji-${item.literal}`);
    assert.equal(item.jlptLevel, "N5");
    assert.ok(item.meaningsRu.length > 0, `${item.literal} has no Russian meaning`);
    assert.ok(item.examples.length > 0, `${item.literal} has no contextual example`);
    item.examples.forEach((example) => {
      assert.ok(example.written.includes(item.literal), `${item.literal} is absent from its example`);
      assert.ok(example.reading.trim(), `${item.literal} example has no reading`);
      assert.ok(example.kanjiReading.trim(), `${item.literal} has no contextual reading`);
      assert.ok(example.meaningRu.trim(), `${item.literal} example has no translation`);
    });
  });
});

test("all 103 N5 kanji are distributed through lessons 1-36", () => {
  const n5Bundles = lessonBundles.filter((bundle) => bundle.lesson.order <= 36);
  const n4Bundles = lessonBundles.filter((bundle) => bundle.lesson.order > 36);
  assert.equal(n5Bundles.length, 36);

  n5Bundles.forEach((bundle) => {
    assert.ok((bundle.kanji?.length ?? 0) > 0, `${bundle.lesson.id} has no kanji stage`);
  });
  n4Bundles.forEach((bundle) => {
    assert.equal(bundle.kanji?.length ?? 0, 0, `${bundle.lesson.id} received premature N5 kanji`);
  });

  const introduced = n5Bundles.flatMap((bundle) => bundle.kanji ?? []);
  assert.equal(introduced.length, 103);
  assert.equal(new Set(introduced.map((item) => item.id)).size, 103);
});

test("visible lessons stay compact and introduce recognition, reading, and writing", () => {
  const n5Bundles = lessonBundles.filter((bundle) => bundle.lesson.order <= 36);
  const targetedKanji = new Set<string>();
  let writingExerciseCount = 0;

  n5Bundles.forEach((bundle) => {
    assert.equal(bundle.exercises.length, 12, `${bundle.lesson.id} no longer has a compact session`);

    const kanjiExercises = bundle.exercises.filter((exercise) =>
      exercise.contentKey?.startsWith("kanji:"),
    );
    const kanjiCount = bundle.kanji?.length ?? 0;
    const expectedKanjiExerciseCount = kanjiCount === 1 ? 3 : 1 + kanjiCount;
    assert.equal(
      kanjiExercises.length,
      expectedKanjiExerciseCount,
      `${bundle.lesson.id} has the wrong number of guided kanji checks`,
    );

    const skills = new Set(kanjiExercises.map(inferExerciseSkill));
    assert.ok(skills.has("recognition"), `${bundle.lesson.id} lacks kanji recognition`);
    assert.ok(skills.has("reading"), `${bundle.lesson.id} lacks contextual kanji reading`);
    assert.ok(skills.has("writing"), `${bundle.lesson.id} lacks kanji writing`);

    const writingExercises = kanjiExercises.filter(
      (exercise) => inferExerciseSkill(exercise) === "writing",
    );
    assert.equal(writingExercises.length, 1, `${bundle.lesson.id} should introduce one writing target`);
    writingExerciseCount += writingExercises.length;
    writingExercises.forEach((exercise) => {
      assert.equal(exercise.type, "handwriting");
      assert.equal(exercise.correctAnswers.length, 1);
      assert.equal(exercise.handwritingGuide?.reference, exercise.correctAnswers[0]);
      assert.equal(exercise.handwritingGuide?.initialMode, "memory");
    });

    kanjiExercises.forEach((exercise) => {
      assert.ok(
        exercise.skill === "recognition" ||
          exercise.skill === "reading" ||
          exercise.skill === "writing",
      );
      exercise.targetItemIds.forEach((id) => targetedKanji.add(id));
    });

    const reviewExercises = bundle.reviewExercises ?? [];
    assert.equal(
      reviewExercises.length,
      12 + expectedKanjiExerciseCount,
      `${bundle.lesson.id} did not retain every displaced legacy exercise`,
    );
    assert.equal(
      new Set(reviewExercises.map((exercise) => exercise.id)).size,
      reviewExercises.length,
      `${bundle.lesson.id} review pool repeats exercise ids`,
    );
    bundle.exercises.forEach((exercise) => {
      assert.ok(
        reviewExercises.some((candidate) => candidate.id === exercise.id),
        `${bundle.lesson.id} review pool misses visible ${exercise.id}`,
      );
    });
  });

  assert.equal(writingExerciseCount, 36);
  assert.deepEqual(
    [...targetedKanji].sort(),
    n5KanjiCatalog.map((item) => item.id).sort(),
  );
});

test("explicit exercise skill overrides the generic interaction type", () => {
  const readingExercise = lessonBundles
    .flatMap((bundle) => bundle.exercises)
    .find((exercise) => exercise.skill === "reading");
  assert.ok(readingExercise);
  assert.equal(inferExerciseSkill(readingExercise), "reading");

  const writingExercise = lessonBundles
    .flatMap((bundle) => bundle.exercises)
    .find((exercise) => exercise.skill === "writing" && exercise.contentKey?.startsWith("kanji:"));
  assert.ok(writingExercise);
  assert.equal(writingExercise.type, "handwriting");
  assert.equal(inferExerciseSkill(writingExercise), "writing");
});

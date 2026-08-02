import assert from "node:assert/strict";
import test from "node:test";

import { getExerciseContentKey } from "../engine/exerciseIdentity";
import { courseUnits, lessonBundles } from "./courseCatalog.ts";

const duplicates = (values: string[]): string[] => {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  values.forEach((value) => {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  });
  return [...repeated];
};

const vocabularyIds = lessonBundles.flatMap((bundle) =>
  bundle.vocabulary.map((item) => item.id),
);
const kanjiIds = lessonBundles.flatMap((bundle) =>
  (bundle.kanji ?? []).map((item) => item.id),
);
const grammarIds = lessonBundles.flatMap((bundle) =>
  bundle.grammar.map((item) => item.id),
);
const sentenceIds = lessonBundles.flatMap((bundle) =>
  bundle.sentences.map((item) => item.id),
);
const exerciseIds = lessonBundles.flatMap((bundle) =>
  bundle.exercises.map((item) => item.id),
);
const learningItemIds = [...vocabularyIds, ...kanjiIds, ...grammarIds, ...sentenceIds];
const addressableTargetIds = new Set(learningItemIds);

test("lesson order is contiguous and each lesson appears in one matching unit", () => {
  const lessons = lessonBundles.map((bundle) => bundle.lesson);
  assert.deepEqual(
    lessons.map((lesson) => lesson.order),
    Array.from({ length: lessons.length }, (_, index) => index + 1),
  );

  const unitLessonIds = courseUnits.flatMap((unit) => unit.lessons.map((lesson) => lesson.id));
  assert.deepEqual(duplicates(unitLessonIds), []);
  assert.deepEqual(
    [...unitLessonIds].sort(),
    lessons.map((lesson) => lesson.id).sort(),
  );

  courseUnits.forEach((unit) => {
    unit.lessons.forEach((lesson) => {
      assert.equal(lesson.unitId, unit.id, `${lesson.id} points to ${lesson.unitId}, not ${unit.id}`);
    });
  });
});

test("all course ids are globally unique", () => {
  assert.deepEqual(duplicates(lessonBundles.map((bundle) => bundle.lesson.id)), []);
  assert.deepEqual(duplicates(learningItemIds), []);
  assert.deepEqual(duplicates(exerciseIds), []);
});

test("lesson manifests match their bundle contents", () => {
  lessonBundles.forEach((bundle) => {
    const expectedItemIds = [
      ...bundle.vocabulary.map((item) => item.id),
      ...(bundle.kanji ?? []).map((item) => item.id),
      ...bundle.grammar.map((item) => item.id),
      ...bundle.sentences.map((item) => item.id),
    ];
    assert.deepEqual(bundle.lesson.itemIds, expectedItemIds, `${bundle.lesson.id} itemIds differ`);
    assert.deepEqual(
      bundle.lesson.exerciseIds,
      bundle.exercises.map((exercise) => exercise.id),
      `${bundle.lesson.id} exerciseIds differ`,
    );
    assert.ok(bundle.outcomes.length >= 3, `${bundle.lesson.id} needs at least three outcomes`);
    assert.ok(bundle.lesson.estimatedMinutes > 0, `${bundle.lesson.id} has invalid duration`);
  });
});

test("sentence and exercise references resolve to real course items", () => {
  lessonBundles.forEach((bundle) => {
    bundle.sentences.forEach((sentence) => {
      sentence.grammarIds.forEach((id) => {
        assert.ok(grammarIds.includes(id), `${sentence.id} references missing grammar ${id}`);
      });
      sentence.vocabularyIds.forEach((id) => {
        assert.ok(vocabularyIds.includes(id), `${sentence.id} references missing vocabulary ${id}`);
      });
      assert.ok(sentence.japanese.trim().length > 0, `${sentence.id} has no Japanese text`);
      assert.ok(sentence.translationRu.trim().length > 0, `${sentence.id} has no translation`);
    });

    bundle.exercises.forEach((exercise) => {
      assert.ok(exercise.correctAnswers.length > 0, `${exercise.id} has no correct answer`);
      exercise.targetItemIds.forEach((id) => {
        assert.ok(addressableTargetIds.has(id), `${exercise.id} references missing target ${id}`);
      });
      (exercise.confusionItemIds ?? []).forEach((id) => {
        assert.ok(addressableTargetIds.has(id), `${exercise.id} references missing confusion ${id}`);
      });
      if (exercise.type === "multiple-choice" || exercise.type === "listening") {
        const correct = new Set(exercise.correctAnswers);
        (exercise.distractors ?? []).forEach((distractor) => {
          assert.ok(!correct.has(distractor), `${exercise.id} repeats a correct answer as distractor`);
        });
      }
      if (exercise.type === "listening") {
        assert.ok(exercise.audioText?.trim(), `${exercise.id} has no listening audio text`);
      }
    });
  });
});

test("lesson six remains the mixed-practice reference lesson", () => {
  const lessonSix = lessonBundles.find((bundle) => bundle.lesson.id === "lesson-006");
  assert.ok(lessonSix);
  assert.equal(lessonSix.exercises.length, 16);
  assert.ok(lessonSix.lesson.estimatedMinutes >= 14);
  assert.ok(lessonSix.lesson.estimatedMinutes <= 21);

  const exerciseTypes = new Set(lessonSix.exercises.map((exercise) => exercise.type));
  assert.ok(exerciseTypes.has("multiple-choice"));
  assert.ok(exerciseTypes.has("listening"));
  assert.ok(exerciseTypes.has("sentence-builder"));
  assert.ok(exerciseTypes.has("particle-gap"));
  assert.ok(exerciseTypes.has("text-input"));
  assert.ok(lessonSix.exercises.some((exercise) => exercise.difficulty === 4));
});

test("every lesson keeps its mixed practice and adds only contextual N5 kanji checks", () => {
  lessonBundles.forEach((bundle) => {
    const kanjiCount = bundle.kanji?.length ?? 0;
    const expectedCount = kanjiCount > 0 ? 13 + kanjiCount : 12;
    assert.equal(
      bundle.exercises.length,
      expectedCount,
      `${bundle.lesson.id} has an unexpected exercise count`,
    );

    const contentKeys = bundle.exercises.map(getExerciseContentKey);
    assert.equal(
      new Set(contentKeys).size,
      contentKeys.length,
      `${bundle.lesson.id} repeats semantic content`,
    );
    assert.ok(
      bundle.exercises.every((exercise) => Boolean(exercise.contentKey)),
      `${bundle.lesson.id} has exercises without semantic identity`,
    );

    const sentenceKeys = contentKeys.filter((key) => key.startsWith("sentence:"));
    assert.equal(
      new Set(sentenceKeys).size,
      sentenceKeys.length,
      `${bundle.lesson.id} repeats the same sentence in one session`,
    );

    const exerciseTypes = new Set(bundle.exercises.map((exercise) => exercise.type));
    assert.ok(exerciseTypes.has("multiple-choice"), `${bundle.lesson.id} lacks recognition practice`);
    assert.ok(exerciseTypes.has("listening"), `${bundle.lesson.id} lacks listening practice`);
    assert.ok(exerciseTypes.has("text-input"), `${bundle.lesson.id} lacks active recall`);
    assert.ok(
      bundle.exercises.every((exercise) => Boolean(exercise.variantGroup)),
      `${bundle.lesson.id} has exercises without a remediation group`,
    );
    assert.ok(
      bundle.exercises.every((exercise) => Boolean(exercise.difficulty)),
      `${bundle.lesson.id} has exercises without difficulty`,
    );
  });
});

test("remediation groups connect different content instead of cloning one sentence", () => {
  lessonBundles.forEach((bundle) => {
    const groups = new Map<string, string[]>();
    bundle.exercises.forEach((exercise) => {
      const group = exercise.variantGroup as string;
      const keys = groups.get(group) ?? [];
      groups.set(group, [...keys, getExerciseContentKey(exercise)]);
    });

    const linkedDistinctGroups = [...groups.values()].filter(
      (keys) => keys.length >= 2 && new Set(keys).size === keys.length,
    );
    assert.ok(
      linkedDistinctGroups.length > 0,
      `${bundle.lesson.id} has no non-duplicate remediation pair`,
    );
  });
});

test("generated listening uses full sentences and generated recall accepts readings", () => {
  const generatedExercises = lessonBundles.flatMap((bundle) =>
    bundle.exercises.filter((exercise) => exercise.id.includes("-auto-")),
  );
  assert.ok(generatedExercises.length > 0);

  generatedExercises
    .filter((exercise) => exercise.type === "listening")
    .forEach((exercise) => {
      assert.ok((exercise.audioText?.trim().length ?? 0) >= 4, `${exercise.id} audio is too short`);
    });

  generatedExercises
    .filter((exercise) => exercise.type === "text-input")
    .forEach((exercise) => {
      assert.ok(
        (exercise.acceptableAnswers?.length ?? 0) > 0,
        `${exercise.id} does not accept a kana reading`,
      );
    });
});

test("new time and tense lessons keep noun and verb paradigms separate", () => {
  const byId = new Map(lessonBundles.map((bundle) => [bundle.lesson.id, bundle]));
  const nounForms = byId.get("lesson-009");
  const verbForms = byId.get("lesson-010");
  assert.ok(nounForms);
  assert.ok(verbForms);

  assert.ok(nounForms.grammar.some((item) => item.id === "grammar-desu-past-negative"));
  assert.ok(verbForms.grammar.some((item) => item.id === "grammar-masu-past-negative"));
  assert.ok(
    nounForms.exercises.every((exercise) =>
      exercise.correctAnswers.every((answer) => !answer.includes("学生ません")),
    ),
  );
  assert.ok(
    verbForms.exercises.every((exercise) =>
      exercise.correctAnswers.every((answer) => !answer.includes("食べでした")),
    ),
  );
});

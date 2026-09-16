import assert from "node:assert/strict";
import test from "node:test";

import {
  getKanjiLessonCompletedSkills,
  getKanjiLessonRuntime,
  markKanjiLessonSkillComplete,
  registerKanjiLessonGate,
  registerKanjiLessonRuntime,
  requestKanjiLessonAdvance,
  resetKanjiLessonBridgeForTests,
} from "./kanjiLessonBridge";

test("lesson kanji gate blocks navigation and opens the exact study cycle", () => {
  resetKanjiLessonBridgeForTests();
  let opened = 0;
  let advanced = 0;
  const unregister = registerKanjiLessonGate("lesson-001", {
    complete: false,
    openStudy: () => {
      opened += 1;
    },
  });

  assert.equal(
    requestKanjiLessonAdvance("lesson-001", () => {
      advanced += 1;
    }),
    false,
  );
  assert.equal(opened, 1);
  assert.equal(advanced, 0);
  unregister();
});

test("lesson kanji gate fails closed before its effect registers", () => {
  resetKanjiLessonBridgeForTests();
  let opened = 0;
  let advanced = 0;

  assert.equal(
    requestKanjiLessonAdvance("lesson-001", () => {
      advanced += 1;
    }),
    false,
  );
  assert.equal(advanced, 0);

  registerKanjiLessonGate("lesson-001", {
    complete: false,
    openStudy: () => {
      opened += 1;
    },
  });
  assert.equal(opened, 1);
  assert.equal(advanced, 0);
});

test("lesson kanji gate allows navigation only after the cycle is complete", () => {
  resetKanjiLessonBridgeForTests();
  let advanced = 0;
  registerKanjiLessonGate("lesson-001", {
    complete: true,
    openStudy: () => {
      throw new Error("Completed lesson must not reopen Learn");
    },
  });

  assert.equal(
    requestKanjiLessonAdvance("lesson-001", () => {
      advanced += 1;
    }),
    true,
  );
  assert.equal(advanced, 1);
});

test("course screen exposes live SRS callbacks to the lesson stage", () => {
  resetKanjiLessonBridgeForTests();
  const runtime = {
    reviewItems: [],
    onRecordStudy: () => undefined,
    onRecordWriting: () => undefined,
  };
  registerKanjiLessonRuntime(runtime);
  assert.equal(getKanjiLessonRuntime(), runtime);
});

test("completed skills survive a direct lesson retry before course rerenders", () => {
  resetKanjiLessonBridgeForTests();
  markKanjiLessonSkillComplete("kanji-日", "meaning");
  markKanjiLessonSkillComplete("kanji-日", "reading");
  markKanjiLessonSkillComplete("kanji-日", "writing");
  markKanjiLessonSkillComplete("kanji-日", "writing");

  assert.deepEqual(
    [...getKanjiLessonCompletedSkills("kanji-日")].sort(),
    ["meaning", "reading", "writing"],
  );
});

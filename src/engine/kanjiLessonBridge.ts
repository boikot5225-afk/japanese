import type { SkritterWritingResult } from "../components/SkritterWritingPad";
import type { KanjiItem } from "../domain/course";
import type { KanjiStudyResult } from "./kanjiStudySession";
import type { ReviewItem } from "./reviewEngine";

export interface KanjiLessonRuntime {
  reviewItems: readonly ReviewItem[];
  onRecordStudy: (item: KanjiItem, result: KanjiStudyResult) => void;
  onRecordWriting: (item: KanjiItem, result: SkritterWritingResult) => void;
}

interface KanjiLessonGate {
  complete: boolean;
  openStudy: () => void;
}

let runtime: KanjiLessonRuntime | null = null;
const gates = new Map<string, KanjiLessonGate>();

export const registerKanjiLessonRuntime = (
  value: KanjiLessonRuntime,
): void => {
  runtime = value;
};

export const getKanjiLessonRuntime = (): KanjiLessonRuntime | null => runtime;

export const registerKanjiLessonGate = (
  lessonId: string,
  gate: KanjiLessonGate,
): (() => void) => {
  gates.set(lessonId, gate);
  return () => {
    if (gates.get(lessonId) === gate) gates.delete(lessonId);
  };
};

export const requestKanjiLessonAdvance = (
  lessonId: string,
  proceed: () => void,
): boolean => {
  const gate = gates.get(lessonId);
  if (!gate || gate.complete) {
    proceed();
    return true;
  }
  gate.openStudy();
  return false;
};

export const resetKanjiLessonBridgeForTests = (): void => {
  runtime = null;
  gates.clear();
};

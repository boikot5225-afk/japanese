import { lessonBundles } from "./courseCatalog";
import { getKanjiStrokeData } from "./kanjiStrokeData";
import type { KanjiItem } from "../domain/course";

/**
 * Writing-only mode uses exactly the kanji already introduced by the course
 * content, but strips away the lesson/grammar navigation. Order is preserved
 * by first appearance so existing progress keys stay compatible.
 */
export const kanjiWritingCatalog: KanjiItem[] = (() => {
  const byLiteral = new Map<string, KanjiItem>();

  lessonBundles.forEach((bundle) => {
    (bundle.kanji ?? []).forEach((item) => {
      if (!byLiteral.has(item.literal) && getKanjiStrokeData(item.literal)) {
        byLiteral.set(item.literal, item);
      }
    });
  });

  return [...byLiteral.values()];
})();

export const findWritingKanji = (itemId: string): KanjiItem | undefined =>
  kanjiWritingCatalog.find((item) => item.id === itemId);

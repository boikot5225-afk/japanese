import { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SkritterExactWritingPad,
  type SkritterExactWritingMode,
  type SkritterExactWritingResult,
} from "../components/SkritterExactWritingPad";
import { createKanjiWritingExercise, maskKanjiInExample } from "../content/kanjiCurriculum";
import { getKanjiStrokeData } from "../content/kanjiStrokeData";
import { kanjiWritingCatalog } from "../content/kanjiWritingCatalog";
import type { KanjiItem } from "../domain/course";
import { upsertReviewItem, type ReviewItem } from "../engine/reviewEngine";
import { scheduleWritingReview } from "../engine/writingReview";
import {
  loadCourseProgress,
  saveCourseProgress,
  type CourseProgressSnapshot,
} from "../storage/progressStorage";

type SessionKind = "learn" | "review" | "free";
type WritingStage = SkritterExactWritingMode;

const NEW_BATCH_SIZE = 8;

const writingReviewFor = (
  reviewItems: readonly ReviewItem[],
  itemId: string,
): ReviewItem | undefined =>
  reviewItems.find((entry) => entry.itemId === itemId && entry.skill === "writing");

const isDue = (item: ReviewItem | undefined, nowMs: number): boolean =>
  Boolean(item && new Date(item.dueAt).getTime() <= nowMs);

const itemSubtitle = (item: KanjiItem): string => {
  const example = item.examples[0];
  if (example) return `${example.written} · ${example.reading}`;
  return item.meaningsRu.slice(0, 2).join(", ");
};

export default function KanjiOnlyRoot() {
  const [baseSnapshot, setBaseSnapshot] = useState<CourseProgressSnapshot | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [sessionKind, setSessionKind] = useState<SessionKind | null>(null);
  const [queue, setQueue] = useState<KanjiItem[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [stage, setStage] = useState<WritingStage>("teach");
  const [sessionNonce, setSessionNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const snapshot = await loadCourseProgress();
      if (cancelled) return;
      setBaseSnapshot(snapshot);
      setReviewItems(snapshot?.reviewItems ?? []);
      setHydrated(true);
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void saveCourseProgress({
      completedLessonIds: baseSnapshot?.completedLessonIds ?? [],
      lastLessonId: baseSnapshot?.lastLessonId ?? null,
      reviewItems,
      attemptHistory: baseSnapshot?.attemptHistory ?? [],
      checkpointProgress: baseSnapshot?.checkpointProgress ?? [],
    });
  }, [baseSnapshot, hydrated, reviewItems]);

  const learnedItems = useMemo(
    () => kanjiWritingCatalog.filter((item) => writingReviewFor(reviewItems, item.id)),
    [reviewItems],
  );
  const newItems = useMemo(
    () => kanjiWritingCatalog.filter((item) => !writingReviewFor(reviewItems, item.id)),
    [reviewItems],
  );
  const dueItems = useMemo(
    () => kanjiWritingCatalog.filter((item) =>
      isDue(writingReviewFor(reviewItems, item.id), nowMs),
    ),
    [nowMs, reviewItems],
  );

  const activeItem = queue[queueIndex];
  const strokeData = activeItem ? getKanjiStrokeData(activeItem.literal) : undefined;

  const startSession = (kind: SessionKind, items: readonly KanjiItem[]) => {
    if (items.length === 0) return;
    setSessionKind(kind);
    setQueue([...items]);
    setQueueIndex(0);
    setStage(kind === "review" ? "recall" : "teach");
    setSessionNonce((value) => value + 1);
  };

  const closeSession = () => {
    setSessionKind(null);
    setQueue([]);
    setQueueIndex(0);
    setStage("teach");
    setNowMs(Date.now());
  };

  const recordWriting = (item: KanjiItem, result: SkritterExactWritingResult) => {
    const exercise = createKanjiWritingExercise(item.introducedInLessonId, item);
    const now = new Date();
    setReviewItems((previous) => {
      const existing = writingReviewFor(previous, item.id);
      const scheduled = scheduleWritingReview(
        existing,
        item.id,
        exercise,
        item.introducedInLessonId,
        result.grade,
        now,
      );
      return upsertReviewItem(previous, scheduled);
    });
  };

  const advanceItem = () => {
    if (queue[queueIndex + 1]) {
      setQueueIndex((value) => value + 1);
      setStage(sessionKind === "review" ? "recall" : "teach");
      setSessionNonce((value) => value + 1);
      return;
    }
    closeSession();
  };

  const finishPad = (result: SkritterExactWritingResult) => {
    if (!activeItem || !sessionKind) return;

    if (sessionKind !== "review" && stage === "teach") {
      setStage("snap");
      return;
    }
    if (sessionKind !== "review" && stage === "snap") {
      setStage("recall");
      return;
    }

    if (sessionKind === "learn" || sessionKind === "review") {
      recordWriting(activeItem, result);
    }
    advanceItem();
  };

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.loading}>Загружаю кандзи…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (sessionKind && activeItem && strokeData) {
    const example = activeItem.examples[0];
    const recall = stage === "recall";
    const queueLabel = sessionKind === "review"
      ? "Повторение"
      : sessionKind === "learn"
        ? "Новые кандзи"
        : "Свободная практика";

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.sessionScroll}>
          <View style={styles.sessionTop}>
            <TouchableOpacity style={styles.closeButton} onPress={closeSession}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <View style={styles.sessionHeading}>
              <Text style={styles.eyebrow}>{queueLabel}</Text>
              <Text style={styles.sessionCounter}>
                {queueIndex + 1}/{queue.length} · {stage === "teach" ? "порядок черт" : stage === "snap" ? "по контуру" : "по памяти"}
              </Text>
            </View>
          </View>

          <View style={styles.promptCard}>
            {!recall ? (
              <Text style={styles.sessionGlyph}>{activeItem.literal}</Text>
            ) : (
              <Text style={styles.recallTitle}>Напиши знак по памяти</Text>
            )}
            <Text style={styles.meaning}>
              {activeItem.contextualOnly && example
                ? example.meaningRu
                : activeItem.meaningsRu.join(", ")}
            </Text>
            {example && (
              <Text style={styles.context}>
                {recall ? maskKanjiInExample(activeItem) : example.written}（{example.reading}）
              </Text>
            )}
          </View>

          <SkritterExactWritingPad
            key={`${activeItem.id}-${stage}-${sessionNonce}`}
            data={strokeData}
            mode={stage}
            grading="none"
            onComplete={finishPad}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.homeScroll}>
        <View style={styles.hero}>
          <Text style={styles.title}>Кандзи</Text>
          <Text style={styles.subtitle}>Только письмо. Без грамматики и уроков.</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{newItems.length}</Text>
            <Text style={styles.statLabel}>новых</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dueItems.length}</Text>
            <Text style={styles.statLabel}>к повтору</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{learnedItems.length}</Text>
            <Text style={styles.statLabel}>изучено</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, newItems.length === 0 && styles.disabledButton]}
          disabled={newItems.length === 0}
          onPress={() => startSession("learn", newItems.slice(0, NEW_BATCH_SIZE))}
        >
          <Text style={styles.actionButtonText}>
            {newItems.length > 0 ? `Прописывать новые · ${Math.min(NEW_BATCH_SIZE, newItems.length)}` : "Новых кандзи нет"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.reviewButton, dueItems.length === 0 && styles.disabledButton]}
          disabled={dueItems.length === 0}
          onPress={() => startSession("review", dueItems)}
        >
          <Text style={styles.reviewButtonText}>
            {dueItems.length > 0 ? `Повторить · ${dueItems.length}` : "На сегодня всё"}
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Все знаки</Text>
          <Text style={styles.sectionHint}>Нажми на любой — просто потренировать</Text>
        </View>

        <View style={styles.grid}>
          {kanjiWritingCatalog.map((item) => {
            const review = writingReviewFor(reviewItems, item.id);
            const due = isDue(review, nowMs);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.tile}
                onPress={() => startSession("free", [item])}
              >
                <Text style={styles.tileGlyph}>{item.literal}</Text>
                <Text style={styles.tileStatus} numberOfLines={1}>
                  {due ? "повтор" : review ? "изучен" : "новый"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f7f4ed" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { color: "#5f6872", fontSize: 18, fontWeight: "700" },
  homeScroll: { padding: 20, paddingBottom: 48, gap: 14 },
  hero: { gap: 4, paddingTop: 8, paddingBottom: 4 },
  title: { color: "#171717", fontSize: 44, fontWeight: "900" },
  subtitle: { color: "#66717d", fontSize: 16, lineHeight: 22 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1ddd5",
  },
  statNumber: { color: "#171717", fontSize: 27, fontWeight: "900" },
  statLabel: { color: "#6c737b", fontSize: 12, fontWeight: "700" },
  actionButton: {
    minHeight: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#183153",
  },
  actionButtonText: { color: "#ffffff", fontSize: 18, fontWeight: "900" },
  reviewButton: {
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#183153",
    backgroundColor: "#ffffff",
  },
  reviewButtonText: { color: "#183153", fontSize: 17, fontWeight: "900" },
  disabledButton: { opacity: 0.4 },
  sectionHeader: { gap: 2, marginTop: 8 },
  sectionTitle: { color: "#171717", fontSize: 25, fontWeight: "900" },
  sectionHint: { color: "#737b84", fontSize: 13 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: {
    width: "22.8%",
    minHeight: 88,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1ddd5",
  },
  tileGlyph: { color: "#171717", fontSize: 38, lineHeight: 46, fontWeight: "600" },
  tileStatus: { color: "#7a828a", fontSize: 10, fontWeight: "800" },
  sessionScroll: { padding: 18, paddingBottom: 42, gap: 14 },
  sessionTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#e7eef5",
  },
  closeButtonText: { color: "#183153", fontSize: 28, lineHeight: 31 },
  sessionHeading: { flex: 1, gap: 2 },
  eyebrow: { color: "#31546f", fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  sessionCounter: { color: "#697887", fontSize: 14, fontWeight: "700" },
  promptCard: {
    alignItems: "center",
    gap: 7,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#d7e0e8",
    backgroundColor: "#ffffff",
  },
  sessionGlyph: { color: "#15202b", fontSize: 92, lineHeight: 108, fontWeight: "500" },
  recallTitle: { color: "#15202b", fontSize: 25, fontWeight: "900" },
  meaning: { color: "#25313c", fontSize: 19, lineHeight: 26, fontWeight: "800", textAlign: "center" },
  context: { color: "#66788a", fontSize: 17, lineHeight: 24, textAlign: "center" },
});

import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { speakJapanese } from "../audio/japaneseSpeech";
import { lessonBundles } from "../content/courseCatalog";
import { n5KanjiCatalog } from "../content/kanjiCatalog";
import type { KanjiItem } from "../domain/course";
import {
  buildKanjiProgressCatalog,
  type KanjiProgressSummary,
  type KanjiSkillProgress,
  type KanjiSkillState,
  type KanjiStudyStatus,
} from "../engine/kanjiProgress";
import {
  loadCourseProgress,
  type CourseProgressSnapshot,
} from "../storage/progressStorage";

interface KanjiScreenProps {
  onCourse: () => void;
}

type CatalogFilter = "available" | "weak" | "all";

interface CatalogEntry {
  item: KanjiItem;
  progress: KanjiProgressSummary;
  lessonOrder: number;
  available: boolean;
  completedLesson: boolean;
}

const statusLabels: Record<KanjiStudyStatus, string> = {
  new: "не начат",
  learning: "изучается",
  review: "закреплён",
  weak: "слабое место",
};

const skillStateLabels: Record<KanjiSkillState, string> = {
  new: "не начато",
  learning: "в работе",
  review: "закреплено",
  weak: "нужно повторить",
};

const lessonOrderById = new Map(
  lessonBundles.map((bundle) => [bundle.lesson.id, bundle.lesson.order]),
);

const normalizeSearch = (value: string): string => value.trim().toLocaleLowerCase("ru-RU");

const matchesSearch = (item: KanjiItem, query: string): boolean => {
  if (!query) return true;
  const example = item.examples[0];
  return [
    item.literal,
    ...item.meaningsRu,
    example?.written,
    example?.reading,
    example?.kanjiReading,
    example?.meaningRu,
  ]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLocaleLowerCase("ru-RU").includes(query));
};

const formatDue = (value: string | null): string => {
  if (!value) return "ещё не назначено";
  const date = new Date(value);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (left: Date, right: Date): boolean =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  if (sameDay(date, today)) return "сегодня";
  if (sameDay(date, tomorrow)) return "завтра";
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
};

const stateStyle = (state: KanjiSkillState) => {
  switch (state) {
    case "weak":
      return styles.stateWeak;
    case "review":
      return styles.stateReview;
    case "learning":
      return styles.stateLearning;
    default:
      return styles.stateNew;
  }
};

const fillStyle = (state: KanjiSkillState) => {
  switch (state) {
    case "weak":
      return styles.fillWeak;
    case "review":
      return styles.fillReview;
    case "learning":
      return styles.fillLearning;
    default:
      return styles.fillNew;
  }
};

function SkillCard({
  title,
  progress,
  note,
}: {
  title: string;
  progress: KanjiSkillProgress;
  note: string;
}) {
  return (
    <View style={styles.skillCard}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillTitle}>{title}</Text>
        <Text style={[styles.skillState, stateStyle(progress.state)]}>
          {skillStateLabels[progress.state]}
        </Text>
      </View>
      <View style={styles.masteryTrack}>
        <View
          style={[
            styles.masteryFill,
            fillStyle(progress.state),
            { width: `${progress.mastery}%` as `${number}%` },
          ]}
        />
      </View>
      <Text style={styles.masteryValue}>{progress.mastery}%</Text>
      <Text style={styles.skillMeta}>
        {progress.attempts > 0
          ? `${progress.correctCount} верно · ${progress.incorrectCount} ошибок · повторение ${formatDue(progress.dueAt)}`
          : note}
      </Text>
    </View>
  );
}

export function KanjiScreen({ onCourse }: KanjiScreenProps) {
  const [snapshot, setSnapshot] = useState<CourseProgressSnapshot | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<CatalogFilter>("available");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const progress = await loadCourseProgress();
      if (cancelled) return;
      setSnapshot(progress);
      setHydrated(true);
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const entries = useMemo<CatalogEntry[]>(() => {
    const completedLessonIds = new Set(snapshot?.completedLessonIds ?? []);
    const n5Bundles = lessonBundles.filter((bundle) => bundle.lesson.order <= 36);
    const currentBundle = n5Bundles.find(
      (bundle) => !completedLessonIds.has(bundle.lesson.id),
    );
    const availableThroughOrder = currentBundle?.lesson.order ?? 36;
    const progressById = new Map(
      buildKanjiProgressCatalog(
        n5KanjiCatalog,
        snapshot?.reviewItems ?? [],
      ).map((progress) => [progress.itemId, progress]),
    );

    return n5KanjiCatalog.map((item) => {
      const lessonOrder = lessonOrderById.get(item.introducedInLessonId) ?? 999;
      const progress = progressById.get(item.id);
      if (!progress) throw new Error(`Нет прогресса для ${item.id}`);
      return {
        item,
        progress,
        lessonOrder,
        available: lessonOrder <= availableThroughOrder,
        completedLesson: completedLessonIds.has(item.introducedInLessonId),
      };
    });
  }, [snapshot]);

  const normalizedQuery = normalizeSearch(query);
  const filteredEntries = useMemo(() => {
    const candidates = entries.filter((entry) => {
      if (filter === "available" && !entry.available) return false;
      if (filter === "weak" && (!entry.available || !entry.progress.weak)) return false;
      return matchesSearch(entry.item, normalizedQuery);
    });

    return [...candidates].sort((left, right) => {
      if (filter === "weak") {
        const masteryDifference =
          left.progress.overallMastery - right.progress.overallMastery;
        if (masteryDifference !== 0) return masteryDifference;
      }
      return left.lessonOrder - right.lessonOrder;
    });
  }, [entries, filter, normalizedQuery]);

  const selectedEntry =
    filteredEntries.find((entry) => entry.item.id === selectedId) ??
    filteredEntries[0] ??
    entries.find((entry) => entry.available) ??
    entries[0];

  const availableEntries = entries.filter((entry) => entry.available);
  const startedCount = availableEntries.filter(
    (entry) => entry.progress.status !== "new",
  ).length;
  const reviewCount = availableEntries.filter(
    (entry) => entry.progress.status === "review",
  ).length;
  const weakCount = availableEntries.filter((entry) => entry.progress.weak).length;

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Собираю прогресс кандзи…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={onCourse}>
            <Text style={styles.backButtonText}>‹ К курсу</Text>
          </TouchableOpacity>
          <Text style={styles.levelBadge}>JLPT N5</Text>
        </View>

        <Text style={styles.eyebrow}>漢字 · Kanji Study</Text>
        <Text style={styles.title}>Кандзи без свалки чтений</Text>
        <Text style={styles.description}>
          Знак открывается вместе с уроком и учится в знакомом слове. Значение,
          чтение и письмо считаются отдельно; слабые навыки остаются в общей SRS-очереди.
        </Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{availableEntries.length}</Text>
            <Text style={styles.summaryLabel}>доступно</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{startedCount}</Text>
            <Text style={styles.summaryLabel}>начато</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{reviewCount}</Text>
            <Text style={styles.summaryLabel}>закреплено</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{weakCount}</Text>
            <Text style={styles.summaryLabel}>слабые</Text>
          </View>
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Поиск: 日, день, にち, 日曜日…"
          placeholderTextColor="#7b8794"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.filters}>
          {([
            ["available", `Доступные ${availableEntries.length}`],
            ["weak", `Слабые ${weakCount}`],
            ["all", "Все 103"],
          ] as const).map(([value, label]) => (
            <TouchableOpacity
              key={value}
              style={[styles.filterButton, filter === value && styles.filterButtonActive]}
              onPress={() => setFilter(value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === value && styles.filterButtonTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedEntry && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={styles.largeGlyphBox}>
                <Text style={styles.largeGlyph}>{selectedEntry.item.literal}</Text>
              </View>
              <View style={styles.detailHeaderText}>
                <Text style={styles.meaning}>
                  {selectedEntry.item.meaningsRu.join(", ")}
                </Text>
                <Text style={styles.lessonLabel}>
                  Урок {selectedEntry.lessonOrder} · {selectedEntry.completedLesson
                    ? "встречался в пройденном уроке"
                    : selectedEntry.available
                      ? "открыт для текущего урока"
                      : "пока закрыт"}
                </Text>
                <Text style={styles.statusLabel}>
                  Статус: {statusLabels[selectedEntry.progress.status]} · общий прогресс {selectedEntry.progress.overallMastery}%
                </Text>
              </View>
            </View>

            {selectedEntry.item.examples[0] && (
              <View style={styles.exampleCard}>
                <View style={styles.exampleText}>
                  <Text style={styles.exampleWord}>
                    {selectedEntry.item.examples[0].written}
                  </Text>
                  <Text style={styles.exampleReading}>
                    {selectedEntry.item.examples[0].reading}
                  </Text>
                  <Text style={styles.exampleMeaning}>
                    {selectedEntry.item.examples[0].meaningRu}
                  </Text>
                  <Text style={styles.contextReading}>
                    Чтение знака здесь: {selectedEntry.item.examples[0].kanjiReading}
                  </Text>
                </View>
                <TouchableOpacity
                  accessibilityLabel={`Прослушать ${selectedEntry.item.examples[0].written}`}
                  style={styles.soundButton}
                  onPress={() =>
                    void speakJapanese(selectedEntry.item.examples[0]?.reading ?? "")
                  }
                >
                  <Text style={styles.soundButtonText}>🔊</Text>
                </TouchableOpacity>
              </View>
            )}

            <SkillCard
              title="Значение"
              progress={selectedEntry.progress.meaning}
              note="Появится после задания на узнавание или активное значение."
            />
            <SkillCard
              title="Чтение в слове"
              progress={selectedEntry.progress.reading}
              note="Появится после задания на чтение знакомого слова."
            />
            <SkillCard
              title="Письмо"
              progress={selectedEntry.progress.writing}
              note="Пока не оценивается: следующим этапом будет настоящий порядок черт и обведение, а не декоративная кнопка."
            />

            <Text style={styles.nextReview}>
              Ближайшее повторение значения или чтения: {formatDue(selectedEntry.progress.nextDueAt)}.
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          {filter === "weak"
            ? "Слабые кандзи"
            : filter === "all"
              ? "Полный N5-каталог"
              : "Открытые кандзи"}
        </Text>

        {filteredEntries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {filter === "weak" ? "Слабых кандзи пока нет" : "Ничего не найдено"}
            </Text>
            <Text style={styles.emptyBody}>
              {filter === "weak"
                ? "Это не амнистия: слабые места появятся после реальных попыток в уроках и повторении."
                : "Попробуй искать по знаку, русскому значению или чтению."}
            </Text>
          </View>
        ) : (
          <View style={styles.kanjiGrid}>
            {filteredEntries.map((entry) => {
              const selected = selectedEntry?.item.id === entry.item.id;
              return (
                <TouchableOpacity
                  key={entry.item.id}
                  style={[
                    styles.kanjiTile,
                    selected && styles.kanjiTileSelected,
                    !entry.available && styles.kanjiTileLocked,
                    entry.progress.weak && styles.kanjiTileWeak,
                  ]}
                  onPress={() => setSelectedId(entry.item.id)}
                >
                  <Text style={styles.tileGlyph}>{entry.item.literal}</Text>
                  <Text style={styles.tileProgress}>{entry.progress.overallMastery}%</Text>
                  <Text style={styles.tileLesson}>ур. {entry.lessonOrder}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f7fa",
  },
  container: {
    padding: 20,
    paddingBottom: 48,
    gap: 18,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  loadingText: {
    color: "#52606d",
    fontSize: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#e7eef5",
  },
  backButtonText: {
    color: "#183153",
    fontSize: 15,
    fontWeight: "700",
  },
  levelBadge: {
    color: "#31546f",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  eyebrow: {
    color: "#52606d",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: "#15202b",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
  },
  description: {
    color: "#52606d",
    fontSize: 16,
    lineHeight: 24,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryCard: {
    minWidth: "47%",
    flexGrow: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: "#d7e0e8",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  summaryValue: {
    color: "#15202b",
    fontSize: 26,
    fontWeight: "900",
  },
  summaryLabel: {
    color: "#66788a",
    fontSize: 13,
    fontWeight: "700",
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#c9d5df",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    color: "#15202b",
    fontSize: 16,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#c9d5df",
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  filterButtonActive: {
    borderColor: "#183153",
    backgroundColor: "#183153",
  },
  filterButtonText: {
    color: "#52606d",
    fontSize: 14,
    fontWeight: "700",
  },
  filterButtonTextActive: {
    color: "#ffffff",
  },
  detailCard: {
    gap: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d7e0e8",
    borderRadius: 24,
    backgroundColor: "#ffffff",
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  largeGlyphBox: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "#eef4f8",
  },
  largeGlyph: {
    color: "#15202b",
    fontSize: 72,
    lineHeight: 86,
    fontWeight: "500",
  },
  detailHeaderText: {
    flex: 1,
    gap: 6,
  },
  meaning: {
    color: "#15202b",
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
  },
  lessonLabel: {
    color: "#66788a",
    fontSize: 13,
    lineHeight: 18,
  },
  statusLabel: {
    color: "#31546f",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  exampleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
  },
  exampleText: {
    flex: 1,
    gap: 2,
  },
  exampleWord: {
    color: "#15202b",
    fontSize: 26,
    fontWeight: "800",
  },
  exampleReading: {
    color: "#31546f",
    fontSize: 16,
  },
  exampleMeaning: {
    color: "#52606d",
    fontSize: 14,
  },
  contextReading: {
    marginTop: 5,
    color: "#183153",
    fontSize: 14,
    fontWeight: "800",
  },
  soundButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    backgroundColor: "#e7eef5",
  },
  soundButtonText: {
    fontSize: 19,
  },
  skillCard: {
    gap: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e1e7ed",
    borderRadius: 16,
  },
  skillHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  skillTitle: {
    color: "#15202b",
    fontSize: 16,
    fontWeight: "800",
  },
  skillState: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "800",
  },
  stateNew: {
    color: "#66788a",
    backgroundColor: "#edf1f4",
  },
  stateLearning: {
    color: "#7a4f00",
    backgroundColor: "#fff1c7",
  },
  stateReview: {
    color: "#1f6a45",
    backgroundColor: "#dff5e9",
  },
  stateWeak: {
    color: "#9c2f2f",
    backgroundColor: "#fde7e7",
  },
  masteryTrack: {
    height: 8,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#e8edf2",
  },
  masteryFill: {
    height: "100%",
    borderRadius: 999,
  },
  fillNew: {
    backgroundColor: "#b8c3cc",
  },
  fillLearning: {
    backgroundColor: "#d49b23",
  },
  fillReview: {
    backgroundColor: "#3e9b6a",
  },
  fillWeak: {
    backgroundColor: "#c85454",
  },
  masteryValue: {
    color: "#183153",
    fontSize: 18,
    fontWeight: "900",
  },
  skillMeta: {
    color: "#66788a",
    fontSize: 13,
    lineHeight: 19,
  },
  nextReview: {
    color: "#52606d",
    fontSize: 13,
    lineHeight: 19,
  },
  sectionTitle: {
    color: "#15202b",
    fontSize: 22,
    fontWeight: "900",
  },
  kanjiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kanjiTile: {
    width: 72,
    minHeight: 92,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    padding: 8,
    borderWidth: 1,
    borderColor: "#d7e0e8",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  kanjiTileSelected: {
    borderWidth: 2,
    borderColor: "#183153",
  },
  kanjiTileLocked: {
    opacity: 0.48,
  },
  kanjiTileWeak: {
    borderColor: "#c85454",
  },
  tileGlyph: {
    color: "#15202b",
    fontSize: 34,
    fontWeight: "600",
  },
  tileProgress: {
    color: "#31546f",
    fontSize: 12,
    fontWeight: "800",
  },
  tileLesson: {
    color: "#7b8794",
    fontSize: 10,
  },
  emptyCard: {
    gap: 6,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d7e0e8",
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },
  emptyTitle: {
    color: "#15202b",
    fontSize: 17,
    fontWeight: "800",
  },
  emptyBody: {
    color: "#66788a",
    fontSize: 14,
    lineHeight: 20,
  },
});

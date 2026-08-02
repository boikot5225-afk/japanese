import { useMemo, useState } from "react";
import {
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
import { KanjiStudyPanel } from "../components/KanjiStudyPanel";
import type { SkritterWritingResult } from "../components/SkritterWritingPad";
import { lessonBundles } from "../content/courseCatalog";
import { n5KanjiCatalog } from "../content/kanjiCatalog";
import { kanjiStrokeDataByLiteral } from "../content/kanjiStrokeData";
import type { KanjiItem } from "../domain/course";
import {
  buildKanjiProgressCatalog,
  type KanjiProgressSummary,
  type KanjiSkillProgress,
  type KanjiSkillState,
  type KanjiStudyStatus,
} from "../engine/kanjiProgress";
import {
  countDueKanjiCards,
  countNewKanji,
  type KanjiStudyResult,
} from "../engine/kanjiStudySession";
import type { ReviewItem } from "../engine/reviewEngine";
import type { CheckpointProgress } from "../engine/checkpointEngine";

interface KanjiScreenProps {
  completedLessonIds: string[];
  checkpointProgress: CheckpointProgress[];
  reviewItems: ReviewItem[];
  onCourse: () => void;
  onRecordWriting: (item: KanjiItem, result: SkritterWritingResult) => void;
  onRecordStudy: (item: KanjiItem, result: KanjiStudyResult) => void;
}

type CatalogFilter = "all" | "new" | "due" | "weak";

interface CatalogEntry {
  item: KanjiItem;
  progress: KanjiProgressSummary;
  lessonOrder: number;
  due: boolean;
}

const statusLabels: Record<KanjiStudyStatus, string> = {
  new: "не начат",
  learning: "изучается",
  review: "в повторении",
  weak: "слабое место",
};

const skillStateLabels: Record<KanjiSkillState, string> = {
  new: "не начато",
  learning: "в работе",
  review: "в повторении",
  weak: "нужно повторить",
};

const lessonOrderById = new Map(
  lessonBundles.map((bundle) => [bundle.lesson.id, bundle.lesson.order]),
);

const normalizeSearch = (value: string): string =>
  value.trim().toLocaleLowerCase("ru-RU");

const matchesSearch = (item: KanjiItem, query: string): boolean => {
  if (!query) return true;
  return [
    item.literal,
    ...item.meaningsRu,
    ...item.examples.flatMap((example) => [
      example.written,
      example.reading,
      example.kanjiReading,
      example.meaningRu,
    ]),
  ].some((value) => value.toLocaleLowerCase("ru-RU").includes(query));
};

const formatDue = (value: string | null): string => {
  if (!value) return "после первой оценки";
  const date = new Date(value);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (left: Date, right: Date): boolean =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();
  if (date.getTime() <= Date.now()) return "сейчас";
  if (sameDay(date, today)) {
    return `сегодня в ${date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
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

function SkillCard({ title, progress }: { title: string; progress: KanjiSkillProgress }) {
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
      <Text style={styles.skillMeta}>
        {progress.attempts > 0
          ? `${progress.mastery}% · ${progress.correctCount} верно · ${progress.incorrectCount} ошибок · ${formatDue(progress.dueAt)}`
          : "Ещё не проверялось"}
      </Text>
    </View>
  );
}

export function KanjiScreen(props: KanjiScreenProps) {
  const {
    reviewItems,
    onCourse,
    onRecordWriting,
    onRecordStudy,
  } = props;
  const [sessionOpen, setSessionOpen] = useState(false);
  const [filter, setFilter] = useState<CatalogFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const progressCatalog = useMemo(
    () => buildKanjiProgressCatalog(n5KanjiCatalog, reviewItems),
    [reviewItems],
  );
  const progressById = useMemo(
    () => new Map(progressCatalog.map((entry) => [entry.itemId, entry])),
    [progressCatalog],
  );
  const dueItemIds = useMemo(() => {
    const now = Date.now();
    return new Set(
      reviewItems
        .filter((item) => new Date(item.dueAt).getTime() <= now)
        .map((item) => item.itemId),
    );
  }, [reviewItems]);

  const entries = useMemo<CatalogEntry[]>(
    () =>
      n5KanjiCatalog.map((item) => {
        const progress = progressById.get(item.id);
        if (!progress) throw new Error(`Нет прогресса для ${item.id}`);
        return {
          item,
          progress,
          lessonOrder: lessonOrderById.get(item.introducedInLessonId) ?? 999,
          due: dueItemIds.has(item.id),
        };
      }),
    [dueItemIds, progressById],
  );

  const dueCount = countDueKanjiCards(n5KanjiCatalog, reviewItems);
  const newCount = countNewKanji(n5KanjiCatalog, progressCatalog);
  const learningCount = progressCatalog.filter(
    (entry) => entry.status === "learning" || entry.status === "weak",
  ).length;
  const reviewCount = progressCatalog.filter((entry) => entry.status === "review").length;
  const weakCount = progressCatalog.filter((entry) => entry.weak).length;

  const normalizedQuery = normalizeSearch(query);
  const filteredEntries = useMemo(() => {
    const candidates = entries.filter((entry) => {
      if (filter === "new" && entry.progress.status !== "new") return false;
      if (filter === "due" && !entry.due) return false;
      if (filter === "weak" && !entry.progress.weak) return false;
      return matchesSearch(entry.item, normalizedQuery);
    });
    return [...candidates].sort((left, right) => {
      if (left.due !== right.due) return left.due ? -1 : 1;
      if (left.progress.weak !== right.progress.weak) {
        return left.progress.weak ? -1 : 1;
      }
      if (left.progress.overallMastery !== right.progress.overallMastery) {
        return left.progress.overallMastery - right.progress.overallMastery;
      }
      return left.lessonOrder - right.lessonOrder;
    });
  }, [entries, filter, normalizedQuery]);

  const selectedEntry =
    filteredEntries.find((entry) => entry.item.id === selectedId) ??
    filteredEntries[0] ??
    entries[0];
  const example = selectedEntry?.item.examples[0];
  const strokeCount = selectedEntry
    ? kanjiStrokeDataByLiteral[selectedEntry.item.literal]?.strokes.length ?? null
    : null;

  if (sessionOpen) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView
          contentContainerStyle={styles.sessionContainer}
          keyboardShouldPersistTaps="handled"
        >
          <KanjiStudyPanel
            catalog={n5KanjiCatalog}
            progress={progressCatalog}
            reviewItems={reviewItems}
            onRecordStudy={onRecordStudy}
            onRecordWriting={onRecordWriting}
            onExit={() => setSessionOpen(false)}
          />
        </ScrollView>
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
          <Text style={styles.levelBadge}>JLPT N5 · 103</Text>
        </View>

        <Text style={styles.eyebrow}>漢字 · Skritter-style</Text>
        <Text style={styles.title}>Один список. Одна очередь.</Text>
        <Text style={styles.description}>
          Все 103 кандзи N5 доступны сразу. Сначала идут просроченные навыки, затем до
          пяти новых знаков: знакомство, значение, чтение в слове и письмо. Ответ
          открывается вручную, оценка 1–4 решает, когда карточка вернётся.
        </Text>

        <View style={styles.deckCard}>
          <View style={styles.deckHeader}>
            <View style={styles.deckTitleCopy}>
              <Text style={styles.deckEyebrow}>Активный список</Text>
              <Text style={styles.deckTitle}>JLPT N5 Kanji</Text>
            </View>
            <Text style={styles.deckGlyph}>日語</Text>
          </View>
          <View style={styles.deckStats}>
            <View style={styles.deckStat}>
              <Text style={styles.deckStatValue}>{dueCount}</Text>
              <Text style={styles.deckStatLabel}>к повторению</Text>
            </View>
            <View style={styles.deckStat}>
              <Text style={styles.deckStatValue}>{newCount}</Text>
              <Text style={styles.deckStatLabel}>новых</Text>
            </View>
            <View style={styles.deckStat}>
              <Text style={styles.deckStatValue}>{weakCount}</Text>
              <Text style={styles.deckStatLabel}>слабых</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setSessionOpen(true)}>
            <Text style={styles.primaryButtonText}>
              {dueCount > 0 ? `Повторить ${dueCount} карточек` : "Начать занятие"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.deckNote}>
            За одну сессию: до 20 просроченных карточек и до 5 новых кандзи.
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{newCount}</Text>
            <Text style={styles.summaryLabel}>не начато</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{learningCount}</Text>
            <Text style={styles.summaryLabel}>изучается</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{reviewCount}</Text>
            <Text style={styles.summaryLabel}>в повторении</Text>
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
            ["all", `Все ${entries.length}`],
            ["new", `Новые ${newCount}`],
            ["due", `Сейчас ${dueCount}`],
            ["weak", `Слабые ${weakCount}`],
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
                  Порядок в курсе: урок {selectedEntry.lessonOrder}
                  {strokeCount ? ` · ${strokeCount} черт` : ""}
                </Text>
                <Text style={styles.statusLabel}>
                  {statusLabels[selectedEntry.progress.status]} · общий прогресс {selectedEntry.progress.overallMastery}%
                </Text>
              </View>
            </View>

            {example && (
              <View style={styles.exampleCard}>
                <View style={styles.exampleText}>
                  <Text style={styles.exampleWord}>{example.written}</Text>
                  <Text style={styles.exampleReading}>{example.reading}</Text>
                  <Text style={styles.exampleMeaning}>{example.meaningRu}</Text>
                  <Text style={styles.contextReading}>
                    {selectedEntry.item.literal} здесь читается {example.kanjiReading}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.soundButton}
                  onPress={() => void speakJapanese(example.reading)}
                >
                  <Text style={styles.soundButtonText}>🔊</Text>
                </TouchableOpacity>
              </View>
            )}

            <SkillCard title="Значение" progress={selectedEntry.progress.meaning} />
            <SkillCard title="Чтение в слове" progress={selectedEntry.progress.reading} />
            <SkillCard title="Письмо" progress={selectedEntry.progress.writing} />

            <TouchableOpacity style={styles.secondaryButton} onPress={() => setSessionOpen(true)}>
              <Text style={styles.secondaryButtonText}>Открыть учебную очередь</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          {filter === "new"
            ? "Новые кандзи"
            : filter === "due"
              ? "К повторению сейчас"
              : filter === "weak"
                ? "Слабые кандзи"
                : "Полный список N5"}
        </Text>

        {filteredEntries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Здесь пока пусто</Text>
            <Text style={styles.emptyBody}>
              Смени фильтр или запрос. Пустая очередь повторения — редкий приятный вид
              бюрократии: значит, на сейчас всё сделано.
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
                    entry.due && styles.kanjiTileDue,
                    entry.progress.weak && styles.kanjiTileWeak,
                  ]}
                  onPress={() => setSelectedId(entry.item.id)}
                >
                  <Text style={styles.tileGlyph}>{entry.item.literal}</Text>
                  <Text style={styles.tileProgress}>{entry.progress.overallMastery}%</Text>
                  <Text style={styles.tileLesson}>
                    {entry.due ? "сейчас" : `ур. ${entry.lessonOrder}`}
                  </Text>
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
  safeArea: { flex: 1, backgroundColor: "#f4f7fa" },
  container: { padding: 20, paddingBottom: 48, gap: 18 },
  sessionContainer: { padding: 18, paddingBottom: 48 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: "#e7eef5" },
  backButtonText: { color: "#183153", fontSize: 15, fontWeight: "700" },
  levelBadge: { color: "#31546f", fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
  eyebrow: { color: "#52606d", fontSize: 13, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" },
  title: { color: "#15202b", fontSize: 31, lineHeight: 38, fontWeight: "900" },
  description: { color: "#52606d", fontSize: 16, lineHeight: 24 },
  deckCard: { gap: 14, padding: 18, borderWidth: 1, borderColor: "#b9cbd8", borderRadius: 24, backgroundColor: "#eaf2f7" },
  deckHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  deckTitleCopy: { flex: 1, gap: 3 },
  deckEyebrow: { color: "#52606d", fontSize: 11, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" },
  deckTitle: { color: "#15202b", fontSize: 24, fontWeight: "900" },
  deckGlyph: { color: "#31546f", fontSize: 38, fontWeight: "700" },
  deckStats: { flexDirection: "row", gap: 8 },
  deckStat: { flex: 1, padding: 11, borderRadius: 14, backgroundColor: "#ffffff" },
  deckStatValue: { color: "#15202b", fontSize: 22, fontWeight: "900" },
  deckStatLabel: { color: "#66788a", fontSize: 11, fontWeight: "700" },
  deckNote: { textAlign: "center", color: "#66788a", fontSize: 12, lineHeight: 18 },
  primaryButton: { alignItems: "center", paddingVertical: 14, paddingHorizontal: 18, borderRadius: 15, backgroundColor: "#183153" },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  secondaryButton: { alignItems: "center", paddingVertical: 13, paddingHorizontal: 17, borderWidth: 1, borderColor: "#afbdc9", borderRadius: 15, backgroundColor: "#ffffff" },
  secondaryButtonText: { color: "#183153", fontSize: 14, fontWeight: "800" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summaryCard: { minWidth: "47%", flexGrow: 1, padding: 14, borderWidth: 1, borderColor: "#d7e0e8", borderRadius: 16, backgroundColor: "#ffffff" },
  summaryValue: { color: "#15202b", fontSize: 26, fontWeight: "900" },
  summaryLabel: { color: "#66788a", fontSize: 13, fontWeight: "700" },
  searchInput: { paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: "#c9d5df", borderRadius: 16, backgroundColor: "#ffffff", color: "#15202b", fontSize: 16 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterButton: { paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: "#c9d5df", borderRadius: 999, backgroundColor: "#ffffff" },
  filterButtonActive: { borderColor: "#183153", backgroundColor: "#183153" },
  filterButtonText: { color: "#52606d", fontSize: 14, fontWeight: "700" },
  filterButtonTextActive: { color: "#ffffff" },
  detailCard: { gap: 14, padding: 18, borderWidth: 1, borderColor: "#d7e0e8", borderRadius: 24, backgroundColor: "#ffffff" },
  detailHeader: { flexDirection: "row", alignItems: "center", gap: 16 },
  largeGlyphBox: { width: 104, height: 104, alignItems: "center", justifyContent: "center", borderRadius: 24, backgroundColor: "#eef4f8" },
  largeGlyph: { color: "#15202b", fontSize: 72, lineHeight: 86, fontWeight: "500" },
  detailHeaderText: { flex: 1, gap: 6 },
  meaning: { color: "#15202b", fontSize: 21, lineHeight: 27, fontWeight: "800" },
  lessonLabel: { color: "#66788a", fontSize: 13, lineHeight: 18 },
  statusLabel: { color: "#31546f", fontSize: 13, lineHeight: 18, fontWeight: "700" },
  exampleCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: "#f8fafc" },
  exampleText: { flex: 1, gap: 2 },
  exampleWord: { color: "#15202b", fontSize: 26, fontWeight: "800" },
  exampleReading: { color: "#31546f", fontSize: 16 },
  exampleMeaning: { color: "#52606d", fontSize: 14 },
  contextReading: { marginTop: 5, color: "#183153", fontSize: 14, fontWeight: "800" },
  soundButton: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 23, backgroundColor: "#e7eef5" },
  soundButtonText: { fontSize: 19 },
  skillCard: { gap: 8, padding: 14, borderWidth: 1, borderColor: "#e1e7ed", borderRadius: 16 },
  skillHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  skillTitle: { color: "#15202b", fontSize: 16, fontWeight: "800" },
  skillState: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, overflow: "hidden", fontSize: 12, fontWeight: "800" },
  stateNew: { color: "#66788a", backgroundColor: "#edf1f4" },
  stateLearning: { color: "#7a4f00", backgroundColor: "#fff1c7" },
  stateReview: { color: "#1f6a45", backgroundColor: "#dff5e9" },
  stateWeak: { color: "#9c2f2f", backgroundColor: "#fde7e7" },
  masteryTrack: { height: 8, overflow: "hidden", borderRadius: 999, backgroundColor: "#e8edf2" },
  masteryFill: { height: "100%", borderRadius: 999 },
  fillNew: { backgroundColor: "#b8c3cc" },
  fillLearning: { backgroundColor: "#d49b23" },
  fillReview: { backgroundColor: "#3e9b6a" },
  fillWeak: { backgroundColor: "#c85454" },
  skillMeta: { color: "#66788a", fontSize: 13, lineHeight: 19 },
  sectionTitle: { color: "#15202b", fontSize: 22, fontWeight: "900" },
  kanjiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kanjiTile: { width: 72, minHeight: 92, alignItems: "center", justifyContent: "center", gap: 2, padding: 8, borderWidth: 1, borderColor: "#d7e0e8", borderRadius: 16, backgroundColor: "#ffffff" },
  kanjiTileSelected: { borderWidth: 2, borderColor: "#183153" },
  kanjiTileDue: { backgroundColor: "#fff8df" },
  kanjiTileWeak: { borderColor: "#c85454" },
  tileGlyph: { color: "#15202b", fontSize: 34, fontWeight: "600" },
  tileProgress: { color: "#31546f", fontSize: 12, fontWeight: "800" },
  tileLesson: { color: "#7b8794", fontSize: 10 },
  emptyCard: { gap: 6, padding: 18, borderWidth: 1, borderColor: "#d7e0e8", borderRadius: 18, backgroundColor: "#ffffff" },
  emptyTitle: { color: "#15202b", fontSize: 17, fontWeight: "800" },
  emptyBody: { color: "#66788a", fontSize: 14, lineHeight: 20 },
});

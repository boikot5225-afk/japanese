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
import { n5KanjiCatalog } from "../content/kanjiCatalog";
import type { KanjiItem } from "../domain/course";
import type { CheckpointProgress } from "../engine/checkpointEngine";
import {
  buildKanjiProgressCatalog,
  type KanjiProgressSummary,
  type KanjiSkillProgress,
} from "../engine/kanjiProgress";
import {
  countDueKanjiCards,
  countNewKanji,
  type KanjiStudyMode,
  type KanjiStudyResult,
} from "../engine/kanjiStudySession";
import type { ReviewItem } from "../engine/reviewEngine";

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
  due: boolean;
}

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

const skillLabel = (progress: KanjiSkillProgress): string => {
  if (progress.attempts === 0) return "новое";
  if (progress.state === "weak") return "слабое";
  if (progress.state === "review") return "SRS";
  return "учится";
};

function SkillPill({
  title,
  progress,
}: {
  title: string;
  progress: KanjiSkillProgress;
}) {
  return (
    <View style={styles.skillPill}>
      <Text style={styles.skillTitle}>{title}</Text>
      <Text style={styles.skillValue}>{progress.mastery}%</Text>
      <Text style={styles.skillState}>{skillLabel(progress)}</Text>
    </View>
  );
}

export function KanjiScreen({
  reviewItems,
  onCourse,
  onRecordWriting,
  onRecordStudy,
}: KanjiScreenProps) {
  const [sessionMode, setSessionMode] = useState<KanjiStudyMode | null>(null);
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
          due: dueItemIds.has(item.id),
        };
      }),
    [dueItemIds, progressById],
  );

  const dueCount = countDueKanjiCards(n5KanjiCatalog, reviewItems);
  const newCount = countNewKanji(n5KanjiCatalog, progressCatalog);
  const weakCount = progressCatalog.filter((entry) => entry.weak).length;
  const learnedCount = n5KanjiCatalog.length - newCount;

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
      return left.progress.overallMastery - right.progress.overallMastery;
    });
  }, [entries, filter, normalizedQuery]);

  const selectedEntry =
    filteredEntries.find((entry) => entry.item.id === selectedId) ??
    filteredEntries[0] ??
    entries[0];
  const example = selectedEntry?.item.examples[0];

  if (sessionMode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.sessionContainer}>
          <KanjiStudyPanel
            key={sessionMode}
            mode={sessionMode}
            catalog={n5KanjiCatalog}
            progress={progressCatalog}
            reviewItems={reviewItems}
            onRecordStudy={onRecordStudy}
            onRecordWriting={onRecordWriting}
            onExit={() => setSessionMode(null)}
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

        <Text style={styles.eyebrow}>漢字 · Skritter workflow</Text>
        <Text style={styles.title}>Кандзи N5</Text>
        <Text style={styles.description}>
          Один список, но две разные активности. Learn вводит один новый кандзи через
          шесть этапов без оценок. Review разбирает только просроченные навыки и по
          умолчанию использует две оценки: «Забыл» и «Знаю».
        </Text>

        <View style={styles.activityGrid}>
          <View style={styles.activityCard}>
            <Text style={styles.activityEyebrow}>Learn</Text>
            <Text style={styles.activityValue}>{newCount}</Text>
            <Text style={styles.activityTitle}>новых кандзи</Text>
            <Text style={styles.activityBody}>
              Preview → значение → чтение → Teach → Snap → письмо по памяти.
            </Text>
            <TouchableOpacity
              disabled={newCount === 0}
              style={[styles.primaryButton, newCount === 0 && styles.disabled]}
              onPress={() => setSessionMode("learn")}
            >
              <Text style={styles.primaryButtonText}>
                {newCount > 0 ? "Учить новый" : "Все введены"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityCard}>
            <Text style={styles.activityEyebrow}>Review</Text>
            <Text style={styles.activityValue}>{dueCount}</Text>
            <Text style={styles.activityTitle}>к повторению</Text>
            <Text style={styles.activityBody}>
              Только готовые SRS-карточки. «Забыл» возвращается в конец очереди.
            </Text>
            <TouchableOpacity
              disabled={dueCount === 0}
              style={[styles.reviewButton, dueCount === 0 && styles.disabled]}
              onPress={() => setSessionMode("review")}
            >
              <Text style={styles.reviewButtonText}>
                {dueCount > 0 ? `Повторить ${dueCount}` : "Пока пусто"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{learnedCount}</Text>
            <Text style={styles.summaryLabel}>введено</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{newCount}</Text>
            <Text style={styles.summaryLabel}>новых</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{weakCount}</Text>
            <Text style={styles.summaryLabel}>слабых</Text>
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
              <Text style={styles.detailGlyph}>{selectedEntry.item.literal}</Text>
              <View style={styles.detailCopy}>
                <Text style={styles.detailMeaning}>
                  {selectedEntry.item.meaningsRu.join(", ")}
                </Text>
                <Text style={styles.detailStatus}>
                  {selectedEntry.due
                    ? "готово к повторению"
                    : selectedEntry.progress.status === "new"
                      ? "ещё не введено"
                      : `общий прогресс ${selectedEntry.progress.overallMastery}%`}
                </Text>
              </View>
            </View>

            {example && (
              <View style={styles.exampleCard}>
                <View style={styles.exampleCopy}>
                  <Text style={styles.exampleWord}>{example.written}</Text>
                  <Text style={styles.exampleReading}>{example.reading}</Text>
                  <Text style={styles.exampleMeaning}>{example.meaningRu}</Text>
                  <Text style={styles.exampleFocus}>
                    {selectedEntry.item.literal}: {example.kanjiReading}
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

            <View style={styles.skillsRow}>
              <SkillPill title="Значение" progress={selectedEntry.progress.meaning} />
              <SkillPill title="Чтение" progress={selectedEntry.progress.reading} />
              <SkillPill title="Письмо" progress={selectedEntry.progress.writing} />
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Список JLPT N5</Text>
        {filteredEntries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Ничего не найдено</Text>
            <Text style={styles.emptyBody}>Измени фильтр или поисковый запрос.</Text>
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
                  <Text style={styles.tileProgress}>
                    {entry.progress.status === "new"
                      ? "new"
                      : `${entry.progress.overallMastery}%`}
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
  container: { padding: 20, paddingBottom: 50, gap: 18 },
  sessionContainer: { padding: 18, paddingBottom: 48 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#e7eef5",
  },
  backButtonText: { color: "#183153", fontSize: 15, fontWeight: "800" },
  levelBadge: { color: "#31546f", fontSize: 13, fontWeight: "900" },
  eyebrow: { color: "#52606d", fontSize: 12, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase" },
  title: { color: "#15202b", fontSize: 34, lineHeight: 40, fontWeight: "900" },
  description: { color: "#52606d", fontSize: 15, lineHeight: 23 },
  activityGrid: { gap: 12 },
  activityCard: {
    gap: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d7e0e8",
    borderRadius: 22,
    backgroundColor: "#ffffff",
  },
  activityEyebrow: { color: "#31546f", fontSize: 12, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" },
  activityValue: { color: "#15202b", fontSize: 34, fontWeight: "900" },
  activityTitle: { color: "#15202b", fontSize: 18, fontWeight: "900" },
  activityBody: { color: "#66788a", fontSize: 14, lineHeight: 20 },
  primaryButton: { minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#183153" },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
  reviewButton: { minHeight: 48, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#183153", borderRadius: 14, backgroundColor: "#ffffff" },
  reviewButtonText: { color: "#183153", fontSize: 15, fontWeight: "900" },
  disabled: { opacity: 0.38 },
  summaryRow: { flexDirection: "row", gap: 9 },
  summaryCard: { flex: 1, padding: 13, borderWidth: 1, borderColor: "#d7e0e8", borderRadius: 16, backgroundColor: "#ffffff" },
  summaryValue: { color: "#15202b", fontSize: 23, fontWeight: "900" },
  summaryLabel: { color: "#66788a", fontSize: 12, fontWeight: "700" },
  searchInput: { paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: "#c9d5df", borderRadius: 16, backgroundColor: "#ffffff", color: "#15202b", fontSize: 16 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterButton: { paddingVertical: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: "#c9d5df", borderRadius: 999, backgroundColor: "#ffffff" },
  filterButtonActive: { borderColor: "#183153", backgroundColor: "#183153" },
  filterButtonText: { color: "#52606d", fontSize: 13, fontWeight: "800" },
  filterButtonTextActive: { color: "#ffffff" },
  detailCard: { gap: 14, padding: 18, borderWidth: 1, borderColor: "#d7e0e8", borderRadius: 24, backgroundColor: "#ffffff" },
  detailHeader: { flexDirection: "row", alignItems: "center", gap: 16 },
  detailGlyph: { width: 100, textAlign: "center", color: "#15202b", fontSize: 76, lineHeight: 94 },
  detailCopy: { flex: 1, gap: 5 },
  detailMeaning: { color: "#15202b", fontSize: 21, lineHeight: 27, fontWeight: "900" },
  detailStatus: { color: "#31546f", fontSize: 13, fontWeight: "800" },
  exampleCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: "#f4f7fa" },
  exampleCopy: { flex: 1, gap: 2 },
  exampleWord: { color: "#15202b", fontSize: 25, fontWeight: "900" },
  exampleReading: { color: "#31546f", fontSize: 16 },
  exampleMeaning: { color: "#66788a", fontSize: 14 },
  exampleFocus: { marginTop: 4, color: "#183153", fontSize: 13, fontWeight: "900" },
  soundButton: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 23, backgroundColor: "#e1eaf1" },
  soundButtonText: { fontSize: 19 },
  skillsRow: { flexDirection: "row", gap: 8 },
  skillPill: { flex: 1, gap: 2, padding: 10, borderWidth: 1, borderColor: "#e0e7ed", borderRadius: 14 },
  skillTitle: { color: "#66788a", fontSize: 11, fontWeight: "800" },
  skillValue: { color: "#15202b", fontSize: 19, fontWeight: "900" },
  skillState: { color: "#31546f", fontSize: 10, fontWeight: "800" },
  sectionTitle: { color: "#15202b", fontSize: 22, fontWeight: "900" },
  kanjiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  kanjiTile: { width: 69, minHeight: 82, alignItems: "center", justifyContent: "center", gap: 2, padding: 7, borderWidth: 1, borderColor: "#d7e0e8", borderRadius: 15, backgroundColor: "#ffffff" },
  kanjiTileSelected: { borderWidth: 2, borderColor: "#183153" },
  kanjiTileDue: { backgroundColor: "#edf8f1", borderColor: "#67a27f" },
  kanjiTileWeak: { borderColor: "#c85454" },
  tileGlyph: { color: "#15202b", fontSize: 34, fontWeight: "600" },
  tileProgress: { color: "#31546f", fontSize: 11, fontWeight: "900" },
  emptyCard: { gap: 5, padding: 18, borderWidth: 1, borderColor: "#d7e0e8", borderRadius: 18, backgroundColor: "#ffffff" },
  emptyTitle: { color: "#15202b", fontSize: 17, fontWeight: "900" },
  emptyBody: { color: "#66788a", fontSize: 14 },
});

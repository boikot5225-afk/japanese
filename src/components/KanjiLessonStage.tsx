import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { speakJapanese } from "../audio/japaneseSpeech";
import type { KanjiItem, Skill } from "../domain/course";
import {
  buildKanjiProgressCatalog,
  type KanjiProgressSummary,
  type KanjiStudySkill,
} from "../engine/kanjiProgress";
import {
  getKanjiLessonRuntime,
  registerKanjiLessonGate,
} from "../engine/kanjiLessonBridge";
import type { KanjiStudyResult } from "../engine/kanjiStudySession";
import type { SkritterWritingResult } from "./SkritterWritingPad";
import { KanjiStudyPanel } from "./KanjiStudyPanel";

interface KanjiLessonStageProps {
  lessonId: string;
  kanji: readonly KanjiItem[];
}

type CompletedSkills = Record<string, readonly KanjiStudySkill[]>;

const studySkillForExerciseSkill = (skill: Skill | undefined): KanjiStudySkill | null => {
  if (skill === "recognition" || skill === "recall") return "meaning";
  if (skill === "reading") return "reading";
  if (skill === "writing") return "writing";
  return null;
};

const buildCompletedSkills = (
  progress: readonly KanjiProgressSummary[],
): CompletedSkills =>
  Object.fromEntries(
    progress.map((entry) => [
      entry.itemId,
      [
        ...(entry.meaning.attempts > 0 ? ["meaning" as const] : []),
        ...(entry.reading.attempts > 0 ? ["reading" as const] : []),
        ...(entry.writing.attempts > 0 ? ["writing" as const] : []),
      ],
    ]),
  );

const hasFinishedItem = (
  completed: CompletedSkills,
  itemId: string,
): boolean => {
  const skills = completed[itemId] ?? [];
  return skills.includes("meaning") && skills.includes("reading") && skills.includes("writing");
};

export function KanjiLessonStage({ lessonId, kanji }: KanjiLessonStageProps) {
  const runtime = getKanjiLessonRuntime();
  const progressCatalog = useMemo(
    () => buildKanjiProgressCatalog(kanji, runtime?.reviewItems ?? []),
    [kanji, runtime?.reviewItems],
  );
  const [completedSkills, setCompletedSkills] = useState<CompletedSkills>(() =>
    buildCompletedSkills(progressCatalog),
  );
  const [sessionOpen, setSessionOpen] = useState(false);

  useEffect(() => {
    setCompletedSkills(buildCompletedSkills(progressCatalog));
    setSessionOpen(false);
  }, [lessonId, progressCatalog]);

  const markSkillComplete = (itemId: string, skill: KanjiStudySkill) => {
    setCompletedSkills((previous) => {
      const current = previous[itemId] ?? [];
      if (current.includes(skill)) return previous;
      return {
        ...previous,
        [itemId]: [...current, skill],
      };
    });
  };

  const finishedCount = kanji.filter((item) =>
    hasFinishedItem(completedSkills, item.id),
  ).length;
  const allComplete = kanji.length === 0 || finishedCount === kanji.length;

  useEffect(
    () =>
      registerKanjiLessonGate(lessonId, {
        complete: allComplete,
        openStudy: () => setSessionOpen(true),
      }),
    [allComplete, lessonId],
  );

  const recordStudy = (item: KanjiItem, result: KanjiStudyResult) => {
    runtime?.onRecordStudy(item, result);
    const skill = studySkillForExerciseSkill(result.exercise.skill);
    if (skill) markSkillComplete(item.id, skill);
  };

  const recordWriting = (item: KanjiItem, result: SkritterWritingResult) => {
    runtime?.onRecordWriting(item, result);
    markSkillComplete(item.id, "writing");
  };

  if (sessionOpen && !allComplete && runtime) {
    return (
      <View style={styles.sessionSection}>
        <KanjiStudyPanel
          key={lessonId}
          mode="learn"
          catalog={kanji}
          progress={progressCatalog}
          reviewItems={runtime.reviewItems}
          onRecordStudy={recordStudy}
          onRecordWriting={recordWriting}
          onExit={() => setSessionOpen(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text style={styles.sectionTitle}>Кандзи урока · Skritter</Text>
          <Text style={styles.progressText}>
            {finishedCount}/{kanji.length} полностью введено в повторение
          </Text>
        </View>
        <View style={[styles.statusBadge, allComplete && styles.statusBadgeComplete]}>
          <Text style={[styles.statusText, allComplete && styles.statusTextComplete]}>
            {allComplete ? "готово" : "обязательно"}
          </Text>
        </View>
      </View>

      <Text style={styles.intro}>
        Каждый новый знак проходит полный цикл: Preview → значение → чтение →
        Writing Teach → Writing Snap → Writing Recall. До завершения всех шести
        этапов знание не считается изученным и не попадает в SRS.
      </Text>

      {kanji.map((item) => {
        const example = item.examples[0];
        const complete = hasFinishedItem(completedSkills, item.id);
        return (
          <View key={item.id} style={[styles.card, complete && styles.cardComplete]}>
            <View style={styles.header}>
              <View style={styles.glyphBox}>
                <Text style={styles.glyph}>{item.literal}</Text>
              </View>
              <View style={styles.headerText}>
                <Text style={styles.meaning}>{item.meaningsRu.join(", ")}</Text>
                <Text style={styles.level}>
                  JLPT N5 · {complete ? "цикл завершён" : "ожидает полного цикла"}
                </Text>
              </View>
              {complete && <Text style={styles.checkmark}>✓</Text>}
            </View>

            {example && (
              <View style={styles.example}>
                <View style={styles.exampleText}>
                  <Text style={styles.word}>{example.written}</Text>
                  <Text style={styles.reading}>{example.reading}</Text>
                  <Text style={styles.translation}>{example.meaningRu}</Text>
                </View>
                <TouchableOpacity
                  accessibilityLabel={`Прослушать ${example.written}`}
                  style={styles.soundButton}
                  onPress={() => void speakJapanese(example.reading)}
                >
                  <Text style={styles.soundButtonText}>🔊</Text>
                </TouchableOpacity>
              </View>
            )}

            {example && (
              <View style={styles.focusRow}>
                <Text style={styles.focusLabel}>Чтение знака в этом слове</Text>
                <Text style={styles.focusReading}>{example.kanjiReading}</Text>
              </View>
            )}
          </View>
        );
      })}

      {!runtime && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Сессия письма не подключена</Text>
          <Text style={styles.warningBody}>
            Вернись к экрану курса и открой урок заново. Прогресс не будет подделан.
          </Text>
        </View>
      )}

      {allComplete ? (
        <View style={styles.completeCard}>
          <Text style={styles.completeTitle}>Кандзи урока готовы</Text>
          <Text style={styles.completeBody}>
            Значение, чтение и письмо каждого знака добавлены в независимое
            интервальное повторение.
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          disabled={!runtime}
          style={[styles.primaryButton, !runtime && styles.disabledButton]}
          onPress={() => setSessionOpen(true)}
        >
          <Text style={styles.primaryButtonText}>
            {finishedCount > 0 ? "Продолжить Skritter-цикл" : "Начать Skritter-цикл"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 14 },
  sessionSection: { gap: 14, paddingTop: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  titleCopy: { flex: 1, gap: 3 },
  sectionTitle: { color: "#15202b", fontSize: 22, fontWeight: "800" },
  progressText: { color: "#66788a", fontSize: 13, fontWeight: "700" },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: "#fff1c7",
  },
  statusBadgeComplete: { backgroundColor: "#dff5e9" },
  statusText: { color: "#7a4f00", fontSize: 11, fontWeight: "900" },
  statusTextComplete: { color: "#1f6a45" },
  intro: { color: "#52606d", fontSize: 15, lineHeight: 22 },
  card: {
    gap: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d7e0e8",
    borderRadius: 22,
    backgroundColor: "#ffffff",
  },
  cardComplete: { borderColor: "#9bc5aa", backgroundColor: "#f7fcf8" },
  header: { flexDirection: "row", alignItems: "center", gap: 16 },
  glyphBox: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#eef4f8",
  },
  glyph: { color: "#15202b", fontSize: 60, lineHeight: 74, fontWeight: "500" },
  headerText: { flex: 1, gap: 6 },
  meaning: { color: "#15202b", fontSize: 19, lineHeight: 25, fontWeight: "700" },
  level: { color: "#66788a", fontSize: 13, fontWeight: "600" },
  checkmark: { color: "#2e7d55", fontSize: 27, fontWeight: "900" },
  example: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
  },
  exampleText: { flex: 1, gap: 2 },
  word: { color: "#15202b", fontSize: 25, fontWeight: "700" },
  reading: { color: "#31546f", fontSize: 16 },
  translation: { color: "#52606d", fontSize: 14 },
  soundButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#e7eef5",
  },
  soundButtonText: { fontSize: 19 },
  focusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  focusLabel: { flex: 1, color: "#52606d", fontSize: 14, lineHeight: 19 },
  focusReading: { color: "#183153", fontSize: 22, fontWeight: "800" },
  warningCard: {
    gap: 5,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e6b8b8",
    borderRadius: 16,
    backgroundColor: "#fff7f7",
  },
  warningTitle: { color: "#9c2f2f", fontSize: 15, fontWeight: "900" },
  warningBody: { color: "#6f4b4b", fontSize: 13, lineHeight: 19 },
  completeCard: {
    gap: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: "#9bc5aa",
    borderRadius: 18,
    backgroundColor: "#f1faf4",
  },
  completeTitle: { color: "#1f6a45", fontSize: 17, fontWeight: "900" },
  completeBody: { color: "#42634f", fontSize: 14, lineHeight: 20 },
  primaryButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#183153",
  },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
  disabledButton: { opacity: 0.45 },
});

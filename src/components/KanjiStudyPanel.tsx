import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { speakJapanese } from "../audio/japaneseSpeech";
import type { KanjiItem } from "../domain/course";
import type { KanjiProgressSummary } from "../engine/kanjiProgress";
import {
  buildKanjiStudyQueue,
  buildKanjiStudyResult,
  kanjiStudyPartLabel,
  requeueKanjiStudyCard,
  type KanjiStudyCard,
  type KanjiStudyResult,
} from "../engine/kanjiStudySession";
import type { ReviewItem } from "../engine/reviewEngine";
import {
  WRITING_GRADE_DEFINITIONS,
  type WritingGrade,
} from "../engine/writingSession";
import { KanjiWritingPanel } from "./KanjiWritingPanel";
import type { SkritterWritingResult } from "./SkritterWritingPad";

interface KanjiStudyPanelProps {
  catalog: readonly KanjiItem[];
  progress: readonly KanjiProgressSummary[];
  reviewItems: readonly ReviewItem[];
  onRecordStudy: (item: KanjiItem, result: KanjiStudyResult) => void;
  onRecordWriting: (item: KanjiItem, result: SkritterWritingResult) => void;
  onExit: () => void;
}

interface SessionStats {
  reviewed: number;
  forgot: number;
  hard: number;
  known: number;
  easy: number;
}

const emptyStats: SessionStats = {
  reviewed: 0,
  forgot: 0,
  hard: 0,
  known: 0,
  easy: 0,
};

const updateStats = (stats: SessionStats, grade: WritingGrade): SessionStats => ({
  ...stats,
  reviewed: stats.reviewed + 1,
  forgot: stats.forgot + (grade === 1 ? 1 : 0),
  hard: stats.hard + (grade === 2 ? 1 : 0),
  known: stats.known + (grade === 3 ? 1 : 0),
  easy: stats.easy + (grade === 4 ? 1 : 0),
});

const partInstruction = (card: KanjiStudyCard): string => {
  switch (card.part) {
    case "preview":
      return "Посмотри на знак и слово целиком. Это знакомство, оценка пока не нужна.";
    case "meaning":
      return "Вспомни основное значение знака, затем открой ответ и оцени себя честно.";
    case "reading":
      return "Вспомни чтение выделенного кандзи именно в этом слове.";
    case "writing":
      return "Напиши знак. Порядок черт, подсказки и ошибки ограничат доступную оценку.";
  }
};

function GradeButtons({ onGrade }: { onGrade: (grade: WritingGrade) => void }) {
  return (
    <View style={styles.gradeRow}>
      {WRITING_GRADE_DEFINITIONS.map((definition) => (
        <TouchableOpacity
          key={definition.grade}
          style={[styles.gradeButton, styles[`grade${definition.grade}`]]}
          onPress={() => onGrade(definition.grade)}
          accessibilityLabel={`Оценка ${definition.grade}: ${definition.label}`}
        >
          <Text style={styles.gradeNumber}>{definition.grade}</Text>
          <Text style={styles.gradeLabel}>{definition.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function KanjiStudyPanel({
  catalog,
  progress,
  reviewItems,
  onRecordStudy,
  onRecordWriting,
  onExit,
}: KanjiStudyPanelProps) {
  const itemById = useMemo(
    () => new Map(catalog.map((item) => [item.id, item])),
    [catalog],
  );
  const progressById = useMemo(
    () => new Map(progress.map((entry) => [entry.itemId, entry])),
    [progress],
  );
  const [queue, setQueue] = useState<KanjiStudyCard[]>(() =>
    buildKanjiStudyQueue(catalog, progress, reviewItems),
  );
  const [revealed, setRevealed] = useState(false);
  const [handled, setHandled] = useState(0);
  const [stats, setStats] = useState<SessionStats>(emptyStats);

  const card = queue[0];
  const item = card ? itemById.get(card.itemId) : undefined;
  const example = item?.examples[0];
  const itemProgress = item ? progressById.get(item.id) : undefined;
  const writingReviewItem = item
    ? reviewItems.find(
        (reviewItem) =>
          reviewItem.itemId === item.id && reviewItem.skill === "writing",
      )
    : undefined;

  const restart = () => {
    setQueue(buildKanjiStudyQueue(catalog, progress, reviewItems));
    setRevealed(false);
    setHandled(0);
    setStats(emptyStats);
  };

  const continueAfterPreview = () => {
    setQueue((previous) => previous.slice(1));
    setHandled((previous) => previous + 1);
    setRevealed(false);
  };

  const skipNewItem = () => {
    if (!item) return;
    setQueue((previous) => previous.filter((entry) => entry.itemId !== item.id));
    setHandled((previous) => previous + 1);
    setRevealed(false);
  };

  const finishCard = (grade: WritingGrade) => {
    if (!card || !item || card.part === "preview") return;
    onRecordStudy(item, buildKanjiStudyResult(card, item, grade));
    setStats((previous) => updateStats(previous, grade));
    setHandled((previous) => previous + 1);
    setQueue((previous) =>
      requeueKanjiStudyCard(previous.slice(1), card, grade),
    );
    setRevealed(false);
  };

  const finishWriting = (result: SkritterWritingResult) => {
    if (!card || !item || card.part !== "writing") return;
    onRecordWriting(item, result);
    setStats((previous) => updateStats(previous, result.grade));
    setHandled((previous) => previous + 1);
    setQueue((previous) =>
      requeueKanjiStudyCard(previous.slice(1), card, result.grade),
    );
    setRevealed(false);
  };

  if (!card || !item) {
    return (
      <View style={styles.completeCard}>
        <Text style={styles.eyebrow}>Сессия завершена</Text>
        <Text style={styles.completeTitle}>Очередь разобрана</Text>
        <Text style={styles.completeBody}>
          Проверено навыков: {stats.reviewed}. Забыл: {stats.forgot}, трудно: {stats.hard},
          знаю: {stats.known}, легко: {stats.easy}.
        </Text>
        <View style={styles.completeActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onExit}>
            <Text style={styles.secondaryButtonText}>К списку N5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={restart}>
            <Text style={styles.primaryButtonText}>Ещё занятие</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const remaining = queue.length;
  const total = handled + remaining;

  return (
    <View style={styles.session}>
      <View style={styles.sessionHeader}>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Text style={styles.exitButtonText}>×</Text>
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>JLPT N5 · {kanjiStudyPartLabel(card.part)}</Text>
          <Text style={styles.counter}>
            {handled + 1} / {total} · в очереди {remaining}
          </Text>
        </View>
        {card.remediation ? (
          <Text style={styles.retryBadge}>повтор</Text>
        ) : card.isNew ? (
          <Text style={styles.newBadge}>новое</Text>
        ) : (
          <Text style={styles.reviewBadge}>SRS</Text>
        )}
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round((handled / Math.max(total, 1)) * 100)}%` as `${number}%` },
          ]}
        />
      </View>

      <Text style={styles.instruction}>{partInstruction(card)}</Text>

      {card.part === "preview" && (
        <View style={styles.studyCard}>
          <Text style={styles.previewGlyph}>{item.literal}</Text>
          <Text style={styles.previewMeaning}>{item.meaningsRu.join(", ")}</Text>
          {example && (
            <View style={styles.answerBox}>
              <View style={styles.wordRow}>
                <View style={styles.wordCopy}>
                  <Text style={styles.word}>{example.written}</Text>
                  <Text style={styles.reading}>{example.reading}</Text>
                  <Text style={styles.translation}>{example.meaningRu}</Text>
                </View>
                <TouchableOpacity
                  style={styles.soundButton}
                  onPress={() => void speakJapanese(example.reading)}
                >
                  <Text style={styles.soundButtonText}>🔊</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.focusReading}>
                {item.literal} здесь читается {example.kanjiReading}
              </Text>
            </View>
          )}
          <Text style={styles.masteryNote}>
            Значение {itemProgress?.meaning.mastery ?? 0}% · чтение {itemProgress?.reading.mastery ?? 0}% · письмо {itemProgress?.writing.mastery ?? 0}%
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={continueAfterPreview}>
            <Text style={styles.primaryButtonText}>Продолжить обучение</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={skipNewItem}>
            <Text style={styles.linkButtonText}>Не добавлять этот кандзи сейчас</Text>
          </TouchableOpacity>
        </View>
      )}

      {card.part === "meaning" && (
        <View style={styles.studyCard}>
          <Text style={styles.promptLabel}>Что означает этот кандзи?</Text>
          <Text style={styles.questionGlyph}>{item.literal}</Text>
          {!revealed ? (
            <TouchableOpacity style={styles.revealButton} onPress={() => setRevealed(true)}>
              <Text style={styles.revealButtonText}>Показать ответ</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.revealedArea}>
              <View style={styles.answerBox}>
                <Text style={styles.answerTitle}>{item.meaningsRu.join(", ")}</Text>
                {example && (
                  <Text style={styles.answerDetail}>
                    {example.written}（{example.reading}）— {example.meaningRu}
                  </Text>
                )}
              </View>
              <Text style={styles.gradePrompt}>Насколько хорошо вспомнил?</Text>
              <GradeButtons onGrade={finishCard} />
            </View>
          )}
        </View>
      )}

      {card.part === "reading" && (
        <View style={styles.studyCard}>
          <Text style={styles.promptLabel}>Как читается выделенный знак?</Text>
          <Text style={styles.questionWord}>{example?.written ?? item.literal}</Text>
          {example && <Text style={styles.translation}>{example.meaningRu}</Text>}
          {!revealed ? (
            <TouchableOpacity style={styles.revealButton} onPress={() => setRevealed(true)}>
              <Text style={styles.revealButtonText}>Показать чтение</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.revealedArea}>
              <View style={styles.answerBox}>
                <View style={styles.wordRow}>
                  <View style={styles.wordCopy}>
                    <Text style={styles.answerTitle}>{example?.kanjiReading ?? "—"}</Text>
                    <Text style={styles.answerDetail}>
                      Всё слово: {example?.reading ?? item.literal}
                    </Text>
                  </View>
                  {example && (
                    <TouchableOpacity
                      style={styles.soundButton}
                      onPress={() => void speakJapanese(example.reading)}
                    >
                      <Text style={styles.soundButtonText}>🔊</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <Text style={styles.gradePrompt}>Насколько хорошо вспомнил?</Text>
              <GradeButtons onGrade={finishCard} />
            </View>
          )}
        </View>
      )}

      {card.part === "writing" && itemProgress && (
        <View style={styles.writingCard}>
          <KanjiWritingPanel
            key={card.id}
            item={item}
            progress={itemProgress.writing}
            reviewItem={writingReviewItem}
            onComplete={finishWriting}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  session: { gap: 14 },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  exitButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#e7eef5",
  },
  exitButtonText: { color: "#183153", fontSize: 27, lineHeight: 30, fontWeight: "500" },
  headerCopy: { flex: 1, gap: 2 },
  eyebrow: {
    color: "#31546f",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  counter: { color: "#66788a", fontSize: 13, fontWeight: "700" },
  newBadge: { color: "#7a4f00", backgroundColor: "#fff1c7", paddingVertical: 5, paddingHorizontal: 9, borderRadius: 999, overflow: "hidden", fontSize: 11, fontWeight: "900" },
  retryBadge: { color: "#9c2f2f", backgroundColor: "#fde7e7", paddingVertical: 5, paddingHorizontal: 9, borderRadius: 999, overflow: "hidden", fontSize: 11, fontWeight: "900" },
  reviewBadge: { color: "#1f6a45", backgroundColor: "#dff5e9", paddingVertical: 5, paddingHorizontal: 9, borderRadius: 999, overflow: "hidden", fontSize: 11, fontWeight: "900" },
  progressTrack: { height: 7, overflow: "hidden", borderRadius: 999, backgroundColor: "#e1e8ee" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#183153" },
  instruction: { color: "#52606d", fontSize: 14, lineHeight: 21 },
  studyCard: { gap: 16, padding: 18, borderWidth: 1, borderColor: "#d7e0e8", borderRadius: 24, backgroundColor: "#ffffff" },
  writingCard: { padding: 18, borderWidth: 1, borderColor: "#d7e0e8", borderRadius: 24, backgroundColor: "#ffffff" },
  previewGlyph: { textAlign: "center", color: "#15202b", fontSize: 108, lineHeight: 128, fontWeight: "500" },
  previewMeaning: { textAlign: "center", color: "#15202b", fontSize: 22, lineHeight: 29, fontWeight: "900" },
  promptLabel: { textAlign: "center", color: "#52606d", fontSize: 15, fontWeight: "800" },
  questionGlyph: { textAlign: "center", color: "#15202b", fontSize: 126, lineHeight: 146, fontWeight: "500" },
  questionWord: { textAlign: "center", color: "#15202b", fontSize: 50, lineHeight: 64, fontWeight: "800" },
  answerBox: { gap: 7, padding: 15, borderRadius: 18, backgroundColor: "#f1f6f9" },
  answerTitle: { color: "#15202b", fontSize: 23, lineHeight: 30, fontWeight: "900" },
  answerDetail: { color: "#52606d", fontSize: 15, lineHeight: 22 },
  wordRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  wordCopy: { flex: 1, gap: 2 },
  word: { color: "#15202b", fontSize: 28, fontWeight: "900" },
  reading: { color: "#31546f", fontSize: 17 },
  translation: { textAlign: "center", color: "#66788a", fontSize: 15, lineHeight: 21 },
  focusReading: { color: "#183153", fontSize: 14, lineHeight: 20, fontWeight: "800" },
  soundButton: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 23, backgroundColor: "#dfeaf1" },
  soundButtonText: { fontSize: 19 },
  masteryNote: { textAlign: "center", color: "#66788a", fontSize: 12, lineHeight: 18 },
  revealButton: { alignItems: "center", paddingVertical: 17, paddingHorizontal: 18, borderRadius: 16, backgroundColor: "#183153" },
  revealButtonText: { color: "#ffffff", fontSize: 17, fontWeight: "900" },
  revealedArea: { gap: 13 },
  gradePrompt: { textAlign: "center", color: "#52606d", fontSize: 13, fontWeight: "800" },
  gradeRow: { flexDirection: "row", gap: 7 },
  gradeButton: { flex: 1, minHeight: 67, alignItems: "center", justifyContent: "center", gap: 2, paddingVertical: 9, paddingHorizontal: 4, borderWidth: 1, borderRadius: 14 },
  grade1: { borderColor: "#d98989", backgroundColor: "#fdecec" },
  grade2: { borderColor: "#dfbd72", backgroundColor: "#fff4d8" },
  grade3: { borderColor: "#83bfa0", backgroundColor: "#e7f7ee" },
  grade4: { borderColor: "#75a9c0", backgroundColor: "#e4f2f8" },
  gradeNumber: { color: "#15202b", fontSize: 18, fontWeight: "900" },
  gradeLabel: { color: "#42596d", fontSize: 10, fontWeight: "800" },
  primaryButton: { alignItems: "center", paddingVertical: 14, paddingHorizontal: 18, borderRadius: 15, backgroundColor: "#183153" },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
  secondaryButton: { alignItems: "center", paddingVertical: 13, paddingHorizontal: 17, borderWidth: 1, borderColor: "#afbdc9", borderRadius: 15, backgroundColor: "#ffffff" },
  secondaryButtonText: { color: "#183153", fontSize: 14, fontWeight: "800" },
  linkButton: { alignItems: "center", paddingVertical: 8 },
  linkButtonText: { color: "#66788a", fontSize: 13, fontWeight: "700" },
  completeCard: { gap: 14, padding: 22, borderWidth: 1, borderColor: "#9bc9ae", borderRadius: 24, backgroundColor: "#f0faf4" },
  completeTitle: { color: "#15202b", fontSize: 27, fontWeight: "900" },
  completeBody: { color: "#52606d", fontSize: 15, lineHeight: 23 },
  completeActions: { flexDirection: "row", gap: 10 },
});

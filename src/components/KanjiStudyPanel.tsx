import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { speakJapanese } from "../audio/japaneseSpeech";
import { getKanjiStrokeData } from "../content/kanjiStrokeData";
import type { KanjiItem } from "../domain/course";
import type { KanjiProgressSummary } from "../engine/kanjiProgress";
import {
  buildKanjiLearnKnowledgeResults,
  buildKanjiLearnQueue,
  buildKanjiReviewQueue,
  buildKanjiStudyResult,
  findNextKanjiCardAvailableAt,
  findNextNewKanjiId,
  findReadyKanjiCardIndex,
  kanjiStudyPartLabel,
  requeueForgottenKanjiCard,
  type KanjiStudyCard,
  type KanjiStudyMode,
  type KanjiStudyResult,
} from "../engine/kanjiStudySession";
import type { ReviewItem } from "../engine/reviewEngine";
import type { WritingGrade } from "../engine/writingSession";
import {
  SkritterExactWritingPad,
  type SkritterExactWritingMode,
  type SkritterExactWritingResult,
} from "./SkritterExactWritingPad";
import type { SkritterWritingResult } from "./SkritterWritingPad";

interface KanjiStudyPanelProps {
  mode: KanjiStudyMode;
  catalog: readonly KanjiItem[];
  progress: readonly KanjiProgressSummary[];
  reviewItems: readonly ReviewItem[];
  onRecordStudy: (item: KanjiItem, result: KanjiStudyResult) => void;
  onRecordWriting: (item: KanjiItem, result: SkritterWritingResult) => void;
  onExit: () => void;
}

interface ReviewStats {
  answered: number;
  forgotten: number;
  remembered: number;
}

const emptyStats: ReviewStats = {
  answered: 0,
  forgotten: 0,
  remembered: 0,
};

const LEARN_PART_INDEX: Record<KanjiStudyCard["part"], number> = {
  preview: 1,
  definition: 2,
  reading: 3,
  "writing-teach": 4,
  "writing-snap": 5,
  "writing-recall": 6,
};

const MARK_LEARNED_WRITING: SkritterExactWritingResult = {
  grade: 3,
  mode: "recall",
  mistakes: 0,
  attempts: 0,
  hints: 0,
  revealAll: false,
  completed: true,
};

const writingModeForPart = (
  part: KanjiStudyCard["part"],
): SkritterExactWritingMode | null => {
  switch (part) {
    case "writing-teach":
      return "teach";
    case "writing-snap":
      return "snap";
    case "writing-recall":
      return "recall";
    default:
      return null;
  }
};

function BasicGradeButtons({
  onGrade,
}: {
  onGrade: (grade: WritingGrade) => void;
}) {
  return (
    <View style={styles.gradeRow}>
      <TouchableOpacity
        style={[styles.gradeButton, styles.gradeForgot]}
        onPress={() => onGrade(1)}
      >
        <Text style={styles.gradeNumberForgot}>1</Text>
        <Text style={styles.gradeLabel}>Забыл</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.gradeButton, styles.gradeGotIt]}
        onPress={() => onGrade(3)}
      >
        <Text style={styles.gradeNumberGotIt}>3</Text>
        <Text style={styles.gradeLabel}>Знаю</Text>
      </TouchableOpacity>
    </View>
  );
}

function ReadingWord({
  written,
  literal,
}: {
  written: string;
  literal: string;
}) {
  const index = written.indexOf(literal);
  if (index < 0) return <Text style={styles.questionWord}>{written}</Text>;
  return (
    <Text style={styles.questionWord}>
      {written.slice(0, index)}
      <Text style={styles.highlightedKanji}>{literal}</Text>
      {written.slice(index + literal.length)}
    </Text>
  );
}

function WritingPrompt({
  item,
  mode,
}: {
  item: KanjiItem;
  mode: SkritterExactWritingMode;
}) {
  const example = item.examples[0];
  const recall = mode === "recall";

  return (
    <View style={styles.writingPrompt}>
      <View style={styles.writingPromptCopy}>
        <Text style={styles.writingPromptLabel}>
          {recall ? "Какой кандзи нужно написать" : "Текущий кандзи"}
        </Text>
        {!recall && <Text style={styles.writingPromptGlyph}>{item.literal}</Text>}
        <Text style={styles.writingPromptMeaning}>
          {item.meaningsRu.join(", ")}
        </Text>
        {example && (
          <>
            <Text style={styles.writingPromptReading}>
              Чтение: {example.kanjiReading}
            </Text>
            <Text style={styles.writingPromptContext}>
              Слово звучит: {example.reading} — {example.meaningRu}
            </Text>
          </>
        )}
      </View>
      {example && (
        <TouchableOpacity
          accessibilityLabel="Прослушать подсказку"
          style={styles.soundButton}
          onPress={() => void speakJapanese(example.reading)}
        >
          <Text style={styles.soundButtonText}>🔊</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function KanjiStudyPanel({
  mode,
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
    mode === "learn"
      ? buildKanjiLearnQueue(catalog, progress)
      : buildKanjiReviewQueue(catalog, reviewItems),
  );
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState<ReviewStats>(emptyStats);
  const [incorrectPending, setIncorrectPending] = useState(0);
  const [clockMs, setClockMs] = useState(() => Date.now());

  const readyCardIndex = findReadyKanjiCardIndex(queue, clockMs);
  const card = readyCardIndex >= 0 ? queue[readyCardIndex] : undefined;
  const item = card ? itemById.get(card.itemId) : undefined;
  const itemProgress = item ? progressById.get(item.id) : undefined;
  const example = item?.examples[0];
  const writingMode = card ? writingModeForPart(card.part) : null;
  const nextAvailableAt = findNextKanjiCardAvailableAt(queue, clockMs);

  useEffect(() => {
    if (nextAvailableAt === null) return;
    const delay = Math.max(25, nextAvailableAt - Date.now());
    const timer = setTimeout(() => setClockMs(Date.now()), delay);
    return () => clearTimeout(timer);
  }, [nextAvailableAt]);

  const resetReveal = () => setRevealed(false);

  const loadNextLearnItem = (currentItemId: string) => {
    const nextItemId = findNextNewKanjiId(catalog, progress, currentItemId);
    setQueue(
      nextItemId
        ? buildKanjiLearnQueue(catalog, progress, nextItemId)
        : [],
    );
    resetReveal();
  };

  const advanceLearn = () => {
    if (!card || !item) return;
    const remaining = queue.slice(1);
    if (remaining.length > 0) {
      setQueue(remaining);
      resetReveal();
      return;
    }
    loadNextLearnItem(item.id);
  };

  const completeLearnItem = (writing: SkritterExactWritingResult) => {
    if (!item || mode !== "learn") return;
    const [definitionResult, readingResult] = buildKanjiLearnKnowledgeResults(item);
    if ((itemProgress?.meaning.attempts ?? 0) === 0 && definitionResult) {
      onRecordStudy(item, definitionResult);
    }
    if ((itemProgress?.reading.attempts ?? 0) === 0 && readingResult) {
      onRecordStudy(item, readingResult);
    }
    if ((itemProgress?.writing.attempts ?? 0) === 0) {
      onRecordWriting(item, writing);
    }
    loadNextLearnItem(item.id);
  };

  const requestExit = () => {
    if (mode === "review" || !card) {
      onExit();
      return;
    }
    Alert.alert(
      "Прервать обучение?",
      "Текущий кандзи останется в Learn и при следующем запуске начнётся заново.",
      [
        { text: "Продолжить учить", style: "cancel" },
        { text: "Выйти", style: "destructive", onPress: onExit },
      ],
    );
  };

  const markAsLearned = () => {
    if (!item) return;
    Alert.alert(
      "Уже знаешь этот кандзи?",
      "Значение, чтение и письмо будут добавлены в повторение как известные.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Отметить изученным",
          onPress: () => completeLearnItem(MARK_LEARNED_WRITING),
        },
      ],
    );
  };

  const finishReviewCard = (grade: WritingGrade) => {
    if (!card || !item || card.mode !== "review") return;
    onRecordStudy(item, buildKanjiStudyResult(card, item, grade));
    setStats((previous) => ({
      answered: previous.answered + 1,
      forgotten: previous.forgotten + (grade === 1 ? 1 : 0),
      remembered: previous.remembered + (grade === 3 ? 1 : 0),
    }));
    setIncorrectPending((previous) => {
      if (grade === 1 && !card.remediation) return previous + 1;
      if (grade === 3 && card.remediation) return Math.max(0, previous - 1);
      return previous;
    });
    setQueue((previous) => {
      const remaining = previous.filter((_, index) => index !== readyCardIndex);
      return requeueForgottenKanjiCard(remaining, card, grade, Date.now());
    });
    resetReveal();
  };

  const finishWriting = (result: SkritterExactWritingResult) => {
    if (!card || !item || !writingMode) return;

    if (mode === "learn") {
      if (card.part === "writing-recall") completeLearnItem(result);
      else advanceLearn();
      return;
    }

    if (card.part !== "writing-recall") return;
    onRecordWriting(item, result);
    setStats((previous) => ({
      answered: previous.answered + 1,
      forgotten: previous.forgotten + (result.grade === 1 ? 1 : 0),
      remembered: previous.remembered + (result.grade === 3 ? 1 : 0),
    }));
    setIncorrectPending((previous) => {
      if (result.grade === 1 && !card.remediation) return previous + 1;
      if (result.grade === 3 && card.remediation) return Math.max(0, previous - 1);
      return previous;
    });
    setQueue((previous) => {
      const remaining = previous.filter((_, index) => index !== readyCardIndex);
      return requeueForgottenKanjiCard(remaining, card, result.grade, Date.now());
    });
    resetReveal();
  };

  if ((!card || !item) && queue.length > 0 && nextAvailableAt !== null) {
    const seconds = Math.max(1, Math.ceil((nextAvailableAt - clockMs) / 1000));
    return (
      <View style={styles.completeCard}>
        <Text style={styles.eyebrow}>Review · пауза</Text>
        <Text style={styles.completeTitle}>Карточка вернётся через {seconds} сек</Text>
        <Text style={styles.completeBody}>
          Оценка «Забыл» действительно выдерживает 30-секундную границу,
          а не появляется сразу в хвосте. Экран обновится автоматически.
        </Text>
        <TouchableOpacity style={styles.linkButton} onPress={onExit}>
          <Text style={styles.linkButtonText}>Выйти к списку</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!card || !item) {
    return (
      <View style={styles.completeCard}>
        <Text style={styles.eyebrow}>
          {mode === "learn" ? "Обучение завершено" : "Повторение завершено"}
        </Text>
        <Text style={styles.completeTitle}>
          {mode === "learn" ? "Новых кандзи больше нет" : "Очередь разобрана"}
        </Text>
        <Text style={styles.completeBody}>
          {mode === "learn"
            ? "Все 103 кандзи списка JLPT N5 введены в повторение."
            : `Ответов: ${stats.answered}. Забыл: ${stats.forgotten}. Знаю: ${stats.remembered}.`}
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={onExit}>
          <Text style={styles.primaryButtonText}>К списку N5</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const reviewRemaining = queue.length;
  const learnStep = LEARN_PART_INDEX[card.part];

  return (
    <View style={styles.session}>
      <View style={styles.sessionHeader}>
        <TouchableOpacity style={styles.exitButton} onPress={requestExit}>
          <Text style={styles.exitButtonText}>×</Text>
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>
            {mode === "learn" ? "Learn · JLPT N5" : "Review · JLPT N5"}
          </Text>
          <Text style={styles.counter}>
            {mode === "learn"
              ? `Этап ${learnStep}/6 · ${kanjiStudyPartLabel(card.part)}`
              : `Осталось ${reviewRemaining} · ошибок в хвосте ${incorrectPending}`}
          </Text>
        </View>
        <Text
          style={[
            styles.badge,
            card.remediation
              ? styles.retryBadge
              : mode === "learn"
                ? styles.newBadge
                : styles.reviewBadge,
          ]}
        >
          {card.remediation ? "повтор" : mode === "learn" ? "новое" : "SRS"}
        </Text>
      </View>

      {mode === "learn" && (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round((learnStep / 6) * 100)}%` as `${number}%` },
            ]}
          />
        </View>
      )}

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
          <TouchableOpacity style={styles.primaryButton} onPress={advanceLearn}>
            <Text style={styles.primaryButtonText}>Продолжить обучение</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={markAsLearned}>
            <Text style={styles.linkButtonText}>Уже знаю · отметить изученным</Text>
          </TouchableOpacity>
        </View>
      )}

      {card.part === "definition" && (
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
              {mode === "learn" ? (
                <TouchableOpacity style={styles.primaryButton} onPress={advanceLearn}>
                  <Text style={styles.primaryButtonText}>Дальше</Text>
                </TouchableOpacity>
              ) : (
                <BasicGradeButtons onGrade={finishReviewCard} />
              )}
            </View>
          )}
        </View>
      )}

      {card.part === "reading" && (
        <View style={styles.studyCard}>
          <Text style={styles.promptLabel}>Как читается выделенный знак?</Text>
          <ReadingWord written={example?.written ?? item.literal} literal={item.literal} />
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
              {mode === "learn" ? (
                <TouchableOpacity style={styles.primaryButton} onPress={advanceLearn}>
                  <Text style={styles.primaryButtonText}>Дальше</Text>
                </TouchableOpacity>
              ) : (
                <BasicGradeButtons onGrade={finishReviewCard} />
              )}
            </View>
          )}
        </View>
      )}

      {writingMode && (() => {
        const strokeData = getKanjiStrokeData(item.literal);
        if (!strokeData) {
          return (
            <View style={styles.unavailableCard}>
              <Text style={styles.unavailableTitle}>Нет проверенных данных черт</Text>
              <Text style={styles.unavailableBody}>
                {item.literal} не будет оцениваться выдуманной геометрией.
              </Text>
            </View>
          );
        }
        return (
          <View style={styles.writingCard}>
            <WritingPrompt item={item} mode={writingMode} />
            <SkritterExactWritingPad
              key={card.id}
              data={strokeData}
              mode={writingMode}
              grading={mode === "learn" ? "none" : "basic"}
              onComplete={finishWriting}
            />
          </View>
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  session: { gap: 14 },
  sessionHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  exitButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#e7eef5",
  },
  exitButtonText: { color: "#183153", fontSize: 27, lineHeight: 30 },
  headerCopy: { flex: 1, gap: 2 },
  eyebrow: {
    color: "#31546f",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  counter: { color: "#66788a", fontSize: 13, fontWeight: "700" },
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 11,
    fontWeight: "900",
  },
  newBadge: { color: "#7a4f00", backgroundColor: "#fff1c7" },
  retryBadge: { color: "#9c2f2f", backgroundColor: "#fde7e7" },
  reviewBadge: { color: "#1f6a45", backgroundColor: "#dff5e9" },
  progressTrack: {
    height: 7,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#e1e8ee",
  },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#183153" },
  studyCard: {
    gap: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d7e0e8",
    borderRadius: 24,
    backgroundColor: "#ffffff",
  },
  writingCard: {
    gap: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d7e0e8",
    borderRadius: 24,
    backgroundColor: "#ffffff",
  },
  writingPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#edf3f7",
  },
  writingPromptCopy: { flex: 1, gap: 3 },
  writingPromptLabel: {
    color: "#52606d",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  writingPromptGlyph: {
    color: "#15202b",
    fontSize: 46,
    lineHeight: 54,
    fontWeight: "600",
  },
  writingPromptMeaning: {
    color: "#15202b",
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
  },
  writingPromptReading: { color: "#31546f", fontSize: 15, fontWeight: "800" },
  writingPromptContext: { color: "#66788a", fontSize: 13, lineHeight: 18 },
  previewGlyph: {
    textAlign: "center",
    color: "#15202b",
    fontSize: 108,
    lineHeight: 128,
    fontWeight: "500",
  },
  previewMeaning: { textAlign: "center", color: "#15202b", fontSize: 22, fontWeight: "900" },
  answerBox: { gap: 6, padding: 14, borderRadius: 17, backgroundColor: "#f2f6f9" },
  wordRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  wordCopy: { flex: 1, gap: 2 },
  word: { color: "#15202b", fontSize: 27, fontWeight: "900" },
  reading: { color: "#31546f", fontSize: 16 },
  translation: { color: "#66788a", fontSize: 14, textAlign: "center" },
  focusReading: { color: "#183153", fontSize: 14, fontWeight: "800" },
  soundButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    backgroundColor: "#e1eaf1",
  },
  soundButtonText: { fontSize: 19 },
  promptLabel: { textAlign: "center", color: "#52606d", fontSize: 15, fontWeight: "800" },
  questionGlyph: { textAlign: "center", color: "#15202b", fontSize: 118, lineHeight: 138 },
  questionWord: { textAlign: "center", color: "#15202b", fontSize: 40, fontWeight: "900" },
  highlightedKanji: { color: "#c44747", textDecorationLine: "underline" },
  revealButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#183153",
  },
  revealButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  revealedArea: { gap: 13 },
  answerTitle: { color: "#15202b", fontSize: 22, fontWeight: "900" },
  answerDetail: { color: "#52606d", fontSize: 14, lineHeight: 20 },
  gradeRow: { flexDirection: "row", gap: 10 },
  gradeButton: {
    flex: 1,
    minHeight: 88,
    alignItems: "center",
    justifyContent: "center",
    padding: 9,
    borderWidth: 2,
    borderRadius: 15,
    backgroundColor: "#ffffff",
  },
  gradeForgot: { borderColor: "#c44747" },
  gradeGotIt: { borderColor: "#2e7d55" },
  gradeNumberForgot: { color: "#c44747", fontSize: 24, fontWeight: "900" },
  gradeNumberGotIt: { color: "#2e7d55", fontSize: 24, fontWeight: "900" },
  gradeLabel: { color: "#263746", fontSize: 13, fontWeight: "900" },
  primaryButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: "#183153",
  },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
  linkButton: { alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  linkButtonText: { color: "#52606d", fontSize: 13, fontWeight: "800" },
  completeCard: {
    gap: 12,
    padding: 22,
    borderWidth: 1,
    borderColor: "#bfd5c7",
    borderRadius: 24,
    backgroundColor: "#f1faf4",
  },
  completeTitle: { color: "#15202b", fontSize: 25, fontWeight: "900" },
  completeBody: { color: "#52606d", fontSize: 15, lineHeight: 22 },
  unavailableCard: {
    gap: 7,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e0c7c7",
    borderRadius: 18,
    backgroundColor: "#fff8f8",
  },
  unavailableTitle: { color: "#8a3030", fontSize: 16, fontWeight: "900" },
  unavailableBody: { color: "#6c5050", fontSize: 13, lineHeight: 19 },
});

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Circle,
  Line,
  Path,
  Polyline,
  Text as SvgText,
} from "react-native-svg";

import type {
  KanjiStrokeData,
  KanjiStrokePoint,
} from "../domain/kanjiStroke";
import {
  assessKanjiStroke,
  kanjiStrokeIssueMessage,
  normalizePadStroke,
} from "../engine/kanjiStrokeEngine";
import {
  getSkritterPressGesture,
  isSkritterSwipeUp,
  SKRITTER_PRESS_HOLD_MS,
} from "../engine/skritterWritingGestures";
import type { WritingGrade, WritingMode } from "../engine/writingSession";

export type SkritterExactWritingMode = "teach" | "snap" | "recall";
export type SkritterExactGrading = "none" | "basic" | "advanced";

export interface SkritterExactWritingResult {
  grade: WritingGrade;
  mode: WritingMode;
  mistakes: number;
  attempts: number;
  hints: number;
  revealAll: boolean;
  completed: boolean;
}

interface SkritterExactWritingPadProps {
  data: KanjiStrokeData;
  mode: SkritterExactWritingMode;
  grading: SkritterExactGrading;
  gradeIntervalLabels?: Partial<Record<WritingGrade, string>>;
  onComplete: (result: SkritterExactWritingResult) => void;
}

type PadPhase = "input" | "revealed" | "grading" | "done";

const pointDistance = (
  left: KanjiStrokePoint,
  right: KanjiStrokePoint,
): number => Math.hypot(right.x - left.x, right.y - left.y);

const polylineValue = (points: readonly KanjiStrokePoint[]): string =>
  points.map((point) => `${point.x},${point.y}`).join(" ");

const resultMode = (mode: SkritterExactWritingMode): WritingMode =>
  mode === "snap" ? "guided" : mode;

const failureLimit = (strokeCount: number): number => {
  if (strokeCount > 6) return 3;
  if (strokeCount > 2) return 2;
  return 1;
};

const gradeLabel = (grade: WritingGrade): string => {
  switch (grade) {
    case 1:
      return "Забыл";
    case 2:
      return "Трудно";
    case 3:
      return "Знаю";
    case 4:
      return "Легко";
  }
};

const gradeColor = (grade: WritingGrade): string => {
  switch (grade) {
    case 1:
      return "#c44747";
    case 2:
      return "#b97817";
    case 3:
      return "#2e7d55";
    case 4:
      return "#2e609d";
  }
};

const modeTitle = (mode: SkritterExactWritingMode): string => {
  switch (mode) {
    case "teach":
      return "Изучи порядок черт";
    case "snap":
      return "Напиши поверх контура";
    case "recall":
      return "Напиши по памяти";
  }
};

const modeInstruction = (mode: SkritterExactWritingMode): string => {
  switch (mode) {
    case "teach":
      return "Следуй за синей анимацией. Принятый штрих притянется к эталону.";
    case "snap":
      return "Весь знак виден бледным контуром. Пиши в правильном порядке.";
    case "recall":
      return "Знак скрыт. Удерживай один палец для следующей черты, два — для всего ответа.";
  }
};

export const hiddenLearnWritingGrade = (
  manualReveal: boolean,
  revealAll: boolean,
): WritingGrade => (manualReveal || revealAll ? 1 : 3);

export function SkritterExactWritingPad({
  data,
  mode,
  grading,
  gradeIntervalLabels,
  onComplete,
}: SkritterExactWritingPadProps) {
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [currentStroke, setCurrentStroke] = useState<KanjiStrokePoint[]>([]);
  const [rejectedStroke, setRejectedStroke] = useState<KanjiStrokePoint[]>([]);
  const [padSize, setPadSize] = useState({ width: 0, height: 0 });
  const [mistakes, setMistakes] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [hints, setHints] = useState(0);
  const [revealedAll, setRevealedAll] = useState(false);
  const [forcedForgotten, setForcedForgotten] = useState(false);
  const [hintStrokeIndex, setHintStrokeIndex] = useState<number | null>(null);
  const [teachingSampleCount, setTeachingSampleCount] = useState(1);
  const [phase, setPhase] = useState<PadPhase>("input");
  const [feedback, setFeedback] = useState(modeInstruction(mode));

  const currentStrokeRef = useRef<KanjiStrokePoint[]>([]);
  const gestureStartedAtRef = useRef(0);
  const gesturePointerCountRef = useRef(1);
  const holdTriggeredRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rejectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionSentRef = useRef(false);
  const forcedForgottenRef = useRef(false);
  const manualRevealRef = useRef(false);
  const hintsRef = useRef(0);
  const mistakesRef = useRef(0);
  const attemptsRef = useRef(0);
  const revealedAllRef = useRef(false);

  const activeIndex = acceptedCount;
  const activeStroke = data.strokes[activeIndex];
  const inputLocked = phase !== "input";
  const showFullGuide = mode === "teach" || mode === "snap" || revealedAll;
  const showActiveHint = mode === "teach" || hintStrokeIndex === activeIndex;
  const canvasSize = Math.min(padSize.width, padSize.height);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
  }, []);

  const clearTimers = useCallback(() => {
    clearHoldTimer();
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    if (rejectTimerRef.current) clearTimeout(rejectTimerRef.current);
    hintTimerRef.current = null;
    rejectTimerRef.current = null;
  }, [clearHoldTimer]);

  const setForgotten = useCallback(() => {
    forcedForgottenRef.current = true;
    setForcedForgotten(true);
  }, []);

  const addHint = useCallback(
    (manual: boolean) => {
      const next = hintsRef.current + 1;
      hintsRef.current = next;
      setHints(next);
      if (manual) {
        manualRevealRef.current = true;
        setForgotten();
      }
      return next;
    },
    [setForgotten],
  );

  const reset = useCallback(() => {
    clearTimers();
    currentStrokeRef.current = [];
    gestureStartedAtRef.current = 0;
    gesturePointerCountRef.current = 1;
    holdTriggeredRef.current = false;
    completionSentRef.current = false;
    forcedForgottenRef.current = false;
    manualRevealRef.current = false;
    hintsRef.current = 0;
    mistakesRef.current = 0;
    attemptsRef.current = 0;
    revealedAllRef.current = false;
    setAcceptedCount(0);
    setCurrentStroke([]);
    setRejectedStroke([]);
    setMistakes(0);
    setAttempts(0);
    setConsecutiveFailures(0);
    setHints(0);
    setRevealedAll(false);
    setForcedForgotten(false);
    setHintStrokeIndex(null);
    setTeachingSampleCount(1);
    setPhase("input");
    setFeedback(modeInstruction(mode));
  }, [clearTimers, mode]);

  useEffect(() => {
    reset();
  }, [data.literal, mode, reset]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (mode !== "teach" || !activeStroke || phase !== "input") {
      setTeachingSampleCount(1);
      return;
    }
    const sampleCount = Math.max(activeStroke.samples.length, 2);
    const timer = setInterval(() => {
      setTeachingSampleCount((previous) =>
        previous >= sampleCount ? 1 : previous + 1,
      );
    }, 55);
    return () => clearInterval(timer);
  }, [activeStroke, mode, phase]);

  const emitResult = useCallback(
    (grade: WritingGrade) => {
      if (completionSentRef.current) return;
      completionSentRef.current = true;
      setPhase("done");
      onComplete({
        grade,
        mode: resultMode(mode),
        mistakes: mistakesRef.current,
        attempts: attemptsRef.current,
        hints: hintsRef.current,
        revealAll: revealedAllRef.current,
        completed: true,
      });
    },
    [mode, onComplete],
  );

  const getHiddenGrade = useCallback(
    (): WritingGrade => hiddenLearnWritingGrade(
      manualRevealRef.current,
      revealedAllRef.current,
    ),
    [],
  );

  const finishCharacter = useCallback(() => {
    if (grading === "none") {
      const hiddenGrade = getHiddenGrade();
      setPhase("done");
      setFeedback(
        hiddenGrade === 1 ? "Готово. Письмо вернётся скоро." : "Готово.",
      );
      emitResult(hiddenGrade);
      return;
    }

    const forgotten =
      forcedForgottenRef.current ||
      revealedAllRef.current ||
      mistakesRef.current > failureLimit(data.strokes.length);
    if (forgotten) setForgotten();
    setPhase("grading");
    setFeedback(
      forgotten
        ? "Подсказка или ошибки зафиксировали оценку «Забыл»."
        : "Знак завершён. Оцени ответ.",
    );
  }, [data.strokes.length, emitResult, getHiddenGrade, grading, setForgotten]);

  const showNextStroke = useCallback(
    (automatic = false) => {
      if (!activeStroke || inputLocked) return;
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      addHint(!automatic);
      setHintStrokeIndex(activeIndex);
      setFeedback(
        automatic
          ? "Три ошибки подряд: показываю следующую черту."
          : "Следующая черта показана.",
      );
      hintTimerRef.current = setTimeout(() => {
        setHintStrokeIndex(null);
        hintTimerRef.current = null;
      }, data.strokes.length < 10 ? 1200 : 1800);
    }, [activeIndex, activeStroke, addHint, data.strokes.length, inputLocked]);

  const revealWholeCharacter = useCallback(() => {
    if (inputLocked || mode !== "recall") return;
    addHint(true);
    revealedAllRef.current = true;
    setRevealedAll(true);
    setHintStrokeIndex(null);
    setFeedback(
      grading === "none"
        ? "Ответ открыт. Письмо будет отмечено как забытое."
        : "Ответ открыт полностью. Оценка — «Забыл».",
    );
    if (grading === "none") setPhase("revealed");
    else setPhase("grading");
  }, [addHint, grading, inputLocked, mode]);

  const rejectStroke = useCallback(
    (drawn: readonly KanjiStrokePoint[], message: string) => {
      const nextMistakes = mistakesRef.current + 1;
      const nextAttempts = attemptsRef.current + 1;
      const nextFailures = consecutiveFailures + 1;
      mistakesRef.current = nextMistakes;
      attemptsRef.current = nextAttempts;
      setMistakes(nextMistakes);
      setAttempts(nextAttempts);
      setConsecutiveFailures(nextFailures);
      setRejectedStroke(normalizePadStroke(drawn, padSize.width, padSize.height));
      setFeedback(message);
      if (rejectTimerRef.current) clearTimeout(rejectTimerRef.current);
      rejectTimerRef.current = setTimeout(() => {
        setRejectedStroke([]);
        rejectTimerRef.current = null;
      }, 420);

      if (
        grading !== "none" &&
        nextMistakes > failureLimit(data.strokes.length)
      ) {
        setForgotten();
      }
      if (nextFailures >= 3) {
        setConsecutiveFailures(0);
        showNextStroke(true);
      }
    }, [
      consecutiveFailures,
      data.strokes.length,
      grading,
      padSize.height,
      padSize.width,
      setForgotten,
      showNextStroke,
    ],
  );

  const acceptStroke = useCallback(
    (drawn: readonly KanjiStrokePoint[]) => {
      if (!activeStroke || padSize.width <= 0 || padSize.height <= 0) return;
      const assessment = assessKanjiStroke(
        drawn,
        activeStroke,
        padSize.width,
        padSize.height,
      );
      if (!assessment.accepted) {
        rejectStroke(drawn, kanjiStrokeIssueMessage(assessment.issue));
        return;
      }

      const nextAttempts = attemptsRef.current + 1;
      const nextAccepted = acceptedCount + 1;
      attemptsRef.current = nextAttempts;
      setAttempts(nextAttempts);
      setAcceptedCount(nextAccepted);
      setConsecutiveFailures(0);
      setHintStrokeIndex(null);
      setTeachingSampleCount(1);

      if (nextAccepted >= data.strokes.length) {
        finishCharacter();
      } else {
        setFeedback(`Штрих ${nextAccepted} принят.`);
      }
    }, [
      acceptedCount,
      activeStroke,
      data.strokes.length,
      finishCharacter,
      padSize.height,
      padSize.width,
      rejectStroke,
    ],
  );

  const triggerHoldGesture = useCallback(() => {
    const gesture = getSkritterPressGesture(
      currentStrokeRef.current,
      canvasSize,
      gesturePointerCountRef.current,
      Date.now() - gestureStartedAtRef.current,
    );
    holdTimerRef.current = null;
    if (!gesture || inputLocked) return;

    holdTriggeredRef.current = true;
    currentStrokeRef.current = [];
    setCurrentStroke([]);
    if (gesture === "single-hold") {
      showNextStroke(false);
    } else if (mode === "recall") {
      revealWholeCharacter();
    }
  }, [canvasSize, inputLocked, mode, revealWholeCharacter, showNextStroke]);

  const beginHoldTimer = useCallback(() => {
    clearHoldTimer();
    holdTimerRef.current = setTimeout(
      triggerHoldGesture,
      SKRITTER_PRESS_HOLD_MS,
    );
  }, [clearHoldTimer, triggerHoldGesture]);

  const finishInput = useCallback(() => {
    clearHoldTimer();
    const drawn = currentStrokeRef.current;
    currentStrokeRef.current = [];
    setCurrentStroke([]);

    if (holdTriggeredRef.current) {
      holdTriggeredRef.current = false;
      return;
    }
    if (inputLocked || drawn.length === 0) return;

    if (isSkritterSwipeUp(drawn, canvasSize, true)) {
      reset();
      return;
    }

    const first = drawn[0];
    const last = drawn.at(-1);
    if (!first || !last || pointDistance(first, last) <= 2) return;
    acceptStroke(drawn);
  }, [acceptStroke, canvasSize, clearHoldTimer, inputLocked, reset]);

  const cancelInput = useCallback(() => {
    clearHoldTimer();
    holdTriggeredRef.current = false;
    currentStrokeRef.current = [];
    setCurrentStroke([]);
  }, [clearHoldTimer]);

  const responder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => !inputLocked,
      onMoveShouldSetPanResponder: () => !inputLocked,
      onPanResponderGrant: (event, gestureState) => {
        gestureStartedAtRef.current = Date.now();
        gesturePointerCountRef.current = Math.max(
          1,
          gestureState.numberActiveTouches,
          event.nativeEvent.touches.length,
        );
        holdTriggeredRef.current = false;
        const point = {
          x: event.nativeEvent.locationX,
          y: event.nativeEvent.locationY,
        };
        currentStrokeRef.current = [point];
        setCurrentStroke([point]);
        beginHoldTimer();
      },
      onPanResponderStart: (event, gestureState) => {
        gesturePointerCountRef.current = Math.max(
          gesturePointerCountRef.current,
          gestureState.numberActiveTouches,
          event.nativeEvent.touches.length,
        );
      },
      onPanResponderMove: (event, gestureState) => {
        gesturePointerCountRef.current = Math.max(
          gesturePointerCountRef.current,
          gestureState.numberActiveTouches,
          event.nativeEvent.touches.length,
        );
        const point = {
          x: event.nativeEvent.locationX,
          y: event.nativeEvent.locationY,
        };
        const previous = currentStrokeRef.current.at(-1);
        if (previous && pointDistance(previous, point) < 1.8) return;
        currentStrokeRef.current = [...currentStrokeRef.current, point];
        setCurrentStroke(currentStrokeRef.current);
      },
      onPanResponderRelease: finishInput,
      onPanResponderTerminate: cancelInput,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
    }),
    [beginHoldTimer, cancelInput, finishInput, inputLocked],
  );

  const normalizedCurrent = normalizePadStroke(
    currentStroke,
    padSize.width,
    padSize.height,
  );
  const teachingSamples = activeStroke?.samples.slice(0, teachingSampleCount) ?? [];
  const availableGrades: readonly WritingGrade[] =
    grading === "advanced" ? [1, 2, 3, 4] : [1, 3];
  const maximumGrade: WritingGrade = forcedForgotten ? 1 : 4;

  return (
    <View style={styles.wrapper}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>{modeTitle(mode)}</Text>
          <Text style={styles.progress}>
            {Math.min(acceptedCount, data.strokes.length)}/{data.strokes.length} черт
          </Text>
        </View>
        <View style={styles.metrics}>
          <Text style={styles.metric}>Ошибки {mistakes}</Text>
          <Text style={styles.metric}>Подсказки {hints}</Text>
        </View>
      </View>

      <Text style={styles.instruction}>{modeInstruction(mode)}</Text>

      <View
        accessibilityLabel={`Поле письма ${data.literal}`}
        style={styles.pad}
        onLayout={(event) => setPadSize(event.nativeEvent.layout)}
        {...responder.panHandlers}
      >
        <Svg
          pointerEvents="none"
          width="100%"
          height="100%"
          viewBox={data.viewBox.join(" ")}
        >
          <Line x1="54.5" y1="0" x2="54.5" y2="109" stroke="#d8e0e7" strokeWidth="0.65" />
          <Line x1="0" y1="54.5" x2="109" y2="54.5" stroke="#d8e0e7" strokeWidth="0.65" />
          <Line x1="0" y1="0" x2="109" y2="109" stroke="#edf1f4" strokeWidth="0.45" />
          <Line x1="109" y1="0" x2="0" y2="109" stroke="#edf1f4" strokeWidth="0.45" />

          {showFullGuide && data.strokes.map((stroke, index) => (
            <Path
              key={`guide-${index}`}
              d={stroke.path}
              fill="none"
              stroke={revealedAll ? "#4f9c70" : "#c3ced8"}
              strokeWidth={mode === "teach" && index === activeIndex ? 4.1 : 2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={
                revealedAll
                  ? 0.65
                  : mode === "snap"
                    ? 0.5
                    : index === activeIndex
                      ? 0.75
                      : 0.28
              }
            />
          ))}

          {data.strokes.slice(0, acceptedCount).map((stroke, index) => (
            <Path
              key={`accepted-${index}`}
              d={stroke.path}
              fill="none"
              stroke="#152b44"
              strokeWidth="4.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {activeStroke && showActiveHint && phase === "input" && (
            <Path
              d={activeStroke.path}
              fill="none"
              stroke="#2f91cb"
              strokeWidth="4.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={hintStrokeIndex === activeIndex ? 0.95 : 0.46}
            />
          )}

          {teachingSamples.length > 1 && phase === "input" && (
            <Polyline
              points={polylineValue(teachingSamples)}
              fill="none"
              stroke="#157ab5"
              strokeWidth="5.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {normalizedCurrent.length > 0 && (
            <Polyline
              points={polylineValue(normalizedCurrent)}
              fill="none"
              stroke="#101820"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {rejectedStroke.length > 0 && (
            <Polyline
              points={polylineValue(rejectedStroke)}
              fill="none"
              stroke="#d24b4b"
              strokeWidth="4.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.82"
            />
          )}

          {activeStroke &&
            phase === "input" &&
            (mode !== "recall" || hintStrokeIndex === activeIndex) && (
              <>
                <Circle
                  cx={activeStroke.start.x}
                  cy={activeStroke.start.y}
                  r="5.7"
                  fill="#c44747"
                />
                <SvgText
                  x={activeStroke.start.x}
                  y={activeStroke.start.y + 2.5}
                  fontSize="7"
                  fontWeight="800"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  {activeIndex + 1}
                </SvgText>
              </>
            )}
        </Svg>
      </View>

      <Text style={styles.feedback}>{feedback}</Text>

      {phase === "input" && mode === "recall" && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => showNextStroke(false)}
          >
            <Text style={styles.actionButtonText}>Одна черта</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={revealWholeCharacter}
          >
            <Text style={styles.actionButtonText}>Показать всё</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={reset}>
            <Text style={styles.actionButtonText}>Стереть</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === "input" && mode !== "recall" && (
        <TouchableOpacity style={styles.resetButton} onPress={reset}>
          <Text style={styles.resetButtonText}>Начать заново</Text>
        </TouchableOpacity>
      )}

      {phase === "revealed" && (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => emitResult(1)}
        >
          <Text style={styles.continueButtonText}>Дальше</Text>
        </TouchableOpacity>
      )}

      {phase === "grading" && (
        <View style={styles.gradingCard}>
          <Text style={styles.gradingTitle}>Оцени ответ</Text>
          <View style={styles.gradeRow}>
            {availableGrades.map((grade) => {
              const disabled = grade > maximumGrade;
              return (
                <TouchableOpacity
                  key={grade}
                  disabled={disabled}
                  style={[
                    styles.gradeButton,
                    { borderColor: gradeColor(grade) },
                    disabled && styles.disabled,
                  ]}
                  onPress={() => emitResult(grade)}
                >
                  <Text
                    style={[styles.gradeNumber, { color: gradeColor(grade) }]}
                  >
                    {grade}
                  </Text>
                  <Text style={styles.gradeLabel}>{gradeLabel(grade)}</Text>
                  {gradeIntervalLabels?.[grade] && (
                    <Text style={styles.gradeInterval}>
                      {gradeIntervalLabels[grade]}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.gradingHint}>
            {forcedForgotten
              ? "После подсказки или показа ответа доступно только «Забыл»."
              : grading === "basic"
                ? "Обычный режим: «Забыл» или «Знаю»."
                : "Advanced Grading: четыре оценки."}
          </Text>
        </View>
      )}

      {mode === "recall" && phase === "input" && (
        <Text style={styles.gestureHint}>
          Удержание одним пальцем — следующая черта · двумя — весь знак · длинный свайп вверх — стереть.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headingCopy: { flex: 1 },
  title: { color: "#15202b", fontSize: 19, fontWeight: "900" },
  progress: { marginTop: 2, color: "#66788a", fontSize: 13 },
  metrics: { alignItems: "flex-end", gap: 3 },
  metric: { color: "#66788a", fontSize: 11, fontWeight: "700" },
  instruction: { color: "#52606d", fontSize: 14, lineHeight: 20 },
  pad: {
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#c9d5df",
    borderRadius: 22,
    backgroundColor: "#fbfcfd",
  },
  feedback: { minHeight: 40, color: "#52606d", fontSize: 14, lineHeight: 20 },
  actionRow: { flexDirection: "row", gap: 8 },
  actionButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#b9c7d3",
    borderRadius: 13,
    backgroundColor: "#ffffff",
  },
  actionButtonText: { color: "#263f57", fontSize: 12, fontWeight: "800" },
  resetButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#b9c7d3",
    borderRadius: 13,
    backgroundColor: "#ffffff",
  },
  resetButtonText: { color: "#263f57", fontSize: 13, fontWeight: "800" },
  continueButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#183153",
  },
  continueButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
  gradingCard: {
    gap: 10,
    padding: 13,
    borderWidth: 1,
    borderColor: "#d3dde5",
    borderRadius: 16,
    backgroundColor: "#f8fafc",
  },
  gradingTitle: { color: "#15202b", fontSize: 16, fontWeight: "900" },
  gradeRow: { flexDirection: "row", gap: 8 },
  gradeButton: {
    flex: 1,
    minHeight: 78,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 13,
    backgroundColor: "#ffffff",
  },
  gradeNumber: { fontSize: 21, fontWeight: "900" },
  gradeLabel: { marginTop: 2, color: "#263746", fontSize: 12, fontWeight: "800" },
  gradeInterval: { marginTop: 3, color: "#71808d", fontSize: 10, fontWeight: "700" },
  gradingHint: { color: "#66788a", fontSize: 12, lineHeight: 17 },
  gestureHint: { color: "#7b8794", fontSize: 11, lineHeight: 16 },
  disabled: { opacity: 0.3 },
});

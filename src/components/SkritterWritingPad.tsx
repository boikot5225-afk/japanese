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
  deriveAutomaticWritingGrade,
  getMaximumWritingGrade,
  getWritingGradeDefinition,
  type WritingGrade,
  type WritingMode,
  writingModeLabel,
  WRITING_GRADE_DEFINITIONS,
} from "../engine/writingSession";

export interface SkritterWritingResult {
  grade: WritingGrade;
  mode: WritingMode;
  mistakes: number;
  attempts: number;
  hints: number;
  revealAll: boolean;
  completed: boolean;
}

interface SkritterWritingPadProps {
  data: KanjiStrokeData;
  initialMode?: WritingMode;
  disabled?: boolean;
  compact?: boolean;
  allowModeSelection?: boolean;
  autoAdvance?: boolean;
  gradeIntervalLabels?: Partial<Record<WritingGrade, string>>;
  onComplete: (result: SkritterWritingResult) => void;
}

const TAP_DELAY_MS = 270;
const AUTO_ADVANCE_MS = 2600;

const pointDistance = (left: KanjiStrokePoint, right: KanjiStrokePoint): number =>
  Math.hypot(right.x - left.x, right.y - left.y);

const polylineLength = (points: readonly KanjiStrokePoint[]): number =>
  points.slice(1).reduce(
    (sum, current, index) =>
      sum + pointDistance(points[index] as KanjiStrokePoint, current),
    0,
  );

const polylineValue = (points: readonly KanjiStrokePoint[]): string =>
  points.map((item) => `${item.x},${item.y}`).join(" ");

const gradeColor = (grade: WritingGrade): string => {
  switch (grade) {
    case 1:
      return "#b74343";
    case 2:
      return "#b87916";
    case 3:
      return "#2d7a52";
    case 4:
      return "#2e5f9c";
  }
};

const modeInstruction = (mode: WritingMode): string => {
  switch (mode) {
    case "teach":
      return "Следуй синей анимации. Правильный штрих прилипнет к эталону.";
    case "guided":
      return "Пиши поверх бледного контура. Порядок и форма проверяются.";
    case "recall":
      return "Напиши знак по памяти. Одно касание — следующая черта, двойное — весь ответ.";
    case "freeform":
      return "Напиши знак целиком без распознавания по чертам, затем сравни и оцени себя.";
  }
};

export function SkritterWritingPad({
  data,
  initialMode = "recall",
  disabled = false,
  compact = false,
  allowModeSelection = true,
  autoAdvance = false,
  gradeIntervalLabels,
  onComplete,
}: SkritterWritingPadProps) {
  const [mode, setMode] = useState<WritingMode>(initialMode);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [freeformStrokes, setFreeformStrokes] = useState<KanjiStrokePoint[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<KanjiStrokePoint[]>([]);
  const [rejectedStroke, setRejectedStroke] = useState<KanjiStrokePoint[]>([]);
  const [padSize, setPadSize] = useState({ width: 0, height: 0 });
  const [mistakes, setMistakes] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [hints, setHints] = useState(0);
  const [revealedAll, setRevealedAll] = useState(false);
  const [showAllGuide, setShowAllGuide] = useState(false);
  const [hintStrokeIndex, setHintStrokeIndex] = useState<number | null>(null);
  const [teachingEnabled, setTeachingEnabled] = useState(initialMode === "teach");
  const [teachingSampleCount, setTeachingSampleCount] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [awaitingGrade, setAwaitingGrade] = useState(false);
  const [suggestedGrade, setSuggestedGrade] = useState<WritingGrade>(3);
  const [maximumGrade, setMaximumGrade] = useState<WritingGrade>(4);
  const [submittedGrade, setSubmittedGrade] = useState<WritingGrade | null>(null);
  const [feedback, setFeedback] = useState(modeInstruction(initialMode));
  const [autoRemaining, setAutoRemaining] = useState<number | null>(null);

  const currentStrokeRef = useRef<KanjiStrokePoint[]>([]);
  const gestureStartedAtRef = useRef(0);
  const lastTapAtRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rejectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gradeSubmittedRef = useRef(false);

  const activeIndex = acceptedCount;
  const activeStroke = data.strokes[activeIndex];
  const inputLocked = disabled || gradeSubmittedRef.current || awaitingGrade;
  const fullGuideVisible =
    mode === "teach" ||
    mode === "guided" ||
    showAllGuide ||
    (mode === "freeform" && awaitingGrade);
  const activeHintVisible =
    hintStrokeIndex === activeIndex || teachingEnabled || mode === "teach";

  const clearTimers = useCallback(() => {
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    if (rejectTimerRef.current) clearTimeout(rejectTimerRef.current);
    tapTimerRef.current = null;
    hintTimerRef.current = null;
    rejectTimerRef.current = null;
  }, []);

  const resetSession = useCallback(
    (nextMode: WritingMode = mode) => {
      clearTimers();
      currentStrokeRef.current = [];
      gestureStartedAtRef.current = 0;
      lastTapAtRef.current = 0;
      gradeSubmittedRef.current = false;
      setAcceptedCount(0);
      setFreeformStrokes([]);
      setCurrentStroke([]);
      setRejectedStroke([]);
      setMistakes(0);
      setAttempts(0);
      setConsecutiveFailures(0);
      setHints(0);
      setRevealedAll(false);
      setShowAllGuide(false);
      setHintStrokeIndex(null);
      setTeachingEnabled(nextMode === "teach");
      setTeachingSampleCount(1);
      setCompleted(false);
      setAwaitingGrade(false);
      setSuggestedGrade(3);
      setMaximumGrade(4);
      setSubmittedGrade(null);
      setAutoRemaining(null);
      setFeedback(modeInstruction(nextMode));
    },
    [clearTimers, mode],
  );

  useEffect(() => {
    setMode(initialMode);
    resetSession(initialMode);
  }, [data.literal, initialMode]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (!activeStroke || !(teachingEnabled || mode === "teach")) {
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
  }, [activeStroke, mode, teachingEnabled]);

  const metricsFor = useCallback(
    (
      nextCompleted: boolean,
      nextMistakes = mistakes,
      nextAttempts = attempts,
      nextHints = hints,
      nextRevealAll = revealedAll,
    ) => ({
      mode,
      strokeCount: data.strokes.length,
      mistakes: nextMistakes,
      attempts: nextAttempts,
      hints: nextHints,
      revealAll: nextRevealAll,
      completed: nextCompleted,
    }),
    [attempts, data.strokes.length, hints, mistakes, mode, revealedAll],
  );

  const enterGrading = useCallback(
    (
      grade: WritingGrade,
      message: string,
      nextCompleted = true,
    ) => {
      setCompleted(nextCompleted);
      setAwaitingGrade(true);
      setSuggestedGrade(grade);
      setMaximumGrade(grade <= 2 ? grade : 4);
      setFeedback(message);
      setAutoRemaining(autoAdvance ? AUTO_ADVANCE_MS : null);
    },
    [autoAdvance],
  );

  const submitGrade = useCallback(
    (grade: WritingGrade) => {
      if (disabled || gradeSubmittedRef.current) return;
      const safeGrade = Math.min(grade, maximumGrade) as WritingGrade;
      gradeSubmittedRef.current = true;
      setSubmittedGrade(safeGrade);
      setAutoRemaining(null);
      const definition = getWritingGradeDefinition(safeGrade);
      setFeedback(`${definition.label}. Результат записан в повторение.`);
      onComplete({
        grade: safeGrade,
        mode,
        mistakes,
        attempts,
        hints,
        revealAll: revealedAll,
        completed: true,
      });
    },
    [attempts, disabled, hints, maximumGrade, mistakes, mode, onComplete, revealedAll],
  );

  useEffect(() => {
    if (!awaitingGrade || !autoAdvance || submittedGrade !== null) {
      setAutoRemaining(null);
      return;
    }
    const startedAt = Date.now();
    setAutoRemaining(AUTO_ADVANCE_MS);
    const interval = setInterval(() => {
      setAutoRemaining(Math.max(0, AUTO_ADVANCE_MS - (Date.now() - startedAt)));
    }, 100);
    const timeout = setTimeout(() => submitGrade(suggestedGrade), AUTO_ADVANCE_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [autoAdvance, awaitingGrade, submitGrade, submittedGrade, suggestedGrade]);

  const showNextStrokeHint = useCallback(
    (automatic = false) => {
      if (!activeStroke || awaitingGrade) return;
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      const nextHints = hints + 1;
      setHints(nextHints);
      setHintStrokeIndex(activeIndex);
      setFeedback(
        automatic
          ? "Три ошибки подряд: показываю следующую черту."
          : "Следующая черта подсвечена на несколько секунд.",
      );
      hintTimerRef.current = setTimeout(() => {
        setHintStrokeIndex(null);
        hintTimerRef.current = null;
      }, data.strokes.length < 10 ? 1200 : 1800);
    },
    [activeIndex, activeStroke, awaitingGrade, data.strokes.length, hints],
  );

  const revealWholeCharacter = useCallback(() => {
    if (awaitingGrade) return;
    const nextHints = hints + 1;
    setHints(nextHints);
    setRevealedAll(true);
    setShowAllGuide(true);
    setTeachingEnabled(false);
    enterGrading(1, "Ответ открыт полностью. Оценка снижена до «Забыл».");
  }, [awaitingGrade, enterGrading, hints]);

  const handleTap = useCallback(() => {
    if (mode === "freeform" || awaitingGrade) return;
    const now = Date.now();
    if (now - lastTapAtRef.current <= TAP_DELAY_MS) {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
      lastTapAtRef.current = 0;
      revealWholeCharacter();
      return;
    }
    lastTapAtRef.current = now;
    tapTimerRef.current = setTimeout(() => {
      showNextStrokeHint(false);
      tapTimerRef.current = null;
    }, TAP_DELAY_MS);
  }, [awaitingGrade, mode, revealWholeCharacter, showNextStrokeHint]);

  const rejectStroke = useCallback(
    (drawn: readonly KanjiStrokePoint[], message: string) => {
      const nextMistakes = mistakes + 1;
      const nextAttempts = attempts + 1;
      const nextFailures = consecutiveFailures + 1;
      setMistakes(nextMistakes);
      setAttempts(nextAttempts);
      setConsecutiveFailures(nextFailures);
      setRejectedStroke(
        normalizePadStroke(drawn, padSize.width, padSize.height),
      );
      setFeedback(message);
      if (rejectTimerRef.current) clearTimeout(rejectTimerRef.current);
      rejectTimerRef.current = setTimeout(() => {
        setRejectedStroke([]);
        rejectTimerRef.current = null;
      }, 420);
      if (nextFailures >= 3) {
        setConsecutiveFailures(0);
        showNextStrokeHint(true);
      }
    },
    [
      attempts,
      consecutiveFailures,
      mistakes,
      padSize.height,
      padSize.width,
      showNextStrokeHint,
    ],
  );

  const finishRecognizedStroke = useCallback(
    (drawn: readonly KanjiStrokePoint[]) => {
      if (!activeStroke || padSize.width <= 0 || padSize.height <= 0) return;
      const assessment = assessKanjiStroke(
        drawn,
        activeStroke,
        padSize.width,
        padSize.height,
      );
      const guidedAcceptance =
        (mode === "teach" || mode === "guided") &&
        assessment.score >= 47 &&
        assessment.directionSimilarity > 0.02 &&
        assessment.startDistance < 31;
      if (!assessment.accepted && !guidedAcceptance) {
        rejectStroke(drawn, kanjiStrokeIssueMessage(assessment.issue));
        return;
      }

      const nextAttempts = attempts + 1;
      const nextAccepted = acceptedCount + 1;
      setAttempts(nextAttempts);
      setAcceptedCount(nextAccepted);
      setConsecutiveFailures(0);
      setHintStrokeIndex(null);
      setTeachingSampleCount(1);
      if (nextAccepted >= data.strokes.length) {
        const grade = deriveAutomaticWritingGrade(
          metricsFor(true, mistakes, nextAttempts),
        );
        enterGrading(
          grade,
          mistakes === 0 && hints === 0
            ? "Знак завершён без подсказок. Проверь автоматическую оценку."
            : "Знак завершён. Выбери итоговую оценку.",
        );
      } else {
        setFeedback(
          `Штрих ${nextAccepted} принят и выровнен по эталону. Следующий: ${nextAccepted + 1}.`,
        );
      }
    },
    [
      acceptedCount,
      activeStroke,
      attempts,
      data.strokes.length,
      enterGrading,
      hints,
      metricsFor,
      mistakes,
      mode,
      padSize.height,
      padSize.width,
      rejectStroke,
    ],
  );

  const finishInput = useCallback(() => {
    const drawn = currentStrokeRef.current;
    currentStrokeRef.current = [];
    setCurrentStroke([]);
    if (inputLocked || drawn.length === 0) return;

    const duration = Date.now() - gestureStartedAtRef.current;
    const length = polylineLength(drawn);
    const first = drawn[0];
    const last = drawn[drawn.length - 1];
    if (!first || !last) return;
    const deltaX = last.x - first.x;
    const deltaY = last.y - first.y;

    if (
      mode !== "freeform" &&
      duration < 260 &&
      length < 9 &&
      Math.abs(deltaX) < 8 &&
      Math.abs(deltaY) < 8
    ) {
      handleTap();
      return;
    }

    if (
      duration < 900 &&
      deltaY < -72 &&
      Math.abs(deltaY) > Math.abs(deltaX) * 1.35
    ) {
      resetSession(mode);
      setFeedback("Поле очищено жестом вверх.");
      return;
    }

    if (mode === "freeform") {
      setFreeformStrokes((previous) => [...previous, [...drawn]]);
      setAttempts((previous) => previous + 1);
      setFeedback("Продолжай писать или нажми «Сравнить».");
      return;
    }

    finishRecognizedStroke(drawn);
  }, [finishRecognizedStroke, handleTap, inputLocked, mode, resetSession]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !inputLocked,
        onMoveShouldSetPanResponder: () => !inputLocked,
        onPanResponderGrant: (event) => {
          gestureStartedAtRef.current = Date.now();
          const point = {
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          };
          currentStrokeRef.current = [point];
          setCurrentStroke([point]);
        },
        onPanResponderMove: (event) => {
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
        onPanResponderTerminate: () => {
          currentStrokeRef.current = [];
          setCurrentStroke([]);
        },
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      }),
    [finishInput, inputLocked],
  );

  const changeMode = (nextMode: WritingMode) => {
    if (nextMode === mode || disabled) return;
    setMode(nextMode);
    resetSession(nextMode);
  };

  const undoLast = () => {
    if (disabled || gradeSubmittedRef.current) return;
    if (mode === "freeform") {
      setFreeformStrokes((previous) => previous.slice(0, -1));
    } else {
      setAcceptedCount((previous) => Math.max(0, previous - 1));
    }
    setCompleted(false);
    setAwaitingGrade(false);
    setSubmittedGrade(null);
    gradeSubmittedRef.current = false;
    setShowAllGuide(false);
    setRevealedAll(false);
    setAutoRemaining(null);
    setFeedback("Последний штрих отменён.");
  };

  const compareFreeform = () => {
    if (freeformStrokes.length === 0 || awaitingGrade) return;
    setShowAllGuide(true);
    enterGrading(
      3,
      "Эталон наложен поверх твоего письма. Оцени результат честно.",
    );
  };

  const normalizedCurrent = normalizePadStroke(
    currentStroke,
    padSize.width,
    padSize.height,
  );
  const normalizedFreeform = freeformStrokes.map((stroke) =>
    normalizePadStroke(stroke, padSize.width, padSize.height),
  );
  const teachingSamples = activeStroke?.samples.slice(0, teachingSampleCount) ?? [];
  const suggestedDefinition = getWritingGradeDefinition(suggestedGrade);
  const canUndo = mode === "freeform" ? freeformStrokes.length > 0 : acceptedCount > 0;

  return (
    <View style={styles.wrapper}>
      {allowModeSelection && (
        <View style={styles.modeRow}>
          {(["teach", "guided", "recall", "freeform"] as const).map((value) => (
            <TouchableOpacity
              key={value}
              disabled={disabled}
              style={[styles.modeButton, mode === value && styles.modeButtonActive]}
              onPress={() => changeMode(value)}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === value && styles.modeButtonTextActive,
                ]}
              >
                {writingModeLabel(value)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>{writingModeLabel(mode)}</Text>
          <Text style={styles.progress}>
            {mode === "freeform"
              ? `${freeformStrokes.length} штр. · свободная запись`
              : `${Math.min(acceptedCount, data.strokes.length)}/${data.strokes.length} черт`}
          </Text>
        </View>
        <View style={styles.metricPills}>
          <Text style={styles.metricPill}>Ошибки {mistakes}</Text>
          <Text style={styles.metricPill}>Подсказки {hints}</Text>
        </View>
      </View>

      <Text style={styles.instruction}>{modeInstruction(mode)}</Text>

      <View
        accessibilityLabel={`Тренажёр письма ${data.literal}, режим ${writingModeLabel(mode)}`}
        style={[
          styles.pad,
          compact && styles.padCompact,
          awaitingGrade && {
            borderColor: gradeColor(submittedGrade ?? suggestedGrade),
          },
        ]}
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

          {fullGuideVisible &&
            data.strokes.map((stroke, index) => (
              <Path
                key={`guide-${index}`}
                d={stroke.path}
                fill="none"
                stroke={
                  awaitingGrade
                    ? "#55a174"
                    : index === activeIndex
                      ? "#8da7bd"
                      : "#c9d4de"
                }
                strokeWidth={index === activeIndex && !awaitingGrade ? 4.1 : 2.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={
                  awaitingGrade
                    ? 0.62
                    : mode === "teach"
                      ? index === activeIndex
                        ? 0.82
                        : 0.34
                      : index === activeIndex
                        ? 0.7
                        : 0.28
                }
              />
            ))}

          {!fullGuideVisible &&
            data.strokes.slice(0, acceptedCount).map((stroke, index) => (
              <Path
                key={`accepted-${index}`}
                d={stroke.path}
                fill="none"
                stroke="#162b44"
                strokeWidth="4.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

          {fullGuideVisible &&
            mode !== "freeform" &&
            data.strokes.slice(0, acceptedCount).map((stroke, index) => (
              <Path
                key={`accepted-over-guide-${index}`}
                d={stroke.path}
                fill="none"
                stroke="#162b44"
                strokeWidth="4.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

          {activeStroke && activeHintVisible && !awaitingGrade && (
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

          {teachingSamples.length > 1 && !awaitingGrade && (
            <Polyline
              points={polylineValue(teachingSamples)}
              fill="none"
              stroke="#157ab5"
              strokeWidth="5.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {normalizedFreeform.map((stroke, index) => (
            <Polyline
              key={`freeform-${index}`}
              points={polylineValue(stroke)}
              fill="none"
              stroke="#17283c"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

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
            !awaitingGrade &&
            (mode === "teach" || mode === "guided" || hintStrokeIndex === activeIndex) && (
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

      <Text
        style={[
          styles.feedback,
          awaitingGrade && { color: gradeColor(submittedGrade ?? suggestedGrade) },
        ]}
      >
        {feedback}
      </Text>

      {!awaitingGrade && (
        <View style={styles.actionGrid}>
          {mode !== "freeform" && (
            <TouchableOpacity
              disabled={disabled || !activeStroke}
              style={[styles.actionButton, (disabled || !activeStroke) && styles.disabled]}
              onPress={() => showNextStrokeHint(false)}
            >
              <Text style={styles.actionButtonText}>Одна черта</Text>
            </TouchableOpacity>
          )}
          {mode !== "freeform" && (
            <TouchableOpacity
              disabled={disabled}
              style={[styles.actionButton, disabled && styles.disabled]}
              onPress={revealWholeCharacter}
            >
              <Text style={styles.actionButtonText}>Показать всё</Text>
            </TouchableOpacity>
          )}
          {mode !== "freeform" && (
            <TouchableOpacity
              disabled={disabled || !activeStroke}
              style={[
                styles.actionButton,
                teachingEnabled && styles.actionButtonActive,
                (disabled || !activeStroke) && styles.disabled,
              ]}
              onPress={() =>
                setTeachingEnabled((previous) => {
                  const next = !previous;
                  if (next && mode !== "teach") {
                    setHints((current) => current + 1);
                  }
                  return next;
                })
              }
            >
              <Text
                style={[
                  styles.actionButtonText,
                  teachingEnabled && styles.actionButtonTextActive,
                ]}
              >
                Учить
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            disabled={disabled || !canUndo}
            style={[styles.actionButton, (disabled || !canUndo) && styles.disabled]}
            onPress={undoLast}
          >
            <Text style={styles.actionButtonText}>Отменить</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={disabled}
            style={[styles.actionButton, disabled && styles.disabled]}
            onPress={() => resetSession(mode)}
          >
            <Text style={styles.actionButtonText}>Стереть</Text>
          </TouchableOpacity>
          {mode === "freeform" && (
            <TouchableOpacity
              disabled={disabled || freeformStrokes.length === 0}
              style={[
                styles.actionButton,
                styles.actionButtonPrimary,
                (disabled || freeformStrokes.length === 0) && styles.disabled,
              ]}
              onPress={compareFreeform}
            >
              <Text style={styles.actionButtonPrimaryText}>Сравнить</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {awaitingGrade && (
        <View style={styles.gradingCard}>
          <View style={styles.gradingHeader}>
            <View style={styles.gradingHeaderCopy}>
              <Text style={styles.gradingTitle}>Оцени результат</Text>
              <Text style={styles.gradingSuggestion}>
                Автооценка: {suggestedDefinition.label.toLowerCase()}
              </Text>
            </View>
            {autoRemaining !== null && submittedGrade === null && (
              <Text style={styles.autoAdvanceLabel}>
                авто {(autoRemaining / 1000).toFixed(1)}с
              </Text>
            )}
          </View>
          <View style={styles.gradeRow}>
            {WRITING_GRADE_DEFINITIONS.map((definition) => {
              const selected = (submittedGrade ?? suggestedGrade) === definition.grade;
              return (
                <TouchableOpacity
                  key={definition.grade}
                  disabled={
                    disabled ||
                    submittedGrade !== null ||
                    definition.grade > maximumGrade
                  }
                  style={[
                    styles.gradeButton,
                    selected && {
                      borderColor: gradeColor(definition.grade),
                      backgroundColor: `${gradeColor(definition.grade)}16`,
                    },
                    (disabled ||
                      submittedGrade !== null ||
                      definition.grade > maximumGrade) &&
                      styles.disabled,
                  ]}
                  onPress={() => submitGrade(definition.grade)}
                >
                  <Text
                    style={[
                      styles.gradeNumber,
                      { color: gradeColor(definition.grade) },
                    ]}
                  >
                    {definition.grade}
                  </Text>
                  <Text style={styles.gradeLabel}>{definition.shortLabel}</Text>
                  {gradeIntervalLabels?.[definition.grade] && (
                    <Text style={styles.gradeInterval}>
                      {gradeIntervalLabels[definition.grade]}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {submittedGrade === null && (
            <Text style={styles.gradingHelp}>
              {maximumGrade < 4
                ? `Подсказки и ошибки ограничили оценку: максимум ${maximumGrade}/4.`
                : "1–2 считаются ошибкой и возвращаются быстро; 3–4 продвигают интервал."}
            </Text>
          )}
        </View>
      )}

      <Text style={styles.gestureHint}>
        Жесты: одно касание — следующая черта · двойное — ответ · свайп вверх — стереть.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  modeRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: "#cbd6df",
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  modeButtonActive: { borderColor: "#17314f", backgroundColor: "#17314f" },
  modeButtonText: { color: "#5d6f7e", fontSize: 12, fontWeight: "800" },
  modeButtonTextActive: { color: "#ffffff" },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  headingCopy: { flex: 1 },
  title: { color: "#15202b", fontSize: 18, fontWeight: "900" },
  progress: { marginTop: 2, color: "#657786", fontSize: 13 },
  metricPills: { alignItems: "flex-end", gap: 4 },
  metricPill: { color: "#5d6f7e", fontSize: 11, fontWeight: "700" },
  instruction: { color: "#536574", fontSize: 13, lineHeight: 19 },
  pad: {
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#c9d5df",
    borderRadius: 22,
    backgroundColor: "#fbfcfd",
  },
  padCompact: { maxHeight: 320 },
  feedback: { minHeight: 38, color: "#536574", fontSize: 14, lineHeight: 20 },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionButton: {
    minHeight: 42,
    minWidth: "30%",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: "#b9c7d3",
    borderRadius: 13,
    backgroundColor: "#ffffff",
  },
  actionButtonActive: { borderColor: "#257ead", backgroundColor: "#e6f4fb" },
  actionButtonPrimary: { borderColor: "#17314f", backgroundColor: "#17314f" },
  actionButtonText: { color: "#263f57", fontSize: 13, fontWeight: "800" },
  actionButtonTextActive: { color: "#17688f" },
  actionButtonPrimaryText: { color: "#ffffff", fontSize: 13, fontWeight: "900" },
  gradingCard: {
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d3dde5",
    borderRadius: 16,
    backgroundColor: "#f8fafc",
  },
  gradingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  gradingHeaderCopy: { flex: 1 },
  gradingTitle: { color: "#15202b", fontSize: 16, fontWeight: "900" },
  gradingSuggestion: { marginTop: 2, color: "#657786", fontSize: 12 },
  autoAdvanceLabel: { color: "#31546f", fontSize: 12, fontWeight: "800" },
  gradeRow: { flexDirection: "row", gap: 6 },
  gradeButton: {
    flex: 1,
    minHeight: 76,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: "#d4dde5",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  gradeNumber: { fontSize: 18, fontWeight: "900" },
  gradeLabel: { marginTop: 2, color: "#263746", fontSize: 10, fontWeight: "800" },
  gradeInterval: { marginTop: 3, color: "#71808d", fontSize: 9, fontWeight: "700" },
  gradingHelp: { color: "#687986", fontSize: 11, lineHeight: 16 },
  gestureHint: { color: "#7b8794", fontSize: 10, lineHeight: 15 },
  disabled: { opacity: 0.36 },
});

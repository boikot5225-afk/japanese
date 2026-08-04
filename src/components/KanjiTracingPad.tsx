import { useEffect, useMemo, useRef, useState } from "react";
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

export interface KanjiTracingResult {
  mistakes: number;
  attempts: number;
}

interface KanjiTracingPadProps {
  data: KanjiStrokeData;
  disabled?: boolean;
  compact?: boolean;
  onComplete: (result: KanjiTracingResult) => void;
}

const pointDistance = (left: KanjiStrokePoint, right: KanjiStrokePoint): number =>
  Math.hypot(right.x - left.x, right.y - left.y);

const polylineValue = (points: readonly KanjiStrokePoint[]): string =>
  points.map((item) => `${item.x},${item.y}`).join(" ");

export function KanjiTracingPad({
  data,
  disabled = false,
  compact = false,
  onComplete,
}: KanjiTracingPadProps) {
  const [acceptedStrokes, setAcceptedStrokes] = useState<KanjiStrokePoint[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<KanjiStrokePoint[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("Начни с красной точки и веди по серой линии.");
  const [padSize, setPadSize] = useState({ width: 0, height: 0 });
  const currentStrokeRef = useRef<KanjiStrokePoint[]>([]);
  const completionReportedRef = useRef(false);
  const activeIndex = acceptedStrokes.length;
  const complete = activeIndex >= data.strokes.length;
  const activeStroke = data.strokes[activeIndex];

  useEffect(() => {
    setAcceptedStrokes([]);
    setCurrentStroke([]);
    currentStrokeRef.current = [];
    setMistakes(0);
    setAttempts(0);
    setFeedback("Начни с красной точки и веди по серой линии.");
    completionReportedRef.current = false;
  }, [data.literal]);

  useEffect(() => {
    if (!complete || completionReportedRef.current) return;
    completionReportedRef.current = true;
    setFeedback(
      mistakes === 0
        ? "Все штрихи приняты без ошибок."
        : `Знак завершён. Исправленных попыток: ${mistakes}.`,
    );
    onComplete({ mistakes, attempts });
  }, [attempts, complete, mistakes, onComplete]);

  const finishStroke = () => {
    const drawn = currentStrokeRef.current;
    currentStrokeRef.current = [];
    setCurrentStroke([]);
    if (disabled || complete || !activeStroke || drawn.length === 0) return;

    const assessment = assessKanjiStroke(
      drawn,
      activeStroke,
      padSize.width,
      padSize.height,
    );
    setAttempts((previous) => previous + 1);
    if (!assessment.accepted) {
      setMistakes((previous) => previous + 1);
      setFeedback(kanjiStrokeIssueMessage(assessment.issue));
      return;
    }

    setAcceptedStrokes((previous) => [...previous, drawn]);
    const nextNumber = activeIndex + 2;
    setFeedback(
      nextNumber <= data.strokes.length
        ? `Штрих ${activeIndex + 1} принят. Теперь штрих ${nextNumber}.`
        : "Последний штрих принят.",
    );
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled && !complete,
        onMoveShouldSetPanResponder: () => !disabled && !complete,
        onPanResponderGrant: (event) => {
          const first = {
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          };
          currentStrokeRef.current = [first];
          setCurrentStroke([first]);
        },
        onPanResponderMove: (event) => {
          const next = {
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          };
          const previous = currentStrokeRef.current.at(-1);
          if (previous && pointDistance(previous, next) < 2.2) return;
          currentStrokeRef.current = [...currentStrokeRef.current, next];
          setCurrentStroke(currentStrokeRef.current);
        },
        onPanResponderRelease: finishStroke,
        onPanResponderTerminate: finishStroke,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      }),
    [activeStroke, complete, disabled, padSize.height, padSize.width],
  );

  const reset = () => {
    if (disabled) return;
    setAcceptedStrokes([]);
    setCurrentStroke([]);
    currentStrokeRef.current = [];
    setMistakes(0);
    setAttempts(0);
    setFeedback("Начни с красной точки и веди по серой линии.");
    completionReportedRef.current = false;
  };

  const normalizedAccepted = acceptedStrokes.map((stroke) =>
    normalizePadStroke(stroke, padSize.width, padSize.height),
  );
  const normalizedCurrent = normalizePadStroke(
    currentStroke,
    padSize.width,
    padSize.height,
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.title}>Обведение с проверкой</Text>
          <Text style={styles.progress}>
            {complete
              ? `${data.strokes.length}/${data.strokes.length} · готово`
              : `Следующий штрих: ${activeIndex + 1}/${data.strokes.length}`}
          </Text>
        </View>
        <Text style={styles.mistakes}>Ошибки: {mistakes}</Text>
      </View>

      <View
        accessibilityLabel={`Поле письма для кандзи ${data.literal}`}
        style={[styles.pad, compact && styles.padCompact]}
        onLayout={(event) => setPadSize(event.nativeEvent.layout)}
        {...responder.panHandlers}
      >
        <Svg
          pointerEvents="none"
          width="100%"
          height="100%"
          viewBox={data.viewBox.join(" ")}
        >
          <Line x1="54.5" y1="0" x2="54.5" y2="109" stroke="#dbe3ea" strokeWidth="0.7" />
          <Line x1="0" y1="54.5" x2="109" y2="54.5" stroke="#dbe3ea" strokeWidth="0.7" />

          {data.strokes.map((stroke, index) => (
            <Path
              key={`guide-${index}`}
              d={stroke.path}
              fill="none"
              stroke={index === activeIndex ? "#a9b7c4" : "#d8e0e7"}
              strokeWidth={index === activeIndex ? 4.3 : 2.7}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={index < activeIndex ? 0.22 : index === activeIndex ? 0.92 : 0.38}
            />
          ))}

          {normalizedAccepted.map((stroke, index) => (
            <Polyline
              key={`accepted-${index}`}
              points={polylineValue(stroke)}
              fill="none"
              stroke="#183153"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {normalizedCurrent.length > 0 && (
            <Polyline
              points={polylineValue(normalizedCurrent)}
              fill="none"
              stroke="#111827"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {activeStroke && !complete && (
            <>
              <Circle
                cx={activeStroke.start.x}
                cy={activeStroke.start.y}
                r="6.2"
                fill="#c85454"
              />
              <SvgText
                x={activeStroke.start.x}
                y={activeStroke.start.y + 2.7}
                fontSize="7.5"
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

      <Text style={[styles.feedback, complete && styles.feedbackComplete]}>{feedback}</Text>
      <TouchableOpacity
        disabled={disabled || (acceptedStrokes.length === 0 && mistakes === 0)}
        style={[
          styles.resetButton,
          (disabled || (acceptedStrokes.length === 0 && mistakes === 0)) && styles.disabled,
        ]}
        onPress={reset}
      >
        <Text style={styles.resetText}>Начать заново</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    color: "#15202b",
    fontSize: 17,
    fontWeight: "800",
  },
  progress: {
    marginTop: 3,
    color: "#66788a",
    fontSize: 13,
  },
  mistakes: {
    color: "#52606d",
    fontSize: 13,
    fontWeight: "700",
  },
  pad: {
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#cad4df",
    borderRadius: 20,
    backgroundColor: "#f8fafc",
  },
  padCompact: {
    maxHeight: 300,
  },
  feedback: {
    minHeight: 40,
    color: "#52606d",
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackComplete: {
    color: "#1f6a45",
    fontWeight: "700",
  },
  resetButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#9aa9b8",
    borderRadius: 14,
    backgroundColor: "#ffffff",
  },
  resetText: {
    color: "#183153",
    fontSize: 15,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.35,
  },
});

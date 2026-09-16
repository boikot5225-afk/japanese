import { useEffect, useMemo, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getKanjiStrokeData } from "../content/kanjiStrokeData";
import type { KanjiStrokePoint } from "../domain/kanjiStroke";
import { KanjiTracingPad } from "./KanjiTracingPad";

interface HandwritingPadProps {
  reference: string;
  disabled?: boolean;
  onInkChange: (hasInk: boolean) => void;
  onCompare: () => void;
  onAutomaticAssessment?: (looksCorrect: boolean, mistakes: number) => void;
}

const pointDistance = (left: KanjiStrokePoint, right: KanjiStrokePoint): number =>
  Math.hypot(right.x - left.x, right.y - left.y);

const cleanReference = (value: string): string =>
  value.replace(/[|\s。！？!?]/gu, "").trim();

function FreeHandwritingPad({
  reference,
  disabled = false,
  onInkChange,
  onCompare,
}: Omit<HandwritingPadProps, "onAutomaticAssessment">) {
  const [strokes, setStrokes] = useState<KanjiStrokePoint[][]>([]);
  const [showReference, setShowReference] = useState(false);
  const displayReference = cleanReference(reference) || "字";
  const hasInk = strokes.some((stroke) => stroke.length > 0);

  useEffect(() => {
    setStrokes([]);
    setShowReference(false);
  }, [reference]);

  useEffect(() => {
    onInkChange(hasInk);
  }, [hasInk, onInkChange]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          setStrokes((previous) => [
            ...previous,
            [{ x: locationX, y: locationY }],
          ]);
          setShowReference(false);
        },
        onPanResponderMove: (event) => {
          const nextPoint = {
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          };
          setStrokes((previous) => {
            if (previous.length === 0) return [[nextPoint]];
            const next = previous.map((stroke) => [...stroke]);
            const activeStroke = next[next.length - 1];
            if (!activeStroke) return next;
            const lastPoint = activeStroke[activeStroke.length - 1];
            if (!lastPoint || pointDistance(lastPoint, nextPoint) >= 2.5) {
              activeStroke.push(nextPoint);
            }
            return next;
          });
        },
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      }),
    [disabled],
  );

  const clear = () => {
    if (disabled) return;
    setStrokes([]);
    setShowReference(false);
  };

  const compare = () => {
    if (!hasInk || disabled) return;
    setShowReference(true);
    onCompare();
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.instruction}>
        Напиши ответ самостоятельно, затем сравни с образцом. Автоматическая
        проверка включается для одиночных кандзи с данными порядка черт.
      </Text>
      <View
        accessibilityLabel={`Поле письма. Образец: ${displayReference}`}
        style={styles.pad}
        {...responder.panHandlers}
      >
        <View pointerEvents="none" style={styles.verticalGuide} />
        <View pointerEvents="none" style={styles.horizontalGuide} />
        <View pointerEvents="none" style={styles.referenceLayer}>
          <Text
            style={[
              styles.reference,
              displayReference.length > 2 && styles.referenceCompact,
              showReference ? styles.referenceVisible : styles.referenceGhost,
            ]}
          >
            {displayReference}
          </Text>
        </View>
        {strokes.map((stroke, strokeIndex) => {
          const first = stroke[0];
          if (!first) return null;
          return (
            <View key={`stroke-${strokeIndex}`} pointerEvents="none" style={styles.strokeLayer}>
              <View
                style={[
                  styles.strokeDot,
                  { left: first.x - 4, top: first.y - 4 },
                ]}
              />
              {stroke.slice(1).map((item, pointIndex) => {
                const previous = stroke[pointIndex];
                if (!previous) return null;
                const length = pointDistance(previous, item);
                const angle = Math.atan2(item.y - previous.y, item.x - previous.x);
                return (
                  <View
                    key={`${strokeIndex}-${pointIndex}`}
                    style={[
                      styles.segment,
                      {
                        left: (previous.x + item.x) / 2 - length / 2,
                        top: (previous.y + item.y) / 2 - 4,
                        width: Math.max(length, 5),
                        transform: [{ rotateZ: `${angle}rad` }],
                      },
                    ]}
                  />
                );
              })}
            </View>
          );
        })}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          disabled={!hasInk || disabled}
          style={[styles.secondaryButton, (!hasInk || disabled) && styles.disabledButton]}
          onPress={clear}
        >
          <Text style={styles.secondaryText}>Очистить</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!hasInk || disabled}
          style={[styles.primaryButton, (!hasInk || disabled) && styles.disabledButton]}
          onPress={compare}
        >
          <Text style={styles.primaryText}>Сверить</Text>
        </TouchableOpacity>
      </View>
      {showReference && (
        <Text style={styles.compareHint}>
          Образец усилен. Оцени общий силуэт и направление штрихов, затем отметь результат ниже.
        </Text>
      )}
    </View>
  );
}

export function HandwritingPad({
  reference,
  disabled = false,
  onInkChange,
  onCompare,
  onAutomaticAssessment,
}: HandwritingPadProps) {
  const displayReference = cleanReference(reference);
  const strokeData = displayReference.length === 1
    ? getKanjiStrokeData(displayReference)
    : undefined;

  if (strokeData) {
    return (
      <KanjiTracingPad
        data={strokeData}
        disabled={disabled}
        compact
        onComplete={({ mistakes }) => {
          onInkChange(true);
          const allowedMistakes = Math.max(2, Math.ceil(strokeData.strokes.length * 0.6));
          onAutomaticAssessment?.(mistakes <= allowedMistakes, mistakes);
        }}
      />
    );
  }

  return (
    <FreeHandwritingPad
      reference={reference}
      disabled={disabled}
      onInkChange={onInkChange}
      onCompare={onCompare}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  instruction: {
    color: "#52606d",
    fontSize: 14,
    lineHeight: 20,
  },
  pad: {
    height: 280,
    overflow: "hidden",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#cad4df",
    backgroundColor: "#f8fafc",
  },
  verticalGuide: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 1,
    backgroundColor: "#dbe3ea",
  },
  horizontalGuide: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: "#dbe3ea",
  },
  referenceLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  reference: {
    position: "absolute",
    width: "100%",
    top: 32,
    textAlign: "center",
    fontSize: 150,
    lineHeight: 205,
    color: "#15202b",
  },
  referenceCompact: {
    top: 64,
    fontSize: 64,
    lineHeight: 120,
  },
  referenceGhost: {
    opacity: 0.12,
  },
  referenceVisible: {
    opacity: 0.48,
  },
  strokeLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  strokeDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#111827",
  },
  segment: {
    position: "absolute",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#111827",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#183153",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#9aa9b8",
    backgroundColor: "#ffffff",
  },
  disabledButton: {
    opacity: 0.38,
  },
  primaryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryText: {
    color: "#183153",
    fontSize: 15,
    fontWeight: "700",
  },
  compareHint: {
    color: "#415466",
    fontSize: 13,
    lineHeight: 19,
  },
});

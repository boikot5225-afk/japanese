import { useEffect, useMemo, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Point {
  x: number;
  y: number;
}

export type HandwritingMode = "trace" | "memory";

interface HandwritingPadProps {
  reference: string;
  disabled?: boolean;
  initialMode?: HandwritingMode;
  showModeControls?: boolean;
  instruction?: string;
  onInkChange: (hasInk: boolean) => void;
  onCompare: () => void;
  onEdit?: () => void;
}

const pointDistance = (left: Point, right: Point): number =>
  Math.hypot(right.x - left.x, right.y - left.y);

const cleanReference = (value: string): string =>
  value.replace(/[|\s。！？!?]/gu, "").trim();

export function HandwritingPad({
  reference,
  disabled = false,
  initialMode = "memory",
  showModeControls = true,
  instruction,
  onInkChange,
  onCompare,
  onEdit,
}: HandwritingPadProps) {
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [mode, setMode] = useState<HandwritingMode>(initialMode);
  const [showReference, setShowReference] = useState(initialMode === "trace");
  const displayReference = cleanReference(reference) || "字";
  const hasInk = strokes.some((stroke) => stroke.length > 0);

  useEffect(() => {
    setStrokes([]);
    setMode(initialMode);
    setShowReference(initialMode === "trace");
  }, [initialMode, reference]);

  useEffect(() => {
    onInkChange(hasInk);
  }, [hasInk, onInkChange]);

  const beginEdit = () => {
    if (disabled) return;
    onEdit?.();
    if (mode === "memory") setShowReference(false);
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (event) => {
          beginEdit();
          const { locationX, locationY } = event.nativeEvent;
          setStrokes((previous) => [
            ...previous,
            [{ x: locationX, y: locationY }],
          ]);
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
    [disabled, mode, onEdit],
  );

  const changeMode = (nextMode: HandwritingMode) => {
    if (disabled || nextMode === mode) return;
    onEdit?.();
    setMode(nextMode);
    setStrokes([]);
    setShowReference(nextMode === "trace");
  };

  const undo = () => {
    if (!hasInk || disabled) return;
    onEdit?.();
    setStrokes((previous) => previous.slice(0, -1));
    setShowReference(mode === "trace");
  };

  const clear = () => {
    if (disabled) return;
    onEdit?.();
    setStrokes([]);
    setShowReference(mode === "trace");
  };

  const compare = () => {
    if (!hasInk || disabled) return;
    setShowReference(true);
    onCompare();
  };

  const referenceOpacity = showReference ? 0.46 : mode === "trace" ? 0.14 : 0;
  const resolvedInstruction = instruction ?? (
    mode === "trace"
      ? "Обводи знак по видимому образцу. Каждый новый отрыв пальца считается отдельным штрихом."
      : "Напиши знак по памяти. Подсказку можно открыть, но после нового штриха она снова скроется."
  );

  return (
    <View style={styles.wrapper}>
      {showModeControls && (
        <View style={styles.modeRow}>
          <TouchableOpacity
            disabled={disabled}
            style={[styles.modeButton, mode === "trace" && styles.modeButtonActive]}
            onPress={() => changeMode("trace")}
          >
            <Text style={[styles.modeText, mode === "trace" && styles.modeTextActive]}>
              Обвести
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={disabled}
            style={[styles.modeButton, mode === "memory" && styles.modeButtonActive]}
            onPress={() => changeMode("memory")}
          >
            <Text style={[styles.modeText, mode === "memory" && styles.modeTextActive]}>
              По памяти
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.instructionRow}>
        <Text style={styles.instruction}>{resolvedInstruction}</Text>
        <View style={styles.strokeCounter}>
          <Text style={styles.strokeCounterValue}>{strokes.length}</Text>
          <Text style={styles.strokeCounterLabel}>штр.</Text>
        </View>
      </View>

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
              { opacity: referenceOpacity },
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
                  styles.strokeNumber,
                  { left: first.x - 10, top: first.y - 10 },
                ]}
              >
                <Text style={styles.strokeNumberText}>{strokeIndex + 1}</Text>
              </View>
              {stroke.slice(1).map((point, pointIndex) => {
                const previous = stroke[pointIndex];
                if (!previous) return null;
                const length = pointDistance(previous, point);
                const angle = Math.atan2(point.y - previous.y, point.x - previous.x);
                return (
                  <View
                    key={`${strokeIndex}-${pointIndex}`}
                    style={[
                      styles.segment,
                      {
                        left: (previous.x + point.x) / 2 - length / 2,
                        top: (previous.y + point.y) / 2 - 4,
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

      <View style={styles.hintRow}>
        <TouchableOpacity
          disabled={disabled}
          style={[styles.hintButton, disabled && styles.disabledButton]}
          onPress={() => setShowReference((previous) => !previous)}
        >
          <Text style={styles.hintText}>
            {showReference ? "Скрыть образец" : "Показать образец"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          disabled={!hasInk || disabled}
          style={[styles.secondaryButton, (!hasInk || disabled) && styles.disabledButton]}
          onPress={undo}
        >
          <Text style={styles.secondaryText}>Отменить штрих</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!hasInk || disabled}
          style={[styles.secondaryButton, (!hasInk || disabled) && styles.disabledButton]}
          onPress={clear}
        >
          <Text style={styles.secondaryText}>Очистить</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        disabled={!hasInk || disabled}
        style={[styles.primaryButton, (!hasInk || disabled) && styles.disabledButton]}
        onPress={compare}
      >
        <Text style={styles.primaryText}>Сверить с образцом</Text>
      </TouchableOpacity>
      {showReference && hasInk && (
        <Text style={styles.compareHint}>
          Образец усилен поверх твоей записи. Сравни пропорции, направление линий и порядок собственных пронумерованных штрихов.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
    padding: 4,
    borderRadius: 14,
    backgroundColor: "#eaf0f5",
  },
  modeButton: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },
  modeButtonActive: {
    backgroundColor: "#ffffff",
  },
  modeText: {
    color: "#637587",
    fontSize: 14,
    fontWeight: "700",
  },
  modeTextActive: {
    color: "#183153",
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  instruction: {
    flex: 1,
    color: "#52606d",
    fontSize: 14,
    lineHeight: 20,
  },
  strokeCounter: {
    minWidth: 54,
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#eef3f7",
  },
  strokeCounterValue: {
    color: "#183153",
    fontSize: 18,
    fontWeight: "800",
  },
  strokeCounterLabel: {
    color: "#66788a",
    fontSize: 10,
    fontWeight: "700",
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
  strokeLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  strokeNumber: {
    position: "absolute",
    zIndex: 2,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#183153",
  },
  strokeNumberText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  segment: {
    position: "absolute",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#111827",
  },
  hintRow: {
    alignItems: "flex-start",
  },
  hintButton: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#b9c6d2",
    backgroundColor: "#ffffff",
  },
  hintText: {
    color: "#31546f",
    fontSize: 13,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#183153",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
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
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
  },
  compareHint: {
    color: "#415466",
    fontSize: 13,
    lineHeight: 19,
  },
});

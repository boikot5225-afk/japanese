import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

import type { KanjiStrokeData } from "../domain/kanjiStroke";

interface KanjiStrokeOrderProps {
  data: KanjiStrokeData;
}

export function KanjiStrokeOrder({ data }: KanjiStrokeOrderProps) {
  const [activeStroke, setActiveStroke] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setActiveStroke(0);
    setPlaying(false);
  }, [data.literal]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setActiveStroke((previous) => {
        if (previous >= data.strokes.length - 1) {
          setPlaying(false);
          return previous;
        }
        return previous + 1;
      });
    }, 650);
    return () => clearInterval(timer);
  }, [data.strokes.length, playing]);

  const active = data.strokes[activeStroke];

  return (
    <View style={styles.wrapper}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.title}>Порядок черт</Text>
          <Text style={styles.subtitle}>
            Штрих {activeStroke + 1} из {data.strokes.length}
          </Text>
        </View>
        <Text style={styles.literal}>{data.literal}</Text>
      </View>

      <View style={styles.canvas}>
        <Svg width="100%" height="100%" viewBox={data.viewBox.join(" ")}>
          <Line x1="54.5" y1="0" x2="54.5" y2="109" stroke="#dbe3ea" strokeWidth="0.7" />
          <Line x1="0" y1="54.5" x2="109" y2="54.5" stroke="#dbe3ea" strokeWidth="0.7" />
          {data.strokes.map((stroke, index) => (
            <Path
              key={`${data.literal}-${index}`}
              d={stroke.path}
              fill="none"
              stroke={
                index < activeStroke
                  ? "#183153"
                  : index === activeStroke
                    ? "#c85454"
                    : "#cbd5df"
              }
              strokeWidth={index === activeStroke ? 4.2 : 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={index > activeStroke ? 0.55 : 1}
            />
          ))}
          {active && (
            <>
              <Circle
                cx={active.start.x}
                cy={active.start.y}
                r="5.7"
                fill="#c85454"
                opacity="0.9"
              />
              <SvgText
                x={active.start.x}
                y={active.start.y + 2.5}
                fontSize="7"
                fontWeight="800"
                fill="#ffffff"
                textAnchor="middle"
              >
                {activeStroke + 1}
              </SvgText>
            </>
          )}
        </Svg>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          disabled={activeStroke === 0}
          style={[styles.secondaryButton, activeStroke === 0 && styles.disabled]}
          onPress={() => {
            setPlaying(false);
            setActiveStroke((previous) => Math.max(0, previous - 1));
          }}
        >
          <Text style={styles.secondaryText}>Назад</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => {
            if (activeStroke >= data.strokes.length - 1) setActiveStroke(0);
            setPlaying((previous) => !previous);
          }}
        >
          <Text style={styles.playText}>{playing ? "Пауза" : "Показать"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={activeStroke >= data.strokes.length - 1}
          style={[
            styles.secondaryButton,
            activeStroke >= data.strokes.length - 1 && styles.disabled,
          ]}
          onPress={() => {
            setPlaying(false);
            setActiveStroke((previous) =>
              Math.min(data.strokes.length - 1, previous + 1),
            );
          }}
        >
          <Text style={styles.secondaryText}>Дальше</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#d7e0e8",
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#15202b",
    fontSize: 17,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 3,
    color: "#66788a",
    fontSize: 13,
  },
  literal: {
    color: "#183153",
    fontSize: 32,
    fontWeight: "600",
  },
  canvas: {
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#f8fafc",
  },
  controls: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#aab7c3",
    borderRadius: 13,
    backgroundColor: "#ffffff",
  },
  playButton: {
    flex: 1.2,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#183153",
  },
  secondaryText: {
    color: "#183153",
    fontSize: 14,
    fontWeight: "700",
  },
  playText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.35,
  },
});

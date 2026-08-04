export interface KanjiStrokePoint {
  x: number;
  y: number;
}

export interface KanjiStrokeVector {
  path: string;
  start: KanjiStrokePoint;
  end: KanjiStrokePoint;
  samples: KanjiStrokePoint[];
  length: number;
}

export interface KanjiStrokeData {
  literal: string;
  viewBox: readonly [number, number, number, number];
  strokes: KanjiStrokeVector[];
  source: "KanjiVG";
}

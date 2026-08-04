export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export type LearningItemType =
  | "kana"
  | "kanji"
  | "vocabulary"
  | "grammar"
  | "sentence"
  | "conjugation";

export type Skill =
  | "recognition"
  | "recall"
  | "reading"
  | "listening"
  | "writing"
  | "usage";

export interface VocabularyItem {
  id: string;
  type: "vocabulary";
  writtenForm: string;
  reading: string;
  alternativeReadings?: string[];
  meaningsRu: string[];
  partOfSpeech: string[];
  jlptLevel?: JlptLevel;
  tags?: string[];
}

export interface KanjiExample {
  written: string;
  reading: string;
  kanjiReading: string;
  meaningRu: string;
  /**
   * Character means an exact contextual reading of the highlighted glyph.
   * Word means that only the complete lesson word reading is known, so the UI
   * must ask for the word rather than pretend that it knows an individual
   * on/kun segment inside a compound.
   */
  readingScope?: "character" | "word";
}

export interface KanjiItem {
  id: string;
  type: "kanji";
  literal: string;
  meaningsRu: string[];
  jlptLevel: JlptLevel;
  introducedInLessonId: string;
  examples: KanjiExample[];
  /**
   * True when the glyph is introduced because it is required by an actual
   * lesson word/example/test, but is outside the curated standalone N5 list.
   * Its cue is therefore the lesson word context, not a fabricated dictionary
   * definition of the isolated character.
   */
  contextualOnly?: boolean;
}

export interface GrammarPoint {
  id: string;
  type: "grammar";
  title: string;
  meaningRu: string;
  explanationRu: string;
  formation: string[];
  cautions?: string[];
  relatedGrammarIds?: string[];
  jlptLevel?: JlptLevel;
}

export interface ExampleSentence {
  id: string;
  type: "sentence";
  japanese: string;
  reading?: string;
  translationRu: string;
  grammarIds: string[];
  vocabularyIds: string[];
}

export type LearningItem = VocabularyItem | KanjiItem | GrammarPoint | ExampleSentence;

export type ExerciseType =
  | "multiple-choice"
  | "text-input"
  | "sentence-builder"
  | "particle-gap"
  | "listening"
  | "conjugation"
  | "handwriting";

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  targetItemIds: string[];
  correctAnswers: string[];
  acceptableAnswers?: string[];
  distractors?: string[];
  explanationRu?: string;
  variantGroup?: string;
  contentKey?: string;
  difficulty?: 1 | 2 | 3 | 4;
  confusionItemIds?: string[];
  audioText?: string;
  skill?: Skill;
  sessionRole?: "core" | "remediation";
}

export interface Lesson {
  id: string;
  unitId: string;
  order: number;
  title: string;
  description: string;
  theory: string[];
  itemIds: string[];
  exerciseIds: string[];
  estimatedMinutes: number;
}

export interface SkillProgress {
  itemId: string;
  skill: Skill;
  stability: number;
  difficulty: number;
  dueAt: string;
  correctCount: number;
  incorrectCount: number;
}

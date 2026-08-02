import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  KanjiItem,
  Lesson,
  VocabularyItem,
} from "../domain/course";

export interface LessonBundle {
  lesson: Lesson;
  vocabulary: VocabularyItem[];
  kanji?: KanjiItem[];
  grammar: GrammarPoint[];
  sentences: ExampleSentence[];
  exercises: Exercise[];
  outcomes: string[];
}

export interface WordItem {
  en: string;
  ch: string;
  pos?: string;
  kk?: string;
  icon?: string;
  exampleEn?: string;
  exampleCh?: string;
}

export interface WordCategory {
  id: string | number;
  category: string;
  list: WordItem[];
}

export interface WrongWord {
  en: string;
  ch: string;
}

export interface QuizRecord {
  name: string;
  time: string;
  tested: number;
  total?: number;
  correct: number;
  wrong: number;
  rate: string;
  wrongWords: WrongWord[];
  bankPrefix: string;
  isReviewRound: boolean;
  reviewSessionId?: string;
}

export type WordProgressStatus = 'correct' | 'wrong' | undefined;

export interface UserProgressMap {
  [wordEn: string]: WordProgressStatus;
}

export interface UserProgressCache {
  username: string;
  bankName: string;
  progress: UserProgressMap;
}

export interface CloudWordBankIndex {
  [fileName: string]: string; // URL
}

export interface CloudBankItem {
  fileName: string;
  rawUrl: string;
  totalWords: number;
  categoryTitle: string;
  content?: string;
}

export interface WrongWordCountMap {
  [wordEn: string]: number;
}

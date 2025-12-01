export interface GenerationData {
  questionId: string;
  questionContent?: string;
  content?: string;
  answer?: string | null;
}

export interface JudgeData {
  isCorrect?: boolean;
  result?: string;
}

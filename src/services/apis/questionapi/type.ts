export interface GenerationData {
  questionId: string;
  questionContent: string;
}

export interface JudgeData {
  isCorrect?: boolean;
  result?: string;
}

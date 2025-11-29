export interface KnowledgePointNode {
  id: number;
  keyPoints: string;
  hasChildren?: boolean;
}

export interface KnowledgeTooltip {
  degreeOfProficiency: number;
  count: number;
  lastReviewTime: string;
}

export interface QuestionItem {
  id: number;
  content: string;
}

export interface RelatedData {
  questions: QuestionItem[];
  note: string | null;
}

export interface AddSonPointParams {
  pointName: string;
  pointDesc?: string;
  sonPoints?: AddSonPointParams[];
}

export interface KnowledgeDefinition {
  content?: string;
  isMastered?: boolean;
  [key: string]: unknown;
}

export interface KnowledgeStatistic {
  totalCount?: number;
  wrongCount?: number;
  solvedCount?: number;
  [key: string]: number | undefined;
}

export interface KnowledgePointNode {
  id: number | string; // 支持数字和字符串（UUID）格式
  keyPoints: string;
  hasChildren?: boolean;
}

export interface KnowledgeTooltip {
  degreeOfProficiency: number;
  count: number;
  lastReviewTime: string;
}

export interface QuestionItem {
  id: string | number;
  question: string;
}

export interface RelatedData {
  questions: QuestionItem[];
  note: string | null;
}

export interface AddSonPointParams {
  pointId?: string | null;
  pointName: string;
  pointDesc?: string;
  sonPoints?: any[];
  subject?: string;
}

export interface KnowledgeDefinition {
  content?: string;
  isMastered?: boolean;
  keyPoints?: string;
  [key: string]: unknown;
}

export interface KnowledgeStatistic {
  totalCount?: number;
  wrongCount?: number;
  solvedCount?: number;
  count?: number;
  message?: string;
  [key: string]: number | string | undefined; // 支持字符串（如"暂无相关错题"）
}

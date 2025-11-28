export interface QuestionListParams {
  subjects?: string[];
  errorTypes?: string[];
  timeRanges?: string[];
  page?: number;
  size?: number;
}

// 主数据结构接口
export interface AnalysisData {
  subjectDistribution: DistributionItem[];
  knowledgeDistribution: DistributionItem[];
  reviewTrend: ReviewTrendItem[];
}

// 基础数据项接口
export interface DistributionItem {
  [key: string]: number;
}

// 复习趋势数据项接口
export interface ReviewTrendItem {
  month: string;
  total: number;
  reviewed: number;
  completionRate: number;
}

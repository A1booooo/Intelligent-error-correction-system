export interface OverviewResponse {
  questionsNum: number;
  reviewRate: string;
  hardQuestions: number;
  learningTime: string;
}

export interface ChartData {
  month: string;
  total: number;
  reviewed: number;
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

// 主数据结构接口
export interface AnalysisData {
  subjectDistribution: DistributionItem[];
  knowledgeDistribution: DistributionItem[];
  reviewTrend: ReviewTrendItem[];
}

export interface PieDataItem {
  [key: string]: number;
}

export interface ChartPieSimpleProps {
  data?: PieDataItem[];
}

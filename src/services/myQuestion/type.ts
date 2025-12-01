export interface QuestionListParams {
  keyword?: string;
  subject?: string;
  errorType?: string;
  timeRange?: string;
  page?: number;
  size?: number;
}

export interface QuestionItem {
  id: number;
  question_content: string;
  is_careless: number;
  is_unfamiliar: number;
  is_calculate_err: number;
  is_time_shortage: number;
  other_reason: string;
  update_time: string;
  subject: string;
  knowledge_desc: string | null;
}

// 分页信息
export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

// data 部分
export interface QuestionListData {
  content: QuestionItem[];
  page: PageInfo;
}

// 最外层 API 响应
export interface QuestionListResponse {
  traceId: string;
  code: number;
  info: string;
  data: QuestionListData;
}

// 主数据结构接口
export interface StatisticsResponse {
  traceId: string;
  code: number;
  info: string;
  data: AnalysisData;
}

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

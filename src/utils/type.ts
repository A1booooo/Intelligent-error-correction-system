import type { AxiosRequestConfig } from 'axios';

export interface UserResponse {
  traceId: string;
  code: number;
  info: string;
  data: {
    userId: string;
    userName: string;
    accessToken: string;
    refreshToken: string;
  };
}

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

export interface AxiosLikeError {
  response?: {
    status: number;
  };
  config?: AxiosRequestConfig;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CustomAxiosRequestConfig extends AxiosRequestConfig {}

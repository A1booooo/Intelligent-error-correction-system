export interface OverviewResponse {
  traceId: string;
  code: number;
  info: string;
  data: {
    questionsNum: number;
    reviewRate: string;
    hardQuestions: number;
    learningTime: string;
  };
}

export interface OverdueResponse {
  traceId: string;
  code: number;
  info: string;
  data: {
    count: number;
  };
}

export interface TrickyKnowledgeResponse {
  traceId: string;
  code: number;
  info: string;
  data: Array<{
    knowledgeName: string;
    knowledgeId: string;
  }>;
}

export interface KeyPointResponse {
  traceId: string;
  code: number;
  info: string;
  data: Array<{
    knowledgePoint: string;
    reviewReason: string;
  }>;
}

export interface StudyDynamicResponse {
  traceId: string;
  code: number;
  info: string;
  data: string[];
}

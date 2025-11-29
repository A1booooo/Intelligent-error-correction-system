export interface ExtractFirstResponse {
  traceId: string;
  code: number;
  info: string;
  data: {
    questionText: string;
    questionId: string;
    userId: string;
  };
}

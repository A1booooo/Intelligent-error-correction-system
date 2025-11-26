import request from '../utils/http';
import { AnalysisData } from './type';

interface QuestionListParams {
  subjects?: string[];
  errorTypes?: string[];
  timeRanges?: string[];
  page?: number;
  size?: number;
}

export function getQuestionList(params: QuestionListParams) {
  return request.get('/api/v1/feedback/review/list', { params });
}

export function deleteQuestion(questionIds: number[]) {
  return request.delete('/api/v1/feedback/review/deleteBatch', {
    params: { questionIds },
  });
}

export function getStatistics(): Promise<AnalysisData> {
  return request.get('/api/v1/feedback/review/statistics');
}

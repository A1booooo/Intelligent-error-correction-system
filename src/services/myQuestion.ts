import request from '../utils/request';
import { AnalysisData } from '../utils/type';

interface QuestionListParams {
  subjects?: string[];
  errorTypes?: string[];
  timeRanges?: string[];
  page?: number;
  size?: number;
}

export async function getQuestionList(params: QuestionListParams) {
  const res = await request.get({
    url: '/api/v1/feedback/review/list',
    params,
  });
  return res;
}

export function deleteQuestion(questionIds: number[]) {
  return request.delete({
    url: '/api/v1/feedback/review/deleteBatch',
    params: { questionIds },
  });
}

export async function getStatistics(): Promise<AnalysisData> {
  const res = await request.get<AnalysisData>({
    url: '/api/v1/feedback/review/statistics',
  });
  return res;
}

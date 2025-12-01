import request from '../../utils/request';
import {
  QuestionListParams,
  QuestionListResponse,
  StatisticsResponse,
} from './type';

export async function getQuestionList(params: QuestionListParams) {
  const res = (await request.get)<QuestionListResponse>({
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

export async function getStatistics() {
  const res = (await request.get)<StatisticsResponse>({
    url: '/api/v1/feedback/review/statistics',
  });
  return res;
}

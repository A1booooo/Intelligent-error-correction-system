import request from '@/utils/request';
import {JudgeData, GenerationData} from './type';

/**
 * 1. AI 巩固出题
 * Method: POST
 */
export const generateQuestion = (mistakeQuestionId: number) => {
  return request.post<GenerationData>({
    url: '/api/question/generation',
    params: { mistakeQuestionId }, 
  });
};

/**
 * 2. AI 判题
 * Method: POST
 */
export const judgeQuestion = (questionId: string, answer: string) => {
  return request.post<JudgeData>({
    url: '/api/question/judge',
    params: { questionId, answer },
  });
};

/**
 * 3. 录入错题库
 * Method: POST
 */
export const recordQuestion = (questionId: string) => {
  return request.post<void>({ 
    url: '/api/question/record',
    params: { questionId },
  });
};

export default {
  generateQuestion,
  judgeQuestion,
  recordQuestion,
};
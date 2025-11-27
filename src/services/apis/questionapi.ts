import request from '@/utils/request';


export interface GenerationData {
  questionId: string;
  questionContent: string;
}

export interface JudgeData {
  isCorrect?: boolean;
  result?: string;
}


/**
 * 1. AI 巩固出题
 * Method: POST
 * 注意：原代码中使用 searchParams (Query String) 传参，所以在 axios 中使用 params 属性
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
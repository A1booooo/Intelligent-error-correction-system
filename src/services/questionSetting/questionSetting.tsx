import request from '../../utils/request';

export function recordQuestion(questionId: string) {
  return request.post({
    url: '/api/question/record',
    params: { questionId },
  });
}

import request from '@/utils/request';
import { JudgeData, GenerationData } from './type';

/**
 * 1. AI 巩固出题
 * Method: POST
 */
export const generateQuestion = (mistakeQuestionId: string | number) => {
  const formData = new FormData();
  formData.append('_placeholder', '');

  return request.post<GenerationData>({
    url: '/api/question/generation',
    params: { mistakeQuestionId: String(mistakeQuestionId) },
    data: formData,
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

export interface JudgeStreamOptions {
  questionId: string;
  answer: string;
  onMessage: (content: string) => void;
  onError: (error: any) => void;
  signal?: AbortSignal;
}

export const judgeQuestionStream = async ({
  questionId,
  answer,
  onMessage,
  onError,
  signal,
}: JudgeStreamOptions) => {
  try {
    let token = localStorage.getItem('token');
    if (token) {
      token = token.replace(/^"|"$/g, '');
    }

    const params = new URLSearchParams({
      questionId,
      answer,
    });

    const response = await fetch(`/api/question/judge?${params.toString()}`, {
      method: 'POST',
      headers: {
        ...(token ? { 'access-token': token } : {}),
      },
      signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, msg: ${text}`);
    }

    if (!response.body) {
      throw new Error('判题返回体为空');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    const feedLine = (line: string) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) return;
      const content = trimmed.slice(5);
      if (content.trim() === '') {
        onMessage('\n');
      } else {
        onMessage(content);
      }
    };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        if (buffer) {
          const lines = buffer.split(/\r?\n/);
          for (const line of lines) {
            if (line.trim()) {
              feedLine(line);
            }
          }
        }
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';

      for (const line of lines) {
        feedLine(line);
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // 用户取消，不视为错误
      return;
    }
    onError(error);
  }
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
<<<<<<< HEAD
  judgeQuestionStream,
=======
>>>>>>> 97d1a799d2ab78590f1f57c10d2e6c0953c240fd
};

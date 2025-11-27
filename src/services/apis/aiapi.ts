import request from '@/utils/request';

const API_VERSION = 'v1';
const BASE_URL = import.meta.env.VITE_BASE_URL || '';

export interface StreamResponse {
  content?: string;
  text?: string;
  done?: boolean;
  [key: string]: any;
}

export interface SolveStreamOptions {
  question: string;
  onMessage: (text: string) => void;
  onError: (err: any) => void;
  signal?: AbortSignal;
}

/**
 * 1. AI流式解题接口
 * 原生fetch AccessToken 过期，它会直接失败。
 */
export const solveStream = async ({
  question,
  onMessage,
  onError,
  signal,
}: SolveStreamOptions) => {
  const token = localStorage.getItem('token');

  try {
    const endpoint = `${BASE_URL}/api/${API_VERSION}/solve/stream`;
    const fullUrl = `${endpoint}?question=${encodeURIComponent(question)}`;

    console.log('正在请求 AI 流式接口:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '', 
      },
      body: JSON.stringify({}),
      signal,
    });

    if (!response.ok) {
      // 如果是 401，这里其实无法触发无感刷新，因为没走 axios
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, msg: ${errorText}`);
    }

    if (!response.body) throw new Error('Response body is empty');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.slice(5).trim();

        if (dataStr === '[DONE]') return;

        try {
          const data: StreamResponse = JSON.parse(dataStr);
          const content = data.content || data.text || '';
          if (content) onMessage(content);
        } catch (_e) {
          //JSON / 普通文本
          console.warn('Non-JSON SSE data:', dataStr);
          onMessage(dataStr);
        }
      }
    }
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      onError(error);
    }
  }
};

/**
 * 2. 发送消息并获取AI回复
 */
export const sendMessage = (data: { conversationId: string; message: string }) => {
  return request.post<any>({
    url: `/api/${API_VERSION}/conversation/send-message`,
    data,
  });
};

/**
 * 3. 基于错题ID的AI对话
 */
export const solveWithContext = (data: {
  questionId: string | number;
  userQuestion: string;
  questionContent?: string;
}) => {
  return request.post<any>({
    url: `/api/${API_VERSION}/conversation/solve-with-context`,
    data,
  });
};

/**
 * 4. 删除会话
 */
export const deleteConversation = (conversationId: string) => {
  return request.delete<void>({
    url: `/api/${API_VERSION}/conversation/delete/`,
    params: { conversationId },
  });
};

export default {
  solveStream,
  sendMessage,
  solveWithContext,
  deleteConversation,
};
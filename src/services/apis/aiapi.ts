import request from '@/utils/request';

const API_VERSION = 'v1';
const BASE_URL = import.meta.env.VITE_BASE_URL || '';
export interface StreamResponse {
  content?: string;
  text?: string;
  done?: boolean;
  [key: string]: any;
}

export const aiApi = {
  /**
   * 1. AI流式解题接口
   * Method: POST
   */
  solveStream: async (
    question: string,
    onMessage: (text: string) => void,
    onError: (err: any) => void,
    signal?: AbortSignal,
  ) => {
    const token = localStorage.getItem('token');

    try {
      const url = new URL(`${BASE_URL}/api/${API_VERSION}/solve/stream`);
      url.searchParams.append('question', question);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({}),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, msg: ${errorText}`,
        );
      }

      if (!response.body) throw new Error('Response body is empty');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

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
  },

  /**
   * 2. 发送消息并获取AI回复
   * Method: POST
   */
  sendMessage: (data: { conversationId: string; message: string }) => {
    return request.post<any>({
      url: `/api/${API_VERSION}/conversation/send-message`,
      data,
    });
  },

  /**
   * 3. 基于错题ID的AI对话
   * Method: POST
   */
  solveWithContext: (data: {
    questionId: string | number;
    userQuestion: string;
    questionContent?: string;
  }) => {
    return request.post<any>({
      url: `/api/${API_VERSION}/conversation/solve-with-context`,
      data,
    });
  },

  // 4. 删除会话
  deleteConversation: (conversationId: string) => {
    return request.delete<void>({
      url: `/api/${API_VERSION}/conversation/delete/`,
      params: { conversationId },
    });
  },
};

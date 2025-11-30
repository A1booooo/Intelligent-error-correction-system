import request from '@/utils/request';
import { StreamResponse, SolveStreamOptions } from './type';
const API_VERSION = 'v1';


class SectionFormatter {
  private buffer: string = '';


  processChunk(chunk: string): string {
    this.buffer += chunk;


    let result = '';

    const sectionPattern = /【([^】]+)】/g;
    const matches: Array<{ start: number; end: number; text: string }> = [];
    let match;

    while ((match = sectionPattern.exec(this.buffer)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
      });
    }

    if (matches.length === 0) {
      const incompleteIndex = this.buffer.lastIndexOf('【');
      if (incompleteIndex !== -1) {
        const afterBracket = this.buffer.substring(incompleteIndex);
        if (!afterBracket.includes('】')) {
          result = this.buffer.substring(0, incompleteIndex);
          this.buffer = this.buffer.substring(incompleteIndex);
          return result;
        }
      }
      result = this.buffer;
      this.buffer = '';

      return result;
    }

    let lastIndex = 0;
    for (const sectionMatch of matches) {
      if (sectionMatch.start > lastIndex) {
        result += this.buffer.substring(lastIndex, sectionMatch.start);
      }

      result += `\n\n${sectionMatch.text}\n\n`;

      lastIndex = sectionMatch.end;
    }

    const remaining = this.buffer.substring(lastIndex);

    const incompleteIndex = remaining.lastIndexOf('【');
    if (incompleteIndex !== -1) {
      const afterBracket = remaining.substring(incompleteIndex);
      if (!afterBracket.includes('】')) {
        result += remaining.substring(0, incompleteIndex);
        this.buffer = remaining.substring(incompleteIndex);
        return result;
      }
    }

    result += remaining;
    this.buffer = '';
    return result;
  }


  flush(): string {
    const remaining = this.buffer;

    this.buffer = '';
    return remaining;
  }
}


const removeDollarSigns = (text: string): string => {
  return text.replace(/\$/g, '');
};

/**
 * 1. AI流式解题接口
 * 原生fetch --- AccessToken 过期，它会直接失败。
 */
export const solveStream = async ({
  question,
  onMessage,
  onError,
  signal,
}: SolveStreamOptions) => {
  let token = localStorage.getItem('token');

  if (token) {
    token = token.replace(/^"|"$/g, '');
  }

  const formatter = new SectionFormatter();

  const sendMessage = (content: string) => {
    const cleanedContent = removeDollarSigns(content);
    if (cleanedContent) {
      onMessage(cleanedContent);
    }
  };

  try {
    const endpoint = `/api/${API_VERSION}/solve/stream`;


    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['access-token'] = token;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ question }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, msg: ${errorText}`);
    }

    if (!response.body) throw new Error('Response body is empty');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    const processSSELine = (line: string) => {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) {
        return;
      }

      const dataStr = trimmed.slice(5).trim();


      if (dataStr === '[DONE]') {
        return true; // 标记流结束
      }

      if (!dataStr) {
        return;
      }

      try {
        const parsed = JSON.parse(dataStr);
        let content = '';
        if (typeof parsed === 'object' && parsed !== null) {
          content = (parsed as StreamResponse).content || (parsed as StreamResponse).text || '';
        } else {
          content = dataStr;
        }



        if (content) {
          const formatted = formatter.processChunk(content);
          if (formatted) {
            sendMessage(formatted);
          }
        } else {
        }
      } catch (_e) {
        const formatted = formatter.processChunk(dataStr);

        if (formatted) {
          sendMessage(formatted);
        } else {
        }
      }
      return false;
    };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read();

      if (done) {


        if (buffer.trim()) {
          const lines = buffer.split(/\r?\n/);
          for (const line of lines) {
            if (line.trim()) {
              processSSELine(line);
            }
          }
        } else {
        }

        const remaining = formatter.flush();
        if (remaining) {
          sendMessage(remaining);
        }
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';

      for (const line of lines) {
        const isDone = processSSELine(line);
        if (isDone) {
          const remaining = formatter.flush();
          if (remaining) {
            sendMessage(remaining);
          }
          return;
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

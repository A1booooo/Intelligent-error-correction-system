import { useState, useRef, useEffect } from 'react';
import { solveStream } from '@/services/apis/aiapi/aiapi';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isStreaming?: boolean;
}
// 1. 生成唯一ID的工具函数
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
};

export const useAiExplain = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 消息列表更新时自动滚动
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  /**
   * 停止生成
   */
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);

    setMessages((prev) => {
      const newArr = [...prev];
      if (newArr.length > 0) {
        const lastMsg = newArr[newArr.length - 1];
        if (lastMsg.role === 'ai' && lastMsg.isStreaming) {
           newArr[newArr.length - 1] = { ...lastMsg, isStreaming: false };
        }
      }
      return newArr;
    });
  };

  /**
   * 提交问题
   */
  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    // 2. 使用 generateId 生成绝对唯一 ID
    const userMsgId = generateId();
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: userText },
    ]);

    const aiMsgId = generateId();
    setMessages((prev) => [
      ...prev,
      { id: aiMsgId, role: 'ai', content: '', isStreaming: true },
    ]);

    abortControllerRef.current = new AbortController();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await solveStream({
        question: userText,
        onMessage: (chunk) => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === aiMsgId) {
                return { ...msg, content: msg.content + chunk };
              }
              return msg;
            })
          );
        },
        onError: (err) => {
          console.error('Stream Error:', err);
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === aiMsgId && msg.role === 'ai') {
                return {
                  ...msg,
                  content: msg.content + '[网络请求中断或出错，请重试]',
                  isStreaming: false,
                };
              }
              return msg;
            })
          );
        },
        signal: controller.signal,
      });
    } catch (e) {
        console.error("Unknown error:", e);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  };

  const handleClear = () => {
    if (messages.length === 0) return;
    setMessages([]);
    setInput('');
    handleStop();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return {
    input,
    setInput,
    messages,
    isLoading,
    scrollRef,
    handleStop,
    handleSubmit,
    handleClear,
    handleKeyDown,
  };
};

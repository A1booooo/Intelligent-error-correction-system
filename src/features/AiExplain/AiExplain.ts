import { useState, useRef, useEffect } from 'react';
import { aiApi } from '@/services/apis/aiapi';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isStreaming?: boolean;
}

export const useAiExplain = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  /**
   * 停止生成
   */
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setMessages((prev) => {
        const newArr = [...prev];
        if (newArr.length > 0) {
          newArr[newArr.length - 1].isStreaming = false;
        }
        return newArr;
      });
    }
  };
  /**
   * 提交问题
   */
  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: userText },
    ]);
    const aiMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: aiMsgId, role: 'ai', content: '', isStreaming: true },
    ]);
    abortControllerRef.current = new AbortController();
    await aiApi.solveStream(
      userText,
      (chunk) => {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === aiMsgId) {
              return { ...msg, content: msg.content + chunk };
            }
            return msg;
          }),
        );
      },
      (err) => {
        console.error('Stream Error:', err);
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === aiMsgId) {
              return {
                ...msg,
                content: msg.content + '\n\n[网络请求中断或出错，请重试]',
                isStreaming: false,
              };
            }
            return msg;
          }),
        );
        setIsLoading(false);
      },
      abortControllerRef.current.signal,
    );

    setIsLoading(false);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg,
      ),
    );
    abortControllerRef.current = null;
  };

  const handleClear = async () => {
    if (messages.length === 0) return;

    setMessages([]);
    setInput('');
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

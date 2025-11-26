interface ApiResponse<T> {
    code: number;
    info: string;
    data: T;
    traceId?: string;
  }
  
  export interface GenerationData {
    questionId: string;
    questionContent: string;
  }
  
  export interface JudgeData {
    isCorrect?: boolean;
    result?: string;
  }
  
  const BASE_URL = import.meta.env.VITE_BASE_AXIOS_URL || 'http://156.225.19.144:8091';
  
  async function request<T>(endpoint: string, method: 'GET' | 'POST', params?: Record<string, string | number>): Promise<ApiResponse<T>> {

    const url = new URL(endpoint, BASE_URL);
    
    if (params) {
      Object.keys(params).forEach(key => 
        url.searchParams.append(key, String(params[key]))
      );
    }
  
    // 获取 token (假设你存在 localStorage，如果你的 axios 封装里有特定逻辑，这里需保持一致)
    const token = localStorage.getItem('access-token') || localStorage.getItem('token') || '';
  
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'access-token': token 
    };
  
    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const resData: ApiResponse<T> = await response.json();
      return resData;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }
  
  export const questionApi = {
    /**
     * 1. AI 巩固出题
     */
    generate: (mistakeQuestionId: number) => {
      return request<GenerationData>('/api/question/generation', 'POST', { mistakeQuestionId });
    },
  
    /**
     * 2. AI 判题
     */
    judge: (questionId: string, answer: string) => {
      return request<JudgeData>('/api/question/judge', 'POST', { questionId, answer });
    },
  
    /**
     * 3. 录入错题库
     */
    record: (questionId: string) => {
      return request<null>('/api/question/record', 'POST', { questionId });
    }
  };
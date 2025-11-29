export interface StreamResponse {
    qestion: string;
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
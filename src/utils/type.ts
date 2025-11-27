import type { AxiosRequestConfig } from 'axios';

export interface IResponse<T = any> {
  code: number;
  data: T;
  message: string;
  info: string; 
  success: boolean;
  traceId?: string;
}

export interface RefreshTokenResult {
  newAccessToken: string;
  newRefreshToken: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CustomAxiosRequestConfig extends AxiosRequestConfig {}
import type { AxiosRequestConfig } from 'axios';

export interface IResponse<T = any> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CustomAxiosRequestConfig extends AxiosRequestConfig {}

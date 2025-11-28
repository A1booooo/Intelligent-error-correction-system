import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import {
  addRequest,
  removeRequest,
  cancelRequest,
  cancelAllRequest,
} from './requestQueue';
import { IResponse } from './type';

const REFRESH_URL = '/api/userAccount/refreshToken';
let isRefreshing = false;
let requestsQueue: Array<(token: string) => void> = [];

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_AXIOS_URL || '',
  timeout: 8000,
});

const getRefreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const { data } = await axios.post(
      `${import.meta.env.VITE_BASE_AXIOS_URL}${REFRESH_URL}`,
      {},
      {
        headers: {
          'refresh-token': refreshToken,
        },
      },
    );

    if (data.code === 200 && data.data) {
      const { newAccessToken, newRefreshToken } = data.data;

      localStorage.setItem('token', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      return newAccessToken;
    }
    return null;
  } catch (error) {
    console.error('刷新Token失败', error);
    return null;
  }
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    removeRequest(config);
    addRequest(config);

    const token = localStorage.getItem('token');

    if (token && config.url !== REFRESH_URL && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    removeRequest(response.config);
    return response.data;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig;

    if (config) {
      removeRequest(config);
    }

    if (
      error.response?.status === 401 &&
      config &&
      config.url !== REFRESH_URL
    ) {
      // Token 过期，尝试刷新
      if (isRefreshing) {
        return new Promise((resolve) => {
          requestsQueue.push((newToken) => {
            if (config.headers) {
              config.headers['Authorization'] = newToken;
            }
            resolve(axiosInstance(config)); // 重新发起请求
          });
        });
      }

      isRefreshing = true;
      try {
        const newToken = await getRefreshToken();

        if (newToken) {
          requestsQueue.forEach((cb) => cb(newToken));
          requestsQueue = [];

          if (config.headers) {
            config.headers['Authorization'] = newToken;
          }
          return axiosInstance(config);
        } else {
          throw new Error('刷新失败');
        }
      } catch (error) {
        requestsQueue = [];
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const service = {
  request: <T = unknown>(config: AxiosRequestConfig): Promise<IResponse<T>> => {
    return axiosInstance.request(config);
  },
  cancelRequest,
  cancelAllRequest,
};

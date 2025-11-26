import axios, {
  AxiosHeaders,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { getAccessToken, getRefreshToken, setToken, clearToken } from './token';

interface RefreshResponse {
  code: number;
  data: {
    newAccessToken: string;
    newRefreshToken: string;
  };
}

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 8000,
});

// ======================================
// Token 刷新相关
// ======================================
let isRefreshing = false;
let requestsQueue: ((token: string) => void)[] = [];

// 执行刷新 Token
const refreshTokenRequest = () => {
  return axios.post<RefreshResponse>(
    `${import.meta.env.VITE_BASE_URL}/your/refresh/api`,
    {
      refreshToken: getRefreshToken(),
    },
  );
};

// ======================================
// 请求拦截器 —— 自动带上 Token
// ======================================
request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers ?? {});
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

// ======================================
// 响应拦截器 —— 自动刷新 Token
// ======================================
request.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data?.code === -500) {
      return Promise.reject({
        ...response,
        config: { ...response.config },
        response: {
          ...response,
          data: { ...response.data, isTokenExpired: true, code: -500 },
        },
      });
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    const isTokenExpired =
      error.response?.data?.isTokenExpired ||
      error.response?.data?.code === -500;

    if (isTokenExpired && !originalRequest._retry) {
      originalRequest._retry = true;

      // 如果已经在刷新，则排队等待
      if (isRefreshing) {
        return new Promise((resolve) => {
          requestsQueue.push((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axios(originalRequest));
          });
        });
      }

      // 开始刷新
      isRefreshing = true;

      try {
        const res = await refreshTokenRequest();
        const { newAccessToken, newRefreshToken } = res.data.data;

        // 保存新的 token
        setToken(newAccessToken, newRefreshToken);

        // 执行队列中的请求
        requestsQueue.forEach((cb) => cb(newAccessToken));
        requestsQueue = [];
        isRefreshing = false;

        // 重新发起当前请求
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (err) {
        isRefreshing = false;
        requestsQueue = [];
        clearToken();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default request;

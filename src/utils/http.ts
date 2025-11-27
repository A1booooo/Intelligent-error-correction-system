import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  addRequest,
  removeRequest,
  cancelRequest,
  cancelAllRequest,
} from './requestQueue';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '',
  timeout: 8000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    removeRequest(config);
    addRequest(config);

    const token = localStorage.getItem('access-token');
    if (token && config.headers) {
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
  (error) => {
    if (error.config) {
      removeRequest(error.config);
    }
    return Promise.reject(error);
  },
);

export const service = {
  request: <T = unknown>(config: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.request(config);
  },
  cancelRequest,
  cancelAllRequest,
};

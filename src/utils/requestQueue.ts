import axios, { AxiosRequestConfig, Canceler } from 'axios';

const pendingMap = new Map<string, Canceler>();

const getRequestKey = (config: AxiosRequestConfig) => {
  const { method, url, params, data } = config;
  return [
    method,
    url,
    params ? JSON.stringify(params) : '',
    data ? JSON.stringify(data) : '',
  ].join('&');
};

export const removeRequest = (config: AxiosRequestConfig) => {
  const key = getRequestKey(config);
  if (pendingMap.has(key)) {
    const cancel = pendingMap.get(key);
    if (cancel) {
      cancel(key);
    }
    pendingMap.delete(key);
  }
};

export const addRequest = (config: AxiosRequestConfig) => {
  removeRequest(config);
  const key = getRequestKey(config);

  config.cancelToken = new axios.CancelToken((cancel) => {
    if (!pendingMap.has(key)) {
      pendingMap.set(key, cancel);
    }
  });
};
export const cancelRequest = (url: string | string[]) => {
  const urlList = Array.isArray(url) ? url : [url];

  // 遍历 Map
  for (const [key, cancel] of pendingMap) {
    const isMatched = urlList.some((u) => key.includes(u));
    if (isMatched) {
      cancel(`取消请求: ${url}`);
      pendingMap.delete(key);
    }
  }
};

// 取消所有
export const cancelAllRequest = () => {
  for (const cancel of pendingMap.values()) {
    cancel('取消所有请求');
  }
  pendingMap.clear();
};

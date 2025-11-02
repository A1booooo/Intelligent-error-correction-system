import axios from "axios";

export const service = axios.create({
  baseURL: "http://localhost:114514", 
  timeout: 8000, 
});

service.interceptors.request.use(
  (config) => {
    //token + header 
    return config;
  },
  (error) => Promise.reject(error)
);
service.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

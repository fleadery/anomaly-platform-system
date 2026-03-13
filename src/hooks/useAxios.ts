import axios from "axios";
import API_BASE_URL from "../config/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 可添加请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // TODO: 如果有 token，可以加到 headers
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("Axios Error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
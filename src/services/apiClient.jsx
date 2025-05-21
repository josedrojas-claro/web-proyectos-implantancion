// src/services/apiClient.js
import axios from "axios";
import Cookies from "js-cookie";

const API = import.meta.env.VITE_API_dev;

const apiClient = axios.create({
  baseURL: API,
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

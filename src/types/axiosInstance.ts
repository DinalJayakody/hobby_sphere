import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  // baseURL: "http://16.170.26.131:8080",
});

// Interceptor: runs before every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

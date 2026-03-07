import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm Interceptor để gán JWT token vào header của mọi request
axiosClient.interceptors.request.use(
  (config) => {
    const storedAuth = localStorage.getItem("waste_auth_user");
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData?.token) {
          config.headers.Authorization = `Bearer ${authData.token}`;
        }
      } catch (error) {
        console.error("Lỗi parse auth_user trong localStorage:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;

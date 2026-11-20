import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5051";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & 429
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (typeof window !== "undefined") {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      } else if (error.response?.status === 429) {
        console.warn("Too Many Requests (Rate Limiting). Please wait.");
      }
    }
    return Promise.reject(error);
  }
);

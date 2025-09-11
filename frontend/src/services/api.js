import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh"; // optional helper; we'll implement without it
// but we won't install external libs—make a small manual interceptor instead

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export function createAPI({ getAccessToken, refreshAccessToken }) {
  const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
  });

  // Always attach access token if available
  api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Response interceptor to handle 401 -> refresh flow
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) prom.reject(error);
      else prom.resolve(token);
    });
    failedQueue = [];
  };

  api.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalRequest = err.config;
      if (err.response && err.response.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          }).catch((e) => Promise.reject(e));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newAccess = await refreshAccessToken();
          processQueue(null, newAccess);
          originalRequest.headers.Authorization = "Bearer " + newAccess;
          return api(originalRequest);
        } catch (e) {
          processQueue(e, null);
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(err);
    }
  );

  return api;
}

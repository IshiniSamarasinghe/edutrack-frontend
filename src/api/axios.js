// src/api/axios.js
import axios from "axios";

const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:8001").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
  timeout: 15000,
});

let primed = false;
export async function csrf() {
  if (primed) return;
  await api.get("/sanctum/csrf-cookie"); // sets XSRF-TOKEN + laravel_session
  primed = true;
}

function ensureXsrfHeader(config) {
  const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
  if (m) {
    const token = decodeURIComponent(m[1]);
    config.headers = { ...(config.headers || {}), "X-XSRF-TOKEN": token };
  }
}

// attach header on ALL requests; prime before mutating
api.interceptors.request.use(async (config) => {
  ensureXsrfHeader(config);
  const mutating = /^(post|put|patch|delete)$/i.test(config.method || "get");
  if (mutating) {
    await csrf();
    ensureXsrfHeader(config);
  }
  return config;
});

export const auth = {
  register: (data) => api.post("/register", data),
  login: (data) => api.post("/login", data),
  me: () => api.get("/user"),
  logout: () => api.post("/logout"),
};

export const enrollments = {
  create: (payload) => api.post("/api/enrollments", payload),
  mine:   () => api.get("/api/my-courses"),
};

export { api };
export default api;

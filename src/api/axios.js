// src/api/axios.js
import axios from "axios";

// CRA env; fallback to localhost
const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:8001").replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN", // we'll also set it manually just in case
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 15000,
});

let primed = false;
export async function csrf() {
  if (primed) return;
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("API baseURL =", api.defaults.baseURL);
  }
  await api.get("/sanctum/csrf-cookie");
  primed = true;
}

// Helper to read & decode the XSRF cookie and attach header
function ensureXsrfHeader(config) {
  try {
    const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
    if (m) {
      const token = decodeURIComponent(m[1]);
      if (!config.headers) config.headers = {};
      config.headers["X-XSRF-TOKEN"] = token;
    }
  } catch (_) {
    /* noop */
  }
}

// 1) Auto-prime CSRF before mutating requests
api.interceptors.request.use(async (config) => {
  const needsCsrf =
    /^(post|put|patch|delete)$/i.test(config.method || "get") &&
    !String(config.url || "").includes("/sanctum/csrf-cookie");

  if (needsCsrf) {
    await csrf();
    ensureXsrfHeader(config); // make sure header is present even cross-origin
  }
  return config;
});

// 2) No auto-retry on 419/401 – show the error clearly instead of looping
api.interceptors.response.use(
  (r) => r,
  (err) => Promise.reject(err)
);

// Simple auth helpers
export const auth = {
  register: (data) => api.post("/register", data),
  login: (data) => api.post("/login", data),
  me: () => api.get("/user"),
  logout: () => api.post("/logout"),
};

export default api;

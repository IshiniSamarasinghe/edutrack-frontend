// src/api/axios.js
import axios from "axios";

// ---- Base config ------------------------------------------------------------
const API_BASE =
  (process.env.REACT_APP_API_URL || "http://localhost:8001").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,                 // send/receive cookies
  xsrfCookieName: "XSRF-TOKEN",          // Sanctum defaults
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 15000,
});

// ---- CSRF priming -----------------------------------------------------------
let primed = false;
export async function csrf() {
  if (primed) return;
  await api.get("/sanctum/csrf-cookie"); // sets XSRF-TOKEN + laravel_session
  primed = true;
}

// attach XSRF header from cookie (Safari/Edge quirks)
function ensureXsrfHeader(config) {
  const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  if (!m) return;
  const token = decodeURIComponent(m[1]);
  config.headers = { ...(config.headers || {}), "X-XSRF-TOKEN": token };
}

// Prime CSRF for mutating requests and ensure header is present
api.interceptors.request.use(async (config) => {
  ensureXsrfHeader(config);
  const method = (config.method || "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    await csrf();
    ensureXsrfHeader(config);
  }
  return config;
});

// Optional: auto-handle a stray 419 by retrying once after re-priming
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { config, response } = err || {};
    if (response?.status === 419 && !config?._retried) {
      try {
        await csrf();
        config._retried = true;
        ensureXsrfHeader(config);
        return api.request(config);
      } catch (_) {
        /* fall through */
      }
    }
    return Promise.reject(err);
  }
);

// ---- API Facades ------------------------------------------------------------
// Auth/session (Sanctum SPA)
export const auth = {
  csrf,                                        // call if you want to pre‑prime
  register: (data) => api.post("/register", data),
  login:    (data) => api.post("/login", data),
  me:       () => api.get("/api/me"),          // <- your /api/me route
  logout:   () => api.post("/logout"),
};

// Profile
export const profile = {
  uploadAvatar: (formData) =>
    api.post("/api/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Courses / Enrollments / Results (your existing API)
export const courses = {
  list: (params) => api.get("/api/courses", { params }),
};
export const enrollments = {
  create: (payload) => api.post("/api/enrollments", payload),
  mine:   () => api.get("/api/my-courses"),
};
export const results = {
  list: () => api.get("/api/results"),
};

export { api };
export default api;
// src/api/axios.js
import axios from "axios";

/** ------------------------------------------------------------------------
 * Base config
 * --------------------------------------------------------------------- */
const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:8001")
  .replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,                // send/receive cookies
  xsrfCookieName: "XSRF-TOKEN",         // Sanctum defaults
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 15000,
});

/** ------------------------------------------------------------------------
 * CSRF helpers
 * --------------------------------------------------------------------- */
// Always ensure the header mirrors the cookie (Safari/Edge quirks)
function ensureXsrfHeader(config) {
  const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  if (!m) return;
  const token = decodeURIComponent(m[1]);
  config.headers = { ...(config.headers || {}), "X-XSRF-TOKEN": token };
}

// Always (re)prime before mutating requests.
// Calling /sanctum/csrf-cookie is idempotent and cheap.
export async function csrf(force = true) {
  if (!force) {
    if (/(^|;\s*)XSRF-TOKEN=/.test(document.cookie)) return;
  }
  await api.get("/sanctum/csrf-cookie");
}

/** ------------------------------------------------------------------------
 * Interceptors
 * --------------------------------------------------------------------- */
api.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();

  // For POST/PUT/PATCH/DELETE: fetch a fresh CSRF cookie, then mirror header.
  if (["post", "put", "patch", "delete"].includes(method)) {
    await csrf(true);
    ensureXsrfHeader(config);
  } else {
    ensureXsrfHeader(config);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { config, response } = err || {};
    // If server says 419 (token mismatch), re-prime once and retry.
    if (response?.status === 419 && config && !config._retried) {
      await csrf(true);
      config._retried = true;
      ensureXsrfHeader(config);
      return api.request(config);
    }
    return Promise.reject(err);
  }
);

/** ------------------------------------------------------------------------
 * API facades
 * --------------------------------------------------------------------- */
// Auth/session (Sanctum SPA)
export const auth = {
  csrf, // optional manual call
  register: async (data) => {
    const res = await api.post("/register", data);
    await csrf(true); // re-prime so next POSTs are valid
    return res;
  },
  login: async (data) => {
    const res = await api.post("/login", data);
    await csrf(true);
    return res;
  },
  logout: async () => {
    try {
      return await api.post("/logout");
    } finally {
      await csrf(true);
    }
  },
  me: async () => {
    try {
      return await api.get("/user");
    } catch {
      return await api.get("/api/me");
    }
  },
};

// Profile
export const profile = {
  uploadAvatar: (formData) =>
    api.post("/api/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Courses / Enrollments / Results
export const courses = {
  list: (params) => api.get("/api/courses", { params }),
  // NEW: fetch course content/syllabus for a module offering
  content: (offeringId) => api.get(`/api/courses/${offeringId}/content`),
};

export const enrollments = {
  create: (payload) => api.post("/api/enrollments", payload),
  mine: () => api.get("/api/my-courses"),
   remove: (enrollmentId) => api.delete(`/api/enrollments/${enrollmentId}`),
};

export const results = {
  list: () => api.get("/api/results"),
};

/** ------------------------------------------------------------------------
 * Achievements
 * --------------------------------------------------------------------- */
export const achievements = {
  list: () => api.get("/api/achievements"),
  create: (payload) => {
    const fd = new FormData();
    fd.append("title", payload.title);
    if (payload.desc) fd.append("desc", payload.desc);
    if (payload.link) fd.append("link", payload.link);
    if (payload.date) fd.append("date", payload.date);

    (payload.files || []).forEach((f, i) => fd.append(`files[${i}]`, f));

    return api.post("/api/achievements", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  remove: (id) => api.delete(`/api/achievements/${id}`),
};

export { api };
export default api;

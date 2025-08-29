// src/api/axios.js
import axios from "axios";

/** ------------------------------------------------------------------------
 * Base config
 * --------------------------------------------------------------------- */
const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:8001").replace(/\/+$/, "");

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
function ensureXsrfHeader(config) {
  const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  if (!m) return;
  const token = decodeURIComponent(m[1]);
  config.headers = { ...(config.headers || {}), "X-XSRF-TOKEN": token };
}

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
    // Handle Sanctum 419 (CSRF token mismatch/expired) – retry once
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
    await csrf(true);
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

// Profile (student/user profile features)
export const profile = {
  uploadAvatar: (formData) =>
    api.post("/api/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Courses / Enrollments / Results
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

/** ------------------------------------------------------------------------
 * Admin: student users management
 * --------------------------------------------------------------------- */
export const admin = {
  listUsers: (params) => api.get("/api/admin/users", { params }),
  getUser: (id) => api.get(`/api/admin/users/${id}`),
  createUser: (payload) => api.post("/api/admin/users", payload),
  updateUser: (id, payload) => api.put(`/api/admin/users/${id}`, payload),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
};

/** ------------------------------------------------------------------------
 * Admin AUTH (separate guard)
 * --------------------------------------------------------------------- */
export const adminAuth = {
  register: (payload) => api.post("/api/admin/auth/register", payload),
  login:    (payload) => api.post("/api/admin/auth/login", payload),
  me:       ()        => api.get ("/api/admin/auth/me"),
  logout:   ()        => api.post("/api/admin/auth/logout"),
};

/** ------------------------------------------------------------------------
 * Admins table (list of admin accounts)
 * --------------------------------------------------------------------- */
export const admins = {
  list:   (params) => api.get("/api/admin/admins", { params }),
  remove: (id)     => api.delete(`/api/admin/admins/${id}`),
};

/** ------------------------------------------------------------------------
 * Admin Profile (name/email update)
 * --------------------------------------------------------------------- */
export const adminProfile = {
  get:    ()          => api.get("/api/admin/profile"),
  update: (payload)   => api.put("/api/admin/profile", payload),
};

/** ------------------------------------------------------------------------
 * Admin Course Catalog
 * --------------------------------------------------------------------- */
export const adminCourses = {
  list:    (params)        => api.get("/api/admin/courses", { params }),
  create:  (payload)       => api.post("/api/admin/courses", payload),
  update:  (id, payload)   => api.put(`/api/admin/courses/${id}`, payload),
  remove:  (id)            => api.delete(`/api/admin/courses/${id}`),
  restore: (id)            => api.post(`/api/admin/courses/${id}/restore`),
};

/** ------------------------------------------------------------------------
 * Admin Module Offerings (year/semester per course)
 * --------------------------------------------------------------------- */
export const adminOfferings = {
  list:   (moduleId)             => api.get("/api/admin/module-offerings", { params: { module_id: moduleId } }),
  create: (moduleId, payload)    => api.post("/api/admin/module-offerings", { module_id: moduleId, ...payload }),
  update: (id, body)             => api.put(`/api/admin/module-offerings/${id}`, body),
  remove: (id)                   => api.delete(`/api/admin/module-offerings/${id}`),
};

export { api };
export default api;

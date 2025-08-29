// src/pages/admin/AdminLogin.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminAuth } from "../../api/axios";   // ✅ use the admin auth facade
import "../../styles/AdminSignup.css";         // reuse same scoped styles

export default function AdminLogin() {
  const navigate = useNavigate();

  // inline icons (same as signup)
  const EyeIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      width="18" height="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
  const EyeOffIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      width="18" height="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.8 21.8 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a22 22 0 0 1-3.06 4.38" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);

      // ✅ Sanctum CSRF is handled by axios interceptor for POST requests
      await adminAuth.login({ email: form.email, password: form.password });

      // fetch current admin and store a lightweight marker
      const { data } = await adminAuth.me();
      if (data?.admin) {
        window.localStorage.setItem("edutrack_admin", JSON.stringify(data.admin));
      }

      // go to Admin Shell
      navigate("/admin");
    } catch (err) {
      const res = err?.response;
      const msg =
        res?.status === 422
          ? (res?.data?.message || "Invalid credentials.")
          : (res?.data?.message || err?.message || "Login failed. Check your credentials.");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-auth-wrap">
      <div className="admin-auth-card">
        <div className="brand admin-brand">
          <span className="logo-dot admin-logo-dot" />
          <span className="brand-name admin-brand-name">EduTrack</span>
          <span className="brand-tag admin-brand-tag">• Admin</span>
        </div>

        <h1 className="title admin-title">Welcome back</h1>
        <p className="subtitle admin-subtitle">Sign in to manage courses, users, and results.</p>

        {error && <div className="alert admin-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="form admin-form">
          <div className="form-row admin-form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@university.lk"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-row pw admin-pw">
            <label htmlFor="password">Password</label>
            <div className="pw-box admin-pw-box">
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pw-toggle admin-pw-toggle"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
                aria-pressed={showPw}
              >
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button className="submit-btn admin-submit-btn" disabled={submitting}>
            {submitting ? "Signing In..." : "Log In"}
          </button>
        </form>

        <p className="switch admin-switch">
          New admin? <Link to="/admin/signup">Create an account</Link>
        </p>

        <div className="divider admin-divider" />

        <p className="back-link admin-back-link">
          <Link to="/dashboard">← Back to Student Dashboard</Link>
        </p>
      </div>
    </div>
  );
}

// src/pages/admin/AdminSignup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminAuth } from "../../api/axios";           // ✅ use admin auth API
import "../../styles/AdminSignup.css";

export default function AdminSignup() {
  const navigate = useNavigate();

  // inline icons (no extra libs)
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

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // basic checks
    if (!form.full_name || !form.email || !form.password || !form.confirm_password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      // ✅ real API call (CSRF is handled by axios interceptor)
      await adminAuth.register({
        name: form.full_name,
        email: form.email,
        password: form.password,
      });

      navigate("/admin/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Sign up failed. Please try again.";
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

        <h1 className="title admin-title">Create your Admin account</h1>
        <br />

        {error && <div className="alert admin-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="form admin-form">
          <div className="form-row admin-form-row">
            <label htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="e.g., Ishini Samarasinghe"
              value={form.full_name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

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
                autoComplete="new-password"
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

          <div className="form-row pw admin-pw">
            <label htmlFor="confirm_password">Confirm Password</label>
            <div className="pw-box admin-pw-box">
              <input
                id="confirm_password"
                name="confirm_password"
                type={showPw2 ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirm_password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="pw-toggle admin-pw-toggle"
                onClick={() => setShowPw2((s) => !s)}
                aria-label={showPw2 ? "Hide password" : "Show password"}
                aria-pressed={showPw2}
              >
                {showPw2 ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button className="submit-btn admin-submit-btn" disabled={submitting}>
            {submitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="switch admin-switch">
          Already an admin? <Link to="/admin/login">Log in</Link>
        </p>

        <div className="divider admin-divider" />

        <p className="back-link admin-back-link">
          <Link to="/dashboard">← Back to Student Dashboard</Link>
        </p>
      </div>
    </div>
  );
}

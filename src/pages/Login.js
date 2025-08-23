import { useState } from "react";
import "../styles/Auth.css";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const err = {};
    if (!form.email.trim()) err.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Enter a valid email";
    if (!form.password) err.password = "Required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      // TODO: call your backend here (POST /login)
      // await api.login(form)
      alert("Logged in! (wire this to your backend)");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      {/* Header */}
      <section className="container auth-head">
        <h1>Welcome back</h1>
        <p className="muted">Log in to continue to your dashboard.</p>
      </section>

      {/* Card */}
      <section className="container auth-wrap">
        <form className="auth-card card" onSubmit={onSubmit} noValidate>
          <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
            <div className="field">
              <label>University Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="name@students.kln.ac.lk"
                autoComplete="username"
              />
              {errors.email && <span className="err">{errors.email}</span>}
            </div>

            <div className="field">
              <label>Password</label>
              <div className="pwd">
                <input
                  name="password"
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pwd-toggle"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <span className="err">{errors.password}</span>}
            </div>

            <div className="field" style={{ gap: 0 }}>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={onChange}
                />
                <span>Remember me</span>
              </label>
            </div>
          </div>

          <div className="actions between">
            <a href="/forgot-password" className="link">Forgot password?</a>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Signing in..." : "Login"}
            </button>
          </div>

          <div className="auth-alt">
            Don’t have an account? <a className="link" href="/signup">Create one</a>
          </div>
        </form>
      </section>
    </main>
  );
}

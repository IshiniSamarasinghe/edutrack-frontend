import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, csrf } from "../api/axios";
import "../styles/Auth.css";

export default function SignUp() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    universityEmail: "",
    indexNo: "",      // optional UI field; only saved if backend supports it
    password: "",
    confirm: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const err = {};
    if (!form.fullName.trim()) err.fullName = "Required";
    if (!form.universityEmail.trim()) err.universityEmail = "Required";
    // Restrict to your uni domain
    else if (!/^[^\s@]+@stu\.kln\.ac\.lk$/i.test(form.universityEmail)) {
      err.universityEmail = "Use your university email (@stu.kln.ac.lk).";
    }
    if (!form.password) err.password = "Required";
    else if (form.password.length < 6) err.password = "Min 6 characters";
    if (!form.confirm) err.confirm = "Confirm your password";
    else if (form.confirm !== form.password) err.confirm = "Passwords do not match";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setBusy(true);
    setErrors({});
    try {
      // 1) CSRF
      await csrf();

      // 2) Register (Laravel expects: name, email, password)
      await auth.register({
        name: form.fullName,
        email: form.universityEmail,
        password: form.password,
        // If backend accepts it, also send: index_no: form.indexNo
      });

      // 3) Auto-login (keeps UX smooth)
      await auth.login({ email: form.universityEmail, password: form.password });

      // 4) Optionally fetch and store user (if you rely on it elsewhere)
      const me = await auth.me();
      window.localStorage.setItem("edutrack_user", JSON.stringify(me.data.user));

      navigate("/dashboard");
    } catch (err) {
      const res = err?.response;

      // Laravel validation errors: { message, errors: { field: ['msg'] } }
      if (res?.status === 422) {
        const v = res.data?.errors || {};
        setErrors({
          form: res.data?.message || "Please fix the errors below.",
          fullName: v.name?.[0],
          universityEmail: v.email?.[0],
          password: v.password?.[0],
        });
      } else if (res?.data?.message) {
        setErrors({ form: res.data.message });
      } else {
        setErrors({ form: "Sign up failed. Please try again." });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      {/* Header */}
      <section className="container auth-head">
        <h1>Create your EduTrack account</h1>
        <p className="muted">Join and keep all your courses and results in one place.</p>
      </section>

      {/* Card */}
      <section className="container auth-wrap">
        <form className="auth-card card" onSubmit={onSubmit} noValidate>
          {errors.form && (
            <div className="alert alert-error" role="alert">
              {errors.form}
            </div>
          )}

          <div className="grid">
            <div className="field">
              <label>Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                placeholder="e.g., Ishini Samarasinghe"
                autoComplete="name"
              />
              {errors.fullName && <span className="err">{errors.fullName}</span>}
            </div>

            <div className="field">
              <label>University Email</label>
              <input
                name="universityEmail"
                type="email"
                value={form.universityEmail}
                onChange={onChange}
                placeholder="name@stu.kln.ac.lk"
                autoComplete="email"
              />
              {errors.universityEmail && <span className="err">{errors.universityEmail}</span>}
            </div>

            <div className="field">
              <label>Index Number (optional)</label>
              <input
                name="indexNo"
                value={form.indexNo}
                onChange={onChange}
                placeholder="CT2019xxxx"
              />
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
                  autoComplete="new-password"
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

            <div className="field">
              <label>Confirm Password</label>
              <input
                name="confirm"
                type={showPwd ? "text" : "password"}
                value={form.confirm}
                onChange={onChange}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.confirm && <span className="err">{errors.confirm}</span>}
            </div>
          </div>

          <div className="actions between">
            <Link className="link" to="/login">Already have an account? Login</Link>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

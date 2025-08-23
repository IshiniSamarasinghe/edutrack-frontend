import { useState } from "react";
import "../styles/Auth.css";

export default function SignUp() {
  const [form, setForm] = useState({
    fullName: "",
    universityEmail: "",
    indexNo: "",
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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.universityEmail))
      err.universityEmail = "Enter a valid email";
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
    try {
      // TODO: call your API here
      // await api.signup(form)
      alert("Signed up! (wire this to your backend)");
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
          <div className="grid">
            <div className="field">
              <label>Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                placeholder="e.g., Ishini Samarasinghe"
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
                placeholder="name@students.kln.ac.lk"
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
              />
              {errors.confirm && <span className="err">{errors.confirm}</span>}
            </div>
          </div>

          <div className="actions between">
            <a href="/login" className="link">Already have an account? Login</a>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

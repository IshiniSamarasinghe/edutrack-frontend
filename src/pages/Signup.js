import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, csrf } from "../api/axios";
import "../styles/Auth.css";

export default function SignUp() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    universityEmail: "",
    indexNo: "",
    pathway: "",     // ✅ new
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
    else if (!/^[^\s@]+@stu\.kln\.ac\.lk$/i.test(form.universityEmail)) {
      err.universityEmail = "Use your university email (@stu.kln.ac.lk).";
    }

    if (!form.indexNo.trim()) {
      err.indexNo = "Required";
    } else if (!/^(CT|ET|CS)\d{7}$/i.test(form.indexNo.trim())) {
      err.indexNo = "Format: CT/ET/CS followed by 7 digits (e.g., CT2019001).";
    }

    if (!form.pathway) err.pathway = "Select your pathway";

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

      // 2) Register
      await auth.register({
        name: form.fullName,
        email: form.universityEmail,
        index_number: form.indexNo,   // ✅ send index number
        pathway: form.pathway,        // ✅ send pathway
        password: form.password,
      });

      // 3) Auto-login
      await auth.login({ email: form.universityEmail, password: form.password });

      // 4) Fetch current user and store
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
          indexNo: v.student_number?.[0],
          pathway: v.pathway?.[0],
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
              <label>Index Number (Required*)</label>
              <input
                name="indexNo"
                value={form.indexNo}
                onChange={onChange}
                placeholder="CT2019001"
              />
              {errors.indexNo && <span className="err">{errors.indexNo}</span>}
            </div>

            {/* ✅ New: Select Pathway */}
            <div className="field">
              <label>Select Pathway</label>
              <select
                name="pathway"
                value={form.pathway}
                onChange={onChange}
                required
              >
                <option value="">-- Select your pathway --</option>

                <optgroup label="CT (Computing)">
                  <option value="software_systems">Software Systems</option>
                  <option value="networking">Networking</option>
                  <option value="gaming">Gaming</option>
                </optgroup>

                <optgroup label="ET (Engineering Tech)">
                  <option value="material">Material</option>
                  <option value="sustainable">Sustainable</option>
                  <option value="automation">Automation</option>
                </optgroup>

                <optgroup label="CS (Computer Science)">
                  <option value="cyber_security">Cyber Security</option>
                  <option value="data_science">Data Science</option>
                  <option value="ai">Artificial Intelligence</option>
                  <option value="scientific_computing">Scientific Computing</option>
                </optgroup>
              </select>
              {errors.pathway && <span className="err">{errors.pathway}</span>}
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

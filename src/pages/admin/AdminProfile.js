import { useEffect, useState } from "react";
import { adminProfile } from "../../api/axios";
import "../../styles/admin.css";

export default function AdminProfile() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await adminProfile.get();
        const d = res?.data?.data || {};
        if (mounted) setForm({ name: d.name || "", email: d.email || "" });
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setOk("");
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim() };
      const res = await adminProfile.update(payload);
      const d = res?.data?.data || payload;
      setForm({ name: d.name || "", email: d.email || "" });
      setOk("Saved!");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        "Update failed.";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-card profile-wrapper">{/* single box only */}
      <div className="admin-card-head">
        <h2>Profile</h2>
        <div className="spacer" />
      </div>

      {loading ? (
        <div className="muted">Loading…</div>
      ) : (
        <>
          {err && <div className="error" style={{ marginBottom: 8 }}>{err}</div>}
          {ok && <div className="success" style={{ marginBottom: 8 }}>{ok}</div>}

          <form onSubmit={onSubmit} className="form-grid">
            <label className="form-field">
              <span>Name</span>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Full name"
                required
              />
            </label>

            <label className="form-field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="admin@example.com"
                required
              />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 12 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

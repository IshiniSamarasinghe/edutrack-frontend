import { useEffect, useState } from "react";
import { adminOfferings } from "../../api/axios";

export default function AdminCourseOfferings({ course, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ type: "CT", pathway: "software_systems", year: "", semester: "" });
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminOfferings.list(course.id);
        setRows(res?.data?.data ?? []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load offerings.");
      } finally {
        setLoading(false);
      }
    })();
  }, [course.id]);

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!/^[1-4]$/.test(String(form.year))) return "Year must be 1–4.";
    if (!/^[1-2]$/.test(String(form.semester))) return "Semester must be 1 or 2.";
    return "";
    };

  async function addOffering(e) {
    e.preventDefault();
    const v = validate(); if (v) return alert(v);
    setSaving(true);
    try {
      const payload = {
        type: form.type || null,
        pathway: form.pathway || null,
        year: Number(form.year),
        semester: Number(form.semester),
      };
      const res = await adminOfferings.create(course.id, payload);
      setRows(prev => [res.data.data, ...prev]);
      setForm(f => ({ ...f, year: "", semester: "" }));
    } catch (e2) {
      alert(e2?.response?.data?.message || "Create failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onQuickEdit(row, patch) {
    setBusyId(row.id);
    try {
      const res = await adminOfferings.update(row.id, patch);
      const updated = res.data.data;
      setRows(prev => prev.map(r => (r.id === row.id ? updated : r)));
    } catch (e) {
      alert(e?.response?.data?.message || "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(row) {
    if (!window.confirm("Delete this offering?")) return;
    setBusyId(row.id);
    try {
      await adminOfferings.remove(row.id);
      setRows(prev => prev.filter(r => r.id !== row.id));
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Manage Offerings — {course.code}</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={addOffering} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 8, marginTop: 12 }}>
          <input name="type" value={form.type} onChange={onChange} placeholder="Type (CT)" />
          <input name="pathway" value={form.pathway} onChange={onChange} placeholder="Pathway" />
          <input name="year" value={form.year} onChange={onChange} placeholder="Year (1-4)" inputMode="numeric" />
          <input name="semester" value={form.semester} onChange={onChange} placeholder="Sem (1-2)" inputMode="numeric" />
          <button className="btn btn-primary" disabled={saving}>{saving ? "Adding…" : "Add"}</button>
        </form>

        {loading && <div className="muted" style={{ marginTop: 12 }}>Loading…</div>}
        {err && !loading && <div className="error" style={{ marginTop: 12 }}>{err}</div>}

        {!loading && !err && (
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th><th>Pathway</th><th>Year</th><th>Semester</th><th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={5} className="center muted">No offerings yet.</td></tr>}
                {rows.map(r => (
                  <tr key={r.id}>
                    <td className="mono">{r.type ?? "—"}</td>
                    <td className="mono">{r.pathway ?? "—"}</td>
                    <td>
                      <input
                        style={{ width: 64 }}
                        defaultValue={r.year}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (/^[1-4]$/.test(v) && Number(v) !== r.year) onQuickEdit(r, { year: Number(v) });
                          else e.target.value = r.year;
                        }}
                        disabled={busyId === r.id}
                      />
                    </td>
                    <td>
                      <input
                        style={{ width: 64 }}
                        defaultValue={r.semester}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (/^[1-2]$/.test(v) && Number(v) !== r.semester) onQuickEdit(r, { semester: Number(v) });
                          else e.target.value = r.semester;
                        }}
                        disabled={busyId === r.id}
                      />
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost" onClick={() => onDelete(r)} disabled={busyId === r.id}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const backdrop = { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", justifyContent: "flex-end", zIndex: 1000 };
const panel = { width: "min(720px, 95vw)", height: "100%", background: "var(--surface,#fff)", padding: 16, overflow: "auto" };

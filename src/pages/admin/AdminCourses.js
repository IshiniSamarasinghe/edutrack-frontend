// src/pages/admin/AdminCourses.js
import { useEffect, useState, useCallback } from "react";
import { adminCourses } from "../../api/axios";
import AdminCourseOfferings from "./AdminCourseOfferings";

// formatters for year/semester from either fields or offerings[]
const formatYears = (c) => {
  if (c?.year != null) return String(c.year);
  if (Array.isArray(c?.offerings) && c.offerings.length) {
    const uniq = [...new Set(c.offerings.map((o) => o.year).filter((v) => v != null))];
    return uniq.length ? uniq.join(", ") : "–";
  }
  return "–";
};

const formatSemesters = (c) => {
  if (c?.semester != null) return String(c.semester);
  if (Array.isArray(c?.offerings) && c.offerings.length) {
    const uniq = [...new Set(c.offerings.map((o) => o.semester).filter((v) => v != null))];
    return uniq.length ? uniq.join(", ") : "–";
  }
  return "–";
};

export default function AdminCourses() {
  const [rows, setRows] = useState([]);

  // loading + errors
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // modal + offerings
  const [showNew, setShowNew] = useState(false);
  const [offerCourse, setOfferCourse] = useState(null);

  // create form
  const [form, setForm] = useState({ title: "", code: "", year: "", semester: "" });
  const [creating, setCreating] = useState(false);
  const [formErr, setFormErr] = useState("");

  // pagination + filters
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("code");
  const [dir, setDir] = useState("asc");

  const fetchPage = useCallback(
    async ({ pageNumber = 1, reset = false } = {}) => {
      try {
        if (reset) {
          setLoading(true);
          setErr(null);
        } else {
          setLoadingMore(true);
        }

        const res = await adminCourses.list({
          page: pageNumber,
          per_page: perPage,
          q: q || undefined,
          sort,
          dir,
        });

        const data = res?.data?.data ?? [];
        const current = res?.data?.current_page ?? 1;
        const last = res?.data?.last_page ?? 1;

        setRows((prev) => (reset ? data : [...prev, ...data]));
        setPage(current);
        setLastPage(last);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load courses.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [perPage, q, sort, dir]
  );

  useEffect(() => {
    fetchPage({ pageNumber: 1, reset: true });
  }, [fetchPage]);

  async function onEdit(course) {
    const newTitle = window.prompt("New title:", course.title);
    if (newTitle == null) return;
    const creditsStr = window.prompt("Credits (leave blank to keep):", course.credits ?? "");
    const credits = creditsStr === "" ? course.credits : Number(creditsStr);

    setBusyId(course.id);
    try {
      const res = await adminCourses.update(course.id, { title: newTitle, credits });
      const updated = res.data.data;
      setRows((prev) => prev.map((r) => (r.id === course.id ? { ...r, ...updated } : r)));
    } catch (e) {
      alert(e?.response?.data?.message || "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function onArchive(course) {
    if (!window.confirm(`Archive ${course.code} - ${course.title}?`)) return;
    setBusyId(course.id);
    try {
      await adminCourses.remove(course.id);
      setRows((prev) => prev.map((r) => (r.id === course.id ? { ...r, status: "archived" } : r)));
    } catch (e) {
      alert(e?.response?.data?.message || "Archive failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function onRestore(course) {
    setBusyId(course.id);
    try {
      await adminCourses.restore(course.id);
      setRows((prev) => prev.map((r) => (r.id === course.id ? { ...r, status: "active" } : r)));
    } catch (e) {
      alert(e?.response?.data?.message || "Restore failed.");
    } finally {
      setBusyId(null);
    }
  }

  function openNew() {
    setFormErr("");
    setForm({ title: "", code: "", year: "", semester: "" });
    setShowNew(true);
  }

  function closeNew() {
    if (!creating) setShowNew(false);
  }

  function onFormChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validateForm() {
    if (!form.title.trim()) return "Title is required.";
    if (!form.code.trim()) return "Course code is required.";
    if (!form.year) return "Year is required.";
    if (!/^\d+$/.test(form.year)) return "Year must be a number.";
    if (!form.semester) return "Semester is required.";
    if (!/^\d+$/.test(form.semester)) return "Semester must be a number.";
    return "";
  }

  async function onCreateSubmit(e) {
    e.preventDefault();
    const v = validateForm();
    if (v) {
      setFormErr(v);
      return;
    }
    setFormErr("");
    setCreating(true);
    try {
      const payload = {
        title: form.title.trim(),
        code: form.code.trim(),
        year: Number(form.year),
        semester: Number(form.semester),
      };
      const res = await adminCourses.create(payload);
      const created = res?.data?.data ?? payload;

      const normalized = {
        id: created.id ?? Math.random().toString(36).slice(2),
        code: created.code,
        title: created.title,
        year: created.year ?? null,
        semester: created.semester ?? null,
        offerings: created.offerings ?? null,
        credits: created.credits ?? null,
        enrolled: created.enrolled ?? 0,
        status: created.status ?? "active",
      };

      setRows((prev) => [normalized, ...prev]);
      setShowNew(false);
    } catch (e2) {
      setFormErr(e2?.response?.data?.message || "Create failed.");
    } finally {
      setCreating(false);
    }
  }

  function onSearchSubmit(e) {
    e.preventDefault();
    fetchPage({ pageNumber: 1, reset: true });
  }

  function onChangePerPage(e) {
    setPerPage(Number(e.target.value) || 25);
  }

  function toggleSort(next) {
    if (sort === next) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(next);
      setDir("asc");
    }
  }

  function thKeySort(e, key) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSort(key);
    }
  }

  const canLoadMore = page < lastPage;

  return (
    <div className="admin-card">
      <div className="admin-card-head">
        <h2>Course Catalog</h2>
        <div className="spacer" />
        <form onSubmit={onSearchSubmit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search code or title…"
            style={{ minWidth: 220 }}
          />
          <select value={perPage} onChange={onChangePerPage}>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
          <button className="btn btn-ghost" type="submit">Apply</button>
        </form>
        <button className="btn btn-primary" onClick={openNew}>Add New Course</button>
      </div>

      {loading && <div className="muted">Loading…</div>}
      {err && !loading && <div className="error">{err}</div>}

      {!loading && !err && (
        <>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th
                    onClick={() => toggleSort("code")}
                    onKeyDown={(e) => thKeySort(e, "code")}
                    tabIndex={0}
                    style={{ cursor: "pointer", userSelect: "none", color: "inherit", font: "inherit" }}
                  >
                    Code {sort === "code" ? (dir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th
                    onClick={() => toggleSort("title")}
                    onKeyDown={(e) => thKeySort(e, "title")}
                    tabIndex={0}
                    style={{ cursor: "pointer", userSelect: "none", color: "inherit", font: "inherit" }}
                  >
                    Title {sort === "title" ? (dir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th>Year</th>
                  <th>Semester</th>
                  <th
                    onClick={() => toggleSort("credits")}
                    onKeyDown={(e) => thKeySort(e, "credits")}
                    tabIndex={0}
                    style={{ cursor: "pointer", userSelect: "none", color: "inherit", font: "inherit" }}
                  >
                    Credits {sort === "credits" ? (dir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th>Enrolled</th>
                  <th
                    onClick={() => toggleSort("updated_at")}
                    onKeyDown={(e) => thKeySort(e, "updated_at")}
                    tabIndex={0}
                    style={{ cursor: "pointer", userSelect: "none", color: "inherit", font: "inherit" }}
                  >
                    Status {sort === "updated_at" ? (dir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th style={{ width: 360 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="center muted">No courses found.</td>
                  </tr>
                )}

                {rows.map((c) => (
                  <tr key={c.id ?? c.code}>
                    <td className="mono">{c.code}</td>
                    <td className="tight">{c.title}</td>
                    <td className="center">{formatYears(c)}</td>
                    <td className="center">{formatSemesters(c)}</td>
                    <td className="center">{c.credits ?? "–"}</td>
                    <td className="center">{c.enrolled ?? "–"}</td>
                    <td>
                      <span className={"pill " + ((c.status || "active") === "active" ? "pill-green" : "pill-muted")}>
                        {c.status || "active"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost" onClick={() => onEdit(c)} disabled={busyId === c.id}>
                          Edit
                        </button>
                        <button className="btn btn-ghost" onClick={() => setOfferCourse(c)} disabled={busyId === c.id}>
                          Manage Offerings
                        </button>
                        {c.status === "archived" ? (
                          <button className="btn btn-ghost" onClick={() => onRestore(c)} disabled={busyId === c.id}>
                            Restore
                          </button>
                        ) : (
                          <button className="btn btn-ghost" onClick={() => onArchive(c)} disabled={busyId === c.id}>
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            {canLoadMore ? (
              <button
                className="btn btn-ghost"
                onClick={() => fetchPage({ pageNumber: page + 1, reset: false })}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : `Load more (${page}/${lastPage})`}
              </button>
            ) : (
              <div className="muted">Showing all results ({rows.length})</div>
            )}
          </div>
        </>
      )}

      {showNew && (
        <div style={backdropStyle} onClick={closeNew}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Add New Course</h3>
              <button className="btn btn-ghost" onClick={closeNew} disabled={creating}>✕</button>
            </div>

            {formErr && <div className="error" style={{ marginBottom: 8 }}>{formErr}</div>}

            <form onSubmit={onCreateSubmit} className="form-grid">
              <label className="form-field">
                <span>Title</span>
                <input
                  name="title"
                  value={form.title}
                  onChange={onFormChange}
                  placeholder="e.g., Data Structures"
                  required
                />
              </label>

              <label className="form-field">
                <span>Course Code</span>
                <input
                  name="code"
                  value={form.code}
                  onChange={onFormChange}
                  placeholder="e.g., CTEC 32041"
                  required
                />
              </label>

              <div className="form-row">
                <label className="form-field" style={{ flex: 1, marginRight: 8 }}>
                  <span>Year</span>
                  <input
                    name="year"
                    value={form.year}
                    onChange={onFormChange}
                    placeholder="e.g., 3"
                    inputMode="numeric"
                    required
                  />
                </label>

                <label className="form-field" style={{ flex: 1, marginLeft: 8 }}>
                  <span>Semester</span>
                  <input
                    name="semester"
                    value={form.semester}
                    onChange={onFormChange}
                    placeholder="e.g., 1"
                    inputMode="numeric"
                    required
                  />
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button type="button" className="btn btn-ghost" onClick={closeNew} disabled={creating}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? "Saving…" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {offerCourse && (
        <AdminCourseOfferings course={offerCourse} onClose={() => setOfferCourse(null)} />
      )}
    </div>
  );
}

// inline styles for modal
const backdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "var(--surface, #fff)",
  color: "var(--text, #111)",
  width: "min(560px, 92vw)",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
};

import { useCallback, useEffect, useMemo, useState } from "react";
import { admin } from "../../api/axios";

// Icons
const Eye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const Trash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

// helper: pick user avatar or placeholder
const AV_PLACEHOLDER = "/images/avatar-placeholder.png";
const pickAvatar = (u) => (u?.avatar_url ? u.avatar_url : AV_PLACEHOLDER);

export default function AdminUsers() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [sort, setSort] = useState({ key: "created_at", dir: "desc" });

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Modals / actions
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const params = useMemo(
    () => ({ q: query || undefined, page, per_page: perPage, sort: sort.key, dir: sort.dir }),
    [query, page, perPage, sort]
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      const { data } = await admin.listUsers(params);
      setRows(data.data || []);
      setMeta({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
      });
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  const onSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
    setPage(1);
  };

  const headerBtn = (label, key) => (
    <button className="btn btn-ghost" onClick={() => onSort(key)} title={`Sort by ${label}`}>
      {label} {sort.key === key ? (sort.dir === "asc" ? "▲" : "▼") : ""}
    </button>
  );

  const openView = async (id) => {
    try {
      setViewData(null);
      const { data } = await admin.getUser(id);
      setViewData(data);
      setViewOpen(true);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to fetch user.");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      setDeletingId(id);
      await admin.deleteUser(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const fmt = (v) => (v ? new Date(v).toLocaleString() : "—");

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Users</h2>
          <div className="spacer" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search name or email…"
            className="btn"
            style={{ minWidth: 260 }}
          />
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{headerBtn("ID", "id")}</th>
                <th>Avatar</th>
                <th>{headerBtn("Name", "name")}</th>
                <th>{headerBtn("Email", "email")}</th>
                <th>{headerBtn("Verified", "email_verified_at")}</th>
                <th>{headerBtn("Created", "created_at")}</th>
                <th>{headerBtn("Updated", "updated_at")}</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan={8}>Loading…</td></tr>
              ) : err ? (
                <tr><td colSpan={8} className="mono" style={{ color: "#b03343" }}>{err}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="muted">No users found.</td></tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id}>
                    <td className="mono">{u.id}</td>

                    {/* Avatar cell with one-shot onError */}
                    <td>
                      <img
                        src={pickAvatar(u)}
                        alt="avatar"
                        style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.onerror = null; // avoid infinite loop
                          e.currentTarget.src = AV_PLACEHOLDER;
                        }}
                      />
                    </td>

                    <td>{u.name}</td>
                    <td className="mono">{u.email}</td>
                    <td>
                      {u.email_verified_at ? (
                        <span className="pill pill-green" title={fmt(u.email_verified_at)}>verified</span>
                      ) : (
                        <span className="pill pill-muted">unverified</span>
                      )}
                    </td>
                    <td className="mono">{fmt(u.created_at)}</td>
                    <td className="mono">{fmt(u.updated_at)}</td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" title="View" aria-label="View" onClick={() => openView(u.id)}>
                          <Eye />
                        </button>
                        <button
                          className="icon-btn danger"
                          title="Delete"
                          aria-label="Delete"
                          onClick={() => onDelete(u.id)}
                          disabled={deletingId === u.id}
                        >
                          <Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px" }}>
          <span className="muted" style={{ marginRight: "auto" }}>
            Page {meta.current_page} of {meta.last_page} • {meta.total} total
          </span>
          <button className="btn" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </button>
          <button className="btn" disabled={page >= meta.last_page || loading} onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}>
            Next
          </button>
        </div>
      </div>

      {/* View modal */}
      {viewOpen && viewData && (
        <div className="modal-backdrop" onClick={() => setViewOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>User #{viewData.id}</h3>
              <button className="btn btn-ghost" onClick={() => setViewOpen(false)}>Close</button>
            </div>

            {/* Big avatar preview with one-shot fallback */}
            <div style={{ display: "flex", gap: 16, alignItems: "center", margin: "8px 0 20px" }}>
              <img
                src={pickAvatar(viewData)}
                alt="avatar"
                style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = AV_PLACEHOLDER;
                }}
              />
              <div className="muted">Avatar</div>
            </div>

            <div className="form-grid" style={{ maxWidth: 620 }}>
              <div className="form-row"><label>Name</label><input readOnly value={viewData.name || ""} /></div>
              <div className="form-row"><label>Email</label><input readOnly value={viewData.email || ""} /></div>
              <div className="form-row"><label>Email verified at</label><input readOnly value={fmt(viewData.email_verified_at)} /></div>
              <div className="form-row"><label>Created</label><input readOnly value={fmt(viewData.created_at)} /></div>
              <div className="form-row"><label>Updated</label><input readOnly value={fmt(viewData.updated_at)} /></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

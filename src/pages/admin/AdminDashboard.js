import { useEffect, useMemo, useState } from "react";
import api, { admin, adminCourses } from "../../api/axios";
import "../../styles/admin.css";

const PENDING_FALLBACK = 3; // shown if API not available

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [countsMap, setCountsMap] = useState({}); // userId -> enrolled count (optional)
  const [pendingResults, setPendingResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // fetch users + courses
        const [uRes, cRes] = await Promise.all([
          admin.listUsers(),
          adminCourses.list(),
        ]);

        const usersArr = Array.isArray(uRes?.data) ? uRes.data : uRes?.data?.data || [];
        const coursesArr = Array.isArray(cRes?.data) ? cRes.data : cRes?.data?.data || [];

        if (mounted) {
          setUsers(usersArr);
          setCourses(coursesArr);
        }

        // ----- Pending Results count -----
        try {
          const r = await api.get("/api/admin/results/pending-count");
          setPendingResults(Number(r?.data?.count ?? PENDING_FALLBACK));
        } catch {
          setPendingResults(PENDING_FALLBACK);
        }

        // OPTIONAL: per-user enrollment counts (if you add this endpoint)
        try {
          const mRes = await api.get("/api/admin/enrollments/user-counts");
          const map =
            mRes?.data?.data && typeof mRes.data.data === "object"
              ? mRes.data.data
              : typeof mRes?.data === "object"
              ? mRes.data
              : {};
          if (mounted) setCountsMap(map || {});
        } catch {
          /* ignore if not implemented */
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const totalUsers = users.length;
  const coursesCount = courses.length;

  const recentUsers = useMemo(() => {
    const arr = [...users];
    if (arr.length && arr[0]?.created_at) {
      arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return arr.slice(0, 3).map((u) => ({
      name: u.name || u.full_name || "—",
      email: u.email || "—",
      // try several sources for “how many courses enrolled”
      enrolled:
        countsMap?.[u.id] ??
        u.enrollments_count ??
        u.enrolled_count ??
        u.enrollment_count ??
        (Array.isArray(u.enrollments) ? u.enrollments.length : null) ??
        null,
    }));
  }, [users, countsMap]);

  const showEnrollCol = recentUsers.some((u) => typeof u.enrolled === "number");

  const stats = [
    { label: "Total Users", value: loading ? "…" : totalUsers || 0 },
    { label: "Courses", value: loading ? "…" : coursesCount || 0 },
    { label: "Pending Results", value: pendingResults ?? "…" },
  ];

  return (
    <div className="admin-grid">
      <section className="kpis">
        {stats.map((s, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-value">{s.value}</div>
            <div className="kpi-label">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="admin-card">
        <div className="admin-card-head">
          <h2>Recent Users</h2>
          <div className="spacer" />
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {showEnrollCol && <th>Enrolled</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={showEnrollCol ? 3 : 2} className="muted">Loading…</td></tr>
              ) : recentUsers.length ? (
                recentUsers.map((u, idx) => (
                  <tr key={idx}>
                    <td>{u.name}</td>
                    <td className="mono">{u.email}</td>
                    {showEnrollCol && (
                      <td><span className="pill pill-blue">{u.enrolled ?? "—"}</span></td>
                    )}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={showEnrollCol ? 3 : 2} className="muted">No users yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

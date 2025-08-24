import { useEffect, useMemo, useState, useCallback } from "react";
import "../styles/Courses.css";
import Milestones from "../components/Milestones";
import EnrollModal from "../components/EnrollModal";
import { api, auth, csrf } from "../api/axios"; // make sure csrf is exported here

function Courses() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState(""); // "", "3", "4"
  const [items, setItems] = useState([]); // [{id,code,title,description,year,semester,enrolled}, ...]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const load = useCallback(async (lvl = "") => {
    const ctrl = new AbortController();
    setLoading(true);
    setErr("");

    try {
      // Ensure cookies exist (Sanctum)
      await csrf();

      // Optional: verify the session (if this 401s, redirect to login)
      await auth.me();

      const { data } = await api.get("/api/courses", {
        params: lvl ? { level: lvl } : {},
        signal: ctrl.signal,
      });

      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      // Ignore abort errors
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;

      if (e?.response?.status === 401) {
        setErr("Unauthenticated.");
        setItems([]);
        // e.g., navigate("/login");
      } else {
        setErr(e?.response?.data?.message || "Failed to load courses. Please try again.");
        setItems([]);
      }
    } finally {
      setLoading(false);
    }

    // Return a cancel function so callers can abort if needed
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const cancel = load(level);
    // load returns either void or a cancel fn (awaited value). Safely handle both:
    if (typeof cancel === "function") return cancel;
  }, [level, load]);

  // client-side text search (server already filters by level)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) => c.title?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <main className="courses">
      {/* Page header */}
      <section className="container courses-head">
        <h1>Course Catalog</h1>
        <p className="muted">Browse and discover courses available for enrollment</p>

        {/* Filters */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search by course code or name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search courses"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            aria-label="Filter by level"
          >
            <option value="">Level 3 &amp; 4</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
          </select>
          <button
            type="button"
            className="btn btn-primary search-btn"
            onClick={() => load(level)}
          >
            Search Courses
          </button>
        </div>

        {err && (
          <div className="alert alert-error" role="alert">
            {err}
          </div>
        )}
      </section>

      {/* Grid */}
      <section className="container">
        {loading ? (
          <p className="muted">Loading courses…</p>
        ) : (
          <>
            <div className="courses-grid">
              {filtered.map((c) => (
                <article
                  key={c.id ?? `${c.year}-${c.semester}-${c.code}`}
                  className="course-card card"
                >
                  <header className="course-top">
                    <a href="#!" className="code-link">
                      {c.code}
                    </a>
                    <span className="sub">
                      Level {c.year} &nbsp;|&nbsp; Semester {c.semester}
                    </span>
                  </header>

                  <h3 className="course-title">{c.title}</h3>
                  <p className="course-desc">{c.description}</p>

                  <div className="course-actions">
                    {c.enrolled ? (
                      <span className="enrolled">
                        <span className="dot" /> Enrolled
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary sm"
                        onClick={() => setSelectedCourse(c)}
                      >
                        Enroll
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {!filtered.length && (
              <p className="muted" style={{ marginTop: 16 }}>
                No courses found{query ? " for your search" : ""}.
              </p>
            )}

            <div className="view-all-wrap">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setQuery("");
                  setLevel("");
                  load("");
                }}
              >
                View All Courses
              </button>
            </div>
          </>
        )}
      </section>

      {/* Milestones band */}
      <Milestones />

      {/* Enroll Modal */}
      {selectedCourse && (
        <EnrollModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onSuccess={() => load(level)} // refresh to show “Enrolled”
        />
      )}
    </main>
  );
}

export default Courses;

// src/pages/MyCourses.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { enrollments } from "../api/axios";
import "../styles/Courses.css";
import "../styles/MyCourses.css";

export default function MyCourses() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await enrollments.mine();
        setItems(data?.items || []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load your courses.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="mycourses">
      <section className="container mycourses-head">
        <div className="mycourses-title-wrap">
          <div>
            <h1 className="mycourses-title">My Courses</h1>
            <p className="muted sub">
              View all courses you are currently enrolled in and access course materials.
            </p>
          </div>

          <Link to="/courses" className="btn btn-primary search-btn">
            Search Courses
          </Link>
        </div>

        {err && <div className="alert alert-error" role="alert">{err}</div>}
      </section>

      <section className="container">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : !items.length ? (
          <p className="muted">You’re not enrolled in any courses yet.</p>
        ) : (
          <div className="courses-grid">
            {items.map((c) => (
              <article key={c.enrollment_id} className="course-card card">
                <header className="course-top">
                  <span className="code-link">{c.code}</span>
                  <span className="sub">Level {c.year} | Semester {c.semester}</span>
                </header>

                <h3 className="course-title">{c.title}</h3>
                {c.description && <p className="course-desc">{c.description}</p>}

                <div className="course-actions">
                  <span className="enrolled"><span className="dot" /> Enrolled</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

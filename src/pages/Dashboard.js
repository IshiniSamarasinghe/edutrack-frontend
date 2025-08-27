// src/pages/Dashboard.jsx (or .js)
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";
import Milestones from "../components/Milestones";
import { enrollments } from "../api/axios";

function Dashboard() {
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await enrollments.mine();
        setEnrolled(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load your enrolled courses.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const topThree = enrolled.slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <h1>Welcome to Your Academic Dashboard</h1>
          <p className="hero-sub">
            From finding the right course to viewing your grades, EduTrack makes your academic
            journey smoother.
          </p>
          <a href="#overview" className="hero-cta">Get Started</a>
        </div>
      </section>

      {/* Academic Overview */}
      <section id="overview" className="section">
        <h2 className="section-title">Academic Overview</h2>

        <div className="overview-grid">
          {/* Enrolled Courses */}
          <div className="card overview-card">
            <h3>Enrolled Courses</h3>

            {err && <p className="muted" style={{ color: "#b31e1e" }}>{err}</p>}
            {loading ? (
              <>
                <div className="list-row"><span className="pill skeleton">Loading…</span></div>
                <div className="list-row"><span className="pill skeleton">Loading…</span></div>
                <div className="list-row"><span className="pill skeleton">Loading…</span></div>
              </>
            ) : topThree.length ? (
              topThree.map((c) => (
                <div className="list-row" key={c.enrollment_id}>
                  <span className="pill">{c.title}</span>
                  <Link className="btn sm btn-outline" to="/my-courses">
                    View
                  </Link>
                </div>
              ))
            ) : (
              <p className="muted" style={{ marginTop: 6 }}>
                You haven’t enrolled in any courses yet.
              </p>
            )}

            <Link to="/my-courses" className="link-cta">View All Courses</Link>
          </div>

          {/* Recent Results */}
          <div className="card overview-card">
            <h3>Recent Results</h3>

            <div className="list-row">
              <span className="pill">Level 3 | Semester 1</span>
              <Link className="btn sm btn-outline" to="/results">View</Link>
            </div>
            <div className="list-row">
              <span className="pill">Level 3 | Semester 2</span>
              <Link className="btn sm btn-outline" to="/results">View</Link>
            </div>
            <div className="list-row">
              <span className="pill">Level 4 | Semester 1</span>
              <Link className="btn sm btn-outline" to="/results">View</Link>
            </div>

            <Link to="/results" className="link-cta">View All Results</Link>
          </div>

          {/* Quick Actions */}
          <div className="card overview-card">
            <h3>Quick Actions</h3>

            <Link to="/courses" className="action-row">
              <div className="action-text">
                <strong>Enroll in Courses</strong>
                <span>Add New Courses to Your Schedule</span>
              </div>
              <span className="action-icon">↗</span>
            </Link>

            <Link to="/profile" className="action-row">
              <div className="action-text">
                <strong>Manage Profile</strong>
                <span>Update Your Personal Information</span>
              </div>
              <span className="action-icon">↗</span>
            </Link>

            <Link to="/courses" className="action-row">
              <div className="action-text">
                <strong>Browse Catalog</strong>
                <span>Explore Available Courses</span>
              </div>
              <span className="action-icon">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <Milestones />
    </main>
  );
}

export default Dashboard;

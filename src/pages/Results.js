// src/pages/Results.js
import { useEffect, useMemo, useState } from "react";
import "../styles/Results.css";
import Milestones from "../components/Milestones";
import { api, auth, csrf } from "../api/axios"; // uses your axios instance

export default function Results() {
  const [items, setItems] = useState([]);   // API rows
  const [gpa, setGpa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      await csrf();
      await auth.me(); // ensure session
      const { data } = await api.get("/api/results");
      setItems(Array.isArray(data?.items) ? data.items : []);
      setGpa(data?.gpa ?? null);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load results.");
      setItems([]);
      setGpa(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Group by Level + Semester
  const groups = useMemo(() => {
    const map = new Map();
    for (const r of items) {
      const key = `L${r.level}S${r.semester}`;
      if (!map.has(key)) map.set(key, { level: r.level, semester: r.semester, rows: [] });
      map.get(key).rows.push(r);
    }
    return Array.from(map.values()).sort((a,b)=>(a.level-b.level)|| (a.semester-b.semester));
  }, [items]);

  return (
    <main className="results">
      <section className="container results-head">
        <div className="results-title-wrap">
          <div>
            <h1>Academic Results</h1>
            <p className="muted">View your grades and academic performance across all enrolled courses.</p>
          </div>
          <div className="gpa-badge">
            Overall GPA: <span>{gpa == null ? "—" : gpa.toFixed(2)}</span>
          </div>
        </div>
        {err && <div className="alert alert-error" role="alert">{err}</div>}
      </section>

      <section className="container results-tables">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : !groups.length ? (
          <p className="muted">No results yet.</p>
        ) : (
          groups.map(g => (
            <div key={`L${g.level}S${g.semester}`} className="results-block">
              <h2 className="semester-title">Level {g.level} | Semester {g.semester}</h2>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Academic Year</th>
                    <th>Course</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.academic_year}</td>
                      <td>{r.code} – {r.title}</td>
                      <td className="grade"><strong>{r.grade}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </section>

      <br />
      <Milestones />
    </main>
  );
}

// src/pages/Results.js
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Results.css";

export default function Results() {
  const [payload, setPayload] = useState({ gpa: null, items: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("http://localhost:8001/api/results", {
          withCredentials: true,
        });
        setPayload(data);
      } catch (e) {
        setErr(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="container py-4">Loading results…</div>;
  if (err) return <div className="container py-4 text-danger">Couldn’t load results: {err}</div>;

  return (
    <section className="results container">
      <div className="results-head">
        <div className="results-title-wrap">
          <h1>My Results</h1>
          <div className="gpa-badge">
            GPA:&nbsp;<span>{payload.gpa ?? "—"}</span>
          </div>
        </div>

        <p className="results-sub muted">
          Browse and review your module grades and GPA calculated from uploaded results.
        </p>
      </div>

      <div className="results-block">
        {payload.items.length === 0 ? (
          <div className="muted">No results yet.</div>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Sem</th>
                <th>Code</th>
                <th>Title</th>
                <th>Credits</th>
                <th>Academic Year</th>
                <th>Grade</th>
                <th>GPA</th>
              </tr>
            </thead>
            <tbody>
              {payload.items.map((r, i) => (
                <tr key={i}>
                  <td>{r.level}</td>
                  <td>{r.semester}</td>
                  <td className="mono">{r.code}</td>
                  <td className="title">{r.title}</td>
                  <td>{r.credits}</td>
                  <td>{r.academic_year}</td>
                  <td className="grade">{r.grade}</td>
                  <td>{Number(r.grade_points).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

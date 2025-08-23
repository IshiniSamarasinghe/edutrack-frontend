import { useMemo, useState } from "react";
import "../styles/Courses.css";
import Milestones from "../components/Milestones";
import EnrollModal from "../components/EnrollModal"; // ✅ modal import

const allCourses = [
  {
    id: "SWST44062-1",
    code: "SWST 44062",
    level: 4,
    semester: 2,
    title: "Enterprise Application Development",
    desc:
      "An introductory course in software systems covering basic concepts of enterprise application development."
  },
  {
    id: "SWST44062-2",
    code: "SWST 44062",
    level: 4,
    semester: 1,
    title: "Enterprise Application Development",
    desc:
      "An introductory course in software systems covering basic concepts of enterprise application development."
  },
  {
    id: "SWST44062-3",
    code: "SWST 44062",
    level: 3,
    semester: 2,
    title: "Enterprise Application Development",
    desc:
      "An introductory course in software systems covering basic concepts of enterprise application development."
  },
  {
    id: "SWST44062-4",
    code: "SWST 44062",
    level: 3,
    semester: 1,
    title: "Enterprise Application Development",
    desc:
      "An introductory course in software systems covering basic concepts of enterprise application development."
  },
  {
    id: "SWST44062-5",
    code: "SWST 44062",
    level: 2,
    semester: 2,
    title: "Enterprise Application Development",
    desc:
      "An introductory course in software systems covering basic concepts of enterprise application development."
  },
  {
    id: "SWST44062-6",
    code: "SWST 44062",
    level: 2,
    semester: 1,
    title: "Enterprise Application Development",
    desc:
      "An introductory course in software systems covering basic concepts of enterprise application development."
  }
];

function Courses() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null); // ✅ controls modal

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCourses.filter((c) => {
      const matchesText =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q);
      const matchesLevel = !level || String(c.level) === String(level);
      return matchesText && matchesLevel;
    });
  }, [query, level]);

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
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            aria-label="Filter by level"
          >
            <option value="">All levels</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
          </select>
          <button className="btn btn-primary search-btn" onClick={() => {}}>
            Search Courses
          </button>
        </div>
      </section>

      {/* Grid */}
      <section className="container">
        <div className="courses-grid">
          {filtered.map((c) => (
            <article key={c.id} className="course-card card">
              <header className="course-top">
                <a href="#!" className="code-link">{c.code}</a>
                <span className="sub">Level {c.level} &nbsp;|&nbsp; Semester {c.semester}</span>
              </header>

              <h3 className="course-title">{c.title}</h3>
              <p className="course-desc">{c.desc}</p>

              <div className="course-actions">
                <button
                  className="btn btn-outline sm"
                  onClick={() => setSelectedCourse(c)} // ✅ open modal
                >
                  Enroll
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="view-all-wrap">
          <button className="btn btn-primary">View All Courses</button>
        </div>
      </section>

      {/* Milestones band */}
      <Milestones />

      {/* ✅ Modal */}
      {selectedCourse && (
        <EnrollModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </main>
  );
}

export default Courses;

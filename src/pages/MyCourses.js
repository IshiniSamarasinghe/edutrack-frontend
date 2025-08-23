import { useMemo, useState } from "react";
import "../styles/Courses.css";            // reuse same styles
import Milestones from "../components/Milestones";
import CourseDetailsModal from "../components/CourseDetailsModal";

// You can move this to a shared data file later
const allCourses = [
  { id: "SWST44062-1", code: "SWST 44062", level: 4, semester: 1, title: "Enterprise Application Development",
    desc: "An introductory course in software systems covering basic concepts of enterprise application development." },
  { id: "SWST44062-2", code: "SWST 44062", level: 4, semester: 2, title: "Enterprise Application Development",
    desc: "An introductory course in software systems covering basic concepts of enterprise application development." },
  { id: "SWST44062-3", code: "SWST 44062", level: 3, semester: 2, title: "Enterprise Application Development",
    desc: "An introductory course in software systems covering basic concepts of enterprise application development." },
  { id: "SWST44062-4", code: "SWST 44062", level: 3, semester: 1, title: "Enterprise Application Development",
    desc: "An introductory course in software systems covering basic concepts of enterprise application development." },
  { id: "SWST44062-5", code: "SWST 44062", level: 2, semester: 2, title: "Enterprise Application Development",
    desc: "An introductory course in software systems covering basic concepts of enterprise application development." },
  { id: "SWST44062-6", code: "SWST 44062", level: 2, semester: 1, title: "Enterprise Application Development",
    desc: "An introductory course in software systems covering basic concepts of enterprise application development." }
];

// Pretend these come from backend
const enrolledIds = ["SWST44062-1", "SWST44062-3", "SWST44062-5", "SWST44062-6"];

// Example topics per course (replace with API data)
const topicsMap = {
  "SWST44062-1": [
    "Introduction to Enterprise Application Development",
    "Three-tier & n-tier architectures",
    "REST fundamentals and JSON",
    "State management & sessions",
    "Authentication & authorization basics",
    "ORM and data access patterns",
    "Testing: unit, integration, E2E",
  ],
  "SWST44062-3": [
    "Microservices vs Monoliths",
    "Message queues and events",
    "Caching strategies",
    "CI/CD pipelines",
    "Cloud deployment basics",
  ],
};

export default function MyCourses() {
  const [query, setQuery] = useState("");
  const [detailsCourse, setDetailsCourse] = useState(null);

  const enrolled = useMemo(
    () => allCourses.filter(c => enrolledIds.includes(c.id)),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enrolled;
    return enrolled.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [query, enrolled]);

  // Group by semester (ascending)
  const bySemester = useMemo(() => {
    const map = new Map();
    filtered.forEach(c => {
      if (!map.has(c.semester)) map.set(c.semester, []);
      map.get(c.semester).push(c);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  const currentTopics =
    (detailsCourse && (topicsMap[detailsCourse.id] ||
      Array(7).fill("Introduction to Enterprise Application Development"))) || [];

  return (
    <main className="courses my-courses">
      {/* Header */}
      <section className="container mycourses-head">
        <div className="mycourses-title-wrap">
          <div>
            <h1>My Courses</h1>
            <p className="muted">
              View all courses you are currently enrolled in and access course materials.
            </p>
          </div>

          {/* Right-aligned search */}
          <div className="search-inline">
            <input
              type="text"
              placeholder="Search Courses"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search my courses"
            />
            <button className="btn btn-primary sm" onClick={() => {}}>
              Search Courses
            </button>
          </div>
        </div>
      </section>

      {/* Semester sections */}
      <section className="container">
        {bySemester.length === 0 && (
          <p className="muted" style={{ padding: "8px 2px 24px" }}>
            No matching courses found.
          </p>
        )}

        {bySemester.map(([sem, list]) => (
          <div key={sem} className="semester-block">
            <h2 className="semester-title">Semester {sem}</h2>

            <div className="courses-grid">
              {list.map((c) => (
                <article key={c.id} className="course-card card">
                  <header className="course-top">
                    <a href="#!" className="code-link">{c.code}</a>
                    <span className="sub">
                      Level {c.level} &nbsp;|&nbsp; Semester {c.semester}
                    </span>
                  </header>

                  <h3 className="course-title">{c.title}</h3>
                  <p className="course-desc">{c.desc}</p>

                  <div className="course-actions">
                    <button
                      className="btn btn-outline sm"
                      onClick={() => setDetailsCourse(c)}
                    >
                      View Details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Milestones band */}
      <Milestones />

      {/* Details Modal */}
      {detailsCourse && (
        <CourseDetailsModal
          course={detailsCourse}
          topics={currentTopics}
          isEnrolled={true}  // replace with real status from backend
          onUnenroll={() => {
            // TODO: call your API to unenroll, then refresh state/UI
            // await api.unenroll(detailsCourse.id)
            setDetailsCourse(null);
          }}
          onClose={() => setDetailsCourse(null)}
        />
      )}
    </main>
  );
}

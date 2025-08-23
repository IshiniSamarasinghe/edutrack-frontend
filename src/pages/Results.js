import "../styles/Results.css";
import Milestones from "../components/Milestones";

const resultsData = {
  "Level 3 | Semester 1": [
    { year: "2020/2021", course: "CTEC3103 - WEB PROGRAMMING II", grade: "A" },
    { year: "2020/2021", course: "CTEC3023 - MOBILE APPLICATION DEVELOPMENT", grade: "A" },
    { year: "2020/2021", course: "CTEC3102 - ICT FOR BUSINESS", grade: "A" },
    { year: "2020/2021", course: "CTEC3102 - PYTHON PROGRAMMING", grade: "A" },
    { year: "2020/2021", course: "ENRP3102 - PRINCIPLES AND PRACTICES OF MANAGEMENT AND TECHNOLOGY MANAGEMENT", grade: "A" },
    { year: "2020/2021", course: "SWST3022 - REQUIREMENTS ENGINEERING", grade: "A" },
    { year: "2020/2021", course: "SWST3029 - APPLIED INFORMATION SYSTEMS", grade: "A" },
  ],
  "Level 3 | Semester 2": [
    { year: "2020/2021", course: "CTEC3103 - WEB PROGRAMMING II", grade: "A" },
    { year: "2020/2021", course: "CTEC3023 - MOBILE APPLICATION DEVELOPMENT", grade: "A" },
    { year: "2020/2021", course: "CTEC3102 - ICT FOR BUSINESS", grade: "A" },
    { year: "2020/2021", course: "CTEC3102 - PYTHON PROGRAMMING", grade: "A" },
    { year: "2020/2021", course: "ENRP3102 - PRINCIPLES AND PRACTICES OF MANAGEMENT AND TECHNOLOGY MANAGEMENT", grade: "A" },
    { year: "2020/2021", course: "SWST3022 - REQUIREMENTS ENGINEERING", grade: "A" },
    { year: "2020/2021", course: "SWST3029 - APPLIED INFORMATION SYSTEMS", grade: "A" },
  ],
};

export default function Results() {
  return (
    <main className="results">
      {/* Header */}
      <section className="container results-head">
        <div className="results-title-wrap">
          <div>
            <h1>Academic Results</h1>
            <p className="muted">
              View your grades and academic performance across all enrolled courses.
            </p>
          </div>
          <div className="gpa-badge">Overall GPA: <span>3.67</span></div>
        </div>
      </section>

      {/* Results tables */}
      <section className="container results-tables">
        {Object.entries(resultsData).map(([semester, list]) => (
          <div key={semester} className="results-block">
            <h2 className="semester-title">{semester}</h2>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Course</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row, i) => (
                  <tr key={i}>
                    <td>{row.year}</td>
                    <td>{row.course}</td>
                    <td className="grade">{row.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>
<br></br>
      {/* Milestones band */}
      <Milestones />
    </main>
  );
}

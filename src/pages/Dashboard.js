import "../styles/Dashboard.css";

function Dashboard() {
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
          <a href="#overview" className="btn btn-primary hero-cta">Get Started</a>
        </div>
      </section>

      {/* Placeholder for the next sections we’ll build next */}
          {/* Academic Overview */}
      <section id="overview" className="section">
        <h2 className="section-title">Academic Overview</h2>

        <div className="overview-grid">
          {/* Enrolled Courses */}
          <div className="card overview-card">
            <h3>Enrolled Courses</h3>

            <div className="list-row">
              <span className="pill">Enterprise Application Development</span>
              <button className="btn sm btn-outline">View</button>
            </div>
            <div className="list-row">
              <span className="pill">Enterprise Application Development</span>
              <button className="btn sm btn-outline">View</button>
            </div>
            <div className="list-row">
              <span className="pill">Enterprise Application Development</span>
              <button className="btn sm btn-outline">View</button>
            </div>

            <a href="#all-courses" className="link-cta">View All Courses</a>
          </div>

          {/* Recent Results */}
          <div className="card overview-card">
            <h3>Recent Results</h3>

            <div className="list-row">
              <span className="pill">Level 3 | Semester 1</span>
              <button className="btn sm btn-outline">View</button>
            </div>
            <div className="list-row">
              <span className="pill">Level 3 | Semester 2</span>
              <button className="btn sm btn-outline">View</button>
            </div>
            <div className="list-row">
              <span className="pill">Level 4 | Semester 1</span>
              <button className="btn sm btn-outline">View</button>
            </div>

            <a href="#all-results" className="link-cta">View All Results</a>
          </div>

          {/* Quick Actions */}
          <div className="card overview-card">
            <h3>Quick Actions</h3>

            <button className="action-row">
              <div className="action-text">
                <strong>Enroll in Courses</strong>
                <span>Add New Courses to Your Schedule</span>
              </div>
              <span className="action-icon">↗</span>
            </button>

            <button className="action-row">
              <div className="action-text">
                <strong>Manage Profile</strong>
                <span>Update Your Personal Information</span>
              </div>
              <span className="action-icon">↗</span>
            </button>

            <button className="action-row">
              <div className="action-text">
                <strong>Browse Catalog</strong>
                <span>Explore Available Courses</span>
              </div>
              <span className="action-icon">↗</span>
            </button>
          </div>
        </div>
      </section>
      {/* Milestones band */}
<section className="milestones">
  <div className="milestones-inner">
    <h2>Celebrate your academic milestones!</h2>
    <p>
      Upload course projects, group photos, or certificates — and build a timeline of your growth inside EduTrack.
    </p>
    <button className="btn btn-primary milestonecta">Upload Achievements</button>
  </div>
</section>


    </main>
  );
}

export default Dashboard;

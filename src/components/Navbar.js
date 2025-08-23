import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <h2 className="logo">EduTrack</h2>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/courses">Course Catalog</Link>
          <Link to="/my-courses">My Courses</Link>
          <Link to="/results">Results</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/signup" className="btn btn-primary">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

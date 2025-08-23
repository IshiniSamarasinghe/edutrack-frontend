import { Link } from "react-router-dom";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-col footer-brand">
          <div className="brand">EduTrack</div>
          <p className="muted">
            Empowering students with comprehensive course management and
            academic tracking tools for educational success.
          </p>
          <p className="muted copy-sm">© EduTrack All Rights Reserved 2025</p>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/courses">Course Catalog</Link></li>
            <li><Link to="/my-courses">My Courses</Link></li>
            <li><Link to="/results">Results</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <ul>
            <li><Link to="/profile">Profile Settings</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="legal-links">
          <a href="#privacy">Privacy Policy</a>
          <span className="dot">•</span>
          <a href="#terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}


export default Footer;

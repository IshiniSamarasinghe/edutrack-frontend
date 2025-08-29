// src/pages/admin/AdminShell.js
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import "../../styles/AdminDashboard.css";

export default function AdminShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = () => {
    // Clear admin session marker (adjust if you store more)
    window.localStorage.removeItem("edutrack_admin");
    navigate("/admin/login", { replace: true });
  };

  // Simple page title resolver
  const pageTitle =
    pathname === "/admin"
      ? "Dashboard"
      : pathname.startsWith("/admin/users")
      ? "Users"
      : pathname.startsWith("/admin/courses")
      ? "Course Catalog"
      : pathname.startsWith("/admin/results/upload")
      ? "Results Upload"
      : pathname.startsWith("/admin/profile")
      ? "Profile"
      : "Admin";

  return (
    <div className="admin-shell">
      <aside className="admin-aside">
        <div className="admin-brand">
          <div className="admin-dot" />
          <div className="admin-brand-text">
            <strong>EduTrack</strong>
            <span>Admin</span>
          </div>
        </div>

        <nav className="admin-menu">
          <NavItem to="/admin" label="Overview" icon="dashboard" end />
          <NavItem to="/admin/users" label="Users" icon="users" />
          <NavItem to="/admin/courses" label="Course Catalog" icon="courses" />
          {/* Updated: Results Upload link uses /admin/results/upload */}
          <NavItem to="/admin/results/upload" label="Results Upload" icon="upload" />
          <NavItem to="/admin/profile" label="Profile" icon="profile" />
        </nav>

        <button className="admin-logout" onClick={logout}>
          <Icon name="logout" />
          <span>Logout</span>
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-page-title">{pageTitle}</h1>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, label, icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => "admin-link" + (isActive ? " is-active" : "")}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </NavLink>
  );
}

function Icon({ name }) {
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2">
          <path d="M3 13h8V3H3zM13 21h8v-8h-8zM3 21h8v-6H3zM13 11h8V3h-8z" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "courses":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2">
          <path d="M4 19.5V6l8-3 8 3v13.5" />
          <path d="M12 3v13.5" />
          <path d="M4 6l8 3 8-3" />
        </svg>
      );
    case "upload":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M7 10l5-5 5 5" />
          <path d="M12 15V5" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M6 20a6 6 0 0 1 12 0" />
        </svg>
      );
    case "logout":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
    default:
      return null;
  }
}

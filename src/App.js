// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./api/axios";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import MyCourses from "./pages/MyCourses";
import Results from "./pages/Results";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// admin
import AdminSignup from "./pages/admin/AdminSignup";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminShell from "./pages/admin/AdminShell";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminResultsUpload from "./pages/admin/AdminResultsUpload";
import AdminProfile from "./pages/admin/AdminProfile";

// ---- Safe helpers ----
function safeGetUser(key = "edutrack_user") {
  const raw = window.localStorage.getItem(key);
  if (!raw || raw === "undefined" || raw === "null") return null;
  try { return JSON.parse(raw); } catch { return null; }
}
function safeSetUser(u, key = "edutrack_user") {
  window.localStorage.setItem(key, JSON.stringify(u));
}

/** Auth guard
 * 1) If user is already in localStorage → allow
 * 2) Else try /user (or /api/me via axios helper) → cache & allow
 * 3) Otherwise redirect to /login
 */
function RequireAuth({ children }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const u = safeGetUser();
    if (u) { setOk(true); setReady(true); return; }

    (async () => {
      try {
        const me = await auth.me();
        const user = me?.data?.data ?? me?.data ?? null; // supports /user and /api/me
        if (user) {
          safeSetUser(user);
          setOk(true);
        } else {
          setOk(false);
        }
      } catch {
        setOk(false);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) return null; // could return a spinner
  return ok ? children : <Navigate to="/login" replace />;
}

/** Layout wrapper: hides Navbar/Footer on /admin routes */
function Chrome({ children }) {
  const { pathname } = useLocation();
  const hideChrome = pathname.startsWith("/admin");
  return (
    <>
      {!hideChrome && <Navbar />}
      {children}
      {!hideChrome && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Chrome>
        <Routes>
          {/* default -> dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* protected app pages */}
          <Route
            path="/dashboard"
            element={<RequireAuth><Dashboard /></RequireAuth>}
          />
          <Route
            path="/courses"
            element={<RequireAuth><Courses /></RequireAuth>}
          />
          <Route
            path="/my-courses"
            element={<RequireAuth><MyCourses /></RequireAuth>}
          />
          <Route
            path="/results"
            element={<RequireAuth><Results /></RequireAuth>}
          />
          <Route
            path="/profile"
            element={<RequireAuth><Profile /></RequireAuth>}
          />

          {/* public auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* admin (public) */}
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* admin (app shell + nested pages) */}
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="results/upload" element={<AdminResultsUpload />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Chrome>
    </Router>
  );
}

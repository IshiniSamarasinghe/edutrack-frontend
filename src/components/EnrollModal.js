import { useState } from "react";
import "../styles/EnrollModal.css";
import { enrollments, csrf } from "../api/axios";

export default function EnrollModal({ course, onClose, onSuccess }) {
  // ✅ Hooks first – always run in the same order
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // If no course, render nothing (hooks already ran)
  if (!course) return null;

const handleSubmit = async (e) => {
  e.preventDefault();
  setErr("");
  setBusy(true);
  try {
    await csrf();

    // "CTEC 31023" -> "CTEC 31023" (trim, collapse spaces, uppercase)
    const codeNormalized = key.trim().replace(/\s+/g, " ").toUpperCase();

    await enrollments.create({
      offering_id: course.id,       // backend expects this
      code: codeNormalized,         // keep the space between dept + number
    });

    onSuccess?.();
    onClose?.();
  } catch (ex) {
    // Surface the real server error so we know what's wrong
    const payload = ex?.response?.data;
    console.log("Enroll error payload:", payload);

    const msg =
      payload?.errors?.offering_id?.[0] ||
      payload?.errors?.code?.[0] ||
      payload?.message ||
      "Enrollment failed. Please try again.";
    setErr(msg);
  } finally {
    setBusy(false);
  }
};




  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <h2>{course.title}</h2>
        <p>
          <strong>{course.code}</strong> &nbsp;|&nbsp; Level {course.year}, Semester {course.semester}
        </p>
        <p className="desc">{course.description}</p>

        {err && <div className="alert alert-error" role="alert">{err}</div>}

        <form className="enroll-form" onSubmit={handleSubmit}>
          <label>
            Enrollment Key
            <input
              type="text"
              placeholder="Enter course code (e.g., SWST 31022)"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Enrolling…" : "Confirm Enrollment"}
          </button>
        </form>
      </div>
    </div>
  );
}

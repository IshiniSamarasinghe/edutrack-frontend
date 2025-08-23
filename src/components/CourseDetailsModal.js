import { useEffect } from "react";
import "../styles/ModalBase.css";

export default function CourseDetailsModal({
  course,
  topics = [],
  isEnrolled = false,
  onUnenroll = () => {},
  onClose = () => {},
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  if (!course) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header line */}
        <div className="details-head">
          <a className="code-link" href="#!">{course.code}</a>
          <span className="title">{course.title}</span>
          <span className="pipe">|</span>
          <span className="meta">Level {course.level} Semester {course.semester}</span>
        </div>

        {/* Subhead */}
        <div className="details-sub">
          <span className="muted">Course Offerings</span>
          {isEnrolled && (
            <span className="enrolled">
              <span className="dot" aria-hidden="true" /> Already enrolled
            </span>
          )}
        </div>

        {/* Topics list */}
        <ul className="topics">
          {topics.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>

        {/* Actions */}
        <div className="actions end">
          <button className="btn btn-outline sm" onClick={onUnenroll} disabled={!isEnrolled}>
            Unenroll
          </button>
          <button className="btn btn-light sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

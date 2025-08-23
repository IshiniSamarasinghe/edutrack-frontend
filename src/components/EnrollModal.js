import React from "react";
 
import "../styles/EnrollModal.css";

function EnrollModal({ course, onClose }) {
  if (!course) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call Laravel API to enroll, then close
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <h2>{course.title}</h2>
        <p><strong>{course.code}</strong> &nbsp;|&nbsp; Level {course.level}, Semester {course.semester}</p>
        <p className="desc">{course.desc}</p>

        <form className="enroll-form" onSubmit={handleSubmit}>
          <label>
            Enrollment Key
            <input type="text" placeholder="Enter key" required />
          </label>
 

          <button type="submit" className="btn btn-primary">Confirm Enrollment</button>
        </form>
      </div>
    </div>
  );
}

export default EnrollModal;

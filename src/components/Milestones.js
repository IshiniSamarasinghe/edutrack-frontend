// src/components/Milestones.js
import { useState } from "react";
import "../styles/Milestones.css";
// ⚠️ Use the correct path/name you actually have:
import UploadAchievementModal from "../components/UploadAchievementModal";
// If your file is UploadAchievement.js, use:
// import UploadAchievementModal from "../components/UploadAchievement";

import { achievements as achApi } from "../api/axios";

function Milestones({ onUploaded }) {
  const [openUpload, setOpenUpload] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (payload) => {
    // payload: { title, desc, link, files[], [date] }
    try {
      setBusy(true);
      await achApi.create(payload);
      // tell the parent (Profile) to refresh the list
      if (typeof onUploaded === "function") await onUploaded();
      setOpenUpload(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="milestones">
      <div className="milestones-inner">
        <h2>Celebrate your academic milestones!</h2>
        <p>
          Upload course projects, group photos, or certificates — and build a
          timeline of your growth inside EduTrack.
        </p>

        <button
          className="btn btn-primary"
          type="button"
          onClick={() => setOpenUpload(true)}
          disabled={busy}
        >
          {busy ? "Please wait…" : "Upload Achievements"}
        </button>
      </div>

      <UploadAchievementModal
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

export default Milestones;

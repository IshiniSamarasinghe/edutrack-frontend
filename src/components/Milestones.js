import { useState } from "react";
import "../styles/Milestones.css";
import UploadAchievementModal from "../components/UploadAchievementModal";

function Milestones() {
  // 👇 this creates the state variables you were missing
  const [openUpload, setOpenUpload] = useState(false);

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
        >
          Upload Achievements
        </button>
      </div>

      <UploadAchievementModal
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        onSubmit={async (payload) => {
          // TODO: send to backend
          // const form = new FormData();
          // form.append("title", payload.title);
          // form.append("description", payload.desc);
          // form.append("link", payload.link);
          // payload.files.forEach(f => form.append("images[]", f));
          // await fetch("/api/achievements", { method: "POST", body: form });

          // After success, close modal
          setOpenUpload(false);
        }}
      />
    </section>
  );
}

export default Milestones;

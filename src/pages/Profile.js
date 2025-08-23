import { useRef, useState } from "react";
import "../styles/Profile.css";
import Milestones from "../components/Milestones";
import AchievementCard from "../components/AchievementCard";

export default function Profile() {
  // Mock user (replace with real data)
  const user = {
    name: "Samarasinghe D.G.U.",
    index: "CT2019047",
    email: "samaras-ct19001@kln.ac.lk",
    avatar: "",
  };

  // Achievements (display-only for now)
  const [achievements] = useState([
    {
      id: "a1",
      title: "Course Management System",
      desc:
        "Built for Enterprise Application Development using React.js, Laravel and SQLite.",
      link: "https://github.com/your/repo",
      date: "2024-05-11",
    },
    {
      id: "a2",
      title: "Mobile News App",
      desc: "Android app using Java + Firebase for news feed and push notifications.",
      link: "https://github.com/your/another-repo",
      date: "2024-03-28",
    },
  ]);

  // Avatar upload preview
  const fileRef = useRef(null);
  const [tempAvatar, setTempAvatar] = useState("");

  const onUploadAvatar = () => fileRef.current?.click();
  const onFileChoose = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setTempAvatar(preview);
    // TODO: POST to backend in real app
  };

  return (
    <main className="profile">
      {/* Header */}
      <section className="container profile-head">
        <h1>Profile Management</h1>
        <p className="muted">Update your personal information and account settings</p>
      </section>

      {/* Profile card */}
      <section className="container profile-card-wrap">
        <div className="profile-card card">
          <div className="avatar" aria-label="Profile picture">
            {tempAvatar || user.avatar ? (
              <img src={tempAvatar || user.avatar} alt="Profile" />
            ) : (
              <div className="avatar-fallback">{user.name[0]}</div>
            )}
          </div>

          <div className="profile-meta">
            <strong>{user.name}</strong>
            <span>{user.index}</span>
            <span>{user.email}</span>
          </div>

          <button className="btn btn-primary sm" onClick={onUploadAvatar}>
            Update Your Profile Picture
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onFileChoose}
          />
        </div>
      </section>

      {/* Achievements */}
      <section className="container achievements-wrap">
        <h2 className="section-title">My Achievements</h2>

        {achievements.length === 0 ? (
          <p className="muted">No achievements yet. Upload from the Milestones section below.</p>
        ) : (
          <div className="achievements-list">
            {achievements.map((a) => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </div>
        )}
      </section>
<br>
</br>
<br>
</br>
      {/* Milestones band */}
      <Milestones />
    </main>
  );
}

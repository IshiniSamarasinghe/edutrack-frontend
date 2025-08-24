import { useEffect, useState, useRef } from "react";
import { auth, profile as profileApi } from "../api/axios"; // removed unused api
import "../styles/Profile.css";
import Milestones from "../components/Milestones";
import AchievementCard from "../components/AchievementCard";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // ✅ re-add achievements
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
      desc:
        "Android app using Java + Firebase for news feed and push notifications.",
      link: "https://github.com/your/another-repo",
      date: "2024-03-28",
    },
  ]);

  const fileRef = useRef(null);

  // Load the signed-in user
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await auth.me();
        if (mounted) setUser(data);
      } catch {
        setError("Could not load your profile. Please sign in again.");
      } finally {
        if (mounted) setLoadingUser(false);
      }
    })();
    return () => {
      mounted = false;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const studentId = user?.index_number ?? "";

  const onUploadAvatar = () => fileRef.current?.click();

  const onFileChoose = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Please choose an image under 2MB.");
      e.target.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    const form = new FormData();
    form.append("avatar", file);

    try {
      setError("");
      setUploading(true);

      const { data } = await profileApi.uploadAvatar(form);
      setUser((u) => (u ? { ...u, avatar_url: data.avatar_url } : u));
    } catch {
      setError("Upload failed. Try again.");
      setPreviewUrl("");
    } finally {
      setUploading(false);
      setTimeout(() => URL.revokeObjectURL(localPreview), 1000);
    }
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
            {previewUrl || user?.avatar_url ? (
              <img src={previewUrl || user?.avatar_url} alt="Profile" />
            ) : (
              <div className="avatar-fallback">
                {(user?.name?.[0] || "S").toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-meta">
            <strong>{loadingUser ? "…" : user?.name || "Guest"}</strong>
            {!loadingUser && (
              <>
                <span>{studentId}</span>
                <span>{user?.email || ""}</span>
              </>
            )}
          </div>

          <button
            className="btn btn-primary sm"
            onClick={onUploadAvatar}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Update Profile Picture"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onFileChoose}
          />

          {error && (
            <p className="muted" style={{ color: "#b31e1e", marginTop: 8 }}>
              {error}
            </p>
          )}
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

      <br />
      <br />
      <Milestones />
    </main>
  );
}

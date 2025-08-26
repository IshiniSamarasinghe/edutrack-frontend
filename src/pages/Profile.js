// src/pages/Profile.js
import { useEffect, useRef, useState } from "react";
import { auth, profile as profileApi, achievements as achApi } from "../api/axios";
import "../styles/Profile.css";
import Milestones from "../components/Milestones";
import AchievementCard from "../components/AchievementCard";

export default function Profile() {
  // user & avatar
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileRef = useRef(null);

  // achievements
  const [items, setItems] = useState([]);
  const [loadingAch, setLoadingAch] = useState(true);
  const [achError, setAchError] = useState("");

  // load signed-in user
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await auth.me();
        if (mounted) setUser(data.user ?? data);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load achievements
  const loadAchievements = async () => {
    setLoadingAch(true);
    setAchError("");
    try {
      const { data } = await achApi.list();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setAchError("Failed to load achievements.");
    } finally {
      setLoadingAch(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  // avatar upload
  const onUploadAvatar = () => fileRef.current?.click();

  const onFileChoose = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Please choose an image under 2MB.");
      e.target.value = "";
      return;
    }

    const objUrl = URL.createObjectURL(file);
    setPreviewUrl(objUrl);

    const form = new FormData();
    form.append("avatar", file);

    try {
      setError("");
      setUploading(true);
      const { data } = await profileApi.uploadAvatar(form); // expects { avatar_url }
      setUser((u) => (u ? { ...u, avatar_url: data.avatar_url } : u));
    } catch {
      setError("Upload failed. Try again.");
      setPreviewUrl("");
    } finally {
      setUploading(false);
      setTimeout(() => URL.revokeObjectURL(objUrl), 1000);
    }
  };

  return (
    <main className="profile">
      {/* Header */}
      <section className="container profile-head">
        <h1>Profile Management</h1>
        <p className="muted">Update your personal information and account settings</p>
      </section>

      {/* Profile Card */}
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
                <span>{user?.index_number ?? "—"}</span>
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

        {achError && (
          <p className="muted" style={{ color: "#b31e1e" }}>{achError}</p>
        )}

        {loadingAch ? (
          <p className="muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="muted">No achievements yet. Upload from the section below.</p>
        ) : (
          <div className="achievements-list">
            {items.map((a) => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </div>
        )}
      </section>

      <br />
      <br />
      {/* Milestones section handles upload */}
      <Milestones onUploaded={loadAchievements} />
    </main>
  );
}

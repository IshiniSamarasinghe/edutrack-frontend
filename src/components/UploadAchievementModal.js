// src/components/UploadAchievementModal.js
import { useEffect, useState } from "react";
import "../styles/ModalBase.css";
import "../styles/UploadAchievement.css"; // keep if you still use its form styles

export default function UploadAchievementModal({
  open,
  onClose = () => {},
  onSubmit = async () => {}, // (payload) => Promise<void>
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [link, setLink] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = async () => {
    if (!title.trim()) return alert("Please add an achievement title.");
    setBusy(true);
    try {
      // No files anymore
      const payload = { title, desc, link, date };
      await onSubmit(payload);
      onClose();
      setTitle(""); setDesc(""); setLink(""); setDate("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ua-field">
          <label>Achievement Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="ua-field">
          <label>Achievement Description</label>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>

        <div className="ua-field">
          <label>Project/GitHub Link</label>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
        </div>

        <div className="ua-field">
          <label>Date (optional)</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="actions end">
          <button className="btn btn-primary" disabled={busy} onClick={submit}>
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

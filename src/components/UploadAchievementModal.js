import { useEffect, useRef, useState } from "react";
import "../styles/ModalBase.css";
import "../styles/UploadAchievement.css";

export default function UploadAchievementModal({
  open,
  onClose = () => {},
  onSubmit = async () => {}, // (payload) => Promise<void>
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [link, setLink] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

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

  const pickFiles = () => inputRef.current?.click();

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList || []);
    const images = arr.filter((f) => /image\/(png|jpe?g)$/i.test(f.type));
    setFiles((prev) => [...prev, ...images].slice(0, 10)); // limit to 10
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const submit = async () => {
    if (!title.trim()) return alert("Please add an achievement title.");
    setBusy(true);
    try {
      // create a payload you can send to your API later
      const payload = { title, desc, link, files };
      await onSubmit(payload);
      onClose();
      // clear local state
      setTitle(""); setDesc(""); setLink(""); setFiles([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ua-field">
          <label>Achievement Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder=""
          />
        </div>

        <div className="ua-field">
          <label>Achievement Description</label>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder=""
          />
        </div>

        <div className="ua-field">
          <label>Achievement access link</label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder=""
          />
        </div>

        {/* Dropzone */}
        <div
          className="ua-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={pickFiles}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" ? pickFiles() : null)}
          aria-label="Upload images"
        >
          <span className="plus">＋</span>
          <span className="dz-help">upload any images in jpg, png or jpeg</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Previews (small inline chips) */}
        {files.length > 0 && (
          <div className="ua-previews">
            {files.map((f, i) => (
              <span key={i} className="ua-chip" title={f.name}>
                {f.name}
              </span>
            ))}
          </div>
        )}

        <div className="actions end">
          <button className="btn btn-primary" disabled={busy} onClick={submit}>
            {busy ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

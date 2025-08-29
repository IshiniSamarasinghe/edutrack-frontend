import { useState } from "react";
import api from "../../api/axios";
import "../../styles/admin.css";   // ✅ reuse same admin.css

export default function AdminResultUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    if (!file) return alert("Please select a CSV file");

    const fd = new FormData();
    fd.append("file", file);

    setUploading(true);
    setMsg("");
    try {
      const res = await api.post("/api/admin/results/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg(res.data?.message || "Upload successful!");
      setFile(null);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-card profile-wrapper">{/* single card */}
      <div className="admin-card-head">
        <h2>Upload Results (CSV)</h2>
        <div className="spacer" />
      </div>

      <form onSubmit={onSubmit} className="form-grid">
        <label className="form-field" style={{ gridColumn: "1 / -1" }}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </label>

        <p className="muted" style={{ gridColumn: "1 / -1" }}>
          Headers: user_email, module_code, offering_year, offering_semester, academic_year, grade
        </p>

        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 12, gridColumn: "1 / -1" }}>
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </form>

      {msg && (
        <div className={msg.includes("fail") ? "error" : "success"} style={{ marginTop: 16 }}>
          {msg}
        </div>
      )}
    </div>
  );
}

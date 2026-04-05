import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function NoticeBoard({ role }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setNotices(data || []);
    } catch (err) {
      console.error("Error fetching notices:", err);
    }
    setLoading(false);
  };

  const handleAddNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("notices")
        .insert([newNotice]);

      if (!error) {
        alert("Notice published successfully! 📢");
        setNewNotice({ title: "", content: "" });
        setShowAdd(false);
        fetchNotices();
      }
    } catch (err) {
      alert("Error adding notice: " + err.message);
    }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
      <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-blue)", borderTopColor: "transparent", borderRadius: "50%" }}></div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Placement Notice Board</h2>
          <p style={{ color: "var(--text-muted)" }}>Stay updated with the latest campus placement news and schedules.</p>
        </div>
        {role === "admin" && (
          <button className="neon-button" onClick={() => setShowAdd(!showAdd)} style={{ padding: "10px 20px" }}>
            {showAdd ? "Close Form" : "Post New Notice"}
          </button>
        )}
      </div>

      {showAdd && (
        <form onSubmit={handleAddNotice} className="glass-card fade-in" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>Notice Title</label>
            <input 
              value={newNotice.title}
              onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
              placeholder="e.g. Schedule for Amazon Campus Drive"
              style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "#fff", outline: "none" }} 
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>Detailed Message</label>
            <textarea 
              rows="5"
              value={newNotice.content}
              onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
              placeholder="Describe the notice in detail..."
              style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "#fff", outline: "none", resize: "none" }} 
            />
          </div>
          <button type="submit" className="neon-button" disabled={saving} style={{ alignSelf: "flex-end", padding: "12px 24px" }}>
            {saving ? "Publishing..." : "Publish Notice"}
          </button>
        </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {notices.length === 0 ? (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No notices published yet.
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="glass-card fade-in" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "1.1rem" }}>{notice.title}</h3>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{new Date(notice.created_at).toLocaleDateString()}</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                {notice.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

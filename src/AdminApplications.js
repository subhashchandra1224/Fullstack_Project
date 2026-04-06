import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllApplications();
  }, []);

  const fetchAllApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          match_percentage,
          created_at,
          jobs (
            title,
            company
          ),
          students (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (!error) setApplications(data);
    } catch (err) {
      console.error("Error fetching admin apps:", err);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", appId);

    if (error) {
      alert("Failed to update status: " + error.message);
    } else {
      setApplications(applications.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Selected": return "badge-selected";
      case "Rejected": return "badge-rejected";
      default: return "badge-pending";
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
      <div style={{ color: "var(--accent-blue)" }}>
        <svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Review Applications</h2>
        <p style={{ color: "var(--text-muted)" }}>Manage student applications and update their placement status.</p>
      </div>

      <div className="glass-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>
              <th style={{ padding: "20px" }}>Student</th>
              <th style={{ padding: "20px" }}>Position & Company</th>
              <th style={{ padding: "20px" }}>Match</th>
              <th style={{ padding: "20px" }}>Date</th>
              <th style={{ padding: "20px" }}>Current Status</th>
              <th style={{ padding: "20px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No applications submitted yet.</td>
              </tr>
            ) : applications.map((app) => (
              <tr key={app.id} style={{ borderBottom: "1px solid var(--border-color)", fontSize: "0.95rem" }} className="fade-in">
                <td style={{ padding: "20px", fontWeight: "600" }}>{app.students?.name || "Anonymous User"}</td>
                <td style={{ padding: "20px" }}>
                  <div>{app.jobs?.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--accent-blue)" }}>{app.jobs?.company}</div>
                </td>
                <td style={{ padding: "20px" }}>
                  <span style={{ fontWeight: "600", color: app.match_percentage > 70 ? "var(--accent-emerald)" : "inherit" }}>
                    {app.match_percentage}%
                  </span>
                </td>
                <td style={{ padding: "20px", color: "var(--text-muted)" }}>{new Date(app.created_at).toLocaleDateString()}</td>
                <td style={{ padding: "20px" }}>
                  <span className={`badge ${getStatusClass(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td style={{ padding: "20px" }}>
                  <select 
                    value={app.status} 
                    onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                    style={{ 
                      padding: "8px 12px", 
                      borderRadius: "8px", 
                      background: "rgba(255,255,255,0.05)", 
                      color: "#fff", 
                      border: "1px solid var(--border-color)",
                      outline: "none",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="Pending" style={{ background: "var(--bg-slate)" }}>Pending</option>
                    <option value="Selected" style={{ background: "var(--bg-slate)" }}>Selected</option>
                    <option value="Rejected" style={{ background: "var(--bg-slate)" }}>Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

i have changed

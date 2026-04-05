import React, { useState } from "react";

export default function Attendance() {
  const activities = [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px" }}>
      <div>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Session Attendance</h2>
        <p style={{ color: "var(--text-muted)" }}>Track and verify your attendance for all placement-related training and talks.</p>
      </div>

      <div className="glass-card" style={{ padding: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid var(--border-color)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h3 style={{ fontSize: "1.1rem" }}>Current Active Session</h3>
          <p style={{ color: "var(--text-muted)" }}>No active sessions are running right now.</p>
        </div>
        <button 
          className="neon-button" 
          disabled={true}
          style={{ padding: "14px 24px", minWidth: "150px", opacity: 0.5 }}
        >
          No Active Session
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <SectionHeader title="Recent Activity History" />
        {activities.length === 0 ? (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No attendance history available.
          </div>
        ) : (
          activities.map((act, index) => (
            <div key={index} className="glass-card fade-in" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h4 style={{ fontSize: "1rem" }}>{act.title}</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{act.date} • {act.time}</p>
              </div>
              <span className={`badge ${act.status === 'Present' ? 'badge-selected' : 'badge-rejected'}`}>
                {act.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const SectionHeader = ({ title }) => (
  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", padding: "10px 0" }}>{title}</div>
);

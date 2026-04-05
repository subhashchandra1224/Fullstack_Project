import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecruitmentDates();
  }, []);

  const fetchRecruitmentDates = async () => {
    setLoading(true);
    try {
      const { data: jobs, error } = await supabase
        .from("jobs")
        .select("id, title, company, deadline, application_link")
        .not("deadline", "is", null)
        .order("deadline", { ascending: true });

      if (!error) {
        setEvents(jobs);
      }
    } catch (err) {
      console.error("Calendar Fetch Error:", err);
    }
    setLoading(false);
  };

  const getUrgencyColor = (deadline) => {
    const today = new Date();
    const target = new Date(deadline);
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "var(--text-dim)"; // Expired
    if (diffDays <= 2) return "var(--accent-rose)"; // High Urgency
    if (diffDays <= 7) return "var(--accent-amber)"; // Warning
    return "var(--accent-blue)"; // Safe
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
      <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-blue)", borderTopColor: "transparent", borderRadius: "50%" }}></div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "900px" }} className="fade-in">
      <div>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.02em" }}>Placement Calendar</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>Track upcoming recruitment deadlines and critical preparation dates.</p>
      </div>

      <div className="glass-card" style={{ padding: "40px", border: "1px solid var(--border-color)" }}>
        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>📅</div>
            <h3 style={{ color: "var(--text-muted)" }}>No upcoming deadlines detected.</h3>
            <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", marginTop: "8px" }}>New recruitment dates will appear here automatically as they are published.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {events.map((event, index) => {
              const color = getUrgencyColor(event.deadline);
              const isExpired = new Date(event.deadline) < new Date();

              return (
                <div key={event.id} style={{ display: "flex", gap: "24px", padding: "24px 0", borderBottom: index === events.length - 1 ? "none" : "1px solid var(--border-color)", opacity: isExpired ? 0.6 : 1 }}>
                  {/* Date Column */}
                  <div style={{ width: "140px", display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "800", color: isExpired ? "var(--text-dim)" : "var(--accent-blue)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Deadline</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#fff", marginTop: "4px" }}>{formatDate(event.deadline)}</span>
                  </div>

                  {/* Timeline Node */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "6px" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}80` }}></div>
                    {index !== events.length - 1 && <div style={{ width: "2px", flex: 1, background: "rgba(255,255,255,0.05)", margin: "8px 0" }}></div>}
                  </div>

                  {/* Details Column */}
                  <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ fontSize: "1.1rem", marginBottom: "4px" }}>{event.title}</h4>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{event.company}</p>
                    </div>

                    {!isExpired && event.application_link && (
                      <button 
                        onClick={() => window.open(event.application_link, "_blank")}
                        className="glass-card"
                        style={{ padding: "10px 20px", fontSize: "0.8rem", border: `1px solid ${color}40`, color: color, cursor: "pointer", fontWeight: "700" }}
                      >
                        Quick Apply
                      </button>
                    )}
                    {isExpired && <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: "600" }}>EXPIRED</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend Card */}
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1, padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
           <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-rose)" }}></div>
           <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Expires in &lt; 48 Hours</span>
        </div>
        <div style={{ flex: 1, padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: "12px" }}>
           <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-amber)" }}></div>
           <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Expires this week</span>
        </div>
      </div>
    </div>
  );
}

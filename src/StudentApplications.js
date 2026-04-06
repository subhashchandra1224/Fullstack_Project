import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: apps, error } = await supabase
        .from("applications")
        .select(`
          id, job_id, status, match_percentage, created_at,
          jobs (title, company, location, platform_source)
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && apps) {
        setApplications(apps);
        // Fetch stats for these jobs
        const jobIds = [...new Set(apps.map(a => a.job_id))];
        const { data: allApps } = await supabase.from("applications").select("job_id, match_percentage").in("job_id", jobIds);
        
        const jobStats = {};
        jobIds.forEach(id => {
          const matches = allApps.filter(a => a.job_id === id).map(a => a.match_percentage);
          jobStats[id] = {
            avg: Math.round(matches.reduce((a, b) => a + b, 0) / (matches.length || 1)),
            max: Math.max(...matches) || 0,
            count: matches.length
          };
        });
        setStats(jobStats);
      }
    } catch (err) {
      console.error("Stats Error:", err);
    }
    setLoading(false);
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm("Are you sure you want to withdraw this application? This cannot be undone.")) return;
    
    try {
      const { error } = await supabase.from("applications").delete().eq("id", appId);
      if (error) throw error;
      
      setApplications(prev => prev.filter(app => app.id !== appId));
    } catch (err) {
      alert("Error withdrawing application: " + err.message);
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
      <div style={{ color: "var(--accent-blue)" }}><svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Application Intelligence</h2>
        <p style={{ color: "var(--text-muted)" }}>Track your standing and market competitiveness for each role.</p>
      </div>

      {applications.length === 0 ? (
        <div className="glass-card" style={{ padding: "60px", textAlign: "center" }}><p style={{ color: "var(--text-muted)" }}>No active applications found.</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {applications.map((app) => {
            const jobStat = stats[app.job_id] || { avg: 0, max: 0, count: 1 };
            const isTopTier = app.match_percentage >= jobStat.avg;

            return (
              <div key={app.id} className="glass-card fade-in" style={{ padding: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "4px" }}>{app.jobs?.title}</h3>
                    <p style={{ color: "var(--accent-blue)", fontWeight: "600", fontSize: "0.9rem" }}>{app.jobs?.company}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`badge ${getStatusClass(app.status)}`} style={{ padding: "8px 16px" }}>{app.status}</span>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "8px" }}>Applied {new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Your Profile Match</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "1.5rem", fontWeight: "800", color: isTopTier ? "var(--accent-emerald)" : "var(--accent-amber)" }}>{app.match_percentage}%</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{isTopTier ? "Above Average" : "Below Average"}</span>
                    </div>
                  </div>

                  <div style={{ borderLeft: "1px solid var(--border-color)", paddingLeft: "24px" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Competitive Benchmark</p>
                    <div style={{ display: "flex", gap: "20px" }}>
                      <div>
                        <p style={{ fontSize: "1rem", fontWeight: "700" }}>{jobStat.max}%</p>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Top Match</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "1.1rem", fontWeight: "700" }}>{jobStat.avg}%</p>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Avg Match</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "1rem", fontWeight: "700" }}>{jobStat.count}</p>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Applicants</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
                    <button onClick={() => handleWithdraw(app.id)} style={{ padding: "10px 16px", fontSize: "0.85rem", background: "transparent", border: "1px solid var(--accent-rose)", color: "var(--accent-rose)", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Withdraw</button>
                    <button className="neon-button" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>Update Status</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

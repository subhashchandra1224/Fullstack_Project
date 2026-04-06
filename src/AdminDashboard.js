import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    statusData: [],
    platformData: []
  });
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleDeleteJob = async (id) => {
    if (!window.confirm("CRITICAL ACTION: This will permanently remove this job and all results for students who have tracked/applied. Proceed?")) return;
    
    try {
      const response = await fetch("http://127.0.0.1:5000/api/delete-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("Job Intelligence Registry Updated! 🚀 Opportunity Permanently Removed.");
        fetchStatistics();
      } else {
        alert("Deletion Blocked: " + data.error);
      }
    } catch (err) {
      console.error("Proxy Error:", err);
      alert("Could not connect to deletion service.");
    }
  };

  const handleGlobalSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/sync-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (response.ok) {
        let addedCount = 0;
        for (const job of data.jobs) {
          const { data: existing } = await supabase.from("jobs").select("id").eq("application_link", job.link);
          if (existing && existing.length > 0) continue;

          const { error } = await supabase.from("jobs").insert({
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            skills_required: job.skills_required,
            application_link: job.link,
            platform_source: job.source
          });
          if (!error) addedCount++;
        }
        alert(`Success! Sourced ${addedCount} new opportunities from ${data.platform_sources.join(", ")}.`);
        fetchStatistics();
      } else {
        alert("Sync failed: " + data.error);
      }
    } catch (err) {
      console.error("Sync Error:", err);
      alert("Could not connect to sync service.");
    }
    setSyncing(false);
  };

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Fetch Jobs for Table
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .order("id", { ascending: false });
      
      setAllJobs(jobsData || []);

      const { count: totalJobsCount } = await supabase
        .from("jobs")
        .select("*", { count: 'exact', head: true });

      const { data: appsData, error: appsError } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          jobs ( platform_source )
        `);

      if (!appsError) {
        let pending = 0, selected = 0, rejected = 0;
        const platformCounts = {};

        appsData.forEach(app => {
          if (app.status === 'Pending') pending++;
          if (app.status === 'Selected') selected++;
          if (app.status === 'Rejected') rejected++;

          const platform = app.jobs?.platform_source || 'Internal';
          platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        });

        const statusData = [
          { name: 'Pending', value: pending, color: '#f59e0b' },
          { name: 'Selected', value: selected, color: '#10b981' },
          { name: 'Rejected', value: rejected, color: '#f43f5e' },
        ];

        const platformData = Object.keys(platformCounts).map(key => ({
          name: key,
          applications: platformCounts[key]
        }));

        setStats({
          totalJobs: totalJobsCount || 0,
          totalApplications: appsData.length,
          statusData,
          platformData
        });
      }
    } catch (err) {
      console.error("Stats Error:", err);
    }
    setLoading(false);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
      <div style={{ color: "var(--accent-blue)" }}>
        <svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Placement Intelligence</h2>
        <p style={{ color: "var(--text-muted)" }}>Strategic overview of sourcing and student placement performance.</p>
      </div>
      
      {/* KPI Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
        <div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid var(--accent-blue)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Verified Opportunity Pool</p>
          <h3 style={{ fontSize: "2.5rem", marginTop: "8px", color: "#fff" }}>{stats.totalJobs}</h3>
        </div>
        <div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid var(--accent-emerald)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Active Applications</p>
          <h3 style={{ fontSize: "2.5rem", marginTop: "8px", color: "#fff" }}>{stats.totalApplications}</h3>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "24px", textAlign: "center" }}>Application Lifecycle</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stats.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {stats.statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-slate)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "24px", textAlign: "center" }}>Source Distribution</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={stats.platformData}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-slate)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="applications" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Job Intelligence Registry */}
      <div className="glass-card" style={{ padding: "32px", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h3 style={{ fontSize: "1.25rem", color: "#fff", fontWeight: "700" }}>Job Intelligence Registry</h3>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: "20px" }}>
            {allJobs.length} Positions Active
          </span>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "16px", fontWeight: "700" }}>Opportunity</th>
                <th style={{ padding: "16px", fontWeight: "700" }}>Type</th>
                <th style={{ padding: "16px", fontWeight: "700" }}>Source</th>
                <th style={{ padding: "16px", fontWeight: "700" }}>Location</th>
                <th style={{ padding: "16px", fontWeight: "700", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allJobs.map(job => (
                <tr key={job.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.2s" }} className="table-row-hover">
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <div style={{ fontWeight: "700", color: "#fff" }}>{job.title}</div>
                      {job.application_link && (
                        <span title="AI Verified Link" style={{ color: "var(--accent-emerald)", fontSize: "0.8rem", display: "flex", alignItems: "center" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--accent-blue)", fontWeight: "600" }}>{job.company}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ fontSize: "0.7rem", padding: "4px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-muted)", fontWeight: "600" }}>
                      {job.job_type || 'Full-time'}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: "6px", background: "rgba(96, 165, 250, 0.1)", color: "var(--accent-blue)", fontWeight: "700" }}>
                      {job.platform_source || 'Internal'}
                    </span>
                  </td>
                  <td style={{ padding: "16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>{job.location}</td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <a href={job.application_link} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "var(--accent-blue)", textDecoration: "none", fontWeight: "600" }}>View</a>
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        style={{ background: "none", border: "none", color: "var(--accent-rose)", cursor: "pointer", fontSize: "0.75rem", fontWeight: "600" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

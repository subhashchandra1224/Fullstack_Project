import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function CompanyDirectory() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      // Fetch unique companies from the jobs table directly connected to the Opportunity Engine
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, company, location, skills_required, platform_source")
        .order("company", { ascending: true });

      if (!error) {
        // Group jobs by company name
        const companyMap = {};
        data.forEach(job => {
          if (!companyMap[job.company]) {
            companyMap[job.company] = {
              name: job.company,
              locations: new Set([job.location]),
              jobs: []
            };
          }
          companyMap[job.company].locations.add(job.location);
          companyMap[job.company].jobs.push(job);
        });

        const uniqueCompanies = Object.values(companyMap).map(c => ({
          name: c.name,
          location: Array.from(c.locations).join(", "),
          jobs: c.jobs
        }));
        
        setCompanies(uniqueCompanies);
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
    setLoading(false);
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
      <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-blue)", borderTopColor: "transparent", borderRadius: "50%" }}></div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Company Directory</h2>
          <p style={{ color: "var(--text-muted)" }}>Explore organizations actively recruiting from our campus and view their open roles.</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: "16px" }}>
        <input 
          type="text" 
          placeholder="Search by company name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "#fff", outline: "none" }} 
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {filteredCompanies.length === 0 ? (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center", width: "100%" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>No companies found matching your search.</p>
            <p style={{ color: "var(--accent-blue)", fontSize: "0.85rem", marginTop: "8px" }}>Ensure matching organizations have active roles posted in the Opportunity Engine.</p>
          </div>
        ) : (
          filteredCompanies.map((company, index) => (
            <div key={index} className="glass-card fade-in" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", borderBottom: `1px solid var(--border-color)`, paddingBottom: "16px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "12px", background: "var(--accent-blue)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.5rem", fontWeight: "700", opacity: "0.8" }}>
                  {company.name.charAt(0)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>{company.name}</h3>
                  <div style={{ display: "flex", gap: "10px", color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px", alignItems: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{company.location}</span>
                    <span style={{ margin: "0 8px", opacity: 0.3 }}>|</span>
                    <span style={{ color: "var(--accent-blue)", fontWeight: "600" }}>{company.jobs.length} Active Positions</span>
                  </div>
                </div>
              </div>
              
              {/* Linked Job Details */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {company.jobs.map((job) => (
                  <div key={job.id} style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px dashed var(--border-color)" }}>
                    <h4 style={{ fontSize: "1rem", marginBottom: "8px" }}>{job.title}</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Required: {typeof job.skills_required === 'string' ? job.skills_required : (job.skills_required?.join(', ') || 'General')}
                    </p>
                    <span className="badge badge-pending" style={{ fontSize: "0.7rem", backgroundColor: "rgba(59, 130, 246, 0.1)", color: "var(--accent-blue)", borderColor: "rgba(59, 130, 246, 0.3)" }}>
                      Source: {job.platform_source || "Internal"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

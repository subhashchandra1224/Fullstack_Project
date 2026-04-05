import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function RecommendedJobs() {
  const [jobs, setJobs] = useState([]);
  const [studentResumes, setStudentResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysisJob, setAnalysisJob] = useState(null);
  const [pendingSelectionContext, setPendingSelectionContext] = useState(null); // { job, actionType: 'apply' | 'analyze' }
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  useEffect(() => {
    fetchRecommendations();
    fetchStudentResumes();
  }, []);

  const fetchStudentResumes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase.from("students").select("resumes").eq("id", user.id).single();
      
      const localResumes = JSON.parse(localStorage.getItem("fallback_resumes") || "[]");
      const finalResumes = (data?.resumes && Array.isArray(data.resumes) && data.resumes.length > 0) ? data.resumes : localResumes;
      
      if (finalResumes.length > 0) {
        setStudentResumes(finalResumes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const { data: allJobs, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!jobsError) {
        const sortedJobs = allJobs.map(job => ({
          ...job,
          parsedRequiredSkills: Array.isArray(job.skills_required) 
            ? job.skills_required 
            : (typeof job.skills_required === 'string' ? job.skills_required.split(',').map(s => s.trim()) : [])
        }));
        setJobs(sortedJobs);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
    setLoading(false);
  };

  const initiateApply = (job, matchScore = 0) => {
    if (studentResumes.length > 0) {
      setPendingSelectionContext({ job: { ...job, matchScore }, actionType: 'apply' });
    } else {
      // Direct apply if they haven't set up the Resume Center yet
      finalizeApply(job, matchScore, null);
    }
  };

  const finalizeApply = async (job, matchScore, resumeUrl) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Ideally, the applications table would also adopt a 'resume_url' column for full support.
    // For now, we sync the application row.
    const { error } = await supabase.from("applications").insert([
      { 
        student_id: user.id, 
        job_id: job.id, 
        match_percentage: matchScore, 
        status: 'Pending' 
      }
    ]);

    if (!error) {
      setAppliedJobIds(prev => new Set(prev).add(job.id));
      alert(`Application successfully tracked internally using ${resumeUrl ? 'selected resume' : 'default profile'}!`);
    } else {
      alert("Error tracking application: " + error.message);
    }
    setPendingSelectionContext(null);
  };



  const handleResumeCheckFromSaved = async (job, resumeUrl) => {
    setLoading(true);
    setPendingSelectionContext(null); // Close modal

    if (!resumeUrl) {
      alert("Missing Resume File: This resume was uploaded while the Intelligence Hub was restarting or running an old version. Please DELETE this resume in the Resume Center and UPLOAD IT AGAIN!");
      setLoading(false);
      return;
    }

    try {
      // Fetch the actual PDF blob from the URL first to bypass backend JSON-parsing latency/errors
      const fileResponse = await fetch(resumeUrl);
      if (!fileResponse.ok) throw new Error("Could not download cached resume file");
      const fileBlob = await fileResponse.blob();

      // Package it identically to a brand new physical file upload
      const formData = new FormData();
      formData.append("resume", fileBlob, "saved_resume.pdf");
      formData.append("jobSkills", job.parsedRequiredSkills.join(","));
      formData.append("jobDescription", job.description || "");

      const response = await fetch("http://127.0.0.1:5000/api/analyze-job-match", {
        method: "POST",
        body: formData // Content-Type omitted, browser sets to multipart boundary
      });
      
      const data = await response.json();
      if (response.ok) {
        setAnalysisJob({
          ...job,
          matchPercentage: data.score,
          matchingSkills: data.matchingSkills,
          missingSkills: data.missingSkills
        });
      } else {
        alert("Match Analysis Failed: " + (data.error || "Server rejected resume"));
      }
    } catch (err) {
      console.error("Match API Error:", err);
      alert("Could not connect to Intelligence Hub or parse file.");
    }
    setLoading(false);
  };

  const ResumeSelectionModal = () => {
    if (!pendingSelectionContext) return null;
    const { job, actionType } = pendingSelectionContext;
    
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div className="glass-card fade-in" style={{ maxWidth: "500px", width: "100%", padding: "40px", position: "relative", border: "1px solid var(--accent-blue)" }}>
          <button onClick={() => setPendingSelectionContext(null)} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem" }}>&times;</button>
          
          <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Select a Resume</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
            {actionType === 'apply' ? `Which resume would you like to submit for ${job.company}?` : `Which resume should the AI analyze against the ${job.title} requirements?`}
          </p>

          {studentResumes.length === 0 ? (
            <div style={{ padding: "20px", background: "rgba(244, 63, 94, 0.1)", borderRadius: "8px", color: "var(--accent-rose)", textAlign: "center" }}>
              <p>You haven't uploaded any resumes yet.</p>
              <p style={{ fontSize: "0.8rem", marginTop: "8px" }}>Please go to the Resume Center tab to add one.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {studentResumes.map(resume => (
                <button 
                  key={resume.id}
                  onClick={() => {
                    if (actionType === 'apply') {
                      finalizeApply(job, job.matchScore, resume.url);
                    } else if (actionType === 'analyze') {
                      handleResumeCheckFromSaved(job, resume.url);
                    }
                  }}
                  className="hover-glow"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "12px", cursor: "pointer", textAlign: "left", color: "#fff" }}
                >
                  <div>
                    <h4 style={{ fontSize: "1rem", marginBottom: "4px" }}>{resume.name}</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--accent-emerald)" }}>{resume.skills.length} extracted skills</p>
                  </div>
                  <span style={{ fontSize: "1.2rem" }}>{actionType === 'apply' ? 'Submit →' : 'Analyze →'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SkillGapModal = ({ job, onClose }) => {
    if (!job) return null;
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div className="glass-card fade-in" style={{ maxWidth: "600px", width: "100%", padding: "40px", position: "relative", border: "1px solid var(--accent-blue)" }}>
          <button onClick={onClose} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem" }}>&times;</button>
          
          <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>AI Holistic Match Analysis</h2>
          <p style={{ color: "var(--accent-blue)", fontWeight: "600", marginBottom: "24px" }}>{job.title} @ {job.company}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--accent-emerald)", textTransform: "uppercase", marginBottom: "12px" }}>Matched Expertise</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {job.matchingSkills.map(s => <span key={s} className="badge badge-selected" style={{ fontSize: "0.8rem" }}>{s}</span>)}
                {job.matchingSkills.length === 0 && <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>No direct skill matches found.</p>}
              </div>
            </div>

            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--accent-rose)", textTransform: "uppercase", marginBottom: "12px" }}>Identified Skill Gaps</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {job.missingSkills.map(s => <span key={s} className="badge badge-rejected" style={{ fontSize: "0.8rem" }}>{s}</span>)}
                {job.missingSkills.length === 0 && <p style={{ fontSize: "0.9rem", color: "var(--accent-emerald)" }}>Perfect Match! You have all the required skills.</p>}
              </div>
            </div>

            {job.missingSkills.length > 0 && (
              <div style={{ padding: "20px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "12px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                <p style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "12px" }}>🚀 Learning Roadmap</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {job.missingSkills.slice(0, 3).map(s => (
                    <a key={s} href={`https://roadmap.sh/${s}`} target="_blank" rel="noreferrer" style={{ fontSize: "0.85rem", color: "var(--accent-blue)", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Master {s} on Roadmap.sh
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "#fff" }}>Experience & Pattern Fit</p>
                <p style={{ fontSize: "0.8rem", color: "var(--accent-emerald)" }}>Verified</p>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>Your professional projects and background context align with {job.company}'s requirements.</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
              <div style={{ textAlign: "center", padding: "10px 20px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Holistic Match</p>
                <p style={{ fontSize: "1.5rem", fontWeight: "800", color: job.matchPercentage >= 75 ? "var(--accent-emerald)" : "var(--accent-amber)" }}>{job.matchPercentage ? `${job.matchPercentage}%` : "Calculating..."}</p>
              </div>
              <button 
                onClick={() => {
                  onClose();
                  initiateApply(job, job.matchPercentage);
                }} 
                className="neon-button" style={{ padding: "14px 28px" }}
              >
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
      <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-blue)", borderTopColor: "transparent", borderRadius: "50%" }}></div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>AI-Powered Recommendations</h2>
        <p style={{ color: "var(--text-muted)" }}>Our engine has matched your resume against {jobs.length} active opportunities.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
        {jobs.map((job) => (
          <div key={job.id} className="glass-card fade-in" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <h3 style={{ fontSize: "1.15rem" }}>{job.title}</h3>
                  <span style={{ fontSize: "0.65rem", padding: "3px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                    {job.job_type || "Full-time"}
                  </span>
                </div>
                <p style={{ color: "var(--accent-blue)", fontWeight: "600", fontSize: "0.85rem", textTransform: "uppercase" }}>{job.company}</p>
                <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--accent-emerald)", fontWeight: "700" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-emerald)", display: "inline-block" }}></span>
                  Source: {job.platform_source || "Internal"}
                </div>
              </div>
                <div style={{ 
                  color: job.matchPercentage ? (job.matchPercentage >= 70 ? "var(--accent-emerald)" : "var(--accent-amber)") : (appliedJobIds.has(job.id) ? "var(--accent-emerald)" : "var(--accent-amber)"),
                  fontSize: "1.2rem", fontWeight: "800"
                }}>
                  {job.matchPercentage ? `${job.matchPercentage}%` : (appliedJobIds.has(job.id) ? "Logged" : "Pending")}
                </div>
                <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{job.matchPercentage || appliedJobIds.has(job.id) ? "Status" : "AI Rank"}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {job.location}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22m5-18H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                {job.salary || "Not Disclosed"}
              </div>
            </div>

            <div style={{ marginTop: "8px" }}>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Priority Skills</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {job.parsedRequiredSkills?.slice(0, 4).map(s => (
                  <span key={s} style={{ fontSize: "0.75rem", padding: "4px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)" }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingTop: "20px" }}>
              {appliedJobIds.has(job.id) ? (
                <div style={{ padding: "14px", textAlign: "center", color: "var(--accent-emerald)", border: "1px solid var(--accent-emerald)", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Application Submitted
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setPendingSelectionContext({ job, actionType: 'analyze' })}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      gap: "10px",
                      padding: "12px", 
                      fontSize: "0.85rem", 
                      fontWeight: "600", 
                      cursor: "pointer", 
                      border: "1px dashed var(--accent-blue)", 
                      color: "var(--accent-blue)",
                      borderRadius: "8px",
                      background: "rgba(59, 130, 246, 0.05)",
                      transition: "all 0.3s ease",
                      width: "100%"
                    }}
                    className="hover-glow neon-button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Analyze with Saved Resume
                  </button>
                  
                  <button 
                    onClick={() => initiateApply(job)}
                    className="neon-button-amber" 
                    style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                  >
                    Direct Apply (No Analysis)
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {analysisJob && <SkillGapModal job={analysisJob} onClose={() => setAnalysisJob(null)} />}
      <ResumeSelectionModal />
    </div>
  );
}

export default RecommendedJobs;

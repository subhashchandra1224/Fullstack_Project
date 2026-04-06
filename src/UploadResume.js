import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function UploadResume() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [isUploadingNew, setIsUploadingNew] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase.from("students").select("skills, resumes").eq("id", user.id).single();
      
      const localSkills = JSON.parse(localStorage.getItem("fallback_skills") || "[]");
      const localResumes = JSON.parse(localStorage.getItem("fallback_resumes") || "[]");

      const finalSkills = (data?.skills && data.skills.length > 0) ? data.skills : localSkills;
      const finalResumes = (data?.resumes && Array.isArray(data.resumes) && data.resumes.length > 0) ? data.resumes : localResumes;

      if (finalSkills.length > 0) setExtractedSkills(finalSkills);
      if (finalResumes.length > 0) setResumes(finalResumes);
    } catch (err) {
      console.error("Error fetching existing skills:", err);
    }
    setInitialFetchDone(true);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    if (resumes.length >= 3) {
      alert("You have reached the maximum limit of 3 resumes. Please delete one first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("http://localhost:5000/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        alert("Backend Error: " + (data.error || "Unknown error occurred"));
        setLoading(false);
        return;
      }

      if (data.skills && data.skills.length > 0) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          alert("Please log in to save your skills.");
          setLoading(false);
          return;
        }

        // Combine skills ensuring no duplicates
        const combinedSkills = [...new Set([...extractedSkills, ...data.skills])];
        
        const newResumeEntry = {
          id: Date.now().toString(),
          name: data.fileName || file.name,
          url: data.fileUrl || null,
          skills: data.skills,
          uploaded_at: new Date().toISOString()
        };

        const updatedResumes = [...resumes, newResumeEntry];

        const { error: updateError } = await supabase
          .from("students")
          .update({ skills: combinedSkills, resumes: updatedResumes })
          .eq("id", user.id);

        if (updateError) {
          if (updateError.message.includes("column") || updateError.message.includes("schema cache")) {
            alert("⚠️ Your resume was saved locally, but your Administrator needs to run the SQL migration to add 'resumes' to the cloud database. It will stay in your browser until then.");
          } else {
            alert("Failed to save resume to database: " + updateError.message);
          }
        } else {
          alert(`Resume uploaded successfully! ✨ Your combined skills are now synced.\n\n${!data.fileUrl ? "⚠️ WARNING: Your backend terminal is outdated. Please RESTART your 'backend' terminal (stop and run npm start again) so it properly hosts the PDF files!" : ""}`);
        }
        
        // Always save to fallback cache
        localStorage.setItem("fallback_resumes", JSON.stringify(updatedResumes));
        localStorage.setItem("fallback_skills", JSON.stringify(combinedSkills));

        setExtractedSkills(combinedSkills);
        setResumes(updatedResumes);
        setIsUploadingNew(false);
        setFile(null);
      } else {
        alert("No professional skills were extracted from this resume. It has not been saved.");
      }
    } catch (error) {
      alert("Upload failed. Make sure the Intelligence Hub (Node.js backend) is running.");
      console.error(error);
    }
    setLoading(false);
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm("Are you sure you want to remove this resume?")) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updatedResumes = resumes.filter(r => r.id !== resumeId);
    
    // Re-calculate the combined skills from the remaining resumes
    let rebuiltSkills = [];
    updatedResumes.forEach(r => {
      rebuiltSkills = [...new Set([...rebuiltSkills, ...r.skills])];
    });

    try {
      await supabase
        .from("students")
        .update({ skills: rebuiltSkills, resumes: updatedResumes })
        .eq("id", user.id);
        
      localStorage.setItem("fallback_resumes", JSON.stringify(updatedResumes));
      localStorage.setItem("fallback_skills", JSON.stringify(rebuiltSkills));

      setResumes(updatedResumes);
      setExtractedSkills(rebuiltSkills);
    } catch (err) {
      alert("Error deleting resume.");
      console.error(err);
    }
  };

  if (!initialFetchDone) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
        <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-blue)", borderTopColor: "transparent", borderRadius: "50%" }}></div>
      </div>
    );
  }

  const showUploadForm = isUploadingNew || resumes.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px" }} className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Resume Center</h2>
          <p style={{ color: "var(--text-muted)" }}>Manage your resumes (Max 3) for targeted job applications.</p>
        </div>
        {!showUploadForm && resumes.length < 3 && (
          <button 
            onClick={() => setIsUploadingNew(true)} 
            className="glass-card hover-glow" 
            style={{ padding: "10px 24px", color: "var(--accent-blue)", border: "1px solid var(--accent-blue)", cursor: "pointer", fontWeight: "600" }}>
            ➕ Upload New Resume
          </button>
        )}
      </div>

      {!showUploadForm ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {resumes.map((resume, idx) => (
            <div key={resume.id} className="glass-card fade-in" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid var(--accent-emerald)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{resume.name}</h3>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                  {resume.skills.slice(0, 5).map(s => <span key={s} style={{ fontSize: "0.7rem", padding: "2px 8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }}>{s}</span>)}
                  {resume.skills.length > 5 && <span style={{ fontSize: "0.7rem", color: "var(--accent-blue)" }}>+{resume.skills.length - 5} more</span>}
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a href={resume.url} target="_blank" rel="noreferrer" className="neon-button" style={{ padding: "8px 16px", fontSize: "0.8rem", textAlign: "center", textDecoration: "none" }}>
                  👁️ View PDF
                </a>
                <button onClick={() => handleDeleteResume(resume.id)} style={{ background: "transparent", border: "1px solid rgba(244, 63, 94, 0.4)", color: "var(--accent-rose)", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}

          <div className="glass-card" style={{ padding: "24px", marginTop: "12px", border: "1px dashed var(--border-color)" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              Combined Master Skillset
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {extractedSkills.map((skill, index) => (
                <span key={index} className="badge badge-selected" style={{ fontSize: "0.85rem" }}>{skill}</span>
              ))}
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "12px" }}>These skills are synced with the Opportunity Engine to find your holistic job matches.</p>
          </div>
        </div>
      ) : (
        <div className="glass-card fade-in" style={{ padding: "40px", textAlign: "center", border: "2px dashed var(--border-color)", background: "rgba(255,255,255,0.02)" }}>
          {isUploadingNew && resumes.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
              <button onClick={() => setIsUploadingNew(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.9rem" }}>Cancel Upload</button>
            </div>
          )}
          <div style={{ marginBottom: "20px" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          
          <label style={{ display: "block", marginBottom: "20px", cursor: "pointer" }}>
            <span style={{ color: "var(--accent-blue)", fontWeight: "600" }}>Click to select</span> or drag and drop
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>PDF formats only (Max 5MB)</p>
            <input
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          {file && (
            <div style={{ marginBottom: "20px", padding: "10px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "8px", border: "1px solid var(--accent-blue)", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span style={{ fontSize: "0.9rem" }}>{file.name}</span>
            </div>
          )}

          <br />

          <button 
            onClick={handleUpload} 
            className="neon-button" 
            disabled={loading || !file}
            style={{ padding: "12px 32px", width: "240px" }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Processing & Syncing...
              </span>
            ) : "Upload Resume"}
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadResume;

changed

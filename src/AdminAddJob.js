import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import Tesseract from "tesseract.js";

const InputField = ({ label, name, type = "text", placeholder, value, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
      {label} {value && <span title="AI Optimized Content" style={{ color: "var(--accent-blue)", fontSize: "0.7rem", animation: "pulse 2s infinite" }}>✨</span>}
    </label>
    <input
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      style={{ 
        padding: "14px", 
        borderRadius: "10px", 
        border: (value && value.length < (name === "company" ? 2 : 3) && name !== "deadline" && name !== "link" && name !== "salary" && name !== "source") ? "1px solid var(--accent-rose)" : "1px solid var(--border-color)", 
        background: "rgba(255,255,255,0.03)", 
        color: "#fff", 
        outline: "none",
        width: "100%",
        transition: "all 0.3s ease",
        colorScheme: "dark",
        boxShadow: (value && value.length < (name === "company" ? 2 : 3) && name !== "deadline" && name !== "link" && name !== "salary" && name !== "source") ? "0 0 10px rgba(244, 63, 94, 0.2)" : "none"
      }}
      className="input-focus-accent date-picker-white"
    />
  </div>
);

function AdminAddJob({ job, setJob, magicText, setMagicText, magicLink, setMagicLink }) {
  const BACKEND_URL = "http://localhost:5000";
  const FALLBACK_URL = "http://127.0.0.1:5000";

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeMode, setActiveMode] = useState("link");

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const runAIAnalyze = async (textToAnalyze, url = "") => {
    if (!textToAnalyze || textToAnalyze.length < 5) return;
    
    // 🔥 IDENTITY RESET: Kill "Ghost Data" immediately
    setJob(prev => ({ 
      ...prev, 
      title: "🔍 AI Intelligence Searching...", 
      company: "🔎 Sourcing Brand Identity..." 
    }));
    
    setAnalyzing(true);
    
    const attemptAnalyze = async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/analyze-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: textToAnalyze, url })
      });
      return response;
    };

    try {
      let response;
      try {
        response = await attemptAnalyze(BACKEND_URL);
      } catch (e) {
        response = await attemptAnalyze(FALLBACK_URL);
      }

      if (response && response.ok) {
        const data = await response.json();
        
        // 🔮 STRICT SYNC: No default fallbacks allowed
        setJob(prev => ({
          ...prev,
          title: data.title || "Unknown Role (Please verify)",
          company: data.company || "Unknown Company (Please verify)",
          skills: data.skills || prev.skills,
          location: data.location || prev.location,
          job_type: data.job_type || prev.job_type,
          salary: data.salary || prev.salary,
          source: data.source || prev.source,
          link: url || prev.link,
          deadline: data.deadline || ""
        }));
        
        const status = data.rating >= 85 ? "🧠 Intelligence Hub: Professional Verified 💎" : "⚡ AI Prediction Sync Complete";
        const dateStatus = data.deadline ? `📅 Deadline Predicted: ${data.deadline}` : "⚠️ No explicit deadline detected.";
        alert(`${status}\n\nAI Prediction Confidence: ${data.rating}%\n${dateStatus}`);
      }
    } catch (err) {
      console.error("AI Sync Fatal Error:", err);
      // Fallback on error: reset to empty to avoid ghost data
      setJob(prev => ({ ...prev, title: "", company: "" }));
      alert("❌ Critical: Intelligence Hub Unreachable. Please verify port 5000 is running.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLinkFetch = async () => {
    if (!magicLink.startsWith("http")) {
      alert("Please enter a valid career link.");
      return;
    }
    setAnalyzing(true);
    
    const attemptFetch = async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/scrape-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: magicLink })
      });
      return response;
    };

    try {
      let response;
      try {
        response = await attemptFetch(BACKEND_URL);
      } catch (e) {
        response = await attemptFetch(FALLBACK_URL);
      }

      const data = await response.json();
      if (response.ok) {
        setJob(prev => ({ ...prev, link: magicLink }));
        setMagicText(data.rawText); // Sync for transparency
        if (data.rawText.length < 300) {
          alert("🛡️ Portal Security Detected: This site has Anti-Bot protection. \n\n✨ Pro-Tip: Use 'Visual Scan' (OCR) for 100% accuracy!");
        }
        await runAIAnalyze(data.rawText, magicLink);
      } else {
        alert("🛡️ Link Fetch Blocked by Portal Security\n\n✨ Why this happened: Major sites like Amazon/LinkedIn block automated readers.\n\n✅ Solution: Use the 'Visual Scan' tab and paste a screenshot for 100% accuracy!");
      }
    } catch (err) {
      alert("Connection Bridge Interrupted: Ensure the Intelligence Server is running. ✨ Pro-Tip: Use 'Visual Scan' for offline extraction!");
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePasteImage = async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file' && item.type.includes('image')) {
        const blob = item.getAsFile();
        setAnalyzing(true);
        try {
          const result = await Tesseract.recognize(blob, 'eng');
          setMagicText(result.data.text); // Sync for transparency
          await runAIAnalyze(result.data.text);
        } catch (err) {
          alert("Visual Scan Stalled: Ensure image is clear or try a manual paste.");
        } finally {
          setAnalyzing(false);
        }
      }
    }
  };

  const calculateSimilarity = (s1, s2) => {
    if (!s1 || !s2) return 0;
    const l1 = s1.toLowerCase().trim();
    const l2 = s2.toLowerCase().trim();
    if (l1 === l2) return 1;
    if (l1.includes(l2) || l2.includes(l1)) {
       const longer = Math.max(l1.length, l2.length);
       const shorter = Math.min(l1.length, l2.length);
       return shorter / longer;
    }
    return 0;
  };

  const isProfessionalTitle = (title, company) => {
    if (!title || title.trim().length < 4) return false;
    // 1. Anti-Gibberish: Block repeating characters (e.g. aaa, bbb)
    if (/(.)\1{2,}/.test(title.toLowerCase())) return false;
    
    // 2. Fragment Guard: Prevent cut-off titles like "Software de"
    const words = title.trim().split(/\s+/);
    const lastWord = words[words.length - 1].toLowerCase();
    const validAcronyms = ["qa", "ui", "ux", "ml", "ai", "it", "sr", "jr", "ii", "vp", "hr"];
    if (lastWord.length <= 2 && !validAcronyms.includes(lastWord)) return false;

    // 3. Brand-Collision Check: Job Title should be the ROLE (e.g. SDE), not the Company Name
    if (company && calculateSimilarity(title, company) > 0.6) return false;

    // 4. Core Role Noun Requirement (Mandatory for "Real World" experience)
    // Removed adjectives like "software", "cloud" from passing the validation on their own
    const coreRoles = ["engineer", "developer", "intern", "analyst", "lead", "manager", "associate", "specialist", "scientist", "architect", "consultant", "tester", "sde", "designer", "admin", "executive"];
    const hasCoreRole = coreRoles.some(k => title.toLowerCase().includes(k));
    
    return hasCoreRole;
  };

  const isFormValid = 
    job.title.length >= 3 && 
    isProfessionalTitle(job.title, job.company) &&
    job.company.length >= 2 && 
    job.link.startsWith("http");

  const addJob = async () => {
    if (!isFormValid) {
      alert("Verification Failed: Professional standards require full details.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("jobs").insert([
      {
        title: job.title,
        company: job.company,
        skills_required: job.skills.split(",").map(skill => skill.trim()).filter(s => s),
        location: job.location,
        salary: job.salary,
        platform_source: job.source,
        application_link: job.link,
        deadline: job.deadline || null,
        job_type: job.job_type
      }
    ]);

    if (!error) {
      alert("Verified Opportunity Published Successfully! 🎉");
      
      // Clear global draft on success
      setJob({ title: "", company: "", skills: "", location: "", salary: "", source: "", link: "", deadline: "", job_type: "Full-time" });
      setMagicText("");
      setMagicLink("");
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  const renderIntelligenceHub = () => {
    return (
      <div className="glass-card fade-in" style={{ padding: "24px", background: "rgba(96, 165, 250, 0.05)", border: "1px solid rgba(96, 165, 250, 0.2)" }}>
        <div style={{ display: "flex", gap: "24px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
          <button type="button" onClick={(e) => { e.stopPropagation(); setActiveMode("link"); }} style={{ background: "none", border: "none", color: activeMode === "link" ? "var(--accent-blue)" : "var(--text-muted)", cursor: "pointer", fontWeight: "700", fontSize: "0.8rem", textTransform: "uppercase" }}>🔗 Magic Link</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setActiveMode("text"); }} style={{ background: "none", border: "none", color: activeMode === "text" ? "var(--accent-blue)" : "var(--text-muted)", cursor: "pointer", fontWeight: "700", fontSize: "0.8rem", textTransform: "uppercase" }}>📝 Quick Paste</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setActiveMode("visual"); }} style={{ background: "none", border: "none", color: activeMode === "visual" ? "var(--accent-blue)" : "var(--text-muted)", cursor: "pointer", fontWeight: "700", fontSize: "0.8rem", textTransform: "uppercase" }}>📷 Visual Scan</button>
        </div>

        {activeMode === "link" && (
          <div style={{ display: "flex", gap: "12px" }}>
            <input 
              placeholder="Paste Career Portal Link (LinkedIn, Naukri, etc.)"
              value={magicLink}
              onChange={(e) => setMagicLink(e.target.value)}
              style={{ flex: 1, padding: "14px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-color)", color: "#fff", outline: "none" }}
            />
            <button type="button" onClick={handleLinkFetch} disabled={analyzing} className="neon-button" style={{ padding: "0 24px", background: "var(--accent-blue)" }}>
              {analyzing ? "Fetching..." : "✨ Fetch via AI"}
            </button>
          </div>
        )}

        {activeMode === "text" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <textarea
              placeholder="Paste raw job description here... AI will extract the details instantly."
              value={magicText}
              onChange={(e) => setMagicText(e.target.value)}
              style={{ width: "100%", height: "100px", padding: "16px", borderRadius: "10px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-color)", color: "#fff", outline: "none", fontSize: "0.9rem", resize: "none" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => runAIAnalyze(magicText)} disabled={analyzing} className="neon-button" style={{ padding: "10px 24px", fontSize: "0.8rem" }}>
                {analyzing ? "Analyzing..." : "✨ Auto-Refine with AI"}
              </button>
            </div>
          </div>
        )}

        {activeMode === "visual" && (
          <div 
            onPaste={handlePasteImage}
            style={{ padding: "40px", border: "2px dashed rgba(96, 165, 250, 0.3)", borderRadius: "12px", textAlign: "center", cursor: "pointer", background: "rgba(96, 165, 250, 0.02)" }}
          >
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {analyzing ? "🎭 AI Vision: Reading Screenshot..." : "📸 Paste (Ctrl+V) a screenshot of a job posting here to scan."}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.02em" }}>AI-Powered Job Publisher</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Curate verified high-tier opportunities using the AI Intelligence Hub.</p>
      </div>

      {/* Multi-Modal AI Intelligence Hub */}
      {renderIntelligenceHub()}

      <div className="glass-card" style={{ padding: "40px", border: "1px solid var(--border-color)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          <InputField label="Job Title" name="title" value={job.title} onChange={handleChange} placeholder="e.g. Senior Software Engineer (Generative AI)" />
          <InputField label="Company Name" name="company" value={job.company} onChange={handleChange} placeholder="e.g. Google Cloud" />
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Job Type</label>
            <select
              name="job_type"
              value={job.job_type}
              onChange={handleChange}
              style={{ padding: "14px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.03)", color: "#fff", cursor: "pointer", outline: "none" }}
            >
              <option value="Full-time">Full-time Opportunity</option>
              <option value="Internship">Internship / Stipend-based</option>
              <option value="Remote">Remote Workspace</option>
              <option value="Hybrid">Hybrid / Office-based</option>
              <option value="Contract">Contractual Engagement</option>
            </select>
          </div>

          <InputField label="Platform Source" name="source" value={job.source} onChange={handleChange} placeholder="e.g. LinkedIn" />

          <div style={{ gridColumn: "span 2" }}>
            <InputField label="Required Skills (Comma separated)" name="skills" value={job.skills} onChange={handleChange} placeholder="e.g. React, Python, AWS, NLP" />
          </div>

          <InputField label="Work Location" name="location" value={job.location} onChange={handleChange} placeholder="e.g. Bengaluru" />
          
          <div style={{ gridColumn: "span 2" }}>
            <InputField label="Application Portal (URL)" name="link" value={job.link} onChange={handleChange} placeholder="Paste verified hiring portal URL here" />
          </div>
          <InputField label="Expiry Deadline" name="deadline" type="date" value={job.deadline} onChange={handleChange} />
        </div>

        <div style={{ marginTop: "48px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
          {!isFormValid && job.title.length > 0 && calculateSimilarity(job.title, job.company) > 0.6 && (
             <p style={{ fontSize: "0.85rem", color: "var(--accent-rose)", fontWeight: "700", animation: "shake 0.5s" }}>
               🏢 Brand Mismatch: Please enter the JOB ROLE (e.g. SDE Intern) instead of the Company Name in the title field.
             </p>
          )}
          {!isFormValid && job.title.length > 0 && !isProfessionalTitle(job.title, job.company) && calculateSimilarity(job.title, job.company) <= 0.6 && (
            <p style={{ fontSize: "0.8rem", color: "var(--accent-rose)", fontWeight: "600", animation: "shake 0.5s" }}>
              🛡️ Professional Standard: Title must be a COMPLETE career role (e.g. Software Engineer, Product Analyst).
            </p>
          )}
          {!isFormValid && (job.title.length < 3 || job.company.length < 2 || !job.link.startsWith("http")) && (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>
              ⚠️ Mandatory: Minimum Title, Company, and Link required for publication.
            </p>
          )}
          <button 
            type="button"
            onClick={addJob} 
            className="neon-button" 
            disabled={loading || !isFormValid}
            style={{ 
              width: "240px", 
              padding: "16px", 
              fontSize: "0.9rem", 
              fontWeight: "700",
              opacity: isFormValid ? 1 : 0.5,
              cursor: isFormValid ? "pointer" : "not-allowed"
            }}
          >
            {loading ? "Publishing..." : "Verify & Publish Opportunity"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAddJob; 

i have changed

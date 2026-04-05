import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function Profile() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("draft_profile");
    if (saved) return JSON.parse(saved);
    return {
      name: "", email: "", phone: "", graduation_year: "",
      cgpa_int: "", cgpa_dec1: "", cgpa_dec2: "", department: "", skills: []
    };
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    localStorage.setItem("draft_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("id", user.id)
        .single();

      const cgpaNum = data?.cgpa || 0;
      const cgpaStr = cgpaNum.toFixed(2);
      const [intPart, decPart] = cgpaStr.split('.');

      setProfile(prev => {
        const merged = {
          name: data?.name || prev.name,
          email: user.email || prev.email,
          phone: data?.phone || prev.phone,
          graduation_year: data?.graduation_year || prev.graduation_year || 2025,
          cgpa_int: (data?.cgpa != null && data.cgpa > 0) ? intPart : (prev.cgpa_int || "0"),
          cgpa_dec1: (data?.cgpa != null && data.cgpa > 0) ? decPart.charAt(0) : (prev.cgpa_dec1 || "0"),
          cgpa_dec2: (data?.cgpa != null && data.cgpa > 0) ? decPart.charAt(1) : (prev.cgpa_dec2 || "0"),
          department: data?.department || prev.department,
          skills: data?.skills || prev.skills
        };
        
        const mergedCgpa = parseFloat(`${merged.cgpa_int}.${merged.cgpa_dec1}${merged.cgpa_dec2}`);
        if (merged.phone && merged.department && mergedCgpa > 0) {
          setIsEditing(false);
        }
        
        return merged;
      });

    } catch (err) {
      console.error("Error fetching profile:", err);
    }
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // 1. Mandatory Field Validation
    const requiredFields = {
      phone: "Phone Number",
      department: "Department",
      graduation_year: "Graduation Year"
    };

    const emptyFields = Object.keys(requiredFields).filter(key => !profile[key] || profile[key] === "");
    
    if (emptyFields.length > 0) {
      alert(`⚠️ Action Required: Please complete your ${requiredFields[emptyFields[0]]} before saving.`);
      return;
    }

    const valInt = profile.cgpa_int || "0";
    const valD1 = profile.cgpa_dec1 || "0";
    const valD2 = profile.cgpa_dec2 || "0";
    const finalCgpa = parseFloat(`${valInt}.${valD1}${valD2}`);

    if (isNaN(finalCgpa) || finalCgpa < 0 || finalCgpa > 10) {
      alert("Invalid CGPA. Please ensure your score is between 0.00 and 10.00");
      return;
    }

    setSaving(true);
    
    const updateData = {
      phone: profile.phone,
      graduation_year: parseInt(profile.graduation_year),
      department: profile.department,
      cgpa: finalCgpa
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("students")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        if (error.message.includes("schema cache") || error.message.includes("column")) {
          throw new Error("Missing database columns. Please run the SQL migration provided previously.");
        }
        throw error;
      }
      alert("Profile updated successfully! ✨ Your details are now synced with the Opportunity Engine.");
      setIsEditing(false); // Lock the profile after saving
    } catch (err) {
      alert("Intelligence Hub Error: " + err.message);
    }
    setSaving(false);
  };

  const handleFocus = (e) => e.target.select();

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
      <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-blue)", borderTopColor: "transparent", borderRadius: "50%" }}></div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px" }} className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>My Professional Profile</h2>
          <p style={{ color: "var(--text-muted)" }}>Keep your academic and contact details up-to-date for better job matching.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="glass-card hover-glow" 
            style={{ padding: "10px 24px", color: "var(--accent-blue)", border: "1px solid var(--accent-blue)", cursor: "pointer", fontWeight: "600" }}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="glass-card fade-in" style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "32px", border: "1px solid var(--accent-emerald)" }}>
          <div style={{ padding: "16px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.5rem" }}>✅</span>
            <div>
              <p style={{ fontWeight: "700", color: "var(--accent-emerald)" }}>Profile Saved & Locked</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>Your structured data is currently flowing to the Opportunity Engine.</p>
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em", marginBottom: "8px" }}>Identity</p>
              <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>{profile.name}</p>
              <p style={{ color: "var(--accent-blue)", marginTop: "4px" }}>{profile.email}</p>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>{profile.phone}</p>
            </div>
            <div>
               <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em", marginBottom: "8px" }}>Academic Status</p>
               <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>{profile.department}</p>
               <p style={{ color: "var(--text-dim)", marginTop: "4px" }}>Class of {profile.graduation_year}</p>
               <div style={{ marginTop: "12px", display: "inline-block", padding: "6px 14px", background: "rgba(255,255,255,0.05)", borderRadius: "20px", border: "1px solid var(--border-color)", fontWeight: "800", color: "var(--accent-emerald)" }}>
                 CGPA: {parseFloat(`${profile.cgpa_int}.${profile.cgpa_dec1}${profile.cgpa_dec2}`).toFixed(2)}
               </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em", marginBottom: "16px" }}>Detected Skills (From Resume)</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {profile.skills.length > 0 ? profile.skills.map((skill, index) => (
                <span key={index} className="badge badge-selected" style={{ fontSize: "0.8rem" }}>{skill}</span>
              )) : <p style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>No skills detected. Upload your resume in the Resume Center.</p>}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="glass-card fade-in" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Full Name</label>
              <input value={profile.name} disabled style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", color: "var(--text-muted)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Email Address</label>
              <input value={profile.email} disabled style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", color: "var(--text-muted)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Phone Number</label>
              <input 
                value={profile.phone} 
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="+91 98765 43210"
                style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "#fff", outline: "none" }} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Department</label>
              <input 
                value={profile.department} 
                onChange={(e) => setProfile({...profile, department: e.target.value})}
                placeholder="e.g. Computer Science"
                style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "#fff", outline: "none" }} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>CGPA (Format: X.YY)</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input 
                  type="text" maxLength="1" 
                  value={profile.cgpa_int} 
                  onFocus={handleFocus}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setProfile({...profile, cgpa_int: val});
                    if (val) e.target.parentElement.querySelectorAll('input')[1].focus();
                  }}
                  style={{ width: "45px", textAlign: "center", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "#fff", fontSize: "1.2rem", fontWeight: "700" }} 
                />
                <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--accent-blue)" }}>.</span>
                <input 
                  type="text" maxLength="1"
                  value={profile.cgpa_dec1} 
                  onFocus={handleFocus}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setProfile({...profile, cgpa_dec1: val});
                    if (val) e.target.parentElement.querySelectorAll('input')[2].focus();
                  }}
                  onKeyDown={(e) => { if (e.key === 'Backspace' && !profile.cgpa_dec1) e.target.parentElement.querySelectorAll('input')[0].focus(); }}
                  style={{ width: "45px", textAlign: "center", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "#fff", fontSize: "1.2rem", fontWeight: "700" }} 
                />
                <input 
                  type="text" maxLength="1"
                  value={profile.cgpa_dec2} 
                  onFocus={handleFocus}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setProfile({...profile, cgpa_dec2: val});
                  }}
                  onKeyDown={(e) => { if (e.key === 'Backspace' && !profile.cgpa_dec2) e.target.parentElement.querySelectorAll('input')[1].focus(); }}
                  style={{ width: "45px", textAlign: "center", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "#fff", fontSize: "1.2rem", fontWeight: "700" }} 
                />
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Enter digits individually (e.g. 9 . 1 5)</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Graduation Year</label>
              <input 
                type="number" min="2025"
                value={profile.graduation_year} 
                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.length >= 4 && parseInt(val) < 2025) val = "2025";
                  setProfile({...profile, graduation_year: val});
                }}
                placeholder="Min 2025"
                style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "#fff", outline: "none" }} 
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Detected Skills (From Resume)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {profile.skills.length > 0 ? profile.skills.map((skill, index) => (
                <span key={index} className="badge badge-pending" style={{ fontSize: "0.8rem" }}>{skill}</span>
              )) : <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>No skills detected. Please upload your resume.</p>}
            </div>
          </div>

          <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="neon-button" disabled={saving} style={{ padding: "14px 32px" }}>
              {saving ? "Saving Changes..." : "Update Profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

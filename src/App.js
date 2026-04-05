import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import UploadResume from "./UploadResume";
import RecommendedJobs from "./RecommendedJobs";
import Login from "./Login";
import Register from "./Register";
import AdminAddJob from "./AdminAddJob";
import AdminApplications from "./AdminApplications";
import AdminDashboard from "./AdminDashboard";

// New feature imports
import Profile from "./Profile";
import NoticeBoard from "./NoticeBoard";
import CompanyDirectory from "./CompanyDirectory";
import Policies from "./Policies";
import Attendance from "./Attendance";
import PreparationHub from "./PreparationHub";
import Calendar from "./Calendar";

function App() {
  const [view, setView] = useState(() => localStorage.getItem("current_view") || ""); 
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [showPolicies, setShowPolicies] = useState(false);
  
  // Global Persistence: Intelligence Hub State
  const [jobDraft, setJobDraft] = useState({
    title: "", company: "", skills: "", location: "", salary: "", source: "", link: "", deadline: "", job_type: "Full-time"
  });
  const [magicText, setMagicText] = useState("");
  const [magicLink, setMagicLink] = useState("");

  // Persistence: Save view to localStorage
  useEffect(() => {
    if (view) localStorage.setItem("current_view", view);
  }, [view]);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) handleUserSession(session.user);
      else { setView("login"); setLoading(false); }
    };
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) handleUserSession(session.user);
      else { setUser(null); setRole(null); setView("login"); }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserSession = async (user) => {
    setUser(user);
    const { data: adminRecord } = await supabase.from("admins").select("id").eq("id", user.id).single();
    
    if (adminRecord) {
      setRole("admin");
      // Navigation Anchor: Only redirect if we haven't already restored a persisted view
      if (!view || view === "login") {
        setView("admin-dashboard");
      }
    } else {
      setRole("student");
      if (!view || view === "login") {
        setView("jobs");
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setRole(null); setView("login");
  };

  const NavItem = ({ viewId, label, svgPaths, onClick }) => (
    <div 
      className={`nav-item ${view === viewId || (viewId === 'policies' && showPolicies) ? "active" : ""}`}
      onClick={onClick || (() => setView(viewId))}
      style={{
        display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", borderRadius: "var(--radius-md)", cursor: "pointer", transition: "all 0.3s ease",
        color: (view === viewId || (viewId === 'policies' && showPolicies)) ? "var(--accent-blue)" : "var(--text-muted)",
        backgroundColor: (view === viewId || (viewId === 'policies' && showPolicies)) ? "rgba(96, 165, 250, 0.08)" : "transparent",
        marginBottom: "8px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "20px" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {svgPaths.map((p, i) => <path key={i} d={p} />)}
        </svg>
      </div>
      <span style={{ fontSize: "0.92rem", fontWeight: "600", letterSpacing: "0.01em" }}>{label}</span>
    </div>
  );

  const SectionLabel = ({ label }) => (
    <div style={{ color: "var(--text-dim)", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", padding: "32px 20px 12px", letterSpacing: "0.1em" }}>{label}</div>
  );

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--bg-deep)" }}>
      <div style={{ textAlign: "center" }}>
        <div className="animate-spin" style={{ width: "40px", height: "40px", border: "3px solid var(--accent-blue)", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 20px" }}></div>
        <p style={{ color: "var(--accent-blue)", fontWeight: "600", letterSpacing: "0.05em" }}>PLACEMENT OS INITIALIZING</p>
      </div>
    </div>
  );

  return (
    <div className="layout-container">
      {/* Policies Drawer */}
      {showPolicies && (
        <div style={{ position: "fixed", top: 0, right: 0, width: "450px", height: "100vh", background: "var(--bg-card)", zIndex: 200, boxShadow: "-10px 0 30px rgba(0,0,0,0.5)", padding: "40px", borderLeft: "1px solid var(--border-color)", overflowY: "auto" }} className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <h2 style={{ fontSize: "1.4rem" }}>Portal Policies</h2>
            <button onClick={() => setShowPolicies(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.5rem" }}>&times;</button>
          </div>
          <Policies />
        </div>
      )}

      <aside className="sidebar">
        <div style={{ padding: "0 20px 40px" }}>
          <div style={{ width: "40px", height: "40px", background: "var(--accent-blue)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: "0 0 20px rgba(96, 165, 250, 0.4)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h1 style={{ fontSize: "1.25rem", color: "#fff", fontWeight: "800", letterSpacing: "0.02em" }}>PLACEMENT <span style={{ color: "var(--accent-blue)" }}>OS</span></h1>
        </div>

        <div style={{ flex: 1 }}>
          {!user && (
            <>
              <SectionLabel label="Authentication" />
              <NavItem viewId="login" label="Student Login" svgPaths={["M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4", "M10 17l5-5-5-5", "M15 12H3"]} />
              <NavItem viewId="register" label="Register Portal" svgPaths={["M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M20 8v6", "M23 11h-6", "M8.5 3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 1 0 0-9z"]} />
            </>
          )}

          {user && role === "student" && (
            <>
              <SectionLabel label="Intelligence" />
              <NavItem viewId="prep-hub" label="Prep Hub" svgPaths={["M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"]} />
              <NavItem viewId="companies" label="Companies" svgPaths={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]} />
              
              <SectionLabel label="Placement" />
              <NavItem viewId="jobs" label="Opportunity Engine" svgPaths={["M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"]} />
              <NavItem viewId="attendance" label="Attendance" svgPaths={["M22 11.08V12a10 10 0 1 1-5.93-9.14", "M22 4L12 14.01l-3-3"]} />
              
              <SectionLabel label="Personal" />
              <NavItem viewId="profile" label="Profile" svgPaths={["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 3a4 4 0 1 0 0 8 4 4 0 1 0 0-8z"]} />
              <NavItem viewId="upload" label="Resumes" svgPaths={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"]} />
              
              <SectionLabel label="Information" />
              <NavItem viewId="calendar" label="Calendar" svgPaths={["M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z", "M16 2v4", "M8 2v4", "M3 10h18"]} />
              <NavItem viewId="notice" label="Bulletin" svgPaths={["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"]} />
              <NavItem viewId="policies" label="Rulebook" onClick={() => setShowPolicies(true)} svgPaths={["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 8v4", "M12 16h.01"]} />
            </>
          )}

          {user && role === "admin" && (
            <>
              <SectionLabel label="Admin Core" />
              <NavItem viewId="admin-dashboard" label="Analytics" svgPaths={["M18 20V10", "M12 20V4", "M6 20V14"]} />
              <NavItem viewId="admin" label="Post New Job" svgPaths={["M12 5v14", "M5 12h14"]} />
              <NavItem viewId="admin-apps" label="Review Center" svgPaths={["M9 11l3 3L22 4", "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"]} />
              <NavItem viewId="notice" label="Post Notice" svgPaths={["M12 19l7-7 3 3-7 7-3-3z", "M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"]} />
            </>
          )}
        </div>

        {user && (
          <div style={{ padding: "16px", borderTop: "1px solid var(--border-color)", marginBottom: "10px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px", overflow: "hidden", textOverflow: "ellipsis" }}>
              Active User: <strong>{user.email}</strong>
            </div>
            <button 
              onClick={handleLogout} className="glass-card" 
              style={{ width: "100%", padding: "10px", color: "var(--accent-rose)", border: "1px solid rgba(244, 63, 94, 0.2)", cursor: "pointer", fontWeight: "600" }}
            >
              Sign Out
            </button>
          </div>
        )}
      </aside>

      <main className="main-content">
        <div className="fade-in">
          {view === "login" && <Login />}
          {view === "register" && <Register />}
          
          {/* Persistent Core Modules (Zero-Refresh) */}
          <div style={{ display: view === "profile" ? "block" : "none" }}><Profile /></div>
          <div style={{ display: view === "upload" && role === "student" ? "block" : "none" }}><UploadResume /></div>
          <div style={{ display: view === "jobs" && role === "student" ? "block" : "none" }}><RecommendedJobs /></div>

          {/* Functional Modules */}
          {view === "prep-hub" && <PreparationHub />}
          {view === "notice" && <NoticeBoard role={role} />}
          {view === "companies" && <CompanyDirectory />}
          {view === "attendance" && <Attendance />}
          {view === "calendar" && <Calendar />}

          {/* Other Core Modules */}
          {view === "admin-dashboard" && role === "admin" && <AdminDashboard />}
          {view === "admin" && role === "admin" && <AdminAddJob job={jobDraft} setJob={setJobDraft} magicText={magicText} setMagicText={setMagicText} magicLink={magicLink} setMagicLink={setMagicLink} />}
          {view === "admin-apps" && role === "admin" && <AdminApplications />}
        </div>
      </main>
    </div>
  );
}

export default App;
import React from "react";

export default function Policies() {
  const categories = [
    {
      title: "General Eligibility",
      points: [
        "Students must maintain a minimum CGPA of 6.0.",
        "Must be in the final or pre-final year of graduation.",
        "No active backlogs at the time of recruitment.",
        "Must be registered with the Training & Placement Cell."
      ]
    },
    {
      title: "Interview Ethics",
      points: [
        "Punctuality is mandatory for all off-campus and on-campus events.",
        "Professional dress code must be followed (Formals).",
        "Maintain high standards of discipline during PPT and Interviews.",
        "Any misconduct will lead to immediate debarment."
      ]
    },
    {
      title: "Offer Acceptance Policy",
      points: [
        "One student, one job offer policy is strictly followed.",
        "Once a student is placed, they cannot sit for other companies.",
        "Dream company exceptions: Only for companies offering 50% more CTC than the current offer.",
        "Pre-Placement Offers (PPOs) must be reported to the Cell within 48 hours."
      ]
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Placement Policies & Guidelines</h2>
        <p style={{ color: "var(--text-muted)" }}>Essential rules for a successful and fair recruitment process on campus.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
        {categories.map((cat, idx) => (
          <div key={idx} className="glass-card fade-in" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "1.2rem", color: "var(--accent-blue)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "8px", height: "24px", background: "var(--accent-blue)", borderRadius: "4px" }}></div>
              {cat.title}
            </h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: "16px", padding: 0, margin: 0, listStyleType: "none" }}>
              {cat.points.map((p, i) => (
                <li key={i} style={{ display: "flex", gap: "12px", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                  <span style={{ color: "var(--accent-emerald)", fontWeight: "bold" }}>✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid var(--accent-rose)", background: "rgba(244, 63, 94, 0.05)" }}>
        <p style={{ fontSize: "0.9rem", color: "var(--accent-rose)", fontWeight: "600" }}>Note: Any violation of these policies will result in immediate suspension from the current placement season and potential disciplinary action.</p>
      </div>
    </div>
  );
}

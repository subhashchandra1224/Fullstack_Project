import { useState } from "react";
import { supabase } from "./supabaseClient";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1️⃣ Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    // 2️⃣ Insert into students table
    await supabase.from("students").insert([
      {
        id: user.id,
        name: name,
      },
    ]);

    alert("Registration successful 🎉");
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div className="glass-card" style={{ padding: "40px", width: "100%", maxWidth: "450px" }}>
        <h2 style={{ marginBottom: "10px", textAlign: "center" }}>Create Account</h2>
        <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: "30px", fontSize: "0.9rem" }}>Join the placement portal today.</p>

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "500", color: "var(--text-muted)" }}>Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "500", color: "var(--text-muted)" }}>Email Address</label>
            <input
              type="email"
              placeholder="e.g. student@college.com"
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "500", color: "var(--text-muted)" }}>Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="neon-button" style={{ marginTop: "10px", padding: "14px" }}>
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
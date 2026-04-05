import { useState } from "react";
import { supabase } from "./supabaseClient";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login successful 🎉");
    console.log("Logged in user:", data.user);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div className="glass-card" style={{ padding: "40px", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ marginBottom: "10px", textAlign: "center" }}>Welcome Back</h2>
        <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: "30px", fontSize: "0.9rem" }}>Please enter your details to sign in.</p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
              placeholder="••••••••"
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="neon-button" style={{ marginTop: "10px", padding: "14px" }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
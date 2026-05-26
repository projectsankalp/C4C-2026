/**
 * GraamSehat ASHA Worker App - Login Page
 * Path: /src/pages/Login.jsx
 * Worker authentication view checking credentials and role authorization levels.
 */

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export function Login() {
  const { t } = useLanguage();
  const { login, isPendingApproval, logout, authError } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (err) {
      console.error("Login component caught error", err);
      // Map error codes
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setErrorMsg("Incorrect email or password. Please try again.");
      } else {
        setErrorMsg(err.message || "Failed to sign in. Please verify connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "calc(100vh - 40px)",
        padding: "20px"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <span style={{ fontSize: "64px" }}>🏥</span>
        <h1 style={{ margin: "16px 0 8px 0", fontSize: "28px", fontWeight: "800", letterSpacing: "1px" }}>
          GraamSehat
        </h1>
        <p style={{ margin: 0, color: "var(--color-text-gray)", fontSize: "16px", fontWeight: "500" }}>
          ASHA SCREENING PORTAL
        </p>
      </div>

      {isPendingApproval ? (
        // Pending approval card
        <div className="glass-card text-center" style={{ borderLeft: "5px solid var(--color-accent)" }}>
          <span style={{ fontSize: "36px" }}>⏳</span>
          <h3 style={{ margin: "12px 0 8px 0", color: "var(--color-accent)" }}>
            Approval Pending
          </h3>
          <p style={{ fontSize: "14px", color: "var(--color-text-gray)", lineHeight: "1.6" }}>
            {t("pendingStatus")}
          </p>
          <button
            onClick={() => logout()}
            className="btn-secondary"
            style={{ marginTop: "16px", padding: "10px" }}
          >
            {t("logout")}
          </button>
        </div>
      ) : (
        // Login Form
        <form onSubmit={handleSubmit} className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
          <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "700", textAlign: "center" }}>
            ASHA Worker Login
          </h2>

          {errorMsg && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "var(--color-red)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "16px",
                textAlign: "center"
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          {authError === "role_invalid" && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "var(--color-red)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "16px",
                textAlign: "center"
              }}
            >
              ⚠️ Access Denied: Only approved ASHA workers are allowed.
            </div>
          )}

          <label style={{ fontSize: "14px", fontWeight: "700", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="e.g. asha@graamsehat.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />

          <label style={{ fontSize: "14px", fontWeight: "700", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
            Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: "8px" }}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>

          {/* Sandboxed Sandbox testing helpers */}
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              borderRadius: "12px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              fontSize: "13px",
              color: "var(--color-text-secondary)"
            }}
          >
            <div style={{ fontWeight: "800", marginBottom: "6px", color: "var(--color-primary)" }}>
              🧪 Sandbox Test Account
            </div>
            <div>Email: <code style={{ color: "var(--color-text-primary)", fontWeight: "700" }}>asha@graamsehat.org</code></div>
            <div>Pass: <code style={{ color: "var(--color-text-primary)", fontWeight: "700" }}>password123</code></div>
            <div style={{ marginTop: "6px", fontSize: "11px", fontStyle: "italic" }}>
              Note: First-time accounts auto-generate an approved ASHA worker profile.
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default Login;

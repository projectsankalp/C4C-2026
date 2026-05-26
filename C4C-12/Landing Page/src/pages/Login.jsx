/**
 * @file Login.jsx
 * @description Login page for ASHA workers and Admins. Performs authentication, password reset, and role-based redirection.
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { validateLogin } from "../utils/validators";
import { Shield, Mail, Lock, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

import { getUserProfile } from "../firebase/firestore";

export const Login = () => {
  const { login, resetUserPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setResetSuccess("");

    // Validate inputs
    const { isValid, errors: validationErrors } = validateLogin(email, password);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const userCredential = await login(email, password);
      
      // Perform role-based redirection
      // Normally we fetch userProfile immediately in AuthContext.
      // Let's inspect the resolved user profile from DB.
      // Since AuthContext already fetches profile, we'll wait briefly or fetch profile directly.
      const user = userCredential.user;
      const profile = await getUserProfile(user.uid);


      if (profile) {
        const role = profile.role || "asha";
        if (role === "admin") {
          // Redirect to admin portal/admin route
          navigate("/admin");
        } else if (role === "asha") {
          // ASHA workers go to downloads
          if (profile.status === "approved") {
            navigate("/downloads");
          } else {
            navigate("/pending");
          }
        } else if (role === "villager") {
          // Villagers go to web app
          window.location.href = "https://graamsehat-villager.web.app";
        } else {
          navigate("/");
        }
      } else {
        setServerError("No profile associated with this user database entry.");
      }
    } catch (error) {
      console.error("Login component error:", error);
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setServerError("Invalid email or password credentials.");
      } else {
        setServerError(error.message || "An authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ email: "Please enter your email address to reset your password." });
      return;
    }
    setErrors({});
    setIsResetting(true);
    setServerError("");
    setResetSuccess("");

    try {
      await resetUserPassword(email);
      setResetSuccess("A password reset link has been sent to your email address.");
    } catch (error) {
      console.error("Reset password error:", error);
      setServerError("Failed to send reset email. Verify the address is correct.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Rings */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center space-x-2 group">
          <div className="h-12 w-12 rounded-2xl bg-teal-500 flex items-center justify-center text-slate-900 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
            <Shield className="h-6 w-6 fill-slate-900/10" />
          </div>
          <span className="text-2xl font-bold text-white tracking-wide">
            GraamSehat
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Or{" "}
          <Link to="/signup" className="font-bold text-teal-400 hover:text-teal-300 transition-colors">
            register as a new ASHA worker
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-800/80 backdrop-blur-md py-8 px-6 sm:px-10 rounded-3xl border border-slate-700/50 shadow-2xl">
          
          {/* Notifications */}
          {serverError && (
            <div className="mb-5 p-4 rounded-xl bg-red-900/20 border border-red-500/35 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/35 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{resetSuccess}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Email address
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 bg-slate-900/60 border ${
                    errors.email ? "border-red-500" : "border-slate-700"
                  } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 bg-slate-900/60 border ${
                    errors.password ? "border-red-500" : "border-slate-700"
                  } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Remember & Forgot Password Links */}
            <div className="flex items-center justify-between">
              <div className="text-xs">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResetting}
                  className="font-semibold text-teal-400 hover:text-teal-300 focus:outline-none"
                >
                  {isResetting ? "Sending reset..." : "Forgot your password?"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-600/10 hover:shadow-teal-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;

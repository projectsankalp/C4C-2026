/**
 * @file Signup.jsx
 * @description Registration page for new ASHA Workers. Integrates custom validators, OTP verification modal, and Firestore user setup.
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useOTP } from "../hooks/useOTP";
import { validateSignup } from "../utils/validators";
import OTPModal from "../components/OTPModal";
import { Shield, User, Landmark, Building2, Phone, Mail, Lock, RefreshCw, AlertCircle, Award } from "lucide-react";

export const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    district: "",
    subCentre: "",
    phone: "",
    email: "",
    password: "",
  });

  // State Management
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [registeredUid, setRegisteredUid] = useState("");

  // OTP Hooks
  const {
    generatedOtp,
    cooldown,
    loading: otpLoading,
    error: otpError,
    success: otpSuccess,
    triggerOtp,
    verifyOtp,
    clearOtpError
  } = useOTP();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // Form validation
    const { isValid, errors: validationErrors } = validateSignup(formData);
    if (!isValid) {
      setErrors(validationErrors);
      // Scroll to top of form or focus error
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      // Create user auth + save firestore details
      const userCredential = await signup(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
        employeeId: formData.employeeId,
        district: formData.district,
        subCentre: formData.subCentre,
        role: "asha",
        status: "pending",
      });

      const uid = userCredential.user.uid;
      setRegisteredUid(uid);

      // Trigger the OTP simulation and display modal
      await triggerOtp(uid);
      setIsOtpOpen(true);
    } catch (error) {
      console.error("Signup error in form submission:", error);
      if (error.code === "auth/email-already-in-use") {
        setServerError("An account with this email address already exists.");
      } else if (error.code === "auth/invalid-email") {
        setServerError("Invalid email address format.");
      } else if (error.code === "auth/weak-password") {
        setServerError("Password is too weak. Please use a stronger password.");
      } else {
        setServerError(error.message || "Registration failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Callback executed on successful OTP validation
  const handleOtpVerified = () => {
    setIsOtpOpen(false);
    navigate("/pending");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Rings */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <Link to="/" className="flex justify-center items-center space-x-2 group">
          <div className="h-12 w-12 rounded-2xl bg-teal-500 flex items-center justify-center text-slate-900 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
            <Shield className="h-6 w-6 fill-slate-900/10" />
          </div>
          <span className="text-2xl font-bold text-white tracking-wide">
            GraamSehat
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          ASHA Registration Request
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Already have an approved account?{" "}
          <Link to="/login" className="font-bold text-teal-400 hover:text-teal-300 transition-colors">
            Sign In here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-800/80 backdrop-blur-md py-8 px-6 sm:px-10 rounded-3xl border border-slate-700/50 shadow-2xl">
          
          {serverError && (
            <div className="mb-5 p-4 rounded-xl bg-red-900/20 border border-red-500/35 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Split Row: Full Name & Employee ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4.5 w-4.5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full pl-9 pr-3 py-2.5 bg-slate-900/60 border ${
                      errors.name ? "border-red-500" : "border-slate-700"
                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs transition-all`}
                    placeholder="e.g. Lakshmi Devi"
                  />
                </div>
                {errors.name && <p className="mt-1 text-[10px] text-red-400 font-medium">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Employee ID
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award className="h-4.5 w-4.5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className={`block w-full pl-9 pr-3 py-2.5 bg-slate-900/60 border ${
                      errors.employeeId ? "border-red-500" : "border-slate-700"
                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs transition-all`}
                    placeholder="e.g. ASHA-8927"
                  />
                </div>
                {errors.employeeId && <p className="mt-1 text-[10px] text-red-400 font-medium">{errors.employeeId}</p>}
              </div>
            </div>

            {/* Split Row: District & Sub-Centre */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  District
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Landmark className="h-4.5 w-4.5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`block w-full pl-9 pr-3 py-2.5 bg-slate-900/60 border ${
                      errors.district ? "border-red-500" : "border-slate-700"
                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs transition-all`}
                    placeholder="e.g. Nalanda"
                  />
                </div>
                {errors.district && <p className="mt-1 text-[10px] text-red-400 font-medium">{errors.district}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Sub-Centre Name
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-4.5 w-4.5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="subCentre"
                    value={formData.subCentre}
                    onChange={handleInputChange}
                    className={`block w-full pl-9 pr-3 py-2.5 bg-slate-900/60 border ${
                      errors.subCentre ? "border-red-500" : "border-slate-700"
                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs transition-all`}
                    placeholder="e.g. Silao Sub-Centre"
                  />
                </div>
                {errors.subCentre && <p className="mt-1 text-[10px] text-red-400 font-medium">{errors.subCentre}</p>}
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Phone Number (For OTP Verification)
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`block w-full pl-9 pr-3 py-2.5 bg-slate-900/60 border ${
                    errors.phone ? "border-red-500" : "border-slate-700"
                  } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs transition-all`}
                  placeholder="e.g. 9876543210"
                />
              </div>
              {errors.phone && <p className="mt-1 text-[10px] text-red-400 font-medium">{errors.phone}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-9 pr-3 py-2.5 bg-slate-900/60 border ${
                    errors.email ? "border-red-500" : "border-slate-700"
                  } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs transition-all`}
                  placeholder="e.g. lakshmi.devi@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-[10px] text-red-400 font-medium">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-9 pr-3 py-2.5 bg-slate-900/60 border ${
                    errors.password ? "border-red-500" : "border-slate-700"
                  } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs transition-all`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-[10px] text-red-400 font-medium">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-600/10 hover:shadow-teal-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Submit Access Request</span>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* Simulated OTP verification modal */}
      <OTPModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        userUid={registeredUid}
        generatedOtp={generatedOtp}
        cooldown={cooldown}
        loading={otpLoading}
        error={otpError}
        success={otpSuccess}
        triggerOtp={triggerOtp}
        verifyOtp={verifyOtp}
        onVerified={handleOtpVerified}
      />
    </div>
  );
};

export default Signup;

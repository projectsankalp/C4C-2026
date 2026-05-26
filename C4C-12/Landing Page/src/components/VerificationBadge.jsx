/**
 * @file VerificationBadge.jsx
 * @description Renders a visual status badge (Pending, Approved, Rejected) for accounts.
 */

import React from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export const VerificationBadge = ({ status }) => {
  const normalized = (status || "").toLowerCase();

  switch (normalized) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle className="h-3.5 w-3.5" />
          Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
          <XCircle className="h-3.5 w-3.5" />
          Rejected
        </span>
      );
    case "pending":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
          Pending Approval
        </span>
      );
  }
};

export default VerificationBadge;

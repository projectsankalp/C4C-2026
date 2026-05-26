import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("asha_plus_token");
  const userStr = localStorage.getItem("asha_plus_user");
  let user = null;

  try {
    if (userStr) user = JSON.parse(userStr);
  } catch {
    console.error("Invalid user string");
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role.toLowerCase();

  // Enforce single-page workspaces per role
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === "doctor" ? "/dashboard" : "/admin"} replace />;
  }

  return <Outlet />;
}

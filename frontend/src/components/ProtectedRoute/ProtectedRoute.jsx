import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // User is not logged in.
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // User is logged in but does not have
  // permission for this route.
  if (
    allowedRoles &&
    !allowedRoles.includes(role)
  ) {
    if (role === "STUDENT") {
      return (
        <Navigate
          to="/meals"
          replace
        />
      );
    }

    if (
      role === "STAFF" ||
      role === "ADMIN"
    ) {
      return (
        <Navigate
          to="/staff-dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
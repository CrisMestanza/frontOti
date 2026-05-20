import { Navigate } from "react-router-dom";
import { getUser } from "../auth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/encuestas" />;
  }

  return children;
}
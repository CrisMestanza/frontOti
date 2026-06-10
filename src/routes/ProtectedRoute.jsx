import { Navigate } from "react-router-dom";
import { getUser } from "../auth";

const defaultByRole = {
  OTI: "/dashboard",
  ASUNTOS_ACADEMICOS: "/encuestas",
  CAJA: "/ordenar-pdf",
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to={defaultByRole[user.rol] ?? "/encuestas"} />;
  }

  return children;
}
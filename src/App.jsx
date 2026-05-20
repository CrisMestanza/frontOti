import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/dashboard/Dashboard";
import Gmail from "./pages/gmail/Gmail";
import BecasComedor from "./pages/becasComedor/BecasComedor";
import Periodos from "./pages/periodos/Periodos";
import PagosPendientes from "./pages/pagosComedor/PagosComedor";
import Encuestas from "./pages/encuestas/Encuestas";
import Login from "./pages/login/Login";
import Logout from "./pages/logout/Logout";

import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔐 LOGIN */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />

        {/* 🚪 LOGOUT */}
        <Route path="/logout" element={<Logout />} />

        {/* 🟢 ENCUESTAS */}
        <Route
          path="/encuestas"
          element={
            <ProtectedRoute allowedRoles={["OTI", "ASUNTOS_ACADEMICOS"]}>
              <Encuestas />
            </ProtectedRoute>
          }
        />

        {/* 🔴 SOLO OTI */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["OTI"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gmail"
          element={
            <ProtectedRoute allowedRoles={["OTI"]}>
              <Gmail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/comedor"
          element={
            <ProtectedRoute allowedRoles={["OTI"]}>
              <BecasComedor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reportes"
          element={
            <ProtectedRoute allowedRoles={["OTI"]}>
              <Periodos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/comedor/pagos"
          element={
            <ProtectedRoute allowedRoles={["OTI"]}>
              <PagosPendientes />
            </ProtectedRoute>
          }
        />

        {/* 🚨 FALLBACK */}
        <Route path="*" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}
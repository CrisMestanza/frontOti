import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard/Dashboard';
import Gmail from './pages/gmail/Gmail';
import BecasComedor from './pages/becasComedor/BecasComedor';
import Periodos from './pages/periodos/Periodos';
import PagosPendientes from './pages/pagosComedor/PagosComedor';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔥 DEFAULT */}
        <Route path="/" element={<Dashboard />} />

        {/* PÁGINAS */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gmail" element={<Gmail />} />
        <Route path="/comedor" element={<BecasComedor />} />
        <Route path="/reportes" element={<Periodos />} />
        <Route path="/comedor/pagos" element={<PagosPendientes />} />


        {/* 🚨 CUALQUIER RUTA NO EXISTENTE */}
        <Route path="*" element={<Dashboard />} />

      </Routes>
    </BrowserRouter>
  );
}
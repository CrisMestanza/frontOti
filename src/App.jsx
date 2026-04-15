// App.jsx (React Router v6)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard/Dashboard';
import Gmail from './pages/gmail/Gmail';
import BecasComedor from './pages/becasComedor/BecasComedor';
import Periodos from './pages/periodos/Periodos';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gmail" element={<Gmail />} />
        <Route path="/comedor" element={<BecasComedor />} />
        <Route path="/periodos" element={<Periodos />} />

      </Routes>
    </BrowserRouter>
  );
}
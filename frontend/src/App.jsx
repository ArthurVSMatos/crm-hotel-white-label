import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import "./pages/Dashboard/Dashboard.css";
{/* Navegação do Dashboard */ }
import Financeiro from "./pages/Dashboard/Financeiro/Financeiro";
import Hospedes from "./pages/Dashboard/Hospedes/Hospedes";
import Calendario from "./pages/Dashboard/Calendario/Calendario";
import WhiteLabel from "./pages/Dashboard/WhiteLabel/WhiteLabel";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Se acessar a raiz vazia, joga direto pro login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Nossas duas páginas principais */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Rotas do CRM */}
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/hospedes" element={<Hospedes />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/whitelabel" element={<WhiteLabel />} />
      </Routes>
    </BrowserRouter>
  );
}
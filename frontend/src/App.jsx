import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Se acessar a raiz vazia, joga direto pro login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Nossas duas páginas principais */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}
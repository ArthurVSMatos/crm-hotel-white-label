import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";

// Menu lateral do Dashboard
export default function Sidebar() {
  const navigate = useNavigate();

  function sair() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      {/* Logo / nome do sistema */}
      <div className="sidebar-logo">
        <img src={logo} alt="DealFlow" className="logo-img" />
      </div>

      {/* Links do menu */}
      <nav className="sidebar-menu">
        <NavLink to="/dashboard" className="menu-item">
          Dashboard
        </NavLink>

        <NavLink to="/whitelabel" className="menu-item">
          Vitrine
        </NavLink>

        <NavLink to="/calendario" className="menu-item">
          Calendário
        </NavLink>

        <NavLink to="/quartos" className="menu-item">
          Quartos
        </NavLink>

        <NavLink to="/financeiro" className="menu-item">
          Financeiro
        </NavLink>

        <NavLink to="/hospedes" className="menu-item">
          Hóspedes
        </NavLink>

        <NavLink to="/perfil" className="menu-item">
          Configurações
        </NavLink>
      </nav>

      {/* Botão de sair no rodapé */}
      <div className="sidebar-footer">
        <button className="menu-item sair-btn" onClick={sair}>
          <span className="sair-icon">→</span>
          Sair
        </button>
      </div>
    </aside>
  );
}

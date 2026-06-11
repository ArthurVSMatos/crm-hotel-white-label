import { NavLink } from "react-router-dom";
import logo from "../../../assets/logo.png";

// Menu lateral do Dashboard
export default function Sidebar() {
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

        <NavLink to="/financeiro" className="menu-item">
          Financeiro
        </NavLink>

        <NavLink to="/hospedes" className="menu-item">
          Hóspedes
        </NavLink>
      </nav>
    </aside>
  );
}
// Menu lateral do Dashboard
export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo / nome do sistema */}
      <div className="sidebar-logo">
        <h2>DealFlow</h2>
      </div>

      {/* Links do menu */}
      <nav className="sidebar-menu">
        <button className="menu-item active">Dashboard</button>
        <button className="menu-item">White Label</button>
        <button className="menu-item">Calendário</button>
        <button className="menu-item">Financeiro</button>
        <button className="menu-item">Hóspedes</button>
      </nav>
    </aside>
  );
}
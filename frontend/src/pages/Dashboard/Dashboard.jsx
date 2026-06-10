import Sidebar from "../../components-Dashboard/Sidebar";
import MetricCard from "../../components-Dashboard/MetricCard";
import "./Dashboard.css";

// Página principal do Dashboard
export default function Dashboard() {
  return (
    <div className="dashboard">

      {/* Menu lateral esquerdo */}
      <Sidebar />

      {/* Conteúdo principal da página */}
      <main className="content">

        {/* Título de boas-vindas */}
        <h1>Bem-vindo</h1>

        {/* Cards com informações principais */}
        <div className="cards">
          <MetricCard
            titulo="Ocupação Atual"
            valor="85%"
            crescimento="+12%"
            icone="📈"
          />

          <MetricCard
            titulo="Check-ins Programados"
            valor="2"
            crescimento="+5%"
            icone="📅"
          />

          <MetricCard
            titulo="Faturamento do Mês"
            valor="R$ 700"
            crescimento="+8.5%"
            icone="💰"
          />
        </div>

        {/* Área inferior com gráfico e próximos check-ins */}
        <div className="dashboard-main">

          {/* Espaço reservado para gráfico */}
          <div className="chart-box">
            <h2>Evolução Mensal</h2>

            <div className="fake-chart">
              Gráfico em construção
            </div>
          </div>

          {/* Lista de próximos check-ins */}
          <div className="checkins-box">
            <h2>Próximos Check-ins</h2>

            <div className="checkin-item">
              <strong>Luciana Rodrigues</strong>
              <p>16:00 • Quarto 5</p>
            </div>

            <div className="checkin-item">
              <strong>Pedro Manelson</strong>
              <p>20:00 • Quarto 9</p>
            </div>

            <div className="checkin-item">
              <strong>Robert Heriberto</strong>
              <p>08:00 • Quarto 1</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
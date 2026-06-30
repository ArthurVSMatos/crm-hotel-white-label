  import { useEffect, useState } from "react";

  import Sidebar from "./components/Sidebar";
  import MetricCard from "./components/MetricCard";

  import { listarReservas } from "../../services/reservaService";
  import { listarQuartos } from "../../services/quartoService";
  import { listarHospedes } from "../../services/hospedeService";
  import { buscarPerfil } from "../../services/perfilService";

  import "./Dashboard.css";

  const STATUS_LABEL = {
    pendente: "Pendente",
    ativa: "Ativa",
    finalizada: "Finalizada",
    cancelada: "Cancelada",
  };

  const STATUS_ETIQUETA = {
    pendente: "etiqueta-alerta",
    ativa: "etiqueta-sucesso",
    finalizada: "etiqueta-neutro",
    cancelada: "etiqueta-erro",
  };

  const QUARTO_LABEL = {
    disponivel: "Disponível",
    ocupado: "Ocupado",
    manutencao: "Manutenção",
    limpeza: "Limpeza",
  };

  const QUARTO_COR = {
    disponivel: "#16a34a",
    ocupado: "#dc2626",
    manutencao: "#d97706",
    limpeza: "#2563eb",
  };

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarDataBR(iso) {
    if (!iso) return "-";
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function nomeDiaSemana(date) {
    return date
      .toLocaleDateString("pt-BR", { weekday: "short" })
      .replace(".", "");
  }

  export default function Dashboard() {

    const [loading, setLoading] = useState(true);

    const [nomeHotel, setNomeHotel] = useState("");

    const [ocupacao, setOcupacao] = useState(0);

    const [quartos, setQuartos] = useState([]);

    const [reservas, setReservas] = useState([]);

    const [hospedes, setHospedes] = useState([]);

    useEffect(() => {

      carregarDashboard();

    }, []);

    async function carregarDashboard() {

      try {

        const [
          quartosData,
          reservasData,
          hospedesData,
          perfilData
        ] = await Promise.all([
          listarQuartos(),
          listarReservas(),
          listarHospedes(),
          buscarPerfil().catch(() => null)
        ]);

        setQuartos(quartosData);
        setReservas(reservasData);
        setHospedes(hospedesData);

        if (perfilData) {
          setNomeHotel(
            perfilData.nome_empresa || perfilData.nome || ""
          );
        }

        const ocupados = quartosData.filter(
          (q) => q.status === "ocupado"
        ).length;

        const total = quartosData.length;

        const percentual =
          total > 0
            ? ((ocupados / total) * 100).toFixed(0)
            : 0;

        setOcupacao(percentual);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }
    }

    if (loading) {
      return (
        <div className="dashboard">
          <Sidebar />
          <main className="content">
            <div className="dashboard-loading">
              <div className="spinner" />
              <p>Carregando dashboard...</p>
            </div>
          </main>
        </div>
      );
    }

    //metricas de receita etc

    const receitaTotal = reservas.reduce(
      (soma, r) => soma + Number(r.valor_pago || 0),
      0
    );

    const reservasAtivas = reservas.filter(
      (r) => r.status === "ativa"
    ).length;

    const quartosPorStatus = ["disponivel", "ocupado", "manutencao", "limpeza"].map(
      (status) => ({
        status,
        total: quartos.filter((q) => q.status === status).length,
      })
    );

    const totalQuartos = quartos.length || 1;

    //ltimos 7 dias quantas reservas começam em cada dia

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const ultimosDias = Array.from({ length: 7 }, (_, i) => {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - (6 - i));
      const iso = data.toISOString().slice(0, 10);

      const total = reservas.filter((r) => r.check_in === iso).length;

      return { data, iso, total };
    });

    const maiorValorDia = Math.max(1, ...ultimosDias.map((d) => d.total));

    const ultimasReservas = [...reservas]
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 5);

    return (
      <div className="dashboard">

        <Sidebar />

        <main className="content">

          <div className="dashboard-header">
            <div>
              <h1>Olá{nomeHotel ? `, ${nomeHotel}` : ""} 👋</h1>
              <p className="dashboard-subtitulo">
                Aqui está um resumo da operação do seu hotel hoje.
              </p>
            </div>
          </div>

          <div className="cards">

            <MetricCard
              titulo="Ocupação Atual"
              valor={`${ocupacao}%`}
              crescimento=""
              icone="🏨"
            />

            <MetricCard
              titulo="Reservas Ativas"
              valor={reservasAtivas}
              crescimento=""
              icone="📅"
            />

            <MetricCard
              titulo="Hóspedes"
              valor={hospedes.length}
              crescimento=""
              icone="👤"
            />

            <MetricCard
              titulo="Receita Recebida"
              valor={formatarMoeda(receitaTotal)}
              crescimento=""
              icone="💰"
            />

          </div>

          <div className="dashboard-main">

            <div className="chart-box">

              <h2>Reservas nos últimos 7 dias</h2>

              <div className="grafico-barras">
                {ultimosDias.map((dia) => (
                  <div className="grafico-coluna" key={dia.iso}>
                    <span className="grafico-valor">
                      {dia.total > 0 ? dia.total : ""}
                    </span>
                    <div
                      className="grafico-barra"
                      style={{
                        height: `${(dia.total / maiorValorDia) * 100}%`,
                      }}
                    />
                    <span className="grafico-label">
                      {nomeDiaSemana(dia.data)}
                    </span>
                  </div>
                ))}
              </div>

              <h2 className="quartos-titulo">Status dos quartos</h2>

              <div className="quartos-status-lista">
                {quartosPorStatus.map(({ status, total }) => (
                  <div className="quarto-status-linha" key={status}>
                    <div className="quarto-status-info">
                      <span
                        className="quarto-status-ponto"
                        style={{ background: QUARTO_COR[status] }}
                      />
                      <span>{QUARTO_LABEL[status]}</span>
                    </div>

                    <div className="quarto-status-barra-fundo">
                      <div
                        className="quarto-status-barra"
                        style={{
                          width: `${(total / totalQuartos) * 100}%`,
                          background: QUARTO_COR[status],
                        }}
                      />
                    </div>

                    <span className="quarto-status-total">{total}</span>
                  </div>
                ))}
              </div>

            </div>

            <div className="checkins-box">

              <h2>
                Últimas Reservas
              </h2>

              {
                ultimasReservas.length === 0 && (
                  <p className="estado-vazio-dashboard">
                    Nenhuma reserva encontrada ainda. Crie a primeira reserva
                    no Calendário ou na tela de Hóspedes.
                  </p>
                )
              }

              {
                ultimasReservas.map(
                  (reserva) => (

                    <div
                      key={reserva.id}
                      className="checkin-item"
                    >
                      <div className="checkin-item-topo">
                        <strong>
                          {reserva.hospede_nome || `Reserva #${reserva.id}`}
                        </strong>

                        <span
                          className={`etiqueta ${
                            STATUS_ETIQUETA[reserva.status] || "etiqueta-neutro"
                          }`}
                        >
                          {STATUS_LABEL[reserva.status] || reserva.status}
                        </span>
                      </div>

                      <p>
                        Quarto {reserva.quarto_numero ?? "-"} ·{" "}
                        {formatarDataBR(reserva.check_in)} até{" "}
                        {formatarDataBR(reserva.check_out)}
                      </p>

                      <p className="checkin-valor">
                        {formatarMoeda(reserva.valor_total)}
                      </p>
                    </div>

                  )
                )
              }

            </div>

          </div>

        </main>

      </div>
    );
  }
import { useEffect, useState } from "react";
import MainLayout from "../../../components/Layout/MainLayout";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ReservaModal from "../components/ReservaModal";
import ReservaEditModal from "../components/ReservaEditModal";
import {
  listarReservas,
  editarReserva,
  deletarReserva,
  finalizarReserva,
  cancelarReserva
} from "../../../services/reservaService";
import { useToast } from "../../../components/Feedback/useToast";
import ConfirmDialog from "../../../components/Feedback/ConfirmDialog";
import "./Calendario.css";

export default function Calendario() {

  const { showToast } = useToast();
  const [confirmacao, setConfirmacao] = useState(null);

  const [eventos, setEventos] = useState([]);

  const [reservaSelecionada, setReservaSelecionada] =
    useState(null);

  const [abrirModal, setAbrirModal] =
    useState(false);

  const [abrirModalEdicao, setAbrirModalEdicao] =
    useState(false);

  const [dataSelecionada, setDataSelecionada] =
    useState("");

  const [diaAtivo, setDiaAtivo] =
    useState(formatarDataLocal(new Date()));

  const [carregando, setCarregando] =
    useState(true);

  const [processando, setProcessando] =
    useState(false);

  useEffect(() => {
    carregarReservas();
  }, []);

  async function carregarReservas() {

    try {

      setCarregando(true);

      const reservas =
        await listarReservas();

      const formatado =
        reservas.map((r) => ({
          id: r.id,

          title: `${r.hospede_nome}`,

          start: r.check_in,

          end: r.check_out,

          extendedProps: {
            ...r
          }
        }));

      setEventos(formatado);

    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  // ---------- helpers de data ----------

  function formatarDataLocal(date) {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  function formatarDataBR(dataStr) {
    if (!dataStr) return "-";
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  // ---------- interações do calendário ----------

  function clicarDia(info) {

    setDiaAtivo(info.dateStr);

    setDataSelecionada(info.dateStr);

    setAbrirModal(true);
  }

  function clicarReserva(info) {

    setReservaSelecionada(
      info.event.extendedProps
    );

    setDiaAtivo(info.event.startStr);
  }

  function abrirEdicao() {

    if (!reservaSelecionada) return;

    setAbrirModalEdicao(true);
  }

  // ---------- ações de reserva ----------

  async function finalizar(id) {

    const reservaId = id || reservaSelecionada?.id;

    if (!reservaId || processando) return;

    try {
      setProcessando(true);

      await finalizarReserva(reservaId);

      await carregarReservas();

      setReservaSelecionada(null);
      showToast("Reserva finalizada com sucesso.", { tipo: "sucesso" });
    } catch (error) {
      showToast(
        error.response?.data?.detail || "Não foi possível finalizar a reserva.",
        { tipo: "erro" }
      );
    } finally {
      setProcessando(false);
    }
  }

  async function cancelar(id) {

    const reservaId = id || reservaSelecionada?.id;

    if (!reservaId || processando) return;

    try {
      setProcessando(true);

      await cancelarReserva(reservaId);

      await carregarReservas();

      setReservaSelecionada(null);
      showToast("Reserva cancelada.", { tipo: "sucesso" });
    } catch (error) {
      showToast(
        error.response?.data?.detail || "Não foi possível cancelar a reserva.",
        { tipo: "erro" }
      );
    } finally {
      setProcessando(false);
    }
  }

  function excluir(id) {

    const reservaId = id || reservaSelecionada?.id;

    if (!reservaId || processando) return;

    setConfirmacao({
      titulo: "Excluir reserva",
      mensagem: "Tem certeza que deseja excluir esta reserva? Essa ação não pode ser desfeita.",
      textoConfirmar: "Excluir",
      perigo: true,
      onConfirmar: () => executarExclusao(reservaId),
    });
  }

  async function executarExclusao(reservaId) {
    try {
      setProcessando(true);

      await deletarReserva(reservaId);

      await carregarReservas();

      setReservaSelecionada(null);
      showToast("Reserva excluída.", { tipo: "sucesso" });
    } catch (error) {
      showToast(
        error.response?.data?.detail || "Não foi possível excluir a reserva.",
        { tipo: "erro" }
      );
    } finally {
      setProcessando(false);
      setConfirmacao(null);
    }
  }

  // ---------- dados derivados (calculados em cima de "eventos") ----------

  const totalReservas = eventos.length;

  const reservasAtivas = eventos.filter(
    (r) => r.extendedProps.status === "ativa"
  );

  const checkInsEsteMes = eventos.filter((r) => {
    const data = new Date(r.extendedProps.check_in);
    const hoje = new Date();
    return (
      data.getMonth() === hoje.getMonth() &&
      data.getFullYear() === hoje.getFullYear()
    );
  });

  const checkOutsEsteMes = eventos.filter((r) => {
    const data = new Date(r.extendedProps.check_out);
    const hoje = new Date();
    return (
      data.getMonth() === hoje.getMonth() &&
      data.getFullYear() === hoje.getFullYear()
    );
  });

  // Reservas canceladas não devem contar como receita prevista — só
  // entram no cálculo reservas que ainda podem gerar receita de fato.
  const receitaPrevista = eventos.reduce(
    (acc, item) =>
      item.extendedProps.status === "cancelada"
        ? acc
        : acc + Number(item.extendedProps.valor_total || 0),
    0
  );

  const reservasDoDia = eventos.filter(
    (r) => r.extendedProps.check_in === diaAtivo
  );

  const proximosCheckIns = eventos
    .filter((r) => {
      const checkIn = new Date(r.extendedProps.check_in);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      return checkIn >= hoje;
    })
    .sort(
      (a, b) =>
        new Date(a.extendedProps.check_in) -
        new Date(b.extendedProps.check_in)
    )
    .slice(0, 3);

  const checkInsHoje = eventos.filter(
    (r) =>
      r.extendedProps.check_in ===
      formatarDataLocal(new Date())
  ).length;

  const cancelamentos = eventos.filter(
    (r) => r.extendedProps.status === "cancelada"
  ).length;

  // status reais conforme StatusReserva no backend: ativa / finalizada / cancelada
  // (se houver outros valores no enum, é só adicionar aqui)
  // status reais do enum StatusReserva: pendente / ativa / finalizada / cancelada
  function corStatus(status) {
    if (status === "ativa") return "sucesso";
    if (status === "pendente") return "alerta";
    if (status === "finalizada") return "neutro";
    if (status === "cancelada") return "erro";
    return "neutro";
  }

  function labelStatus(status) {
    if (status === "ativa") return "Ativa";
    if (status === "pendente") return "Pendente";
    if (status === "finalizada") return "Finalizada";
    if (status === "cancelada") return "Cancelada";
    return status;
  }

  // bolinhas no dia do calendário (check-in / check-out / status)
  function renderConteudoDia(arg) {

    const dataStr = formatarDataLocal(arg.date);

    const doDia = eventos.filter(
      (r) => r.extendedProps.check_in === dataStr
    );

    const checkoutsDoDia = eventos.filter(
      (r) => r.extendedProps.check_out === dataStr
    );

    return (
      <div className="dia-conteudo">
        <span className="dia-numero">{arg.dayNumberText}</span>

        <div className="dia-marcadores">
          {doDia.slice(0, 2).map((r) => (
            <span key={r.id} className="marcador marcador-checkin">
              <i className="ponto ponto-checkin" />
              {r.title.split(" ")[0]}
            </span>
          ))}

          {checkoutsDoDia.length > 0 && (
            <span className="marcador marcador-checkout">
              <i className="ponto ponto-checkout" />
              {checkoutsDoDia.length} Check-out
              {checkoutsDoDia.length > 1 ? "s" : ""}
            </span>
          )}

          {doDia.length > 2 && (
            <span className="marcador marcador-extra">
              +{doDia.length - 2}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <MainLayout>

      <div className="calendario-pagina">

        <div className="calendario-topo">

          <div className="calendario-titulo">
            <h1>Calendário de Reservas</h1>
            <p>Visualize e gerencie todas as reservas do seu hotel.</p>
          </div>

          <div className="calendario-topo-acoes">

            <button className="botao-secundario">
              Hoje
            </button>

          </div>

        </div>

        <div className="cartoes-resumo">

          <div className="cartao-resumo">
            <div className="cartao-icone icone-verde">🛏️</div>
            <div className="cartao-info">
              <span>Reservas</span>
              <h2>{totalReservas}</h2>
              <small>Este mês</small>
            </div>
          </div>

          <div className="cartao-resumo">
            <div className="cartao-icone icone-azul">↘️</div>
            <div className="cartao-info">
              <span>Check-ins</span>
              <h2>{checkInsEsteMes.length}</h2>
              <small>Este mês</small>
            </div>
          </div>

          <div className="cartao-resumo">
            <div className="cartao-icone icone-roxo">↗️</div>
            <div className="cartao-info">
              <span>Check-outs</span>
              <h2>{checkOutsEsteMes.length}</h2>
              <small>Este mês</small>
            </div>
          </div>

          <div className="cartao-resumo">
            <div className="cartao-icone icone-verde-claro">💲</div>
            <div className="cartao-info">
              <span>Receita Prevista</span>
              <h2>
                R${" "}
                {receitaPrevista.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2
                })}
              </h2>
              <small>Este mês</small>
            </div>
          </div>

        </div>

        <div className="calendario-corpo">

          <div className="calendario-principal">

            {carregando && (
              <div className="estado-carregando">
                Carregando reservas...
              </div>
            )}

            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="pt-br"
              height="700px"
              selectable={true}
              dateClick={clicarDia}
              eventClick={clicarReserva}
              events={eventos}
              dayCellContent={renderConteudoDia}
              headerToolbar={{
                left: "title",
                center: "",
                right: "prev,next"
              }}
            />

            <div className="calendario-legenda">
              <span><i className="ponto ponto-checkin" /> Check-in</span>
              <span><i className="ponto ponto-checkout" /> Check-out</span>
              <span><i className="ponto ponto-hospedado" /> Hospedado</span>
              <span><i className="ponto ponto-pendente" /> Pendente</span>
              <span><i className="ponto ponto-cancelado" /> Cancelado</span>
            </div>

          </div>

          <div className="calendario-lateral">

            <div className="painel">

              <div className="painel-cabecalho">
                <h3>Reservas do dia</h3>
                <span className="painel-data">
                  {formatarDataBR(diaAtivo)}
                </span>
              </div>

              {reservasDoDia.length === 0 && (
                <div className="estado-vazio">
                  Nenhuma reserva com check-in nesta data.
                </div>
              )}

              {reservasDoDia.map((r) => {
                const props = r.extendedProps;
                const cor = corStatus(props.status);

                return (
                  <div
                    key={r.id}
                    className={`item-reserva borda-${cor} ${
                      reservaSelecionada?.id === props.id
                        ? "item-reserva-ativo"
                        : ""
                    }`}
                    onClick={() => setReservaSelecionada(props)}
                  >
                    <div className="item-reserva-topo">
                      <strong>{props.hospede_nome}</strong>
                      <span className={`etiqueta etiqueta-${cor}`}>
                        {labelStatus(props.status)}
                      </span>
                    </div>

                    <small>Quarto {props.quarto_numero}</small>

                    <div className="item-reserva-datas">
                      <div>
                        <span>Check-in</span>
                        <strong>{formatarDataBR(props.check_in)}</strong>
                      </div>
                      <div>
                        <span>Check-out</span>
                        <strong>{formatarDataBR(props.check_out)}</strong>
                      </div>
                      <div className="item-reserva-valor">
                        <span>Total</span>
                        <strong>
                          R${" "}
                          {Number(props.valor_total).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>

            {reservaSelecionada && (

              <div className="painel painel-detalhes">

                <div className="painel-cabecalho">
                  <h3>Detalhes da reserva</h3>
                  <button
                    className="botao-fechar"
                    onClick={() => setReservaSelecionada(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="detalhe-linha">
                  <label>Hóspede</label>
                  <strong>{reservaSelecionada.hospede_nome}</strong>
                </div>

                <div className="detalhe-linha">
                  <label>Quarto</label>
                  <strong>{reservaSelecionada.quarto_numero}</strong>
                </div>

                <div className="detalhe-linha">
                  <label>Check-In</label>
                  <strong>
                    {formatarDataBR(reservaSelecionada.check_in)}
                  </strong>
                </div>

                <div className="detalhe-linha">
                  <label>Check-Out</label>
                  <strong>
                    {formatarDataBR(reservaSelecionada.check_out)}
                  </strong>
                </div>

                <div className="detalhe-linha">
                  <label>Status</label>
                  <span
                    className={`etiqueta etiqueta-${corStatus(
                      reservaSelecionada.status
                    )}`}
                  >
                    {labelStatus(reservaSelecionada.status)}
                  </span>
                </div>

                <div className="detalhe-linha">
                  <label>Valor</label>
                  <strong>
                    R$ {Number(reservaSelecionada.valor_total).toFixed(2)}
                  </strong>
                </div>

                <div className="detalhe-acoes">

                  <button
                    className="botao-acao botao-editar"
                    onClick={abrirEdicao}
                    disabled={processando}
                  >
                    Editar
                  </button>

                  <button
                    className="botao-acao botao-finalizar"
                    onClick={() => finalizar()}
                    disabled={processando}
                  >
                    Finalizar
                  </button>

                  <button
                    className="botao-acao botao-cancelar"
                    onClick={() => cancelar()}
                    disabled={processando}
                  >
                    Cancelar
                  </button>

                  <button
                    className="botao-acao botao-excluir"
                    onClick={() => excluir()}
                    disabled={processando}
                  >
                    Excluir
                  </button>

                </div>

              </div>

            )}

            <div className="painel">

              <div className="painel-cabecalho">
                <h3>Próximos check-ins</h3>
              </div>

              {proximosCheckIns.length === 0 && (
                <div className="estado-vazio">
                  Nenhum check-in agendado.
                </div>
              )}

              {proximosCheckIns.map((r) => {
                const props = r.extendedProps;
                const cor = corStatus(props.status);

                return (
                  <div
                    key={r.id}
                    className="item-checkin"
                    onClick={() => {
                      setReservaSelecionada(props);
                      setDiaAtivo(props.check_in);
                    }}
                  >
                    <div className="item-checkin-data">
                      {formatarDataBR(props.check_in).slice(0, 5)}
                    </div>

                    <div className="item-checkin-info">
                      <strong>{props.hospede_nome}</strong>
                      <small>Quarto {props.quarto_numero}</small>
                    </div>

                    <span className={`etiqueta etiqueta-${cor}`}>
                      {labelStatus(props.status)}
                    </span>
                  </div>
                );
              })}

            </div>

            <div className="painel painel-visao-geral">

              <div className="painel-cabecalho">
                <h3>Visão geral</h3>
              </div>

              <div className="visao-geral-grid">

                <div className="visao-geral-item">
                  <span className="visao-geral-icone">🛏️</span>
                  <strong>{reservasAtivas.length}</strong>
                  <small>Reservas ativas</small>
                </div>

                <div className="visao-geral-item">
                  <span className="visao-geral-icone">📅</span>
                  <strong>{checkInsHoje}</strong>
                  <small>Check-ins hoje</small>
                </div>

                <div className="visao-geral-item">
                  <span className="visao-geral-icone">✕</span>
                  <strong>{cancelamentos}</strong>
                  <small>Cancelamentos</small>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      <ReservaModal
        aberto={abrirModal}
        fechar={() => setAbrirModal(false)}
        dataSelecionada={dataSelecionada}
        atualizarCalendario={carregarReservas}
      />

      <ReservaEditModal
        aberto={abrirModalEdicao}
        fechar={() => setAbrirModalEdicao(false)}
        reserva={reservaSelecionada}
        atualizarCalendario={carregarReservas}
      />

      {confirmacao && (
        <ConfirmDialog
          {...confirmacao}
          carregando={processando}
          onCancelar={() => setConfirmacao(null)}
        />
      )}

    </MainLayout>
  );
}
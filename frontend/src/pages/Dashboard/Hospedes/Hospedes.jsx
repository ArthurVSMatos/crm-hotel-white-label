import { useEffect, useState, useRef } from "react";
import MainLayout from "../../../components/Layout/MainLayout";
import {
  listarReservas,
  criarReserva,
  finalizarReserva,
  cancelarReserva,
  deletarReserva,
} from "../../../services/reservaService";
import { listarQuartos } from "../../../services/quartoService";
import { listarHospedes, criarHospede, deletarHospede } from "../../../services/hospedeService";
import { useToast } from "../../../components/Feedback/useToast";
import ConfirmDialog from "../../../components/Feedback/ConfirmDialog";
import "./Hospedes.css";

// ─── Helpers ────────────────────────────────────────────────────────────────

const AVATAR_CORES = [
  "#4CAF50","#FF9800","#9C27B0","#2196F3","#607D8B",
  "#E91E63","#00BCD4","#FF5722","#3F51B5","#8BC34A",
];

function corAvatar(nome = "") {
  return AVATAR_CORES[nome.charCodeAt(0) % AVATAR_CORES.length];
}

function inicialNome(nome = "") {
  return nome.charAt(0).toUpperCase();
}

function formatarDataBR(iso) {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function calcularNoites(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(diff / 86400000));
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const STATUS_LABEL = {
  confirmada: "Confirmada",
  pendente: "Pendente",
  cancelada: "Cancelada",
  finalizada: "Finalizada",
};

const STATUS_COR = {
  confirmada: "sucesso",
  pendente: "alerta",
  cancelada: "erro",
  finalizada: "neutro",
};

const FORMAS_PAGAMENTO = [
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito",  label: "Cartão de Débito"  },
  { value: "pix",            label: "PIX"               },
  { value: "dinheiro",       label: "Dinheiro"          },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function GestaoHospedes() {

  const { showToast } = useToast();
  const [confirmacao, setConfirmacao] = useState(null);

  const [reservas, setReservas] = useState([]);
  const [quartos,  setQuartos]  = useState([]);
  const [hospedes, setHospedes] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]             = useState(null);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  // modal nova reserva
  const [abrirModal, setAbrirModal] = useState(false);
  const [salvando,   setSalvando]   = useState(false);
  const [erroForm,   setErroForm]   = useState(null);

  // menu de ações inline
  const [menuAberto, setMenuAberto] = useState(null);
  const [menuAbrirParaCima, setMenuAbrirParaCima] = useState(false);
  const [acaoLoading, setAcaoLoading] = useState(false);

  // Altura aproximada do menu de ações (3 itens), usada para decidir
  // se cabe espaço abaixo do botão antes de abri-lo para baixo.
  const ALTURA_MENU_ACOES = 140;

  function alternarMenuAcoes(e, id) {
    if (menuAberto === id) {
      setMenuAberto(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const espacoAbaixo = window.innerHeight - rect.bottom;
    setMenuAbrirParaCima(espacoAbaixo < ALTURA_MENU_ACOES);
    setMenuAberto(id);
  }

  // busca de hóspede no modal
  const [buscaHospede, setBuscaHospede]           = useState("");
  const [hospedesFiltrados, setHospedesFiltrados] = useState([]);
  const [hospedeSelecionado, setHospedeSelecionado] = useState(null);
  const [mostrarDropHospede, setMostrarDropHospede] = useState(false);
  const refBuscaHospede = useRef(null);

  // cadastro rápido de hóspede (quando a busca não encontra ninguém)
  const [formNovoHospedeAberto, setFormNovoHospedeAberto] = useState(false);
  const [novoHospede, setNovoHospede] = useState({ nome: "", cpf: "", telefone: "" });
  const [salvandoHospede, setSalvandoHospede] = useState(false);
  const [erroNovoHospede, setErroNovoHospede] = useState(null);

  // Guarda o id de um hóspede criado via cadastro rápido *dentro do modal
  // atual*. Se o modal for fechado sem a reserva ser efetivamente salva,
  // esse cadastro é revertido — evita que ele fique "solto" no sistema
  // (existindo no backend mas sem aparecer na listagem, que é baseada em
  // reservas) só reaparecendo depois se alguém criar uma reserva pra ele
  // pelo calendário.
  const hospedeOrfaoRef = useRef(null);

  const [form, setForm] = useState({
    hospede_id:      "",
    quarto_id:       "",
    check_in:        "",
    check_out:       "",
    valor_total:     "",
    valor_pago:      "0",
    forma_pagamento: "cartao_credito",
    observacoes:     "",
  });

  // ── carregamento ─────────────────────────────────────────────────────────

  useEffect(() => {
    carregarReservas();
    carregarQuartos();
    carregarHospedes();
  }, []);

  async function carregarReservas() {
    try {
      setCarregando(true);
      setErro(null);
      const data = await listarReservas();
      setReservas(data);
    } catch (e) {
      setErro(
        e?.response?.data?.detail ??
        e?.response?.data?.message ??
        "Não foi possível carregar as reservas."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function carregarQuartos() {
    try {
      const data = await listarQuartos();
      setQuartos(data);
    } catch {
      // silencia — auxiliar
    }
  }

  async function carregarHospedes() {
    try {
      const data = await listarHospedes();
      setHospedes(data);
    } catch {
      // silencia — auxiliar
    }
  }

  // ── filtro local (tabela principal) ──────────────────────────────────────

  const reservasFiltradas = reservas.filter((r) => {
    const q = busca.toLowerCase();
    const correspondeBusca =
      r.hospede_nome?.toLowerCase().includes(q) ||
      String(r.quarto_numero).includes(q)        ||
      String(r.id).includes(q);

    const correspondeStatus =
      filtroStatus === "todos" || r.status?.toLowerCase() === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  // ── busca de hóspede no modal ─────────────────────────────────────────────

  function handleBuscaHospede(e) {
    const valor = e.target.value;
    setBuscaHospede(valor);
    setHospedeSelecionado(null);
    setForm((prev) => ({ ...prev, hospede_id: "" }));
    if (formNovoHospedeAberto) fecharCadastroRapido();

    if (valor.trim().length < 1) {
      setHospedesFiltrados([]);
      setMostrarDropHospede(false);
      return;
    }

    const q = valor.toLowerCase();
    const filtrados = hospedes.filter(
      (h) =>
        h.nome?.toLowerCase().includes(q) ||
        h.cpf?.replace(/\D/g, "").includes(q.replace(/\D/g, ""))
    );
    setHospedesFiltrados(filtrados);
    setMostrarDropHospede(true);
  }

  function selecionarHospede(h) {
    setHospedeSelecionado(h);
    setBuscaHospede(h.nome);
    setForm((prev) => ({ ...prev, hospede_id: String(h.id) }));
    setMostrarDropHospede(false);
  }

  // ── cadastro rápido de hóspede (sem precisar saber dele de antemão) ──────

  function abrirCadastroRapido() {
    setNovoHospede({ nome: buscaHospede.trim(), cpf: "", telefone: "" });
    setErroNovoHospede(null);
    setFormNovoHospedeAberto(true);
    setMostrarDropHospede(false);
  }

  function fecharCadastroRapido() {
    setFormNovoHospedeAberto(false);
    setNovoHospede({ nome: "", cpf: "", telefone: "" });
    setErroNovoHospede(null);
  }

  function handleCpfNovoHospede(e) {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setNovoHospede((prev) => ({ ...prev, cpf: value }));
  }

  async function salvarNovoHospede() {
    if (!novoHospede.nome.trim()) {
      setErroNovoHospede("Informe o nome do hóspede.");
      return;
    }

    setSalvandoHospede(true);
    setErroNovoHospede(null);
    try {
      const criado = await criarHospede({
        nome: novoHospede.nome.trim(),
        cpf: novoHospede.cpf || null,
        telefone: novoHospede.telefone || null,
      });

      // adiciona na lista local sem precisar recarregar tudo do servidor
      setHospedes((lista) => [...lista, criado]);
      selecionarHospede(criado);
      fecharCadastroRapido();
      hospedeOrfaoRef.current = criado.id;
    } catch (e) {
      const detalhe = e?.response?.data?.detail;
      setErroNovoHospede(typeof detalhe === "string" ? detalhe : "Não foi possível cadastrar o hóspede.");
    } finally {
      setSalvandoHospede(false);
    }
  }

  // ── cálculo automático ───────────────────────────────────────────────────

  const quartoSelecionado = quartos.find(
    (q) => String(q.id) === String(form.quarto_id)
  );

  const noites = calcularNoites(form.check_in, form.check_out);

  const valorCalculado =
    quartoSelecionado && noites > 0
      ? (Number(quartoSelecionado.valor_diaria) * noites).toFixed(2)
      : form.valor_total || "0";

  // ── handlers form ─────────────────────────────────────────────────────────

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (["check_in", "check_out", "quarto_id"].includes(name)) {
        const q = quartos.find((q) => String(q.id) === String(next.quarto_id));
        const n = calcularNoites(next.check_in, next.check_out);
        if (q && n > 0) {
          next.valor_total = (Number(q.valor_diaria) * n).toFixed(2);
        } else {
          next.valor_total = "";
        }
      }
      return next;
    });
  }

  function abrirNovaReserva() {
    setForm({
      hospede_id: "", quarto_id: "", check_in: "", check_out: "",
      valor_total: "", valor_pago: "0",
      forma_pagamento: "cartao_credito", observacoes: "",
    });
    setBuscaHospede("");
    setHospedeSelecionado(null);
    setHospedesFiltrados([]);
    setMostrarDropHospede(false);
    setErroForm(null);
    hospedeOrfaoRef.current = null;
    setAbrirModal(true);
  }

  async function fecharModalReserva() {
    setAbrirModal(false);

    const idOrfao = hospedeOrfaoRef.current;
    if (!idOrfao) return;

    hospedeOrfaoRef.current = null;
    try {
      await deletarHospede(idOrfao);
      setHospedes((lista) => lista.filter((h) => h.id !== idOrfao));
    } catch {
      // se não for possível excluir (ex: já foi vinculado a algo nesse
      // meio tempo), apenas mantemos o cadastro — não é crítico.
    }
  }

  function extrairMensagemErro(e, fallback) {
    const data = e?.response?.data;
    const detail = data?.detail ?? data?.message;

    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg).join(", ");
    }

    if (typeof detail === "string" && detail.trim()) {
      const normalizado = detail.toLowerCase();
      if (
        normalizado.includes("ocupado") ||
        normalizado.includes("ja existe") ||
        normalizado.includes("já existe")
      ) {
        return "Já existe uma reserva para este quarto nesse período.";
      }
      return detail;
    }

    return fallback;
  }

  async function salvarReserva() {
    setErroForm(null);
    if (!form.hospede_id || !form.quarto_id || !form.check_in || !form.check_out) {
      setErroForm("Preencha hóspede, quarto e datas.");
      return;
    }
    if (noites <= 0) {
      setErroForm("A data de check-out deve ser após o check-in.");
      return;
    }

    // Validacao client-side: evita a chamada ao backend quando o
    // conflito ja pode ser detectado com as reservas ja carregadas.
    const conflito = reservas.some((r) => {
      if (String(r.quarto_id) !== String(form.quarto_id)) return false;
      if (r.status === "cancelada") return false;
      return r.check_in < form.check_out && r.check_out > form.check_in;
    });

    if (conflito) {
      setErroForm("Já existe uma reserva para este quarto nesse período.");
      return;
    }

    try {
      setSalvando(true);
      await criarReserva({
        hospede_id:      Number(form.hospede_id),
        quarto_id:       Number(form.quarto_id),
        check_in:        form.check_in,
        check_out:       form.check_out,
        valor_total:     Number(valorCalculado),
        valor_pago:      Number(form.valor_pago || 0),
        forma_pagamento: form.forma_pagamento,
        observacoes:     form.observacoes || null,
      });
      hospedeOrfaoRef.current = null; // reserva confirmada: hóspede não é mais órfão
      setAbrirModal(false);
      await carregarReservas();
    } catch (e) {
      setErroForm(
        extrairMensagemErro(
          e,
          "Erro ao criar reserva. Verifique os dados e tente novamente."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  // ── ações de reserva ──────────────────────────────────────────────────────

  async function finalizar(id) {
    try {
      setAcaoLoading(true);
      await finalizarReserva(id);
      setMenuAberto(null);
      await carregarReservas();
      showToast("Reserva finalizada com sucesso.", { tipo: "sucesso" });
    } catch (e) {
      showToast(extrairMensagemErro(e, "Não foi possível finalizar a reserva."), { tipo: "erro" });
    } finally {
      setAcaoLoading(false);
    }
  }

  async function cancelar(id) {
    try {
      setAcaoLoading(true);
      await cancelarReserva(id);
      setMenuAberto(null);
      await carregarReservas();
      showToast("Reserva cancelada.", { tipo: "sucesso" });
    } catch (e) {
      showToast(extrairMensagemErro(e, "Não foi possível cancelar a reserva."), { tipo: "erro" });
    } finally {
      setAcaoLoading(false);
    }
  }

  function excluir(id) {
    setConfirmacao({
      titulo: "Excluir reserva",
      mensagem: "Tem certeza que deseja excluir esta reserva? Essa ação não pode ser desfeita.",
      textoConfirmar: "Excluir",
      perigo: true,
      onConfirmar: () => executarExclusao(id),
    });
  }

  async function executarExclusao(id) {
    try {
      setAcaoLoading(true);
      await deletarReserva(id);
      setMenuAberto(null);
      await carregarReservas();
      showToast("Reserva excluída.", { tipo: "sucesso" });
    } catch (e) {
      showToast(extrairMensagemErro(e, "Não foi possível excluir a reserva."), { tipo: "erro" });
    } finally {
      setAcaoLoading(false);
      setConfirmacao(null);
    }
  }

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <MainLayout>
      <div className="hospedes-pagina" onClick={() => setMenuAberto(null)}>

        {/* Topo */}
        <div className="hospedes-topo">
          <div className="hospedes-titulo">
            <h1>Gestão de Hóspedes</h1>
            <p>Gerencie os seus hóspedes com praticidade e eficiência.</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="hospedes-toolbar">
          <div className="hospedes-busca">
            <svg viewBox="0 0 20 20" fill="none" className="busca-icone">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className="busca-input"
              placeholder="Buscar hóspede, reserva ou quarto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <select
            className="filtro-status"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="todos">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="confirmada">Confirmada</option>
            <option value="finalizada">Finalizada</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <div className="hospedes-toolbar-acoes">
            <button className="botao-secundario" onClick={carregarReservas}>
              Atualizar
            </button>
            <button className="botao-primario" onClick={abrirNovaReserva}>
              + Nova Reserva
            </button>
          </div>
        </div>

        {/* Erro global */}
        {erro && (
          <div className="alerta alerta-erro">
            <strong>Erro:</strong> {erro}
            <button className="alerta-fechar" onClick={() => setErro(null)}>✕</button>
          </div>
        )}

        {/* Tabela */}
        <div className="hospedes-tabela-wrapper">
          {carregando ? (
            <div className="estado-vazio">Carregando reservas...</div>
          ) : reservasFiltradas.length === 0 ? (
            <div className="estado-vazio">
              {busca || filtroStatus !== "todos"
                ? "Nenhuma reserva encontrada com esses filtros."
                : "Nenhuma reserva encontrada."}
            </div>
          ) : (
            <table className="hospedes-tabela">
              <thead>
                <tr>
                  <th>Hóspede</th>
                  <th>Quarto</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Noites</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map((r) => {
                  const n          = calcularNoites(r.check_in, r.check_out);
                  const statusKey  = r.status?.toLowerCase();
                  const cor        = STATUS_COR[statusKey] ?? "alerta";

                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="hospede-cell">
                          <div
                            className="hospede-avatar"
                            style={{ background: corAvatar(r.hospede_nome) }}
                          >
                            {inicialNome(r.hospede_nome)}
                          </div>
                          <div>
                            <div className="hospede-nome">{r.hospede_nome}</div>
                            <div className="hospede-sub">#{r.hospede_id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="quarto-numero">{r.quarto_numero}</div>
                        <div className="quarto-sub">Quarto #{r.quarto_id}</div>
                      </td>
                      <td>
                        <div className="data-principal">{formatarDataBR(r.check_in)}</div>
                      </td>
                      <td>
                        <div className="data-principal">{formatarDataBR(r.check_out)}</div>
                      </td>
                      <td className="noites">{String(n).padStart(2, "0")}</td>
                      <td className="valor">{formatarMoeda(r.valor_total)}</td>
                      <td>
                        <span className={`etiqueta etiqueta-${cor}`}>
                          {STATUS_LABEL[statusKey] ?? r.status}
                        </span>
                      </td>
                      <td>
                        <div
                          className={`acoes-wrapper ${
                            menuAberto === r.id && menuAbrirParaCima
                              ? "acoes-wrapper--abrir-para-cima"
                              : ""
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="botao-acoes"
                            onClick={(e) => alternarMenuAcoes(e, r.id)}
                          >
                            •••
                          </button>
                          {menuAberto === r.id && (
                            <div className="acoes-menu">
                              <button
                                className="acoes-menu-item"
                                disabled={acaoLoading}
                                onClick={() => finalizar(r.id)}
                              >
                                ✓ Finalizar
                              </button>
                              <button
                                className="acoes-menu-item acoes-menu-item--alerta"
                                disabled={acaoLoading}
                                onClick={() => cancelar(r.id)}
                              >
                                ✕ Cancelar
                              </button>
                              <button
                                className="acoes-menu-item acoes-menu-item--erro"
                                disabled={acaoLoading}
                                onClick={() => excluir(r.id)}
                              >
                                🗑 Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal nova reserva */}
        {abrirModal && (
          <div className="modal-overlay" onClick={fecharModalReserva}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>

              <div className="modal-cabecalho">
                <div>
                  <h2 className="modal-titulo">Nova Reserva</h2>
                  <p className="modal-subtitulo">
                    Preencha os dados para criar uma nova reserva
                  </p>
                </div>
                <button className="botao-fechar" onClick={fecharModalReserva}>
                  ✕
                </button>
              </div>

              <div className="modal-corpo">
                {erroForm && (
                  <div className="alerta alerta-erro alerta-sm">
                    <span aria-hidden="true">⚠</span>
                    <span>{erroForm}</span>
                  </div>
                )}

                {/* ── Busca de hóspede ── */}
                <div className="campo">
                  <label className="campo-label">
                    Hóspede <span style={{ color: "#d32f2f", fontWeight: 700 }}>*</span>
                  </label>
                  <div className="hospede-busca-wrapper" ref={refBuscaHospede}>
                    <input
                      className={`campo-input ${hospedeSelecionado ? "campo-input--selecionado" : ""}`}
                      placeholder="Buscar por nome ou CPF..."
                      value={buscaHospede}
                      onChange={handleBuscaHospede}
                      onFocus={() => {
                        if (hospedesFiltrados.length > 0) setMostrarDropHospede(true);
                      }}
                      autoComplete="off"
                    />

                    {hospedeSelecionado && (
                      <button
                        className="hospede-limpar"
                        onClick={() => {
                          setBuscaHospede("");
                          setHospedeSelecionado(null);
                          setForm((prev) => ({ ...prev, hospede_id: "" }));
                        }}
                        title="Limpar seleção"
                      >
                        ✕
                      </button>
                    )}

                    {mostrarDropHospede && (
                      <div className="hospede-dropdown">
                        {hospedesFiltrados.length === 0 ? (
                          <div className="hospede-dropdown-vazio">
                            Nenhum hóspede encontrado
                          </div>
                        ) : (
                          hospedesFiltrados.map((h) => (
                            <button
                              key={h.id}
                              className="hospede-dropdown-item"
                              onClick={() => selecionarHospede(h)}
                            >
                              <div
                                className="hospede-avatar hospede-avatar--sm"
                                style={{ background: corAvatar(h.nome) }}
                              >
                                {inicialNome(h.nome)}
                              </div>
                              <div>
                                <div className="hospede-dropdown-nome">{h.nome}</div>
                                {h.cpf && (
                                  <div className="hospede-dropdown-cpf">CPF: {h.cpf}</div>
                                )}
                              </div>
                            </button>
                          ))
                        )}

                        <button
                          type="button"
                          className="hospede-dropdown-novo"
                          onClick={abrirCadastroRapido}
                        >
                          <span className="hospede-dropdown-novo-icone">+</span>
                          {buscaHospede.trim()
                            ? `Cadastrar "${buscaHospede.trim()}" como novo hóspede`
                            : "Cadastrar novo hóspede"}
                        </button>
                      </div>
                    )}
                  </div>

                  {formNovoHospedeAberto && (
                    <div className="hospede-cadastro-rapido">
                      <div className="hospede-cadastro-rapido-cabecalho">
                        <span>Novo hóspede</span>
                        <button
                          type="button"
                          className="hospede-cadastro-rapido-fechar"
                          onClick={fecharCadastroRapido}
                        >
                          ✕
                        </button>
                      </div>

                      {erroNovoHospede && (
                        <div className="hospede-cadastro-rapido-erro">{erroNovoHospede}</div>
                      )}

                      <div className="campo">
                        <label className="campo-label">
                          Nome completo <span style={{ color: "#d32f2f", fontWeight: 700 }}>*</span>
                        </label>
                        <input
                          className="campo-input"
                          placeholder="Nome do hóspede"
                          value={novoHospede.nome}
                          onChange={(e) => setNovoHospede((prev) => ({ ...prev, nome: e.target.value }))}
                          autoFocus
                        />
                      </div>

                      <div className="hospede-cadastro-rapido-grid">
                        <div className="campo">
                          <label className="campo-label">CPF</label>
                          <input
                            className="campo-input"
                            placeholder="000.000.000-00"
                            value={novoHospede.cpf}
                            onChange={handleCpfNovoHospede}
                          />
                        </div>
                        <div className="campo">
                          <label className="campo-label">Telefone</label>
                          <input
                            className="campo-input"
                            placeholder="(00) 00000-0000"
                            value={novoHospede.telefone}
                            onChange={(e) => setNovoHospede((prev) => ({ ...prev, telefone: e.target.value }))}
                          />
                        </div>
                      </div>

                      <span className="campo-ajuda-rapido">
                        CPF e telefone são opcionais — você pode completar depois.
                      </span>

                      <div className="hospede-cadastro-rapido-acoes">
                        <button type="button" className="botao-secundario" onClick={fecharCadastroRapido}>
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="botao-primario"
                          onClick={salvarNovoHospede}
                          disabled={salvandoHospede}
                        >
                          {salvandoHospede ? "Cadastrando..." : "Cadastrar e selecionar"}
                        </button>
                      </div>
                    </div>
                  )}

                  {hospedeSelecionado ? (
                    <span className="campo-dica campo-dica--ok">
                      ✓ Hóspede #{hospedeSelecionado.id} selecionado
                      {hospedeSelecionado.telefone && ` · ${hospedeSelecionado.telefone}`}
                    </span>
                  ) : (
                    <span className="campo-dica">
                      Digite o nome ou CPF para buscar um hóspede cadastrado.
                    </span>
                  )}
                </div>

                {/* ── Quarto ── */}
                <div className="campo">
                  <label className="campo-label">
                    Quarto <span style={{ color: "#d32f2f", fontWeight: 700 }}>*</span>
                  </label>
                  <select
                    className="campo-input campo-select"
                    name="quarto_id"
                    value={form.quarto_id}
                    onChange={handleFormChange}
                  >
                    <option value="">Selecione o quarto</option>
                    {quartos.map((q) => (
                      <option key={q.id} value={q.id}>
                        #{q.numero} — {q.descricao ?? "Quarto"} · {formatarMoeda(q.valor_diaria)}/noite
                      </option>
                    ))}
                  </select>
                  {quartos.length === 0 && (
                    <span className="campo-dica campo-dica--alerta">
                      Nenhum quarto disponível carregado.
                    </span>
                  )}
                </div>

                {/* ── Datas ── */}
                <div className="campo-linha">
                  <div className="campo">
                    <label className="campo-label">
                      Check-in <span style={{ color: "#d32f2f", fontWeight: 700 }}>*</span>
                    </label>
                    <input
                      className="campo-input"
                      type="date"
                      name="check_in"
                      value={form.check_in}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="campo">
                    <label className="campo-label">
                      Check-out <span style={{ color: "#d32f2f", fontWeight: 700 }}>*</span>
                    </label>
                    <input
                      className="campo-input"
                      type="date"
                      name="check_out"
                      value={form.check_out}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                {/* ── Pagamento ── */}
                <div className="campo">
                  <label className="campo-label">Forma de Pagamento</label>
                  <select
                    className="campo-input campo-select"
                    name="forma_pagamento"
                    value={form.forma_pagamento}
                    onChange={handleFormChange}
                  >
                    {FORMAS_PAGAMENTO.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="campo-linha">
                  <div className="campo">
                    <label className="campo-label">Valor Pago (R$)</label>
                    <input
                      className="campo-input"
                      type="number"
                      name="valor_pago"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={form.valor_pago}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="campo">
                    <label className="campo-label">
                      Valor Total (R$)
                      {quartoSelecionado && noites > 0 && (
                        <span className="campo-auto"> · calculado automaticamente</span>
                      )}
                    </label>
                    <input
                      className={`campo-input ${quartoSelecionado && noites > 0 ? "campo-readonly" : ""}`}
                      type="number"
                      name="valor_total"
                      step="0.01"
                      placeholder={
                        !form.quarto_id
                          ? "Selecione o quarto"
                          : noites === 0
                          ? "Informe as datas"
                          : "Calculando..."
                      }
                      value={valorCalculado === "0" && !quartoSelecionado ? "" : valorCalculado}
                      readOnly={!!(quartoSelecionado && noites > 0)}
                      onChange={
                        quartoSelecionado && noites > 0
                          ? undefined
                          : handleFormChange
                      }
                    />
                  </div>
                </div>

                {/* ── Observações ── */}
                <div className="campo">
                  <label className="campo-label">Observações</label>
                  <textarea
                    className="campo-input campo-textarea"
                    name="observacoes"
                    placeholder="Alguma observação especial?"
                    value={form.observacoes}
                    onChange={handleFormChange}
                  />
                </div>

                {/* ── Resumo ── */}
                <div className="resumo">
                  <div className="resumo-linha resumo-cabecalho">
                    <span>Noites</span>
                    <span>Diária</span>
                    <span>Total</span>
                  </div>
                  <div className="resumo-linha resumo-valores">
                    <span>{noites > 0 ? noites : "—"}</span>
                    <span>
                      {quartoSelecionado
                        ? formatarMoeda(quartoSelecionado.valor_diaria)
                        : "—"}
                    </span>
                    <span>
                      {quartoSelecionado && noites > 0
                        ? formatarMoeda(valorCalculado)
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-rodape">
                <button
                  className="botao-primario botao-primario--cheio"
                  onClick={salvarReserva}
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Criar Reserva"}
                </button>
              </div>

            </div>
          </div>
        )}

        {confirmacao && (
          <ConfirmDialog
            {...confirmacao}
            carregando={acaoLoading}
            onCancelar={() => setConfirmacao(null)}
          />
        )}

      </div>
    </MainLayout>
  );
}
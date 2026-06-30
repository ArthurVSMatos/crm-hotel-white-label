import { useEffect, useMemo, useState, useRef } from "react";
import MainLayout from "../../../components/Layout/MainLayout";
import "./Quartos.css";

import {
  listarQuartos,
  criarQuarto,
  atualizarQuarto,
  deletarQuarto,
  uploadImagemQuarto,
} from "../../../services/quartoService";
import { useToast } from "../../../components/Feedback/useToast";
import ConfirmDialog from "../../../components/Feedback/ConfirmDialog";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const STATUS_LABEL = {
  disponivel: "Disponível",
  ocupado: "Ocupado",
  manutencao: "Manutenção",
  limpeza: "Limpeza",
};

const STATUS_COR = {
  disponivel: "sucesso",
  ocupado: "erro",
  manutencao: "alerta",
  limpeza: "neutro",
};

const FORM_VAZIO = {
  numero: "",
  descricao: "",
  valor_diaria: "",
  capacidade: 1,
  status: "disponivel",
  descricao_vitrine: "",
  visivel_vitrine: true,
};

export default function Quartos() {
  const { showToast } = useToast();
  const [confirmacao, setConfirmacao] = useState(null);

  const [quartos, setQuartos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState(null);

  const [fotoPreview, setFotoPreview] = useState(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const inputFotoRef = useRef(null);

  const [excluindoId, setExcluindoId] = useState(null);

  useEffect(() => {
    carregarQuartos();
  }, []);

  async function carregarQuartos() {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await listarQuartos();
      setQuartos(dados || []);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar os quartos.");
    } finally {
      setCarregando(false);
    }
  }

  const quartosFiltrados = useMemo(() => {
    const q = busca.toLowerCase();
    return quartos.filter((item) => {
      const correspondeBusca =
        !q ||
        item.numero?.toLowerCase().includes(q) ||
        item.descricao?.toLowerCase().includes(q);

      const correspondeStatus =
        filtroStatus === "todos" || item.status?.toLowerCase() === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [quartos, busca, filtroStatus]);

  // ── modal: abrir/fechar ─────────────────────────────────────────────────

  function abrirNovoQuarto() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setFotoPreview(null);
    setErroForm(null);
    setModalAberto(true);
  }

  function abrirEdicaoQuarto(quarto) {
    setEditandoId(quarto.id);
    setForm({
      numero: quarto.numero || "",
      descricao: quarto.descricao || "",
      valor_diaria: quarto.valor_diaria ?? "",
      capacidade: quarto.capacidade ?? 1,
      status: quarto.status || "disponivel",
      descricao_vitrine: quarto.descricao_vitrine || "",
      visivel_vitrine: quarto.visivel_vitrine ?? true,
    });
    setFotoPreview(quarto.imagem_url || null);
    setErroForm(null);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setFotoPreview(null);
    setErroForm(null);
  }

  function handleFormChange(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  // ── salvar (criar ou editar) ────────────────────────────────────────────

  async function salvarQuarto(e) {
    e.preventDefault();
    setErroForm(null);

    if (!form.numero.trim()) {
      setErroForm("Informe o nome/número do quarto.");
      return;
    }
    if (!form.valor_diaria || Number(form.valor_diaria) <= 0) {
      setErroForm("Informe um valor de diária válido.");
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        numero: form.numero.trim(),
        descricao: form.descricao || "",
        valor_diaria: Number(form.valor_diaria),
        capacidade: Number(form.capacidade) || 1,
        descricao_vitrine: form.descricao_vitrine || "",
        visivel_vitrine: form.visivel_vitrine,
      };

      if (editandoId) {
        await atualizarQuarto(editandoId, { ...payload, status: form.status });
      } else {
        await criarQuarto(payload);
      }

      await carregarQuartos();
      showToast(
        editandoId ? "Quarto atualizado com sucesso." : "Quarto cadastrado com sucesso.",
        { tipo: "sucesso" }
      );
      fecharModal();
    } catch (e) {
      const mensagem = e?.response?.data?.detail || "Não foi possível salvar o quarto.";
      setErroForm(typeof mensagem === "string" ? mensagem : "Não foi possível salvar o quarto.");
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatusRapido(quarto, novoStatus) {
    try {
      await atualizarQuarto(quarto.id, {
        numero: quarto.numero,
        descricao: quarto.descricao,
        valor_diaria: quarto.valor_diaria,
        capacidade: quarto.capacidade,
        status: novoStatus,
        descricao_vitrine: quarto.descricao_vitrine || "",
        visivel_vitrine: quarto.visivel_vitrine ?? true,
      });
      await carregarQuartos();
    } catch (e) {
      console.error(e);
      setErro("Não foi possível atualizar o status do quarto.");
    }
  }

  function excluirQuarto(quarto) {
    setConfirmacao({
      titulo: "Excluir quarto",
      mensagem: `Excluir o quarto "${quarto.numero}"? Essa ação não pode ser desfeita.`,
      textoConfirmar: "Excluir",
      perigo: true,
      onConfirmar: () => executarExclusaoQuarto(quarto),
    });
  }

  async function executarExclusaoQuarto(quarto) {
    setExcluindoId(quarto.id);
    try {
      await deletarQuarto(quarto.id);
      await carregarQuartos();
      showToast(`Quarto "${quarto.numero}" excluído.`, { tipo: "sucesso" });
    } catch (e) {
      const mensagem = e?.response?.data?.detail;
      setErro(
        typeof mensagem === "string"
          ? mensagem
          : "Não foi possível excluir o quarto. Verifique se ele não possui reservas vinculadas."
      );
    } finally {
      setExcluindoId(null);
      setConfirmacao(null);
    }
  }

  // ── foto (só disponível depois que o quarto já existe) ──────────────────

  async function handleFoto(arquivo) {
    if (!arquivo || !editandoId) return;
    setEnviandoFoto(true);
    try {
      const atualizado = await uploadImagemQuarto(editandoId, arquivo);
      setFotoPreview(atualizado.imagem_url);
      setQuartos((lista) =>
        lista.map((q) => (q.id === editandoId ? { ...q, imagem_url: atualizado.imagem_url } : q))
      );
    } catch (e) {
      console.error(e);
      setErroForm("Não foi possível enviar a foto.");
    } finally {
      setEnviandoFoto(false);
    }
  }

  return (
    <MainLayout>
      <div className="quartos-pagina">

        {/* Topo */}
        <div className="quartos-topo">
          <div className="quartos-titulo">
            <h1>Quartos</h1>
            <p>Cadastre os quartos do seu hotel — nome, preço e capacidade.</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="quartos-toolbar">
          <div className="quartos-busca">
            <svg viewBox="0 0 20 20" fill="none" className="busca-icone">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className="busca-input"
              placeholder="Buscar por nome ou descrição..."
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
            <option value="disponivel">Disponível</option>
            <option value="ocupado">Ocupado</option>
            <option value="manutencao">Manutenção</option>
            <option value="limpeza">Limpeza</option>
          </select>

          <div className="quartos-toolbar-acoes">
            <button className="botao-secundario" onClick={carregarQuartos}>
              Atualizar
            </button>
            <button className="botao-primario" onClick={abrirNovoQuarto}>
              + Novo Quarto
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

        {/* Grid de quartos */}
        {carregando ? (
          <div className="estado-vazio">Carregando quartos...</div>
        ) : quartosFiltrados.length === 0 ? (
          <div className="estado-vazio">
            {busca || filtroStatus !== "todos"
              ? "Nenhum quarto encontrado com esses filtros."
              : "Nenhum quarto cadastrado ainda. Clique em \"+ Novo Quarto\" para começar."}
          </div>
        ) : (
          <div className="quartos-grid">
            {quartosFiltrados.map((quarto) => {
              const statusKey = quarto.status?.toLowerCase();
              const cor = STATUS_COR[statusKey] ?? "neutro";

              return (
                <div key={quarto.id} className="quarto-card">
                  <div className="quarto-card-foto">
                    {quarto.imagem_url ? (
                      <img src={quarto.imagem_url} alt={quarto.numero} />
                    ) : (
                      <span className="quarto-card-foto-vazia">📷</span>
                    )}
                    <span className={`badge badge--${cor}`}>
                      {STATUS_LABEL[statusKey] || quarto.status}
                    </span>
                    {!quarto.visivel_vitrine && (
                      <span className="quarto-card-oculto" title="Não aparece na vitrine">
                        🚫 Fora da vitrine
                      </span>
                    )}
                  </div>

                  <div className="quarto-card-corpo">
                    <div className="quarto-card-cabecalho">
                      <h3>{quarto.numero}</h3>
                      <span className="quarto-card-preco">{formatarMoeda(quarto.valor_diaria)}</span>
                    </div>

                    <p className="quarto-card-descricao">
                      {quarto.descricao || "Sem descrição."}
                    </p>

                    <div className="quarto-card-info">
                      <span>👥 {quarto.capacidade} {quarto.capacidade === 1 ? "pessoa" : "pessoas"}</span>
                    </div>

                    <select
                      className="quarto-card-status-select"
                      value={quarto.status}
                      onChange={(e) => alterarStatusRapido(quarto, e.target.value)}
                    >
                      <option value="disponivel">Disponível</option>
                      <option value="ocupado">Ocupado</option>
                      <option value="manutencao">Manutenção</option>
                      <option value="limpeza">Limpeza</option>
                    </select>

                    <div className="quarto-card-acoes">
                      <button className="botao-secundario" onClick={() => abrirEdicaoQuarto(quarto)}>
                        Editar
                      </button>
                      <button
                        className="botao-perigo"
                        onClick={() => excluirQuarto(quarto)}
                        disabled={excluindoId === quarto.id}
                      >
                        {excluindoId === quarto.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de criar/editar quarto */}
        {modalAberto && (
          <div className="quarto-modal-overlay" onClick={fecharModal}>
            <div className="quarto-modal" onClick={(e) => e.stopPropagation()}>
              <div className="quarto-modal-cabecalho">
                <h2>{editandoId ? "Editar Quarto" : "Novo Quarto"}</h2>
                <button className="quarto-modal-fechar" onClick={fecharModal}>✕</button>
              </div>

              <form onSubmit={salvarQuarto} className="quarto-modal-corpo">

                {erroForm && (
                  <div className="alerta alerta-erro alerta-sm">{erroForm}</div>
                )}

                {/* Foto — só após o quarto existir, igual ao padrão da logo */}
                <div className="quarto-form-foto">
                  <div
                    className="quarto-form-foto-area"
                    onClick={() => editandoId && inputFotoRef.current?.click()}
                  >
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Foto do quarto" />
                    ) : (
                      <span>
                        {editandoId
                          ? "📷 Clique para adicionar uma foto"
                          : "📷 Salve o quarto primeiro para adicionar uma foto"}
                      </span>
                    )}
                    {enviandoFoto && <div className="quarto-form-foto-loading">Enviando...</div>}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={inputFotoRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleFoto(e.target.files?.[0])}
                  />
                </div>

                <div className="campo">
                  <label className="campo-label">
                    Nome / Número do quarto <span className="campo-obrigatorio">*</span>
                  </label>
                  <input
                    className="campo-input"
                    placeholder="ex: 101 ou Suíte Master"
                    value={form.numero}
                    onChange={(e) => handleFormChange("numero", e.target.value)}
                  />
                </div>

                <div className="quarto-form-grid">
                  <div className="campo">
                    <label className="campo-label">
                      Valor da diária (R$) <span className="campo-obrigatorio">*</span>
                    </label>
                    <input
                      className="campo-input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={form.valor_diaria}
                      onChange={(e) => handleFormChange("valor_diaria", e.target.value)}
                    />
                  </div>

                  <div className="campo">
                    <label className="campo-label">Capacidade (pessoas)</label>
                    <input
                      className="campo-input"
                      type="number"
                      min="1"
                      value={form.capacidade}
                      onChange={(e) => handleFormChange("capacidade", e.target.value)}
                    />
                  </div>
                </div>

                {editandoId && (
                  <div className="campo">
                    <label className="campo-label">Status</label>
                    <select
                      className="campo-input"
                      value={form.status}
                      onChange={(e) => handleFormChange("status", e.target.value)}
                    >
                      <option value="disponivel">Disponível</option>
                      <option value="ocupado">Ocupado</option>
                      <option value="manutencao">Manutenção</option>
                      <option value="limpeza">Limpeza</option>
                    </select>
                  </div>
                )}

                <div className="campo">
                  <label className="campo-label">Descrição (uso interno)</label>
                  <textarea
                    className="campo-input"
                    rows={2}
                    placeholder="Detalhes para a sua equipe, ex: fica no 2º andar, perto do elevador..."
                    value={form.descricao}
                    onChange={(e) => handleFormChange("descricao", e.target.value)}
                  />
                </div>

                <hr className="quarto-form-divisor" />

                <div className="quarto-form-vitrine-cabecalho">
                  <span className="quarto-form-vitrine-tag">Vitrine</span>
                  <label className="toggle-linha toggle-linha--compacto">
                    <input
                      type="checkbox"
                      checked={form.visivel_vitrine}
                      onChange={(e) => handleFormChange("visivel_vitrine", e.target.checked)}
                    />
                    <span>Exibir este quarto no site</span>
                  </label>
                </div>

                <div className="campo">
                  <label className="campo-label">Descrição para os clientes (opcional)</label>
                  <textarea
                    className="campo-input"
                    rows={2}
                    placeholder="Texto que aparece na vitrine pública. Se deixar vazio, usamos a descrição interna."
                    value={form.descricao_vitrine}
                    onChange={(e) => handleFormChange("descricao_vitrine", e.target.value)}
                  />
                </div>

                <div className="quarto-modal-rodape">
                  <button type="button" className="botao-secundario" onClick={fecharModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="botao-primario" disabled={salvando}>
                    {salvando ? "Salvando..." : "Salvar Quarto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirmacao && (
          <ConfirmDialog
            {...confirmacao}
            carregando={excluindoId !== null}
            onCancelar={() => setConfirmacao(null)}
          />
        )}

      </div>
    </MainLayout>
  );
}

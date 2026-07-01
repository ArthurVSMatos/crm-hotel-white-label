import { useEffect, useState } from "react";

import api from "../../../services/api";
import { listarReservas } from "../../../services/reservaService";

import "../Calendario/Calendario.css";

const FORM_INICIAL = {
  hospede_id: "",
  quarto_id: "",
  check_in: "",
  check_out: "",
  valor_total: "",
  valor_pago: 0,
  forma_pagamento: "PIX",
  observacoes: "",
};

export default function ReservaModal({
  aberto,
  fechar,
  dataSelecionada,
  atualizarCalendario,
}) {
  const [hospedes, setHospedes] = useState([]);
  const [quartos, setQuartos] = useState([]);
  const [reservasExistentes, setReservasExistentes] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;

    carregarDados();
    setErro(null);

    setForm({
      ...FORM_INICIAL,
      check_in: dataSelecionada,
      check_out: dataSelecionada,
    });
  }, [aberto, dataSelecionada]);

  async function carregarDados() {
    try {
      const hospedesRes = await api.get("/hospedes/");
      const quartosRes = await api.get("/quartos/");
      const reservas = await listarReservas();

      const hospedesData = Array.isArray(hospedesRes.data)
        ? hospedesRes.data
        : hospedesRes.data?.items ?? hospedesRes.data?.data ?? [];

      const quartosData = Array.isArray(quartosRes.data)
        ? quartosRes.data
        : quartosRes.data?.items ?? quartosRes.data?.data ?? [];

      setHospedes(hospedesData);
      setQuartos(quartosData);
      setReservasExistentes(reservas);
    } catch (error) {
      console.error(error);
    }
  }

  function handleChange(e) {
    setErro(null);
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function haConflito(quartoId, checkIn, checkOut, ignorarReservaId = null) {
    if (!quartoId || !checkIn || !checkOut) return false;

    return reservasExistentes.some((r) => {
      if (String(r.quarto_id) !== String(quartoId)) return false;
      if (ignorarReservaId && r.id === ignorarReservaId) return false;
      if (r.status === "cancelada") return false;

      return r.check_in < checkOut && r.check_out > checkIn;
    });
  }

  function extrairMensagemErro(err) {
    const data = err.response?.data;
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

    return "Erro ao criar reserva. Verifique os dados e tente novamente.";
  }

  async function salvarReserva() {
    setErro(null);

    if (!form.hospede_id || !form.quarto_id || !form.check_in || !form.check_out) {
      setErro("Preencha hóspede, quarto e as datas de check-in e check-out.");
      return;
    }

    if (form.check_out <= form.check_in) {
      setErro("A data de check-out deve ser maior que a de check-in.");
      return;
    }

    if (haConflito(form.quarto_id, form.check_in, form.check_out)) {
      setErro("Já existe uma reserva para este quarto nesse período.");
      return;
    }

    setSalvando(true);
    try {
      await api.post("/reservas/", {
        hospede_id: Number(form.hospede_id),
        quarto_id: Number(form.quarto_id),
        check_in: form.check_in,
        check_out: form.check_out,
        valor_total: Number(form.valor_total),
        valor_pago: Number(form.valor_pago),
        forma_pagamento: form.forma_pagamento,
        observacoes: form.observacoes,
      });

      atualizarCalendario();
      fechar();
    } catch (err) {
      setErro(extrairMensagemErro(err));
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header modal-header--criar">
          <h2>Nova Reserva</h2>
          <button onClick={fechar}>✕</button>
        </div>

        <div className="modal-body">
          {erro && (
            <div className="reserva-erro">
              <span className="reserva-erro-icon">⚠</span>
              <span>{erro}</span>
            </div>
          )}

          <div className="form-group">
            <label>
              Hóspede <span className="campo-obrigatorio" style={{ color: "#d32f2f", fontWeight: 700 }}>*</span>
            </label>
            <select
              name="hospede_id"
              value={form.hospede_id}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              {hospedes.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Quarto <span className="campo-obrigatorio" style={{ color: "#d32f2f", fontWeight: 700 }}>*</span>
            </label>
            <select
              name="quarto_id"
              value={form.quarto_id}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              {quartos.map((q) => (
                <option key={q.id} value={q.id}>
                  Quarto {q.numero}
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>
                Check-in <span className="campo-obrigatorio" style={{ color: "#d32f2f", fontWeight: 700 }}>*</span>
              </label>
              <input
                type="date"
                name="check_in"
                value={form.check_in}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Check-out <span className="campo-obrigatorio" style={{ color: "#d32f2f", fontWeight: 700 }}>*</span>
              </label>
              <input
                type="date"
                name="check_out"
                value={form.check_out}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Valor Total <span className="campo-obrigatorio" style={{ color: "#d32f2f", fontWeight: 700 }}>*</span>
            </label>
            <input
              type="number"
              name="valor_total"
              value={form.valor_total}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Forma Pagamento</label>
            <select
              name="forma_pagamento"
              value={form.forma_pagamento}
              onChange={handleChange}
            >
              <option>PIX</option>
              <option>Cartão</option>
              <option>Dinheiro</option>
            </select>
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              rows="4"
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={fechar} disabled={salvando}>
            Cancelar
          </button>
          <button className="save-btn" onClick={salvarReserva} disabled={salvando}>
            {salvando ? "Criando..." : "Criar Reserva"}
          </button>
        </div>
      </div>
    </div>
  );
}
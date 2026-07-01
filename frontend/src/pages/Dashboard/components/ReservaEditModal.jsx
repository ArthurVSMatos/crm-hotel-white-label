import { useEffect, useState } from "react";
import { editarReserva } from "../../../services/reservaService";
import "../Calendario/Calendario.css";

export default function ReservaEditModal({
  aberto,
  fechar,
  reserva,
  atualizarCalendario,
}) {

  const [form, setForm] = useState({
    check_in: "",
    check_out: "",
    valor_total: "",
    valor_pago: 0,
    forma_pagamento: "PIX",
    observacoes: "",
    status: "pendente",
  });

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!aberto || !reserva) return;

    setErro(null);

    setForm({
      check_in: reserva.check_in || "",
      check_out: reserva.check_out || "",
      valor_total: reserva.valor_total ?? "",
      valor_pago: reserva.valor_pago ?? 0,
      forma_pagamento: reserva.forma_pagamento || "PIX",
      observacoes: reserva.observacoes || "",
      status: reserva.status || "pendente",
    });
  }, [aberto, reserva]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (erro) setErro(null);
  }

  async function salvarEdicao() {

    if (!reserva) return;

    if (!form.check_in || !form.check_out) {
      setErro("Informe as datas de check-in e check-out.");
      return;
    }

    if (form.check_out <= form.check_in) {
      setErro("A data de check-out deve ser maior que a de check-in.");
      return;
    }

    if (form.valor_total === "" || Number(form.valor_total) < 0) {
      setErro("Informe um valor total válido.");
      return;
    }

    if (form.valor_pago === "" || Number(form.valor_pago) < 0) {
      setErro("Informe um valor pago válido.");
      return;
    }

    try {

      setErro(null);
      setSalvando(true);

      //reservaUpdateSchema só aceita estes campos
      await editarReserva(reserva.id, {
        check_in: form.check_in,
        check_out: form.check_out,
        valor_total: Number(form.valor_total),
        valor_pago: Number(form.valor_pago),
        forma_pagamento: form.forma_pagamento,
        observacoes: form.observacoes,
        status: form.status,
      });

      atualizarCalendario();

      fechar();

    } catch (err) {

      const data = err.response?.data;
      const detalhe = data?.detail ?? data?.message;

      let mensagem;

      if (Array.isArray(detalhe)) {
        mensagem = detalhe.map((d) => d.msg).join(", ");
      } else if (typeof detalhe === "string" && detalhe.trim()) {
        const normalizado = detalhe.toLowerCase();
        mensagem =
          normalizado.includes("ocupado") ||
          normalizado.includes("ja existe") ||
          normalizado.includes("já existe")
            ? "Já existe uma reserva para este quarto nesse período."
            : detalhe;
      } else {
        mensagem = "Não foi possível salvar as alterações. Verifique os dados e tente novamente.";
      }

      setErro(mensagem);

    } finally {
      setSalvando(false);
    }
  }

  if (!aberto || !reserva) return null;

  return (
    <div className="modal-overlay">

      <div className="modal">

        <div className="modal-header modal-header--editar">
          <h2>Editar Reserva</h2>
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
            <label>Hóspede</label>
            <input
              type="text"
              value={reserva.hospede_nome || ""}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Quarto</label>
            <input
              type="text"
              value={`Quarto ${reserva.quarto_numero ?? ""}`}
              disabled
            />
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
            <label>
              Valor Pago <span className="campo-obrigatorio" style={{ color: "#d32f2f", fontWeight: 700 }}>*</span>
            </label>
            <input
              type="number"
              name="valor_pago"
              value={form.valor_pago}
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
            <label>
              Status <span className="campo-obrigatorio" style={{ color: "#d32f2f", fontWeight: 700 }}>*</span>
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="pendente">Pendente</option>
              <option value="ativa">Ativa</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
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

          <button
            className="save-btn"
            onClick={salvarEdicao}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>

        </div>

      </div>

    </div>
  );
}
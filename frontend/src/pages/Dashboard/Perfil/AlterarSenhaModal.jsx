import { useState } from "react";
import { changePassword } from "../../../services/authService";
import "../Calendario/Calendario.css";

export default function AlterarSenhaModal({ aberto, fechar }) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function fecharEReiniciar() {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setErro("");
    setSucesso(false);
    fechar();
  }

  async function salvar() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (novaSenha.length < 8) {
      setErro("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("A nova senha e a confirmação não coincidem.");
      return;
    }

    setErro("");
    setSalvando(true);

    try {
      await changePassword({ senhaAtual, novaSenha });

      setSucesso(true);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err) {
      const detalhe = err.response?.data?.detail;

      setErro(
        typeof detalhe === "string"
          ? detalhe
          : "Não foi possível alterar a senha. Tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Alterar Senha</h2>
          <button onClick={fecharEReiniciar}>✕</button>
        </div>

        <div className="modal-body">
          {erro && (
            <div className="reserva-erro">
              <span className="reserva-erro-icon">⚠</span>
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="reserva-erro reserva-sucesso">
              <span className="reserva-erro-icon">✓</span>
              <span>Senha alterada com sucesso!</span>
            </div>
          )}

          <div className="form-group">
            <label>
              Senha atual <span className="campo-obrigatorio">*</span>
            </label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => {
                setSenhaAtual(e.target.value);
                if (erro) setErro("");
              }}
              placeholder="Digite sua senha atual"
            />
          </div>

          <div className="form-group">
            <label>
              Nova senha <span className="campo-obrigatorio">*</span>
            </label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => {
                setNovaSenha(e.target.value);
                if (erro) setErro("");
              }}
              placeholder="No mínimo 8 caracteres"
            />
          </div>

          <div className="form-group">
            <label>
              Confirmar nova senha <span className="campo-obrigatorio">*</span>
            </label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => {
                setConfirmarSenha(e.target.value);
                if (erro) setErro("");
              }}
              placeholder="Repita a nova senha"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={fecharEReiniciar} disabled={salvando}>
            {sucesso ? "Fechar" : "Cancelar"}
          </button>

          {!sucesso && (
            <button className="save-btn" onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar nova senha"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

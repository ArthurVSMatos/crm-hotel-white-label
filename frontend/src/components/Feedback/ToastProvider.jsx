import { useCallback, useRef, useState } from "react";
import { ToastContext } from "./ToastContext";
import "./Toast.css";

let proximoId = 1;

const ICONES = {
  sucesso: "✓",
  erro: "✕",
  aviso: "!",
  info: "i",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removerToast = useCallback((id) => {
    setToasts((atual) => atual.filter((t) => t.id !== id));
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
  }, []);

  const showToast = useCallback((mensagem, opcoes = {}) => {
    const { tipo = "info", duracao = 5000 } = opcoes;
    const id = proximoId++;

    setToasts((atual) => [...atual, { id, mensagem, tipo }]);

    if (duracao > 0) {
      timersRef.current[id] = setTimeout(() => removerToast(id), duracao);
    }

    return id;
  }, [removerToast]);

  return (
    <ToastContext.Provider value={{ showToast, removerToast }}>
      {children}

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tipo}`}>
            <span className={`toast-icone toast-icone--${t.tipo}`}>
              {ICONES[t.tipo] || ICONES.info}
            </span>
            <span className="toast-mensagem">{t.mensagem}</span>
            <button
              className="toast-fechar"
              onClick={() => removerToast(t.id)}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}


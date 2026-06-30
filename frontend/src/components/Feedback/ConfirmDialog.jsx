import "./ConfirmDialog.css";

/**
 * Substitui o window.confirm() nativo do navegador.
 *
 * Uso:
 *   const [confirmacao, setConfirmacao] = useState(null);
 *   setConfirmacao({
 *     titulo: "Excluir reserva",
 *     mensagem: "Essa ação não pode ser desfeita.",
 *     textoConfirmar: "Excluir",
 *     perigo: true,
 *     onConfirmar: () => fazerAlgo(),
 *   });
 *   ...
 *   {confirmacao && <ConfirmDialog {...confirmacao} onCancelar={() => setConfirmacao(null)} />}
 */
export default function ConfirmDialog({
  titulo = "Confirmar ação",
  mensagem,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  perigo = false,
  carregando = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <div className="confirm-overlay" onClick={onCancelar}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-icone ${perigo ? "confirm-icone--perigo" : "confirm-icone--info"}`}>
          {perigo ? "!" : "?"}
        </div>

        <h3 className="confirm-titulo">{titulo}</h3>
        {mensagem && <p className="confirm-mensagem">{mensagem}</p>}

        <div className="confirm-acoes">
          <button className="confirm-btn-cancelar" onClick={onCancelar} disabled={carregando}>
            {textoCancelar}
          </button>
          <button
            className={`confirm-btn-confirmar ${perigo ? "confirm-btn-confirmar--perigo" : ""}`}
            onClick={onConfirmar}
            disabled={carregando}
          >
            {carregando ? "Aguarde..." : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

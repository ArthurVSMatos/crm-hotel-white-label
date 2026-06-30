import { useEffect, useState, useRef } from "react";
import MainLayout from "../../../components/Layout/MainLayout";
import "./WhiteLabel.css";

import {
  buscarConfigVitrine,
  atualizarConfigVitrine,
} from "../../../services/vitrineService";

import { uploadLogo } from "../../../services/perfilService";

// ─── Helpers ────────────────────────────────────────────────────────────────

const CONFIG_VAZIA = {
  vitrine_slug: "",
  vitrine_ativa: true,
  vitrine_whatsapp: "",
  vitrine_titulo_hero: "",
  vitrine_subtitulo_hero: "",
  vitrine_texto_botao: "",
  vitrine_horario_atendimento: "",
  vitrine_mensagem_whatsapp: "",
  cor_primaria: "#2563eb",
  cor_secundaria: "#1e293b",
  logo_url: "",
};

const SECOES = [
  { id: "cabecalho", titulo: "1. Textos do Cabeçalho" },
  { id: "midia", titulo: "2. Mídia e Fotos" },
  { id: "contato", titulo: "3. Informações e Contato" },
];

export default function WhiteLabel() {
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tipo: "sucesso"|"erro", mensagem }

  const [config, setConfig] = useState(CONFIG_VAZIA);
  const [modalAberto, setModalAberto] = useState(false);
  const [secaoAberta, setSecaoAberta] = useState("cabecalho");

  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const inputLogoRef = useRef(null);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        const dados = await buscarConfigVitrine();
        setConfig({
          vitrine_slug: dados.vitrine_slug || "",
          vitrine_ativa: dados.vitrine_ativa ?? true,
          vitrine_whatsapp: dados.vitrine_whatsapp || "",
          vitrine_titulo_hero: dados.vitrine_titulo_hero || "",
          vitrine_subtitulo_hero: dados.vitrine_subtitulo_hero || "",
          vitrine_texto_botao: dados.vitrine_texto_botao || "Reservar agora",
          vitrine_horario_atendimento: dados.vitrine_horario_atendimento || "",
          vitrine_mensagem_whatsapp: dados.vitrine_mensagem_whatsapp || "",
          cor_primaria: dados.cor_primaria || "#2563eb",
          cor_secundaria: dados.cor_secundaria || "#1e293b",
          logo_url: dados.logo_url || "",
        });
      } catch (erro) {
        console.error(erro);
        setFeedback({ tipo: "erro", mensagem: "Não foi possível carregar a vitrine." });
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  function atualizarCampo(campo, valor) {
    setConfig((atual) => ({ ...atual, [campo]: valor }));
  }

  function alternarSecao(id) {
    setSecaoAberta((atual) => (atual === id ? null : id));
  }

  async function salvar() {
    // o slug e o link publico da vitrine — sem ele, a pagina fica
    // inacessivel. Avisamos antes de tentar salvar vazio.
    if (!config.vitrine_slug.trim()) {
      setFeedback({
        tipo: "erro",
        mensagem: 'O "Endereço público" não pode ficar vazio — é o link que seus clientes usam para acessar a vitrine.',
      });
      setSecaoAberta("contato");
      return;
    }

    // a vitrine ativa sem whatsapp deixa o botao de reservar sem funcao
    // pro visitante — avisamos aqui em vez de deixar o hoteleiro descobrir
    // isso só quando um cliente reclamar que o botão não funciona
    const temWhatsApp = !!(config.vitrine_whatsapp || "").replace(/\D/g, "");
    if (config.vitrine_ativa && !temWhatsApp) {
      setFeedback({
        tipo: "erro",
        mensagem:
          'Configure o WhatsApp em "Informações e Contato" antes de publicar a vitrine — sem ele, o botão de reservar não vai funcionar pros seus clientes.',
      });
      setSecaoAberta("contato");
      return;
    }

    setSalvando(true);
    setFeedback(null);
    try {
      const atualizado = await atualizarConfigVitrine(config);
      setConfig((atual) => ({
        ...atual,
        vitrine_slug: atualizado.vitrine_slug || atual.vitrine_slug,
      }));
      setFeedback({ tipo: "sucesso", mensagem: "Vitrine atualizada com sucesso!" });
      setModalAberto(false);
    } catch (erro) {
      const mensagem = erro?.response?.data?.detail || "Não foi possível salvar as alterações.";
      setFeedback({ tipo: "erro", mensagem: typeof mensagem === "string" ? mensagem : "Não foi possível salvar." });
    } finally {
      setSalvando(false);
    }
  }

  async function handleLogo(arquivo) {
    if (!arquivo) return;
    setEnviandoLogo(true);
    try {
      const atualizado = await uploadLogo(arquivo);
      atualizarCampo("logo_url", atualizado.logo_url);
    } catch (erro) {
      console.error(erro);
      setFeedback({ tipo: "erro", mensagem: "Não foi possível enviar a logo." });
    } finally {
      setEnviandoLogo(false);
    }
  }

  const linkPublico = config.vitrine_slug
    ? `${window.location.origin}/v/${config.vitrine_slug}`
    : null;

  if (carregando) {
    return (
      <MainLayout>
        <div className="vitrines-pagina">
          <div className="vitrines-loading">Carregando vitrine...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="vitrines-pagina">
        <div className="vitrines-topo">
          <h1>Minhas Vitrines</h1>
          <p>Gerencie sua landing page.</p>
        </div>

        {feedback && (
          <div className={`vitrine-feedback vitrine-feedback--${feedback.tipo}`}>
            <span className="vitrine-feedback-icon">{feedback.tipo === "sucesso" ? "✓" : "!"}</span>
            {feedback.mensagem}
            <button className="vitrine-feedback-fechar" onClick={() => setFeedback(null)}>✕</button>
          </div>
        )}

        {/* Card de preview da vitrine — espelha o seu mockup do Figma */}
        <div className="vitrine-card">
          <div className="vitrine-card-preview">
            {config.logo_url ? (
              <img src={config.logo_url} alt="Logo" />
            ) : (
              <span className="vitrine-card-preview-vazio">Sem imagem</span>
            )}
            <span className={`vitrine-status-pill ${config.vitrine_ativa ? "ativa" : "inativa"}`}>
              {config.vitrine_ativa ? "● Publicada" : "● Desativada"}
            </span>
          </div>

          <div className="vitrine-card-info">
            <h3>{config.vitrine_titulo_hero || "Sua vitrine ainda não tem título"}</h3>
            <p>
              {config.vitrine_subtitulo_hero ||
                "Vitrine pública para reservas diretas via WhatsApp."}
            </p>

            {linkPublico && (
              <a className="vitrine-card-link" href={linkPublico} target="_blank" rel="noreferrer">
                🔗 {linkPublico}
              </a>
            )}

            <div className="vitrine-card-acoes">
              <button className="botao-primario" onClick={() => setModalAberto(true)}>
                Configurar Site
              </button>
              {linkPublico && (
                <a className="botao-secundario" href={linkPublico} target="_blank" rel="noreferrer">
                  Visualizar Site
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Modal: Editor da Vitrine, em seções colapsáveis */}
        {modalAberto && (
          <div className="vitrine-modal-overlay" onClick={() => setModalAberto(false)}>
            <div className="vitrine-modal" onClick={(e) => e.stopPropagation()}>
              <div className="vitrine-modal-cabecalho">
                <h2>Editor da Vitrine</h2>
                <button className="vitrine-modal-fechar" onClick={() => setModalAberto(false)}>✕</button>
              </div>

              <div className="vitrine-modal-corpo">

                {feedback && feedback.tipo === "erro" && (
                  <div className="vitrine-feedback vitrine-feedback--erro">
                    <span className="vitrine-feedback-icon">!</span>
                    {feedback.mensagem}
                  </div>
                )}

                {/* 1. Textos do Cabeçalho */}
                <Secao
                  id="cabecalho"
                  titulo={SECOES[0].titulo}
                  aberta={secaoAberta === "cabecalho"}
                  onToggle={alternarSecao}
                >
                  <label className="vitrine-label">Título principal</label>
                  <input
                    className="vitrine-input"
                    placeholder="ex: Bem-vindo ao Hotel Vista Mar"
                    value={config.vitrine_titulo_hero}
                    onChange={(e) => atualizarCampo("vitrine_titulo_hero", e.target.value)}
                  />

                  <label className="vitrine-label">Subtítulo</label>
                  <input
                    className="vitrine-input"
                    placeholder="ex: Conforto e tranquilidade a poucos passos da praia"
                    value={config.vitrine_subtitulo_hero}
                    onChange={(e) => atualizarCampo("vitrine_subtitulo_hero", e.target.value)}
                  />

                  <label className="vitrine-label">Texto do botão CTA</label>
                  <input
                    className="vitrine-input"
                    placeholder="ex: Reservar agora"
                    value={config.vitrine_texto_botao}
                    onChange={(e) => atualizarCampo("vitrine_texto_botao", e.target.value)}
                  />
                </Secao>

                {/* 2. Mídia e Fotos */}
                <Secao
                  id="midia"
                  titulo={SECOES[1].titulo}
                  aberta={secaoAberta === "midia"}
                  onToggle={alternarSecao}
                >
                  <label className="vitrine-label">Logo do hotel</label>
                  <div
                    className="vitrine-logo-upload"
                    onClick={() => inputLogoRef.current?.click()}
                  >
                    {config.logo_url ? (
                      <img src={config.logo_url} alt="Logo" />
                    ) : (
                      <span>📷 Clique para enviar a logo</span>
                    )}
                    {enviandoLogo && <div className="vitrine-logo-upload-loading">Enviando...</div>}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={inputLogoRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleLogo(e.target.files?.[0])}
                  />

                  <span className="vitrine-ajuda">
                    As fotos de cada quarto são cadastradas na página{" "}
                    <strong>Quartos</strong> do menu lateral.
                  </span>

                  <label className="vitrine-label" style={{ marginTop: 16 }}>
                    Cor principal
                  </label>
                  <div className="vitrine-cor-wrapper">
                    <input
                      type="color"
                      value={config.cor_primaria}
                      onChange={(e) => atualizarCampo("cor_primaria", e.target.value)}
                    />
                    <input
                      className="vitrine-input"
                      value={config.cor_primaria}
                      onChange={(e) => atualizarCampo("cor_primaria", e.target.value)}
                    />
                  </div>

                  <label className="vitrine-label">Cor secundária</label>
                  <div className="vitrine-cor-wrapper">
                    <input
                      type="color"
                      value={config.cor_secundaria}
                      onChange={(e) => atualizarCampo("cor_secundaria", e.target.value)}
                    />
                    <input
                      className="vitrine-input"
                      value={config.cor_secundaria}
                      onChange={(e) => atualizarCampo("cor_secundaria", e.target.value)}
                    />
                  </div>
                </Secao>

                {/* 3. Informações e Contato */}
                <Secao
                  id="contato"
                  titulo={SECOES[2].titulo}
                  aberta={secaoAberta === "contato"}
                  onToggle={alternarSecao}
                >
                  <label className="vitrine-label">
                    Endereço público (slug) <span className="vitrine-obrigatorio">*</span>
                  </label>
                  <div className="vitrine-slug-wrapper">
                    <span className="vitrine-slug-prefixo">/v/</span>
                    <input
                      className="vitrine-input"
                      placeholder="ex: hotel-da-praia"
                      value={config.vitrine_slug}
                      onChange={(e) => atualizarCampo("vitrine_slug", e.target.value)}
                    />
                  </div>

                  <label className="vitrine-toggle">
                    <input
                      type="checkbox"
                      checked={config.vitrine_ativa}
                      onChange={(e) => atualizarCampo("vitrine_ativa", e.target.checked)}
                    />
                    <span>{config.vitrine_ativa ? "Vitrine visível ao público" : "Vitrine desativada"}</span>
                  </label>

                  <label className="vitrine-label">WhatsApp para reservas</label>
                  <input
                    className="vitrine-input"
                    placeholder="ex: 5511999999999"
                    value={config.vitrine_whatsapp}
                    onChange={(e) => atualizarCampo("vitrine_whatsapp", e.target.value)}
                  />
                  <span className="vitrine-ajuda">Com DDI e DDD, só números.</span>

                  <label className="vitrine-label" style={{ marginTop: 14 }}>
                    Horário de atendimento
                  </label>
                  <input
                    className="vitrine-input"
                    placeholder="ex: Seg a Sex 08h-20h"
                    value={config.vitrine_horario_atendimento}
                    onChange={(e) => atualizarCampo("vitrine_horario_atendimento", e.target.value)}
                  />

                  <label className="vitrine-label">Mensagem padrão do WhatsApp</label>
                  <textarea
                    className="vitrine-input"
                    rows={3}
                    placeholder="ex: Olá! Vi a vitrine do hotel e gostaria de fazer uma reserva."
                    value={config.vitrine_mensagem_whatsapp}
                    onChange={(e) => atualizarCampo("vitrine_mensagem_whatsapp", e.target.value)}
                  />
                </Secao>

              </div>

              <div className="vitrine-modal-rodape">
                <button className="botao-secundario" onClick={() => setModalAberto(false)}>
                  Cancelar
                </button>
                <button className="botao-primario" onClick={salvar} disabled={salvando}>
                  {salvando ? "Salvando..." : "Confirmar Edições"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// ─── Seção colapsável (accordion) ──────────────────────────────────────────

function Secao({ id, titulo, aberta, onToggle, children }) {
  return (
    <div className="vitrine-secao">
      <button
        type="button"
        className="vitrine-secao-cabecalho"
        onClick={() => onToggle(id)}
      >
        {titulo}
        <span className={`vitrine-secao-seta ${aberta ? "aberta" : ""}`}>⌄</span>
      </button>
      {aberta && <div className="vitrine-secao-corpo">{children}</div>}
    </div>
  );
}

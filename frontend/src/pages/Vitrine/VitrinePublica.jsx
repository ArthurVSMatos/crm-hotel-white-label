import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./VitrinePublica.css";

import { buscarVitrinePublica } from "../../services/vitrineService";

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function montarLinkWhatsApp(numero, mensagem) {
  const apenasNumeros = (numero || "").replace(/\D/g, "");
  const texto = encodeURIComponent(mensagem || "Olá! Gostaria de fazer uma reserva.");
  return `https://wa.me/${apenasNumeros}?text=${texto}`;
}

export default function VitrinePublica() {
  const { slug } = useParams();

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [vitrine, setVitrine] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        setErro(null);
        const dados = await buscarVitrinePublica(slug);
        setVitrine(dados);
      } catch (e) {
        setErro(
          e?.response?.status === 404
            ? "Essa vitrine não existe ou não está disponível no momento."
            : "Não foi possível carregar esta página agora."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [slug]);

  if (carregando) {
    return <div className="vitrine-estado">Carregando...</div>;
  }

  if (erro || !vitrine) {
    return (
      <div className="vitrine-estado">
        <h1>😕 {erro}</h1>
      </div>
    );
  }

  const corPrimaria = vitrine.cor_primaria || "#2563eb";
  const corSecundaria = vitrine.cor_secundaria || "#1e293b";

  const temWhatsApp = !!(vitrine.vitrine_whatsapp || "").replace(/\D/g, "");

  const linkWhats = montarLinkWhatsApp(
    vitrine.vitrine_whatsapp,
    vitrine.vitrine_mensagem_whatsapp
  );

  const mapaSrc = vitrine.endereco
    ? `https://maps.google.com/maps?q=${encodeURIComponent(vitrine.endereco)}&output=embed`
    : null;

  return (
    <div
      className="vitrine-page"
      style={{ "--vitrine-primaria": corPrimaria, "--vitrine-secundaria": corSecundaria }}
    >
      {/* Header */}
      <header className="vitrine-header">
        <div className="vitrine-header-conteudo">
          <div className="vitrine-marca">
            {vitrine.logo_url ? (
              <img src={vitrine.logo_url} alt={vitrine.nome_empresa} />
            ) : (
              <div className="vitrine-marca-placeholder">🏨</div>
            )}
            <span>{vitrine.nome_empresa}</span>
          </div>

          <nav className="vitrine-nav">
            <a href="#inicio">Início</a>
            <a href="#quartos">Quartos</a>
            <a href="#contato">Contato</a>
          </nav>

          {temWhatsApp ? (
            <a className="vitrine-btn-cta" href={linkWhats} target="_blank" rel="noreferrer">
              {vitrine.vitrine_texto_botao || "Reservar agora"}
            </a>
          ) : (
            <span className="vitrine-btn-cta vitrine-btn-cta--desabilitado" title="WhatsApp não configurado">
              {vitrine.vitrine_texto_botao || "Reservar agora"}
            </span>
          )}
        </div>
      </header>

      {/* Hero */}
      <section id="inicio" className="vitrine-hero">
        <div className="vitrine-hero-conteudo">
          <h1>{vitrine.vitrine_titulo_hero || `Bem-vindo ao ${vitrine.nome_empresa}`}</h1>
          {vitrine.vitrine_subtitulo_hero && <p>{vitrine.vitrine_subtitulo_hero}</p>}
          {temWhatsApp ? (
            <a className="vitrine-btn-cta vitrine-btn-cta--grande" href={linkWhats} target="_blank" rel="noreferrer">
              {vitrine.vitrine_texto_botao || "Reservar agora"}
            </a>
          ) : (
            <span
              className="vitrine-btn-cta vitrine-btn-cta--grande vitrine-btn-cta--desabilitado"
              title="WhatsApp não configurado"
            >
              {vitrine.vitrine_texto_botao || "Reservar agora"}
            </span>
          )}
        </div>
      </section>

      {/* Quartos */}
      {vitrine.quartos?.length > 0 && (
        <section id="quartos" className="vitrine-quartos">
          <div className="vitrine-secao-titulo">
            <span className="vitrine-tag">Nossas acomodações</span>
            <h2>Escolha seu quarto ideal</h2>
            <p>
              Estamos prontos para receber você. Entre em contato pelo WhatsApp
              e viva uma experiência única em {vitrine.nome_empresa}.
            </p>
          </div>

          <div className="vitrine-quartos-grid">
            {vitrine.quartos.map((quarto) => (
              <div key={quarto.id} className="vitrine-quarto-card">
                <div className="vitrine-quarto-imagem">
                  {quarto.imagem_url ? (
                    <img src={quarto.imagem_url} alt={`Quarto ${quarto.numero}`} />
                  ) : (
                    <span>Imagem do quarto</span>
                  )}
                </div>
                <div className="vitrine-quarto-info">
                  <h3>Quarto {quarto.numero}</h3>
                  <p>
                    {quarto.descricao_vitrine ||
                      quarto.descricao ||
                      `Acomoda até ${quarto.capacidade} pessoa(s).`}
                  </p>
                  <div className="vitrine-quarto-rodape">
                    <div>
                      <span className="vitrine-quarto-preco">{formatarMoeda(quarto.valor_diaria)}</span>
                      <span className="vitrine-quarto-preco-sufixo">/diária</span>
                    </div>
                    {temWhatsApp ? (
                      <a
                        className="vitrine-btn-cta"
                        href={montarLinkWhatsApp(
                          vitrine.vitrine_whatsapp,
                          `Olá! Gostaria de reservar o quarto ${quarto.numero} do ${vitrine.nome_empresa}.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Reservar
                      </a>
                    ) : (
                      <span className="vitrine-btn-cta vitrine-btn-cta--desabilitado" title="WhatsApp não configurado">
                        Reservar
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contato + mapa */}
      <section id="contato" className="vitrine-contato">
        <div className="vitrine-contato-info">
          <span className="vitrine-tag">Fale conosco</span>
          <h2>Agende sua reserva agora</h2>
          <p>
            Estamos prontos para receber você. Entre em contato pelo WhatsApp
            ou visite nossa localização.
          </p>

          {vitrine.endereco && (
            <div className="vitrine-contato-item">
              <strong>📍 Onde estamos</strong>
              <span>{vitrine.endereco}</span>
            </div>
          )}

          {vitrine.vitrine_horario_atendimento && (
            <div className="vitrine-contato-item">
              <strong>🕑 Horário de atendimento</strong>
              <span>{vitrine.vitrine_horario_atendimento}</span>
            </div>
          )}

          {temWhatsApp ? (
            <a className="vitrine-btn-whatsapp" href={linkWhats} target="_blank" rel="noreferrer">
              💬 Chamar no WhatsApp
            </a>
          ) : (
            <span className="vitrine-btn-whatsapp vitrine-btn-whatsapp--desabilitado" title="WhatsApp não configurado">
              💬 WhatsApp não disponível
            </span>
          )}
        </div>

        <div className="vitrine-mapa">
          <span className="vitrine-tag">Localização</span>
          {mapaSrc ? (
            <iframe
              title="Localização"
              src={mapaSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="vitrine-mapa-vazio">Endereço não informado.</div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="vitrine-footer">
        <div>
          <strong>{vitrine.nome_empresa}</strong>
          <p>Sistema de gestão para hospedagens</p>
        </div>
        <div className="vitrine-footer-direita">
          <p>© {new Date().getFullYear()} {vitrine.nome_empresa}. Todos os direitos reservados.</p>
          <p>
            Projeto{" "}
            <a href="https://attdeal.com" target="_blank" rel="noreferrer">
              DealFlow
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

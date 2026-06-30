import { useEffect, useState } from "react";
import MainLayout from "../../../components/Layout/MainLayout";
import AlterarSenhaModal from "./AlterarSenhaModal";
import "./Perfil.css";

import { me } from "../../../services/authService";
import { atualizarPerfil, uploadLogo, removerLogoServidor } from "../../../services/perfilService";

export default function Perfil() {
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [enviandoLogo, setEnviandoLogo] = useState(false);
    const [feedback, setFeedback] = useState(null); // { tipo: "sucesso"|"erro", mensagem }
    const [modalSenhaAberto, setModalSenhaAberto] = useState(false);

    const [logoPreview, setLogoPreview] = useState(null);

    const [perfil, setPerfil] = useState({
        nome: "",
        cpf: "",
        email: "",
        nome_empresa: "",
        cnpj: "",
        endereco: "",
        tipo_hospedagem: "",
        ativo: false,
    });

    useEffect(() => {
        carregarPerfil();
    }, []);

    async function carregarPerfil() {
        try {
            const dados = await me();
            setPerfil({
                nome: dados.nome || "",
                cpf: dados.cpf || "",
                email: dados.email || "",
                nome_empresa: dados.nome_empresa || "",
                cnpj: dados.cnpj || "",
                endereco: dados.endereco || "",
                tipo_hospedagem: dados.tipo_hospedagem || "",
                ativo: dados.ativo || false,
            });
            // Carrega a logo salva no banco (data URL base64)
            if (dados.logo_url) {
                setLogoPreview(dados.logo_url);
            }
        } catch (error) {
            console.log(error);
            setFeedback({ tipo: "erro", mensagem: "Erro ao carregar perfil." });
        } finally {
            setCarregando(false);
        }
    }

    function atualizarCampo(campo, valor) {
        setPerfil({ ...perfil, [campo]: valor });
    }

    function validarPerfil() {
        if (!perfil.nome.trim()) {
            return "O nome do responsável é obrigatório.";
        }
        if (!perfil.email.trim()) {
            return "O email é obrigatório.";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(perfil.email)) {
            return "Informe um email válido.";
        }
        if (!perfil.nome_empresa.trim()) {
            return "O nome da empresa é obrigatório.";
        }
        if (!perfil.cnpj.trim()) {
            return "O CNPJ é obrigatório.";
        }
        if (!perfil.endereco.trim()) {
            return "O endereço é obrigatório.";
        }
        if (!perfil.tipo_hospedagem) {
            return "Selecione o tipo de hospedagem.";
        }
        return null;
    }

    async function salvarAlteracoes() {
        const erroValidacao = validarPerfil();
        if (erroValidacao) {
            setFeedback({ tipo: "erro", mensagem: erroValidacao });
            return;
        }

        setSalvando(true);
        setFeedback(null);
        try {
            await atualizarPerfil({
                nome: perfil.nome,
                email: perfil.email,
                nome_empresa: perfil.nome_empresa,
                cnpj: perfil.cnpj,
                endereco: perfil.endereco,
                tipo_hospedagem: perfil.tipo_hospedagem,
            });
            setFeedback({ tipo: "sucesso", mensagem: "Alterações salvas com sucesso!" });
        } catch (error) {
            const detalhe = error.response?.data?.detail;
            const msg = typeof detalhe === "string" ? detalhe : "Erro ao salvar alterações. Tente novamente.";
            setFeedback({ tipo: "erro", mensagem: msg });
        } finally {
            setSalvando(false);
        }
    }

    async function enviarLogo(e) {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        // Mostra preview local imediatamente
        const imagemUrl = URL.createObjectURL(arquivo);
        setLogoPreview(imagemUrl);

        // Faz upload para o servidor e salva no banco
        setEnviandoLogo(true);
        setFeedback(null);
        try {
            const resultado = await uploadLogo(arquivo);
            // Usa a URL base64 devolvida pelo servidor
            if (resultado.logo_url) {
                setLogoPreview(resultado.logo_url);
            }
            setFeedback({ tipo: "sucesso", mensagem: "Logo salva com sucesso!" });
        } catch (error) {
            setFeedback({ tipo: "erro", mensagem: "Erro ao salvar logo. Tente novamente." });
        } finally {
            setEnviandoLogo(false);
        }
    }

    async function removerLogo() {
        const logoAnterior = logoPreview;
        setLogoPreview(null);
        setFeedback(null);
        try {
            await removerLogoServidor();
            setFeedback({ tipo: "sucesso", mensagem: "Logo removida com sucesso!" });
        } catch (error) {
            console.log(error);
            // reverte o preview, ja que a remocao no servidor falhou
            setLogoPreview(logoAnterior);
            setFeedback({ tipo: "erro", mensagem: "Não foi possível remover a logo. Tente novamente." });
        }
    }

    if (carregando) {
        return (
            <MainLayout>
                <div className="perfil-page">
                    <div className="perfil-loading">Carregando perfil...</div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="perfil-page">
                <div className="perfil-header">
                    <h1>Meu Perfil</h1>
                    <p>Gerencie os dados da sua empresa</p>
                </div>

                <section className="perfil-card logo-section">
                    <div className="logo-placeholder">
                        {logoPreview ? (
                            <img
                                src={logoPreview}
                                alt="Logo da empresa"
                                className="perfil-logo-img"
                            />
                        ) : (
                            "🖼️"
                        )}
                    </div>

                    <div>
                        <h3>Logo da Empresa</h3>
                        <p>Logo com fundo transparente 250 × 100px PNG até 100 kb</p>
                        {enviandoLogo && <p className="logo-status">Salvando logo...</p>}
                    </div>

                    <div className="logo-actions">
                        <label className="btn-primary upload-label">
                            Enviar logo
                            <input
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={enviarLogo}
                                hidden
                                disabled={enviandoLogo}
                            />
                        </label>

                        <button className="btn-secondary" onClick={removerLogo} disabled={enviandoLogo}>
                            Remover
                        </button>
                    </div>
                </section>

                <section className="perfil-card">
                    <h2>Dados do Responsável</h2>

                    <label>Nome do responsável: <span className="campo-obrigatorio">*</span></label>
                    <input
                        value={perfil.nome}
                        onChange={(e) => atualizarCampo("nome", e.target.value)}
                    />

                    <div className="form-grid">
                        <div>
                            <label>Email <span className="campo-obrigatorio">*</span></label>
                            <input
                                value={perfil.email}
                                onChange={(e) => atualizarCampo("email", e.target.value)}
                            />
                        </div>

                        <div>
                            <label>CPF</label>
                            <input
                                value={perfil.cpf}
                                readOnly
                                disabled
                            />
                            <span className="campo-ajuda">O CPF não pode ser alterado.</span>
                        </div>
                    </div>
                </section>

                <section className="perfil-card">
                    <h2>Dados da Empresa</h2>

                    <label>Razão Social / Nome da Empresa: <span className="campo-obrigatorio">*</span></label>
                    <input
                        value={perfil.nome_empresa}
                        onChange={(e) => atualizarCampo("nome_empresa", e.target.value)}
                    />

                    <div className="form-grid">
                        <div>
                            <label>CNPJ <span className="campo-obrigatorio">*</span></label>
                            <input
                                value={perfil.cnpj}
                                onChange={(e) => atualizarCampo("cnpj", e.target.value)}
                            />
                        </div>

                        <div>
                            <label>Tipo de hospedagem <span className="campo-obrigatorio">*</span></label>
                            <select
                                value={perfil.tipo_hospedagem}
                                onChange={(e) =>
                                    atualizarCampo("tipo_hospedagem", e.target.value)
                                }
                            >
                                <option value="">Selecione</option>
                                <option value="hotel">Hotel</option>
                                <option value="pousada">Pousada</option>
                                <option value="resort">Resort</option>
                                <option value="hostel">Hostel</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="perfil-card">
                    <h2>Endereço</h2>

                    <label>Logradouro <span className="campo-obrigatorio">*</span></label>
                    <input
                        value={perfil.endereco}
                        onChange={(e) => atualizarCampo("endereco", e.target.value)}
                    />
                </section>

                <section className="perfil-card password-section">
                    <div>
                        <h2>Status da conta</h2>
                        <span className={`status-badge ${perfil.ativo ? "ativo" : "inativo"}`}>
                            {perfil.ativo ? "Conta ativa" : "Conta inativa"}
                        </span>
                    </div>

                    <button className="btn-password" onClick={() => setModalSenhaAberto(true)}>
                        🔒 Alterar Senha
                    </button>
                </section>

                <AlterarSenhaModal
                    aberto={modalSenhaAberto}
                    fechar={() => setModalSenhaAberto(false)}
                />

                {/* Feedback de salvamento */}
                {feedback && (
                    <div className={`perfil-feedback perfil-feedback--${feedback.tipo}`}>
                        <span className="perfil-feedback-icon">
                            {feedback.tipo === "sucesso" ? "✓" : "✕"}
                        </span>
                        {feedback.mensagem}
                    </div>
                )}

                <div className="perfil-footer">
                    <button
                        className="btn-save"
                        onClick={salvarAlteracoes}
                        disabled={salvando}
                    >
                        {salvando ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}

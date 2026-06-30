import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { checkCpf, checkEmail } from "../../../services/authService";

export default function Step1Personal({ formData, handleChange, nextStep, erroApi, limparErroApi }) {
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verificação de CPF em tempo real (sem precisar chegar no final do cadastro)
  const [statusCpf, setStatusCpf] = useState(null); // null | "verificando" | "disponivel" | "duplicado"
  const cpfVerificadoRef = useRef(""); // guarda o último CPF já checado, evita repetir chamada

  useEffect(() => {
    const cpfLimpo = (formData.cpf || "").replace(/\D/g, "");

    // CPF incompleto: não verifica, limpa qualquer status anterior
    if (cpfLimpo.length !== 11) {
      setStatusCpf(null);
      return;
    }

    // já verificou esse CPF exato, não bate na API de novo
    if (cpfVerificadoRef.current === cpfLimpo) {
      return;
    }

    setStatusCpf("verificando");

    // debounce: espera o usuário parar de digitar por 500ms
    const timer = setTimeout(async () => {
      try {
        const resultado = await checkCpf(cpfLimpo);
        cpfVerificadoRef.current = cpfLimpo;
        setStatusCpf(resultado?.disponivel ? "disponivel" : "duplicado");
      } catch {
        // se a verificação falhar (rede, etc), não bloqueia o usuário aqui;
        // a confirmação final continua acontecendo no envio do cadastro
        setStatusCpf(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.cpf]);

  // Verificação de Email em tempo real (mesma lógica do CPF)
  const [statusEmail, setStatusEmail] = useState(null); // null | "verificando" | "disponivel" | "duplicado"
  const emailVerificadoRef = useRef("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const emailAtual = (formData.email || "").trim();

    // só verifica quando o formato já parece um email válido
    if (!emailRegex.test(emailAtual)) {
      setStatusEmail(null);
      return;
    }

    if (emailVerificadoRef.current === emailAtual) {
      return;
    }

    setStatusEmail("verificando");

    const timer = setTimeout(async () => {
      try {
        const resultado = await checkEmail(emailAtual);
        emailVerificadoRef.current = emailAtual;
        setStatusEmail(resultado?.disponivel ? "disponivel" : "duplicado");
      } catch {
        setStatusEmail(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email]);

  // Interceptador para formatação de CPF em tempo real
  const handleCPFChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove letras
    if (value.length > 11) value = value.slice(0, 11); // Trava o tamanho máximo

    // Aplicação da máscara estrutural
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    if (erroApi?.campo === "cpf") limparErroApi?.();

    // Envia o evento simulado perfeitamente para o estado pai
    handleChange({
      target: {
        name: "cpf",
        value: value,
      },
    });
  };

  const handleEmailChange = (e) => {
    if (erroApi?.campo === "email") limparErroApi?.();
    handleChange(e);
  };


  const validate = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!formData.nomeCompleto) newErrors.nomeCompleto = "Nome completo é obrigatório.";
    if (!formData.cpf || formData.cpf.length !== 14) newErrors.cpf = "CPF inválido ou incompleto.";
    else if (statusCpf === "duplicado") newErrors.cpf = "Este CPF já está cadastrado no sistema.";
    else if (statusCpf === "verificando") newErrors.cpf = "Aguarde, verificando o CPF...";
    else if (erroApi?.campo === "cpf") newErrors.cpf = erroApi.mensagem;

    if (!formData.email) newErrors.email = "Email é obrigatório.";
    else if (formData.email && !emailRegex.test(formData.email)) newErrors.email = "Formato de email inválido.";
    else if (statusEmail === "duplicado") newErrors.email = "Este email já está cadastrado no sistema.";
    else if (statusEmail === "verificando") newErrors.email = "Aguarde, verificando o email...";
    else if (erroApi?.campo === "email") newErrors.email = erroApi.mensagem;

    if (!formData.senha) newErrors.senha = "Senha é obrigatória.";
    if (!formData.confirmarSenha) newErrors.confirmarSenha = "Confirmação de senha é obrigatória.";

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (formData.senha && !passwordRegex.test(formData.senha)) {
      newErrors.senha = "A senha deve conter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial.";
    }

    if (formData.senha && formData.confirmarSenha && formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    nextStep();
  };

  const EyeIcon = ({ show }) => (
    show ? (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    )
  );

  return (
    <form onSubmit={validate} className="space-y-4">
      <h2 className="text-white text-xl font-bold mb-4">Informações Pessoais</h2>

      <div>
        <label className="block text-white text-sm mb-1">Nome Completo <span className="text-red-500">*</span></label>
        <input type="text" name="nomeCompleto" value={formData.nomeCompleto} onChange={handleChange} placeholder="Ex: João da Silva" className="w-full p-3 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
        {errors.nomeCompleto && <p className="text-red-400 text-xs mt-1">{errors.nomeCompleto}</p>}
      </div>

      <div>
        <label className="block text-white text-sm mb-1">CPF <span className="text-red-500">*</span></label>
        <div className="relative">
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleCPFChange}
            placeholder="000.000.000-00"
            className={`w-full p-3 pr-10 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 ${
              statusCpf === "duplicado"
                ? "ring-2 ring-red-500"
                : statusCpf === "disponivel"
                ? "ring-2 ring-green-500"
                : "focus:ring-amber-500"
            }`}
          />
          {statusCpf === "verificando" && (
            <span className="absolute right-3 top-3 text-gray-400 text-xs">verificando...</span>
          )}
          {statusCpf === "disponivel" && (
            <span className="absolute right-3 top-3 text-green-600 font-bold">✓</span>
          )}
          {statusCpf === "duplicado" && (
            <span className="absolute right-3 top-3 text-red-500 font-bold">✕</span>
          )}
        </div>
        {statusCpf === "duplicado" && !errors.cpf && (
          <p className="text-red-400 text-xs mt-1">Este CPF já está cadastrado no sistema.</p>
        )}
        {(errors.cpf || (erroApi?.campo === "cpf" && erroApi.mensagem)) && (
          <p className="text-red-400 text-xs mt-1">{errors.cpf || erroApi.mensagem}</p>
        )}
      </div>

      <div>
        <label className="block text-white text-sm mb-1">Email <span className="text-red-500">*</span></label>
        <div className="relative">
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleEmailChange}
            placeholder="joaodasilva@gmail.com"
            className={`w-full p-3 pr-10 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 ${
              statusEmail === "duplicado"
                ? "ring-2 ring-red-500"
                : statusEmail === "disponivel"
                ? "ring-2 ring-green-500"
                : "focus:ring-amber-500"
            }`}
          />
          {statusEmail === "verificando" && (
            <span className="absolute right-3 top-3 text-gray-400 text-xs">verificando...</span>
          )}
          {statusEmail === "disponivel" && (
            <span className="absolute right-3 top-3 text-green-600 font-bold">✓</span>
          )}
          {statusEmail === "duplicado" && (
            <span className="absolute right-3 top-3 text-red-500 font-bold">✕</span>
          )}
        </div>
        {statusEmail === "duplicado" && !errors.email && (
          <p className="text-red-400 text-xs mt-1">Este email já está cadastrado no sistema.</p>
        )}
        {(errors.email || (erroApi?.campo === "email" && erroApi.mensagem)) && (
          <p className="text-red-400 text-xs mt-1">{errors.email || erroApi.mensagem}</p>
        )}
      </div>

      <div>
        <label className="block text-white text-sm mb-1">Senha <span className="text-red-500">*</span></label>
        <div className="relative">
          <input type={showPassword ? "text" : "password"} name="senha" value={formData.senha} onChange={handleChange} placeholder="No mínimo 8 caracteres" className="w-full p-3 pr-12 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none">
            <EyeIcon show={showPassword} />
          </button>
        </div>
        {errors.senha && <p className="text-red-400 text-xs mt-1">{errors.senha}</p>}
      </div>

      <div>
        <label className="block text-white text-sm mb-1">Confirmar Senha <span className="text-red-500">*</span></label>
        <div className="relative">
          <input type={showConfirmPassword ? "text" : "password"} name="confirmarSenha" value={formData.confirmarSenha} onChange={handleChange} placeholder="Repita a senha" className="w-full p-3 pr-12 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none">
            <EyeIcon show={showConfirmPassword} />
          </button>
        </div>
        {errors.confirmarSenha && <p className="text-red-400 text-xs mt-1">{errors.confirmarSenha}</p>}
      </div>

      <div className="flex justify-between items-center pt-4">
        <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
          Já tem conta? <span className="text-amber-500 font-semibold hover:underline">Faça login</span>
        </Link>
        <button
          type="submit"
          disabled={
            statusCpf === "verificando" || statusCpf === "duplicado" ||
            statusEmail === "verificando" || statusEmail === "duplicado"
          }
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-[#0B3B24] font-bold transition-colors"
        >
          Próximo →
        </button>
      </div>
    </form>
  );
}
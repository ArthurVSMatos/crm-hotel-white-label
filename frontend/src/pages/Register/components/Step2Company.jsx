import { useEffect, useRef, useState } from "react";
import { checkCnpj } from "../../../services/authService";

export default function Step2Company({ formData, handleChange, nextStep, prevStep, erroApi, limparErroApi }) {
  const [errors, setErrors] = useState({});

  // Verificação de CNPJ em tempo real (mesma lógica usada no CPF/Email da etapa 1)
  const [statusCnpj, setStatusCnpj] = useState(null); // null | "verificando" | "disponivel" | "duplicado"
  const cnpjVerificadoRef = useRef("");

  useEffect(() => {
    const cnpjLimpo = (formData.cnpj || "").replace(/\D/g, "");

    if (cnpjLimpo.length !== 14) {
      setStatusCnpj(null);
      return;
    }

    if (cnpjVerificadoRef.current === cnpjLimpo) {
      return;
    }

    setStatusCnpj("verificando");

    const timer = setTimeout(async () => {
      try {
        const resultado = await checkCnpj(cnpjLimpo);
        cnpjVerificadoRef.current = cnpjLimpo;
        setStatusCnpj(resultado?.disponivel ? "disponivel" : "duplicado");
      } catch {
        setStatusCnpj(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.cnpj]);

  // Interceptador para formatação de CNPJ em tempo real
  const handleCNPJChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove letras
    if (value.length > 14) value = value.slice(0, 14); // Trava o tamanho máximo

    // Aplicação da máscara estrutural
    value = value.replace(/^(\d{2})(\d)/, "$1.$2");
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
    value = value.replace(/(\d{4})(\d)/, "$1-$2");

    // Repassa o evento tratado de forma limpa para o estado global
    if (erroApi?.campo === "cnpj") limparErroApi?.();

    handleChange({
      target: {
        name: "cnpj",
        value: value,
      },
    });
  };

  const validate = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!formData.nomeEmpresa) newErrors.nomeEmpresa = "Nome da empresa é obrigatório.";
    if (!formData.cnpj || formData.cnpj.length !== 18) newErrors.cnpj = "CNPJ inválido ou incompleto.";
    else if (statusCnpj === "duplicado") newErrors.cnpj = "Este CNPJ já está cadastrado no sistema.";
    else if (statusCnpj === "verificando") newErrors.cnpj = "Aguarde, verificando o CNPJ...";
    else if (erroApi?.campo === "cnpj") newErrors.cnpj = erroApi.mensagem;
    if (!formData.endereco) newErrors.endereco = "Endereço completo é obrigatório.";
    if (!formData.tipoHospedagem) newErrors.tipoHospedagem = "Selecione o tipo de hospedagem.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    nextStep();
  };

  return (
    <form onSubmit={validate} className="space-y-4">
      <h2 className="text-white text-xl font-bold mb-4">Dados da Empresa</h2>

      <div>
        <label className="block text-white text-sm mb-1">Nome da Empresa / Razão Social <span className="text-red-500">*</span></label>
        <input type="text" name="nomeEmpresa" value={formData.nomeEmpresa} onChange={handleChange} className="w-full p-3 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
        {errors.nomeEmpresa && <p className="text-red-400 text-xs mt-1">{errors.nomeEmpresa}</p>}
      </div>

      <div>
        <label className="block text-white text-sm mb-1">CNPJ <span className="text-red-500">*</span></label>
        <div className="relative">
          <input
            type="text"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleCNPJChange}
            placeholder="00.000.000/0001-00"
            className={`w-full p-3 pr-10 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 ${
              statusCnpj === "duplicado"
                ? "ring-2 ring-red-500"
                : statusCnpj === "disponivel"
                ? "ring-2 ring-green-500"
                : "focus:ring-amber-500"
            }`}
          />
          {statusCnpj === "verificando" && (
            <span className="absolute right-3 top-3 text-gray-400 text-xs">verificando...</span>
          )}
          {statusCnpj === "disponivel" && (
            <span className="absolute right-3 top-3 text-green-600 font-bold">✓</span>
          )}
          {statusCnpj === "duplicado" && (
            <span className="absolute right-3 top-3 text-red-500 font-bold">✕</span>
          )}
        </div>
        {statusCnpj === "duplicado" && !errors.cnpj && (
          <p className="text-red-400 text-xs mt-1">Este CNPJ já está cadastrado no sistema.</p>
        )}
        {(errors.cnpj || (erroApi?.campo === "cnpj" && erroApi.mensagem)) && (
          <p className="text-red-400 text-xs mt-1">{errors.cnpj || erroApi.mensagem}</p>
        )}
      </div>

      <div>
        <label className="block text-white text-sm mb-1">Endereço Completo <span className="text-red-500">*</span></label>
        <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} className="w-full p-3 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
        {errors.endereco && <p className="text-red-400 text-xs mt-1">{errors.endereco}</p>}
      </div>

      <div>
        <label className="block text-white text-sm mb-1">Tipo de Hospedagem <span className="text-red-500">*</span></label>
        {/* Container relativo para acoplamento do ícone customizado */}
        <div className="relative">
          <select
            name="tipoHospedagem"
            value={formData.tipoHospedagem}
            onChange={handleChange}
            className="w-full p-3 pr-10 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
          >
            <option value="">Selecione</option>
            <option value="hotel">Hotel</option>
            <option value="pousada">Pousada</option>
            <option value="resort">Resort</option>
            <option value="hostel">Hostel</option>
          </select>
          {/* Ícone de Seta Customizado (v) */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
        {errors.tipoHospedagem && <p className="text-red-400 text-xs mt-1">{errors.tipoHospedagem}</p>}
      </div>

      <div className="flex justify-between items-center pt-4">
        <button type="button" onClick={prevStep} className="text-gray-300 hover:text-white transition-colors">
          ← Voltar
        </button>
        <button
          type="submit"
          disabled={statusCnpj === "verificando" || statusCnpj === "duplicado"}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-[#0B3B24] font-bold transition-colors"
        >
          Próximo →
        </button>
      </div>
    </form>
  );
}
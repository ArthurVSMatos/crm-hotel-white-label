import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Importação dos Componentes Filhos
import StepIndicator from "./components/StepIndicator";
import Step1Personal from "./components/Step1Personal";
import Step2Company from "./components/Step2Company";
import Step3Logo from "./components/Step3Logo";

export default function Register() {
  // Hook usado para navegar entre páginas
  const navigate = useNavigate();

  // ==========================================
  // 1. A MEMÓRIA DO SISTEMA (Estado Global)
  // ==========================================
  const [formData, setFormData] = useState({
    // Passo 1: Pessoal
    nomeCompleto: "",
    cpf: "",
    email: "",
    senha: "",
    confirmarSenha: "",

    // Passo 2: Empresa
    nomeEmpresa: "",
    cnpj: "",
    endereco: "",
    tipoHospedagem: "",

    // Passo 3: Final
    logo: null,
  });

  // ==========================================
  // 2. CONTROLE DE ETAPAS DO CADASTRO
  // ==========================================
  const [currentStep, setCurrentStep] = useState(1);

  // Avança para o próximo passo
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Volta para o passo anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Atualiza os dados do formulário conforme o usuário digita
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Finaliza o cadastro e redireciona para o Dashboard
  const handleFinalSubmit = () => {
    navigate("/dashboard");
  };

  // ==========================================
  // 3. VISUAL DA PÁGINA DE CADASTRO
  // ==========================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#092B1A] to-gray-200 p-4">
      <div className="w-full max-w-lg bg-[#0B3B24] border-2 border-amber-500 rounded-2xl p-8 shadow-2xl relative">

        {/* Indicador visual de etapas */}
        <StepIndicator currentStep={currentStep} />

        {/* ========================================== */}
        {/* 4. RENDERIZAÇÃO CONDICIONAL DAS ETAPAS */}
        {/* ========================================== */}

        {currentStep === 1 && (
          <div className="animate-fade-in">
            <Step1Personal
              formData={formData}
              handleChange={handleChange}
              nextStep={nextStep}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-fade-in">
            <Step2Company
              formData={formData}
              handleChange={handleChange}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-fade-in">
            <Step3Logo
              formData={formData}
              setFormData={setFormData}
              prevStep={prevStep}
              handleFinalSubmit={handleFinalSubmit}
            />
          </div>
        )}

      </div>
    </div>
  );
}
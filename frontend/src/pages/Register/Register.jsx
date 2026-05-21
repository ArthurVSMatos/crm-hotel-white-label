import { useState } from "react";

// Importação dos Componentes Filhos
import StepIndicator from "./components/StepIndicator";
import Step1Personal from "./components/Step1Personal";
import Step2Company from "./components/Step2Company";
import Step3Logo from "./components/Step3Logo";

export default function Register() {
  // ==========================================
  // 1. A MEMÓRIA DO SISTEMA (O Estado Global)
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
  // 2. O CONTROLE DE TRÁFEGO (Navegação)
  // ==========================================
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFinalSubmit = () => {
    alert("Inscrição concluída com sucesso! Redirecionando para o Dashboard...");
    console.log("Pacote final que será enviado no POST para o Backend:", formData);
  };

  // ==========================================
  // 3. O VISUAL (A Casca do Card)
  // ==========================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#092B1A] to-gray-200 p-4">
      
      <div className="w-full max-w-lg bg-[#0B3B24] border-2 border-amber-500 rounded-2xl p-8 shadow-2xl relative">
        
        {/* Componente Modular do Indicador injetado aqui */}
        <StepIndicator currentStep={currentStep} />

        {/* ========================================== */}
        {/* 4. RENDERIZAÇÃO CONDICIONAL DAS TELAS */}
        {/* ========================================== */}

        {currentStep === 1 && (
          <div className="animate-fade-in">
             <Step1Personal formData={formData} handleChange={handleChange} nextStep={nextStep} />
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-fade-in">
             <Step2Company formData={formData} handleChange={handleChange} nextStep={nextStep} prevStep={prevStep} />
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-fade-in">
             <Step3Logo formData={formData} setFormData={setFormData} prevStep={prevStep} handleFinalSubmit={handleFinalSubmit} />
          </div>
        )}

      </div>
    </div>
  );
}
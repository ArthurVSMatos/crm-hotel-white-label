import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Importação dos Componentes Filhos
import StepIndicator from "./components/StepIndicator";
import Step1Personal from "./components/Step1Personal";
import Step2Company from "./components/Step2Company";
import Step3Logo from "./components/Step3Logo";
// CORREÇÃO 1: Importando a função login que estava faltando aqui no topo!
import { register, login } from "../../services/authService";
import { uploadLogo } from "../../services/perfilService";
import { useToast } from "../../components/Feedback/useToast";

const INITIAL_STATE = {
  nomeCompleto: "",
  cpf: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  nomeEmpresa: "",
  cnpj: "",
  endereco: "",
  tipoHospedagem: "",
  logo: null,
};

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [erroApi, setErroApi] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Inicialização inteligente: Puxa o rascunho caso exista
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("dealflow_rascunho_registro");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Retorna os dados textuais salvos e garante que a logo reinicie limpa
        return { ...INITIAL_STATE, ...parsed, logo: null };
      } catch (e) {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  // Salva apenas os dados textuais no LocalStorage a cada modificação
  useEffect(() => {
    const { logo, ...textualData } = formData;
    localStorage.setItem("dealflow_rascunho_registro", JSON.stringify(textualData));
  }, [formData]);

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFinalSubmit = async () => {
    setErroApi(null);
    setEnviando(true);
    try {
      // 1. A primeira caixa (Dados do Cadastro com máscara aceita pelo back)
      const payloadRegistro = {
        nome: formData.nomeCompleto,
        cpf: formData.cpf, 
        email: formData.email,
        senha: formData.senha,
        nome_empresa: formData.nomeEmpresa,
        cnpj: formData.cnpj, 
        endereco: formData.endereco,
        tipo_hospedagem: formData.tipoHospedagem,
      };
  
      // Envia a primeira caixa para o back-end
      await register(payloadRegistro);
  
      // 2. A segunda caixa (Dados do Auto-Login)
      const payloadLogin = {
        email: formData.email,
        password: formData.senha, 
      };
        
      // Envia a segunda caixa para pegar o Token (Agora a função existe!)
      const responseLogin = await login(payloadLogin);
  
      localStorage.setItem("token", responseLogin.access_token);
      localStorage.removeItem("dealflow_rascunho_registro");

      // Envia a logo selecionada no passo 3 (se houver) agora que já
      // temos o token de autenticação salvo
      if (formData.logo) {
        try {
          await uploadLogo(formData.logo);
        } catch (logoError) {
          console.log("Erro ao enviar logo:", logoError);
          // não bloqueia o cadastro por causa da logo - o usuário
          // pode enviar depois em Configurações
        }
      }
  
      navigate("/dashboard");
  
    } catch (error) {
      console.log(error);

      const detalhe = error?.response?.data?.detail;
      const mensagem = typeof detalhe === "string" ? detalhe : "";
      const mensagemNormalizada = mensagem.toLowerCase();

      // Já existe um cadastro com este CPF: volta para o passo 1
      // (onde o campo CPF está) e mostra o erro perto do campo.
      if (mensagemNormalizada.includes("cpf")) {
        setCurrentStep(1);
        setErroApi({ campo: "cpf", mensagem: mensagem || "CPF já cadastrado." });
        return;
      }

      // Já existe um cadastro com este e-mail: também é exibido no passo 1.
      if (mensagemNormalizada.includes("email") || mensagemNormalizada.includes("e-mail")) {
        setCurrentStep(1);
        setErroApi({ campo: "email", mensagem: mensagem || "Email já cadastrado." });
        return;
      }

      // Já existe um cadastro com este CNPJ: volta para o passo 2.
      if (mensagemNormalizada.includes("cnpj")) {
        setCurrentStep(2);
        setErroApi({ campo: "cnpj", mensagem: mensagem || "CNPJ já cadastrado." });
        return;
      }

      showToast(mensagem || "Erro ao cadastrar ou realizar login automático.", { tipo: "erro" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#092B1A] to-gray-200 p-4">
      <div className="w-full max-w-lg bg-[#0B3B24] border-2 border-amber-500 rounded-2xl p-8 shadow-2xl relative">

        <StepIndicator currentStep={currentStep} />

        {currentStep === 1 && (
          <div className="animate-fade-in">
            <Step1Personal
              formData={formData}
              handleChange={handleChange}
              nextStep={nextStep}
              erroApi={erroApi}
              limparErroApi={() => setErroApi(null)}
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
              erroApi={erroApi}
              limparErroApi={() => setErroApi(null)}
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
              enviando={enviando}
            />
          </div>
        )}

      </div>
    </div>
  );
}
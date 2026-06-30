import logoImg from "../../../assets/logo.png"; 

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex justify-between items-start mb-8">
      
      {/* Bolinhas de Progresso */}
      <div className="flex space-x-3 mt-2">
        {[1, 2, 3].map((stepNumber) => (
          <div
            key={stepNumber}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
              currentStep === stepNumber
                ? "bg-amber-500 text-[#0B3B24]" 
                : currentStep > stepNumber
                ? "bg-amber-700 text-white" 
                : "bg-gray-600 text-gray-300" 
            }`}
          >
            {stepNumber}
          </div>
        ))}
      </div>

      {/* Logo */}
      <div className="flex flex-col items-end">
        <img src={logoImg} alt="Logo DealFlow" className="w-32 h-auto" />
      </div>
    </div>
  );
}
import { useState } from "react";

export default function Step2Company({ formData, handleChange, nextStep, prevStep }) {
  const [errors, setErrors] = useState({});

  const validate = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!formData.nomeEmpresa) newErrors.nomeEmpresa = "Nome da empresa é obrigatório.";
    if (!formData.cnpj) newErrors.cnpj = "CNPJ é obrigatório.";
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

      {/* Nome da Empresa */}
      <div>
        <label className="block text-white text-sm mb-1">Nome da Empresa / Razão Social <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="nomeEmpresa"
          value={formData.nomeEmpresa}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-white text-gray-900 focus:outline-none"
        />
        {errors.nomeEmpresa && <p className="text-red-400 text-xs mt-1">{errors.nomeEmpresa}</p>}
      </div>

      {/* CNPJ */}
      <div>
        <label className="block text-white text-sm mb-1">CNPJ <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="cnpj"
          value={formData.cnpj}
          onChange={handleChange}
          placeholder="xx.xxx.xxx/0001-xx"
          className="w-full p-3 rounded-lg bg-white text-gray-900 focus:outline-none"
        />
        {errors.cnpj && <p className="text-red-400 text-xs mt-1">{errors.cnpj}</p>}
      </div>

      {/* Endereço */}
      <div>
        <label className="block text-white text-sm mb-1">Endereço Completo <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="endereco"
          value={formData.endereco}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-white text-gray-900 focus:outline-none"
        />
        {errors.endereco && <p className="text-red-400 text-xs mt-1">{errors.endereco}</p>}
      </div>

      {/* Tipo de Hospedagem */}
      <div>
        <label className="block text-white text-sm mb-1">Tipo de Hospedagem <span className="text-red-500">*</span></label>
        <select
          name="tipoHospedagem"
          value={formData.tipoHospedagem}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-white text-gray-900 focus:outline-none appearance-none"
        >
          <option value="">Selecione</option>
          <option value="hotel">Hotel</option>
          <option value="pousada">Pousada</option>
          <option value="resort">Resort</option>
          <option value="hostel">Hostel</option>
        </select>
        {errors.tipoHospedagem && <p className="text-red-400 text-xs mt-1">{errors.tipoHospedagem}</p>}
      </div>

      <div className="flex justify-between items-center pt-4">
        <button type="button" onClick={prevStep} className="text-gray-300 hover:text-white transition-colors">
          ← Voltar
        </button>
        <button type="submit" className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-lg text-[#0B3B24] font-bold transition-colors">
          Próximo →
        </button>
      </div>
    </form>
  );
}
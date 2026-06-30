import { useState } from "react";

export default function Step3Logo({ formData, setFormData, prevStep, handleFinalSubmit, enviando }) {
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    // Guarda o objeto File físico no estado pai
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, logo: e.target.files[0] }));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-white text-xl font-bold">Logo do Hotel</h2>

      <div 
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${
          dragActive ? "border-amber-500 bg-amber-950/20" : "border-gray-400 bg-transparent"
        }`}
      >
        {/* Ícone profissional de Imagem/Moldura em SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3 text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>

        <p className="text-gray-300 text-sm">Logo com fundo transparente</p>
        <p className="text-gray-400 text-xs mb-4">250 x 100px | PNG até 100kb</p>
        
        <label className="cursor-pointer bg-white text-gray-700 hover:bg-gray-100 px-4 py-2 rounded border text-sm font-medium transition-colors">
          Procurar Arquivo
          <input type="file" accept="image/png" className="hidden" onChange={handleFileChange} />
        </label>

        {/* CORREÇÃO: Usamos o .name para exibir apenas o texto do nome do arquivo na interface */}
        {formData.logo && (
          <p className="text-amber-400 text-xs mt-3 font-semibold">✓ Selecionado: {formData.logo.name}</p>
        )}
      </div>

      <div className="flex justify-between items-center pt-4">
        <button type="button" onClick={prevStep} className="text-gray-300 hover:text-white transition-colors">
          ← Voltar
        </button>
        <button 
          type="button" 
          onClick={handleFinalSubmit} 
          disabled={enviando}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-[#0B3B24] font-bold transition-colors"
        >
          {enviando ? "Enviando..." : "Configurar Meu Hotel"}
        </button>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Logo do sistema
import logoImg from "../../assets/logo.png";

export default function Login() {
  // Hook usado para navegar entre páginas
  const navigate = useNavigate();

  // Dados digitados no formulário de login
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Guarda mensagens de erro dos campos
  const [errors, setErrors] = useState({});

  // Controla se a senha aparece ou fica oculta
  const [showPassword, setShowPassword] = useState(false);

  // Atualiza os valores dos campos conforme o usuário digita
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Remove o erro do campo quando o usuário começa a corrigir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Valida o formulário e redireciona para o Dashboard
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "O email é obrigatório.";
    }

    if (!formData.password) {
      newErrors.password = "A senha é obrigatória.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Formato de email inválido.";
    }

    // Se tiver erro, mostra na tela e impede o login
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    /*
      Integração futura com o backend:
      aqui depois será feita a chamada para a API de login.
      Exemplo:
      const response = await api.post("/login", formData);

      Por enquanto, se passar nas validações do FrontEnd,
      o usuário é enviado para o Dashboard.
    */
    console.log("Dados prontos para envio ao backend:", formData);

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#092B1A] to-gray-200 p-4">
      <div className="w-full max-w-lg bg-[#0B3B24] border-2 border-amber-500 rounded-2xl p-8 shadow-2xl">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={logoImg}
            alt="Logo DealFlow"
            className="w-48 h-auto mb-2"
          />
        </div>

        <h1 className="text-white text-2xl font-bold mb-6">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Campo de email */}
          <div>
            <label className="block text-white text-sm mb-1">
              Email Empresarial <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-2 border-red-500 focus:ring-red-500"
                  : "focus:ring-amber-500"
              }`}
              placeholder="exemplo@hotel.com"
            />

            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Campo de senha */}
          <div>
            <label className="block text-white text-sm mb-1">
              Senha <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-3 pr-12 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-2 border-red-500 focus:ring-red-500"
                    : "focus:ring-amber-500"
                }`}
                placeholder="••••••••"
              />

              {/* Botão para mostrar ou esconder a senha */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  // Ícone de olho cortado
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  // Ícone de olho aberto
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Links auxiliares */}
          <div className="flex justify-between items-center text-sm mt-2">
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Esqueceu a senha?
            </a>

            <Link
              to="/registro"
              className="text-amber-500 hover:text-amber-400 font-semibold transition-colors"
            >
              Criar Conta
            </Link>
          </div>

          {/* Botão de envio */}
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-[#0B3B24] font-bold py-3 px-4 rounded-lg transition-colors mt-6"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
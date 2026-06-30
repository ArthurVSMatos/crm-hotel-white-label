import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo.png";
import { login } from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.email) newErrors.email = "O email é obrigatório.";
    if (!formData.password) newErrors.password = "A senha é obrigatória.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Formato de email inválido.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      // 🔥 LOGIN REAL
      const response = await login(formData);

      console.log("LOGIN OK:", response);

      // 🔐 token (flexível pra backend diferente)
      localStorage.setItem(
        "token",
        response.access_token || response.token
      );

      // 👤 usuário opcional
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      navigate("/dashboard");

    } catch (error) {
      console.log("ERRO LOGIN:", error);

      setErrors({
        api: error?.response?.data?.detail || error.message || "Erro ao fazer login",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#092B1A] to-gray-200 p-4">

      <div className="w-full max-w-lg bg-[#0B3B24] border-2 border-amber-500 rounded-2xl p-8 shadow-2xl">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <img src={logoImg} alt="Logo" className="w-48 h-auto" />
        </div>

        <h1 className="text-white text-2xl font-bold mb-6">Login</h1>

        {/* ERRO API */}
        {errors.api && (
          <div className="bg-red-500 text-white p-2 rounded mb-3 text-sm">
            {errors.api}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div>
            <label className="block text-white text-sm mb-1">
              Email <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white text-black"
              placeholder="exemplo@hotel.com"
            />

            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email}</p>
            )}
          </div>

          {/* SENHA */}
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
                className="w-full p-3 rounded-lg bg-white text-black pr-12"
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500"
              >
                👁
              </button>
            </div>

            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password}</p>
            )}
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-lg"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {/* LINKS */}
          <div className="flex justify-between text-sm mt-3">
            <Link to="/esqueci-senha" className="text-gray-300 hover:text-white transition-colors">
              Esqueceu a senha?
            </Link>

            <Link to="/registro" className="text-amber-400">
              Criar conta
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}
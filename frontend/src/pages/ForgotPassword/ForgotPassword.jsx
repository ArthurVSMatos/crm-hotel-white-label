import { useState } from "react";
import { Link } from "react-router-dom";
import logoImg from "../../assets/logo.png";
import { forgotPassword } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email) {
      setErro("Informe o seu e-mail.");
      return;
    }

    setErro("");
    setEnviando(true);

    try {
      // Por segurança, o backend sempre responde com a mesma mensagem
      // genérica, exista ou não uma conta com esse e-mail.
      await forgotPassword(email);
      setEnviado(true);
    } catch (error) {
      setErro(
        error?.response?.data?.detail ||
          "Não foi possível enviar o e-mail. Tente novamente em alguns instantes."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#092B1A] to-gray-200 p-4">
      <div className="w-full max-w-lg bg-[#0B3B24] border-2 border-amber-500 rounded-2xl p-8 shadow-2xl">

        <div className="flex flex-col items-center mb-8">
          <img src={logoImg} alt="Logo" className="w-48 h-auto" />
        </div>

        <h1 className="text-white text-2xl font-bold mb-2">Esqueceu a senha?</h1>
        <p className="text-gray-300 text-sm mb-6">
          Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
        </p>

        {enviado ? (
          <div className="space-y-5">
            <div className="bg-green-600/20 border border-green-500 text-green-200 p-4 rounded-lg text-sm">
              Se existir uma conta vinculada a <strong>{email}</strong>, enviamos
              as instruções de redefinição de senha. Verifique sua caixa de
              entrada (e a pasta de spam).
            </div>

            <Link
              to="/login"
              className="block text-center w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-lg transition-colors"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white text-sm mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (erro) setErro("");
                }}
                className="w-full p-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="exemplo@hotel.com"
              />
              {erro && <p className="text-red-400 text-xs mt-1">{erro}</p>}
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-black font-bold py-3 rounded-lg transition-colors"
            >
              {enviando ? "Enviando..." : "Enviar link de recuperação"}
            </button>

            <div className="text-center text-sm">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                ← Voltar para o login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logoImg from "../../assets/logo.png";
import { resetPassword } from "../../services/authService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!token) {
      setErro("Link inválido ou incompleto. Solicite a recuperação de senha novamente.");
      return;
    }

    if (novaSenha.length < 8) {
      setErro("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setErro("");
    setEnviando(true);

    try {
      await resetPassword({ token, novaSenha });
      setSucesso(true);

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (error) {
      setErro(
        error?.response?.data?.detail ||
          "Não foi possível redefinir a senha. O link pode ter expirado."
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

        <h1 className="text-white text-2xl font-bold mb-2">Criar nova senha</h1>
        <p className="text-gray-300 text-sm mb-6">
          Escolha uma nova senha para acessar sua conta.
        </p>

        {!token && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg text-sm mb-5">
            Este link está incompleto ou inválido. Solicite a recuperação de
            senha novamente na tela de login.
          </div>
        )}

        {sucesso ? (
          <div className="bg-green-600/20 border border-green-500 text-green-200 p-4 rounded-lg text-sm">
            Senha alterada com sucesso! Você será redirecionado para o login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white text-sm mb-1">
                Nova senha <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => {
                  setNovaSenha(e.target.value);
                  if (erro) setErro("");
                }}
                className="w-full p-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="No mínimo 8 caracteres"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-1">
                Confirmar nova senha <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => {
                  setConfirmarSenha(e.target.value);
                  if (erro) setErro("");
                }}
                className="w-full p-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Repita a nova senha"
              />
            </div>

            {erro && <p className="text-red-400 text-xs">{erro}</p>}

            <button
              type="submit"
              disabled={enviando || !token}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-black font-bold py-3 rounded-lg transition-colors"
            >
              {enviando ? "Salvando..." : "Redefinir senha"}
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

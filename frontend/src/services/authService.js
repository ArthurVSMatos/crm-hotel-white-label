  import api from "./api";

//login
export const login = async (payload) => {
  const response = await api.post("/auth/login", {
    email: payload.email,
    senha: payload.password,
  });

  return response.data;
};

//parte registro
export const register = async (payload) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

//checagem do cpf em tempo real 

export const checkCpf = async (cpf) => {
  const response = await api.get("/auth/check-cpf", { params: { cpf } });
  return response.data;
};

//checagem do cnpj tempoi real
export const checkCnpj = async (cnpj) => {
  const response = await api.get("/auth/check-cnpj", { params: { cnpj } });
  return response.data;
};

//checagem do email em tempor eal
export const checkEmail = async (email) => {
  const response = await api.get("/auth/check-email", { params: { email } });
  return response.data;
};

//usuario logado
export const me = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

//redefinir senha
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

//redefinir senha com o token enviado por email
export const resetPassword = async ({ token, novaSenha }) => {
  const response = await api.post("/auth/reset-password", {
    token,
    nova_senha: novaSenha,
  });
  return response.data;
};

//altera a senha
export const changePassword = async ({ senhaAtual, novaSenha }) => {
  const response = await api.post("/auth/change-password", {
    senha_atual: senhaAtual,
    nova_senha: novaSenha,
  });
  return response.data;
};
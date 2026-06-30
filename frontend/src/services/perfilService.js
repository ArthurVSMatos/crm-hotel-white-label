import api from "./api";

//busca os dados do usuário/hotel logado
export const buscarPerfil = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

//atualiza os dados do perfil
export const atualizarPerfil = async (payload) => {
  const response = await api.put("/hotel/", payload);
  return response.data;
};

//faz upload da logo e salva no banco
export const uploadLogo = async (arquivo) => {
  const formData = new FormData();
  formData.append("file", arquivo);
  const response = await api.post("/hotel/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

//remove a logo atual do hotel
export const removerLogoServidor = async () => {
  const response = await api.delete("/hotel/logo");
  return response.data;
};

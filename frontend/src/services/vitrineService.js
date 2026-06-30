import api from "./api";

//configuracao da vitirne

export const buscarConfigVitrine = async () => {
  const response = await api.get("/vitrine-config");
  return response.data;
};

export const atualizarConfigVitrine = async (payload) => {
  const response = await api.put("/vitrine-config", payload);
  return response.data;
};

//pagina publica sem login,usada na landing page do hotel

export const buscarVitrinePublica = async (slug) => {
  const response = await api.get(`/vitrine/${slug}`);
  return response.data;
};

import api from "./api";

export const listarQuartos = async () => {
  const response = await api.get("/quartos/");
  return response.data;
};

export const buscarQuarto = async (id) => {
  const response = await api.get(`/quartos/${id}`);
  return response.data;
};

export const criarQuarto = async (payload) => {
  const response = await api.post("/quartos/", payload);
  return response.data;
};

export const atualizarQuarto = async (id, payload) => {
  const response = await api.put(`/quartos/${id}`, payload);
  return response.data;
};

export const deletarQuarto = async (id) => {
  const response = await api.delete(`/quartos/${id}`);
  return response.data;
};

//faz upload da foto do quarto (usada na vitrine publica) e salva 
export const uploadImagemQuarto = async (id, arquivo) => {
  const formData = new FormData();
  formData.append("file", arquivo);
  const response = await api.post(`/quartos/${id}/imagem`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
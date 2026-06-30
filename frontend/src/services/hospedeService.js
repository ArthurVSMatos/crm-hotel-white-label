import api from "./api";

export const listarHospedes = async () => {
  const response = await api.get("/hospedes/");
  return response.data;
};

export const buscarHospede = async (id) => {
  const response = await api.get(`/hospedes/${id}`);
  return response.data;
};

export const criarHospede = async (payload) => {
  const response = await api.post("/hospedes/", payload);
  return response.data;
};

export const atualizarHospede = async (id, payload) => {
  const response = await api.put(`/hospedes/${id}`, payload);
  return response.data;
};

export const deletarHospede = async (id) => {
  const response = await api.delete(`/hospedes/${id}`);
  return response.data;
};
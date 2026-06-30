import api from "./api";

export const listarReservas = async () => {
  const response = await api.get("/reservas/");
  return response.data;
};

export const buscarReserva = async (id) => {
  const response = await api.get(`/reservas/${id}`);
  return response.data;
};

export const criarReserva = async (payload) => {
  const response = await api.post("/reservas/", payload);
  return response.data;
};

export const editarReserva = async (id, payload) => {
  const response = await api.put(`/reservas/${id}`, payload);
  return response.data;
};

export const finalizarReserva = async (id) => {
  const response = await api.put(`/reservas/${id}/finalizar`);
  return response.data;
};

export const cancelarReserva = async (id) => {
  const response = await api.put(`/reservas/${id}/cancelar`);
  return response.data;
};

export const deletarReserva = async (id) => {
  const response = await api.delete(`/reservas/${id}`);
  return response.data;
};
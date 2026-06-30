import api from "./api";

export const listarDespesas = async () => {
  const response = await api.get("/despesas/");
  return response.data;
};

export const criarDespesa = async (payload) => {
  const response = await api.post(
    "/despesas/",
    payload
  );

  return response.data;
};

export const deletarDespesa = async (id) => {
  const response = await api.delete(
    `/despesas/${id}`
  );

  return response.data;
};
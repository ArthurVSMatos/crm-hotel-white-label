import api from "./api";

export async function listarFinanceiro() {
  const response = await api.get("/financeiro");
  return response.data;
}

export async function criarDespesa(data) {
  const response = await api.post("/financeiro", data);
  return response.data;
}

export async function editarDespesa(id, data) {
  const response = await api.put(`/financeiro/${id}`, data);
  return response.data;
}

export async function deletarDespesa(id) {
  const response = await api.delete(`/financeiro/${id}`);
  return response.data;
}

import api from "./api";

export const obterHotel = async () => {
  const response = await api.get("/hotel/");
  return response.data;
};

export const atualizarHotel = async (payload) => {
  const response = await api.put("/hotel/", payload);
  return response.data;
};
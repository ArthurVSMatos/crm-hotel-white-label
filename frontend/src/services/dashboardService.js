import api from "./api";

export const obterDashboard = async () => {

  const response = await api.get(
    "/dashboard/"
  );

  return response.data;
};
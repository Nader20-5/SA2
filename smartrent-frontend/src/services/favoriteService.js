import api from "./api";

export const getFavorites = async () => {
  const response = await api.get("/favorites");
  return response.data;
};

export const addFavorite = async (propertyId) => {
  const response = await api.post(`/favorites/${propertyId}`);
  return response.data;
};

export const removeFavorite = async (propertyId) => {
  const response = await api.delete(`/favorites/${propertyId}`);
  return response.data;
};

export const toggleFavorite = async (propertyId, isFavorited) => {
  if (isFavorited) {
    return await addFavorite(propertyId);
  } else {
    return await removeFavorite(propertyId);
  }
};

export const isFavorited = async (propertyId) => {
  const response = await api.get(`/favorites/${propertyId}/check`);
  return response.data;
};

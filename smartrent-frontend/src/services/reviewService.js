import api from "./api";

export const getPropertyReviews = async (propertyId) => {
  const response = await api.get(`/reviews/property/${propertyId}`);
  return response.data;
};

export const createReview = async (propertyId, data) => {
  const response = await api.post(`/reviews/property/${propertyId}`, data);
  return response.data;
};

export const updateReview = async (reviewId, data) => {
  const response = await api.put(`/reviews/${reviewId}`, data);
  return response.data;
};

export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

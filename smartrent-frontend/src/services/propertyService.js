import api from "./api";

export const getAllProperties = async (params) => {
  const response = await api.get("/properties", { params });
  return response.data.content || response.data;
};

export const getPropertyById = async (id) => {
  const response = await api.get(`/properties/${id}`);
  return response.data;
};

export const createProperty = async (data) => {
  const response = await api.post("/properties", data);
  return response.data;
};

export const updateProperty = async (id, data) => {
  const response = await api.put(`/properties/${id}`, data);
  return response.data;
};

export const deleteProperty = async (id) => {
  const response = await api.delete(`/properties/${id}`);
  return response.data;
};

export const getMyProperties = async (params) => {
  const response = await api.get("/properties/landlord/me", { params });
  return response.data.content || response.data;
};

export const uploadPropertyImages = async (id, formData) => {
  const response = await api.post(`/properties/${id}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deletePropertyImage = async (propertyId, imageId) => {
  const response = await api.delete(`/properties/${propertyId}/images/${imageId}`);
  return response.data;
};

export const updatePropertyStatus = async (id, status) => {
  const response = await api.patch(`/properties/${id}/status`, null, {
    params: { status },
  });
  return response.data;
};

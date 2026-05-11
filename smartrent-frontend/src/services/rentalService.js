import api from "./api";

export const createRentalApplication = async (data) => {
  const response = await api.post("/rentals", data);
  return response.data;
};

export const getMyApplications = async (params) => {
  const response = await api.get("/rentals/my", { params });
  return response.data;
};

export const getApplicationById = async (id) => {
  const response = await api.get(`/rentals/${id}`);
  return response.data;
};

export const withdrawApplication = async (id) => {
  const response = await api.delete(`/rentals/${id}`);
  return response.data;
};

export const getLandlordApplications = async (params) => {
  const response = await api.get("/rentals/landlord", { params });
  return response.data;
};

export const approveRental = async (id) => {
  const response = await api.patch(`/rentals/${id}/approve`);
  return response.data;
};

export const rejectRental = async (id, reason) => {
  const response = await api.patch(`/rentals/${id}/reject`, { reason });
  return response.data;
};

export const uploadDocument = async (id, type, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`/rentals/${id}/documents`, formData, {
    params: { type },
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getBookedDates = async (propertyId) => {
  const response = await api.get(`/rentals/property/${propertyId}/booked-dates`);
  return response.data;
};

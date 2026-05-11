import api from "./api";

export const createVisit = async (data) => {
  const response = await api.post("/visits", data);
  return response.data;
};

export const getMyVisits = async (params) => {
  const response = await api.get("/visits/my", { params });
  return response.data;
};

export const cancelVisit = async (id) => {
  const response = await api.delete(`/visits/${id}`);
  return response.data;
};

export const getLandlordVisits = async (params) => {
  const response = await api.get("/visits/landlord", { params });
  return response.data;
};

export const approveVisit = async (id) => {
  const response = await api.patch(`/visits/${id}/approve`);
  return response.data;
};

export const rejectVisit = async (id, reason) => {
  const response = await api.patch(`/visits/${id}/reject`, { reason });
  return response.data;
};

export const rescheduleVisit = async (id, data) => {
  const response = await api.patch(`/visits/${id}/reschedule`, data);
  return response.data;
};

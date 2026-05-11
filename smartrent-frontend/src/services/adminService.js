import api from "./api";

export const getAllUsers = async (params) => {
  const response = await api.get("/admin/users", { params });
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await api.patch(`/admin/users/${id}/status`, { status });
  return response.data;
};

export const getPlatformStats = async () => {
  try {
    const [userStatsRes, propertyStatsRes] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/properties/admin/stats").catch(() => ({ data: { totalProperties: 0, pendingApprovals: 0 } }))
    ]);
    return {
      ...userStatsRes.data,
      ...propertyStatsRes.data,
    };
  } catch (error) {
    console.error("Failed to fetch platform stats:", error);
    throw error;
  }
};

export const getAllPropertiesAdmin = async (params) => {
  const response = await api.get("/properties/admin/all", { params });
  return response.data;
};

export const updatePropertyStatusAdmin = async (propertyId, status, reason = "") => {
  const response = await api.patch(`/properties/${propertyId}/status`, null, {
    params: { status, reason }
  });
  return response.data;
};

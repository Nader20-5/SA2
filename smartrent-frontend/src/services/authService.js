import api from "./api";

/**
 * Normalizes the flat AuthResponseDto from the backend
 * into the { token, user } shape the frontend expects.
 *
 * Backend returns: { token, userId, email, firstName, lastName, role }
 * Frontend needs:  { token, user: { id, fullName, email, role } }
 */
const normalizeAuthResponse = (data) => ({
  token: data.token,
  user: {
    id: data.userId,
    fullName: `${data.firstName} ${data.lastName}`.trim(),
    email: data.email,
    role: data.role,
  },
});

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return normalizeAuthResponse(response.data);
};

export const register = async (formData) => {
  const payload = {
    firstName: formData.firstName || "",
    lastName: formData.lastName || "",
    email: formData.email,
    password: formData.password,
    role: (formData.role || "TENANT").toUpperCase(),
    phone: formData.phoneNumber || null,
  };

  const response = await api.post("/auth/register", payload);
  return normalizeAuthResponse(response.data);
};

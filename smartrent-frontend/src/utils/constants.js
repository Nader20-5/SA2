export const API_URL = import.meta.env.VITE_API_URL || "/api";

export const ROLES = {
  ADMIN: "ADMIN",
  LANDLORD: "LANDLORD",
  TENANT: "TENANT",
};

export const PROPERTY_TYPES = {
  APARTMENT: "APARTMENT",
  HOUSE: "HOUSE",
  STUDIO: "STUDIO",
  VILLA: "VILLA",
  CONDO: "CONDO",
};

export const PROPERTY_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RENTED: "RENTED",
};

export const VISIT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
};

export const RENTAL_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
};

export const DOCUMENT_TYPES = {
  PROOF_OF_INCOME: "PROOF_OF_INCOME",
  NATIONAL_ID: "NATIONAL_ID",
  EMPLOYMENT_LETTER: "EMPLOYMENT_LETTER",
  OTHER: "OTHER",
};

export const EMPLOYMENT_STATUS = {
  EMPLOYED: "EMPLOYED",
  SELF_EMPLOYED: "SELF_EMPLOYED",
  STUDENT: "STUDENT",
  RETIRED: "RETIRED",
  OTHER: "OTHER",
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 0,
};

/**
 * Resolves property image URLs to a loadable path.
 * Handles absolute URLs, /uploads/ paths, and legacy "uploads/" paths.
 */
export const getImageUrl = (url) => {
  if (!url) return null;
  // Already an absolute URL (http/https)
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Already starts with /uploads/ — works with proxy/gateway
  if (url.startsWith("/uploads/")) return url;
  // Legacy: "uploads/filename.jpg" — add leading slash
  if (url.startsWith("uploads/")) return "/" + url;
  // Fallback: return as-is
  return url;
};

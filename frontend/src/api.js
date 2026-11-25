// Keep all communication with the Django server in this file.
const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw data;
  return data;
}

export function getOptions() {
  return request("/api/options/");
}

export function getPatients(filters) {
  const query = new URLSearchParams();
  if (filters.search.trim()) query.set("search", filters.search.trim());

  ["ward", "department", "doctor"].forEach((field) => {
    if (filters[field]) query.set(field, filters[field]);
  });

  return request(`/api/patients/?${query.toString()}`);
}

export function savePatient(patientId, patientData) {
  const url = patientId
    ? `/api/patients/${patientId}/`
    : "/api/patients/";
  const method = patientId ? "PUT" : "POST";

  return request(url, { method, body: JSON.stringify(patientData) });
}

export function dischargePatient(patientId) {
  return request(`/api/patients/${patientId}/`, {
    method: "PATCH",
    body: JSON.stringify({ status: "Discharged" }),
  });
}

export function deletePatient(patientId) {
  return request(`/api/patients/${patientId}/`, { method: "DELETE" });
}

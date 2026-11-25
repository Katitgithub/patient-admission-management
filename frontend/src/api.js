// This file is the only place that talks to the Django server.
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, method = "GET", data = null) {
  const options = { method };

  if (data !== null) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${path}`, options);

  if (response.status === 204) return null;

  const result = await response.json();
  if (!response.ok) throw result;
  return result;
}

export function getOptions() {
  return request("/api/options/");
}

export function getPatients(filters) {
  const query = new URLSearchParams();

  if (filters.search) query.set("search", filters.search);
  if (filters.ward) query.set("ward", filters.ward);
  if (filters.department) query.set("department", filters.department);
  if (filters.doctor) query.set("doctor", filters.doctor);

  return request(`/api/patients/?${query.toString()}`);
}

export function savePatient(id, patient) {
  if (id) {
    return request(`/api/patients/${id}/`, "PUT", patient);
  }

  return request("/api/patients/", "POST", patient);
}

export function dischargePatient(id) {
  return request(`/api/patients/${id}/`, "PATCH", { status: "Discharged" });
}

export function deletePatient(id) {
  return request(`/api/patients/${id}/`, "DELETE");
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Bed, Check, ChevronDown, CirclePlus, Search, Users, X } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const blankForm = () => ({ name: "", age: "", gender: "", ward: "", department: "", doctor: "", admission_date: "", status: "Admitted" });
const localDate = new Date();
const today = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw data;
  return data;
}

function validate(form) {
  const errors = {};
  if (!/^\p{L}+(?: \p{L}+)*$/u.test(form.name.trim())) errors.name = "Enter letters and spaces only.";
  if (form.age === "" || !Number.isInteger(Number(form.age)) || Number(form.age) < 0 || Number(form.age) > 120) errors.age = "Enter an age from 0 to 120.";
  for (const field of ["gender", "ward", "department", "doctor"])
    if (!form[field]) errors[field] = "Please select an option.";
  if (!form.admission_date) errors.admission_date = "Admission date is required.";
  else if (form.admission_date > today) errors.admission_date = "Date cannot be in the future.";
  return errors;
}

function readableError(error) {
  if (typeof error === "string") return error;
  if (Array.isArray(error)) return error.join(" ");
  if (error && typeof error === "object") return Object.entries(error).map(([key, value]) => `${key.replaceAll("_", " ")}: ${readableError(value)}`).join(" · ");
  return "Something went wrong. Please try again.";
}

function Field({ label, error, children }) {
  return <label className="field"><span>{label}</span>{children}{error && <small className="field-error">{readableError(error)}</small>}</label>;
}

export default function App() {
  const [patients, setPatients] = useState([]);
  const [options, setOptions] = useState({ genders: [], wards: [], departments: [], doctors: [] });
  const [filters, setFilters] = useState({ search: "", ward: "", department: "", doctor: "" });
  const [form, setForm] = useState(blankForm);
  const [editing, setEditing] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPatients = useCallback(async (current) => {
    const query = new URLSearchParams();
    if (current.search.trim()) query.set("search", current.search.trim());
    for (const field of ["ward", "department", "doctor"]) if (current[field]) query.set(field, current[field]);
    setLoading(true);
    try {
      const data = await api(`/api/patients/?${query}`);
      setPatients(Array.isArray(data) ? data : data.results || []);
      setError("");
    } catch (e) { setError(readableError(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { api("/api/options/").then(setOptions).catch((e) => setError(`Could not load form options: ${readableError(e)}`)); }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => loadPatients(filters), 250);
    return () => window.clearTimeout(timer);
  }, [filters, loadPatients]);

  const admittedCount = useMemo(() => patients.filter((p) => p.status === "Admitted").length, [patients]);
  const dischargedCount = useMemo(() => patients.filter((p) => p.status === "Discharged").length, [patients]);
  const updateFilter = (key, value) => setFilters((old) => ({ ...old, [key]: value }));
  const updateForm = (key, value) => { setForm((old) => ({ ...old, [key]: value })); setFormErrors((old) => ({ ...old, [key]: undefined })); };
  const closeForm = () => { setForm(blankForm()); setEditing(null); setFormErrors({}); setNotice(""); };

  async function submit(event) {
    event.preventDefault();
    const errors = validate(form);
    setFormErrors(errors);
    setNotice("");
    if (Object.keys(errors).length) return;
    setSaving(true);
    const payload = { ...form, name: form.name.trim(), age: Number(form.age) };
    try {
      await api(`/api/patients/${editing ? `${editing}/` : ""}`, { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) });
      const wasEditing = Boolean(editing);
      closeForm();
      setNotice(wasEditing ? "Patient record updated." : "Patient added successfully.");
      await loadPatients(filters);
    } catch (e) {
      setFormErrors(e && typeof e === "object" ? e : {});
      setError(readableError(e));
    } finally { setSaving(false); }
  }

  function startEdit(patient) {
    setEditing(patient.id);
    setForm({ name: patient.name, age: String(patient.age), gender: patient.gender, ward: patient.ward,
      department: patient.department, doctor: patient.doctor, admission_date: patient.admission_date, status: patient.status });
    setFormErrors({}); setNotice("");
    document.getElementById("patient-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function removePatient(patient) {
    if (!window.confirm(`Delete ${patient.name}'s patient record? This cannot be undone.`)) return;
    try { await api(`/api/patients/${patient.id}/`, { method: "DELETE" }); setNotice("Patient record deleted."); await loadPatients(filters); }
    catch (e) { setError(readableError(e)); }
  }

  async function discharge(patient) {
    if (!window.confirm(`Mark ${patient.name} as discharged?`)) return;
    try { await api(`/api/patients/${patient.id}/`, { method: "PATCH", body: JSON.stringify({ status: "Discharged" }) }); setNotice(`${patient.name} marked as discharged.`); await loadPatients(filters); }
    catch (e) { setError(readableError(e)); }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top" aria-label="CareDesk home"><span className="brand-mark"><Activity size={21} /></span><span>care<span className="brand-light">desk</span></span></a>
      <div className="side-label">WORKSPACE</div>
      <a className="nav-item active" href="#patients"><Users size={18} /> Patient records</a>
      <div className="sidebar-note"><div className="note-icon"><Activity size={17} /></div><strong>Care starts with clarity.</strong><p>Keep every admission organized and up to date.</p></div>
      <div className="sidebar-footer"><span className="online-dot" /> Patient management</div>
    </aside>

    <main className="main" id="top">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Patient records</b></div><div className="topbar-right"><span className="today-label">Admissions overview</span><span className="avatar">H</span></div></header>
      <div className="content">
        <section className="page-heading"><div><div className="eyebrow">HOSPITAL OPERATIONS</div><h1>Patient admissions</h1><p className="subtitle">A clear view of every patient in your care.</p></div><a className="button button-primary heading-button" href="#patient-form" onClick={closeForm}><CirclePlus size={17} /> Add patient</a></section>

        {error && <div className="alert alert-error" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss"><X size={16} /></button></div>}
        {notice && <div className="alert alert-success" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16} /></button></div>}

        <section className="stat-grid" aria-label="Patient summary">
          <article className="stat-card"><div className="stat-icon icon-blue"><Users size={19} /></div><div className="stat-label">Patients shown</div><div className="stat-value">{loading ? "—" : patients.length}</div><div className="stat-foot">Matching your current view</div></article>
          <article className="stat-card"><div className="stat-icon icon-green"><Activity size={19} /></div><div className="stat-label">Currently admitted</div><div className="stat-value">{loading ? "—" : admittedCount}</div><div className="stat-foot">In the current results</div></article>
          <article className="stat-card"><div className="stat-icon icon-amber"><Bed size={19} /></div><div className="stat-label">Discharged</div><div className="stat-value">{loading ? "—" : dischargedCount}</div><div className="stat-foot">In the current results</div></article>
        </section>

        <section className="panel form-panel" id="patient-form">
          <div className="panel-heading"><div><div className="panel-kicker">PATIENT DETAILS</div><h2>{editing ? "Edit patient" : "Add a patient"}</h2><p>Enter the admission details below.</p></div>{editing && <button className="button button-quiet" type="button" onClick={closeForm}><X size={16} /> Cancel edit</button>}</div>
          <form onSubmit={submit} noValidate>
            <div className="form-grid">
              <Field label="Patient name *" error={formErrors.name}><input value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="e.g. Ananya Sharma" autoComplete="off" /></Field>
              <Field label="Age *" error={formErrors.age}><input type="number" min="0" max="120" step="1" value={form.age} onChange={(e) => updateForm("age", e.target.value)} placeholder="Age in years" /></Field>
              <Field label="Gender *" error={formErrors.gender}><div className="select-wrap"><select value={form.gender} onChange={(e) => updateForm("gender", e.target.value)}><option value="">Select gender</option>{options.genders.map((v) => <option key={v}>{v}</option>)}</select><ChevronDown size={16} /></div></Field>
              <Field label="Ward *" error={formErrors.ward}><div className="select-wrap"><select value={form.ward} onChange={(e) => updateForm("ward", e.target.value)}><option value="">Select ward</option>{options.wards.map((v) => <option key={v}>{v}</option>)}</select><ChevronDown size={16} /></div></Field>
              <Field label="Department *" error={formErrors.department}><div className="select-wrap"><select value={form.department} onChange={(e) => updateForm("department", e.target.value)}><option value="">Select department</option>{options.departments.map((v) => <option key={v}>{v}</option>)}</select><ChevronDown size={16} /></div></Field>
              <Field label="Doctor *" error={formErrors.doctor}><div className="select-wrap"><select value={form.doctor} onChange={(e) => updateForm("doctor", e.target.value)}><option value="">Select doctor</option>{options.doctors.map((v) => <option key={v}>{v}</option>)}</select><ChevronDown size={16} /></div></Field>
              <Field label="Admission date *" error={formErrors.admission_date}><input type="date" max={today} value={form.admission_date} onChange={(e) => updateForm("admission_date", e.target.value)} /></Field>
              <Field label="Status *" error={formErrors.status}><div className="select-wrap"><select value={form.status} onChange={(e) => updateForm("status", e.target.value)}><option>Admitted</option><option>Discharged</option></select><ChevronDown size={16} /></div></Field>
            </div>
            <div className="form-actions"><span className="required-hint">* Required fields</span><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : editing ? <><Check size={16} /> Save changes</> : <><CirclePlus size={16} /> Add patient</>}</button></div>
          </form>
        </section>

        <section className="panel records-panel" id="patients">
          <div className="records-heading"><div><div className="panel-kicker">ADMISSION DIRECTORY</div><h2>All patients <span className="count-pill">{loading ? "…" : patients.length}</span></h2></div></div>
          <div className="filters">
            <label className="search-box"><Search size={17} /><input aria-label="Search patients by name" placeholder="Search by patient name…" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} />{filters.search && <button type="button" onClick={() => updateFilter("search", "")} aria-label="Clear search"><X size={15} /></button>}</label>
            <div className="filter-select"><select aria-label="Filter by ward" value={filters.ward} onChange={(e) => updateFilter("ward", e.target.value)}><option value="">All wards</option>{options.wards.map((v) => <option key={v}>{v}</option>)}</select><ChevronDown size={15} /></div>
            <div className="filter-select"><select aria-label="Filter by department" value={filters.department} onChange={(e) => updateFilter("department", e.target.value)}><option value="">All departments</option>{options.departments.map((v) => <option key={v}>{v}</option>)}</select><ChevronDown size={15} /></div>
            <div className="filter-select"><select aria-label="Filter by doctor" value={filters.doctor} onChange={(e) => updateFilter("doctor", e.target.value)}><option value="">All doctors</option>{options.doctors.map((v) => <option key={v}>{v}</option>)}</select><ChevronDown size={15} /></div>
            <button className="button button-quiet clear-button" onClick={() => setFilters({ search: "", ward: "", department: "", doctor: "" })}>Clear</button>
          </div>
          <div className="table-wrap"><table><thead><tr><th>PATIENT</th><th>AGE / GENDER</th><th>WARD</th><th>DEPARTMENT</th><th>DOCTOR</th><th>ADMITTED</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{loading ? <tr><td colSpan="8" className="table-message">Loading patient records…</td></tr> : patients.length === 0 ? <tr><td colSpan="8" className="table-message empty-state"><span className="empty-icon"><Users size={23} /></span><strong>No patients found</strong><span>Try changing the search or filters, or add a patient above.</span></td></tr> : patients.map((patient) => <tr key={patient.id}>
              <td><div className="patient-cell"><span className="patient-avatar">{patient.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</span><span className="patient-name">{patient.name}</span></div></td>
              <td><span className="age-gender">{patient.age} yrs <span>·</span> {patient.gender}</span></td><td><span className="ward-tag">{patient.ward}</span></td><td>{patient.department}</td><td>{patient.doctor}</td>
              <td className="date-cell">{new Date(`${patient.admission_date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
              <td><span className={`status-badge ${patient.status === "Admitted" ? "status-admitted" : "status-discharged"}`}><i />{patient.status}</span></td>
              <td><div className="row-actions"><button title="Edit patient" aria-label={`Edit ${patient.name}`} onClick={() => startEdit(patient)} className="action-link">Edit</button>{patient.status === "Admitted" && <button title="Mark discharged" aria-label={`Discharge ${patient.name}`} onClick={() => discharge(patient)} className="action-link discharge-link">Discharge</button>}<button title="Delete patient" aria-label={`Delete ${patient.name}`} onClick={() => removePatient(patient)} className="action-delete"><X size={15} /></button></div></td>
            </tr>)}</tbody>
          </table></div>
          <div className="table-footer"><span>Showing {patients.length} patient{patients.length === 1 ? "" : "s"}</span><span><i className="online-dot" /> Records saved automatically</span></div>
        </section>
        <footer className="page-footer">CareDesk <span>·</span> Patient admission management</footer>
      </div>
    </main>
  </div>;
}

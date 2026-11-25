import { useEffect, useState } from "react";
import { Activity, Bed, CirclePlus, Users, X } from "lucide-react";
import { deletePatient, dischargePatient, getOptions, getPatients, savePatient } from "./api.js";
import PatientForm from "./PatientForm.jsx";
import PatientTable from "./PatientTable.jsx";

const emptyOptions = { genders: [], wards: [], departments: [], doctors: [] };
const emptyFilters = { search: "", ward: "", department: "", doctor: "" };

function getErrorMessage(error) {
  if (typeof error === "string") return error;
  if (error && error.detail) return error.detail;
  return "Something went wrong. Please try again.";
}

export default function App() {
  const [patients, setPatients] = useState([]);
  const [options, setOptions] = useState(emptyOptions);
  const [filters, setFilters] = useState(emptyFilters);
  const [editingPatient, setEditingPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Load dropdown choices once when the page first opens.
  useEffect(() => {
    getOptions()
      .then(setOptions)
      .catch((loadError) => setError(getErrorMessage(loadError)));
  }, []);

  // Reload patients when a filter changes or after a create/edit/delete action.
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      getPatients(filters)
        .then(setPatients)
        .catch((loadError) => setError(getErrorMessage(loadError)))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [filters, refreshCount]);

  function changeFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  async function handleSave(patientData) {
    try {
      await savePatient(editingPatient?.id, patientData);
      setEditingPatient(null);
      setNotice(editingPatient ? "Patient record updated." : "Patient added successfully.");
      setError("");
      setRefreshCount((count) => count + 1);
    } catch (saveError) {
      throw saveError;
    }
  }

  async function handleDelete(patient) {
    const confirmed = window.confirm(`Delete ${patient.name}'s patient record?`);
    if (!confirmed) return;

    try {
      await deletePatient(patient.id);
      setNotice("Patient record deleted.");
      setRefreshCount((count) => count + 1);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  }

  async function handleDischarge(patient) {
    const confirmed = window.confirm(`Mark ${patient.name} as discharged?`);
    if (!confirmed) return;

    try {
      await dischargePatient(patient.id);
      setNotice(`${patient.name} marked as discharged.`);
      setRefreshCount((count) => count + 1);
    } catch (dischargeError) {
      setError(getErrorMessage(dischargeError));
    }
  }

  function handleEdit(patient) {
    setNotice("");
    setEditingPatient(patient);
    document.getElementById("patient-form")?.scrollIntoView({ behavior: "smooth" });
  }

  const admittedCount = patients.filter((patient) => patient.status === "Admitted").length;
  const dischargedCount = patients.filter((patient) => patient.status === "Discharged").length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="CareDesk home">
          <span className="brand-mark"><Activity size={21} /></span>
          <span>care<span className="brand-light">desk</span></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <a className="nav-item active" href="#patients"><Users size={18} /> Patient records</a>
        <div className="sidebar-note">
          <div className="note-icon"><Activity size={17} /></div>
          <strong>Care starts with clarity.</strong>
          <p>Keep every admission organized and up to date.</p>
        </div>
        <div className="sidebar-footer"><span className="online-dot" /> Patient management</div>
      </aside>

      <main className="main" id="top">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <b>Patient records</b></div>
          <div className="topbar-right"><span className="today-label">Admissions overview</span><span className="avatar">H</span></div>
        </header>

        <div className="content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">HOSPITAL OPERATIONS</div>
              <h1>Patient admissions</h1>
              <p className="subtitle">A clear view of every patient in your care.</p>
            </div>
            <a className="button button-primary heading-button" href="#patient-form" onClick={() => setEditingPatient(null)}>
              <CirclePlus size={17} /> Add patient
            </a>
          </section>

          {error && <div className="alert alert-error" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss"><X size={16} /></button></div>}
          {notice && <div className="alert alert-success" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16} /></button></div>}

          <section className="stat-grid" aria-label="Patient summary">
            <article className="stat-card"><div className="stat-icon icon-blue"><Users size={19} /></div><div className="stat-label">Patients shown</div><div className="stat-value">{loading ? "—" : patients.length}</div><div className="stat-foot">Matching your current view</div></article>
            <article className="stat-card"><div className="stat-icon icon-green"><Activity size={19} /></div><div className="stat-label">Currently admitted</div><div className="stat-value">{loading ? "—" : admittedCount}</div><div className="stat-foot">In the current results</div></article>
            <article className="stat-card"><div className="stat-icon icon-amber"><Bed size={19} /></div><div className="stat-label">Discharged</div><div className="stat-value">{loading ? "—" : dischargedCount}</div><div className="stat-foot">In the current results</div></article>
          </section>

          <PatientForm
            key={editingPatient?.id || "new-patient"}
            patient={editingPatient}
            options={options}
            onSave={handleSave}
            onCancel={() => setEditingPatient(null)}
          />

          <PatientTable
            patients={patients}
            filters={filters}
            options={options}
            loading={loading}
            onFilterChange={changeFilter}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDischarge={handleDischarge}
          />

          <footer className="page-footer">CareDesk <span>·</span> Patient admission management</footer>
        </div>
      </main>
    </div>
  );
}

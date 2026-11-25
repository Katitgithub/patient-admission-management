import { ChevronDown, Search, Users, X } from "lucide-react";

function FilterSelect({ label, value, options, onChange }) {
  return (
    <div className="filter-select">
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{label}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown size={15} />
    </div>
  );
}

function PatientRow({ patient, onEdit, onDelete, onDischarge }) {
  const initials = patient.name.split(/\s+/).map((word) => word[0]).slice(0, 2).join("").toUpperCase();
  const admissionDate = new Date(`${patient.admission_date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <tr>
      <td><div className="patient-cell"><span className="patient-avatar">{initials}</span><span className="patient-name">{patient.name}</span></div></td>
      <td><span className="age-gender">{patient.age} yrs <span>·</span> {patient.gender}</span></td>
      <td><span className="ward-tag">{patient.ward}</span></td>
      <td>{patient.department}</td>
      <td>{patient.doctor}</td>
      <td className="date-cell">{admissionDate}</td>
      <td><span className={`status-badge ${patient.status === "Admitted" ? "status-admitted" : "status-discharged"}`}><i />{patient.status}</span></td>
      <td>
        <div className="row-actions">
          <button className="action-link" onClick={() => onEdit(patient)}>Edit</button>
          {patient.status === "Admitted" && <button className="action-link discharge-link" onClick={() => onDischarge(patient)}>Discharge</button>}
          <button className="action-delete" aria-label={`Delete ${patient.name}`} onClick={() => onDelete(patient)}><X size={15} /></button>
        </div>
      </td>
    </tr>
  );
}

export default function PatientTable({ patients, filters, options, loading, onFilterChange, onEdit, onDelete, onDischarge }) {
  return (
    <section className="panel records-panel" id="patients">
      <div className="records-heading">
        <div className="panel-kicker">ADMISSION DIRECTORY</div>
        <h2>All patients <span className="count-pill">{patients.length}</span></h2>
      </div>

      <div className="filters">
        <label className="search-box">
          <Search size={17} />
          <input aria-label="Search patients by name" placeholder="Search by patient name…" value={filters.search} onChange={(event) => onFilterChange("search", event.target.value)} />
          {filters.search && <button type="button" aria-label="Clear search" onClick={() => onFilterChange("search", "")}><X size={15} /></button>}
        </label>
        <FilterSelect label="All wards" value={filters.ward} options={options.wards} onChange={(value) => onFilterChange("ward", value)} />
        <FilterSelect label="All departments" value={filters.department} options={options.departments} onChange={(value) => onFilterChange("department", value)} />
        <FilterSelect label="All doctors" value={filters.doctor} options={options.doctors} onChange={(value) => onFilterChange("doctor", value)} />
        <button className="button button-quiet clear-button" onClick={() => ["search", "ward", "department", "doctor"].forEach((field) => onFilterChange(field, ""))}>Clear</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>PATIENT</th><th>AGE / GENDER</th><th>WARD</th><th>DEPARTMENT</th><th>DOCTOR</th><th>ADMITTED</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="8" className="table-message">Loading patient records…</td></tr> : null}
            {!loading && patients.length === 0 && <tr><td colSpan="8" className="table-message empty-state"><span className="empty-icon"><Users size={23} /></span><strong>No patients found</strong><span>Try changing the search or filters, or add a patient above.</span></td></tr>}
            {!loading && patients.map((patient) => <PatientRow key={patient.id} patient={patient} onEdit={onEdit} onDelete={onDelete} onDischarge={onDischarge} />)}
          </tbody>
        </table>
      </div>

      <div className="table-footer"><span>Showing {patients.length} patient{patients.length === 1 ? "" : "s"}</span><span><i className="online-dot" /> Records saved automatically</span></div>
    </section>
  );
}

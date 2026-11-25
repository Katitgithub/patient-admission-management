// This component shows the patient list and its search/filter controls.
function PatientTable({ patients, filters, options, loading, onFilterChange, onEdit, onDelete, onDischarge }) {
  return (
    <section className="card">
      <h2>All patients ({patients.length})</h2>

      <div className="filters">
        <input
          placeholder="Search by name"
          value={filters.search}
          onChange={(event) => onFilterChange("search", event.target.value)}
        />

        <select value={filters.ward} onChange={(event) => onFilterChange("ward", event.target.value)}>
          <option value="">All wards</option>
          {options.wards.map((ward) => <option key={ward}>{ward}</option>)}
        </select>

        <select value={filters.department} onChange={(event) => onFilterChange("department", event.target.value)}>
          <option value="">All departments</option>
          {options.departments.map((department) => <option key={department}>{department}</option>)}
        </select>

        <select value={filters.doctor} onChange={(event) => onFilterChange("doctor", event.target.value)}>
          <option value="">All doctors</option>
          {options.doctors.map((doctor) => <option key={doctor}>{doctor}</option>)}
        </select>

        <button type="button" className="secondary-button" onClick={() => onFilterChange("clear", "")}>
          Clear filters
        </button>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Age</th><th>Gender</th><th>Ward</th>
              <th>Department</th><th>Doctor</th><th>Admission date</th>
              <th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="9">Loading patients...</td></tr>}
            {!loading && patients.length === 0 && <tr><td colSpan="9">No patients found.</td></tr>}
            {!loading && patients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.ward}</td>
                <td>{patient.department}</td>
                <td>{patient.doctor}</td>
                <td>{patient.admission_date}</td>
                <td>{patient.status}</td>
                <td className="actions">
                  <button type="button" onClick={() => onEdit(patient)}>Edit</button>
                  {patient.status === "Admitted" && <button type="button" onClick={() => onDischarge(patient)}>Discharge</button>}
                  <button type="button" onClick={() => onDelete(patient)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default PatientTable;

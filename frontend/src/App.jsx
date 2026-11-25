import { useEffect, useState } from "react";
import { deletePatient, dischargePatient, getOptions, getPatients, savePatient } from "./api.js";
import PatientForm from "./PatientForm.jsx";
import PatientTable from "./PatientTable.jsx";
import { validatePatient } from "./validation.js";
import "./styles.css";

const emptyForm = {
  name: "",
  age: "",
  gender: "",
  ward: "",
  department: "",
  doctor: "",
  admission_date: "",
  status: "Admitted",
};

const emptyFilters = { search: "", ward: "", department: "", doctor: "" };
const emptyOptions = { genders: [], wards: [], departments: [], doctors: [] };

function App() {
  const [patients, setPatients] = useState([]);
  const [options, setOptions] = useState(emptyOptions);
  const [filters, setFilters] = useState(emptyFilters);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  // Load the dropdown options when the app opens.
  useEffect(() => {
    getOptions()
      .then((data) => setOptions(data))
      .catch(() => setMessage("Could not load dropdown options."));
  }, []);

  // Load patients when filters change or after a patient is saved/deleted.
  useEffect(() => {
    async function loadPatients() {
      setLoading(true);
      try {
        const data = await getPatients(filters);
        setPatients(data);
      } catch {
        setMessage("Could not load patients. Check that Django is running.");
      }
      setLoading(false);
    }

    loadPatients();
  }, [filters, reload]);

  function changeForm(field, value) {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: "" });
  }

  function changeFilter(field, value) {
    if (field === "clear") {
      setFilters({ ...emptyFilters });
    } else {
      setFilters({ ...filters, [field]: value });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formErrors = validatePatient(form);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    const patient = { ...form, age: Number(form.age), name: form.name.trim() };

    try {
      await savePatient(editingId, patient);
      setMessage(editingId ? "Patient updated." : "Patient added.");
      setForm({ ...emptyForm });
      setEditingId(null);
      setErrors({});
      setReload(reload + 1);
    } catch (serverErrors) {
      setErrors(serverErrors);
      setMessage("Please check the highlighted form fields.");
    }
  }

  function editPatient(patient) {
    setForm({
      name: patient.name,
      age: String(patient.age),
      gender: patient.gender,
      ward: patient.ward,
      department: patient.department,
      doctor: patient.doctor,
      admission_date: patient.admission_date,
      status: patient.status,
    });
    setEditingId(patient.id);
    setErrors({});
  }

  function cancelEdit() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setErrors({});
  }

  async function removePatient(patient) {
    if (!window.confirm(`Delete ${patient.name}?`)) return;

    try {
      await deletePatient(patient.id);
      setMessage("Patient deleted.");
      setReload(reload + 1);
    } catch {
      setMessage("Could not delete this patient.");
    }
  }

  async function markDischarged(patient) {
    if (!window.confirm(`Mark ${patient.name} as discharged?`)) return;

    try {
      await dischargePatient(patient.id);
      setMessage("Patient marked as discharged.");
      setReload(reload + 1);
    } catch {
      setMessage("Could not update this patient.");
    }
  }

  return (
    <main className="container">
      <header className="page-header">
        <h1>Patient Admissions</h1>
        <p>Add and manage admitted patients.</p>
      </header>

      {message && <p className="message">{message}</p>}

      <PatientForm
        form={form}
        options={options}
        errors={errors}
        editing={Boolean(editingId)}
        onChange={changeForm}
        onSubmit={handleSubmit}
        onCancel={cancelEdit}
      />

      <PatientTable
        patients={patients}
        filters={filters}
        options={options}
        loading={loading}
        onFilterChange={changeFilter}
        onEdit={editPatient}
        onDelete={removePatient}
        onDischarge={markDischarged}
      />
    </main>
  );
}

export default App;

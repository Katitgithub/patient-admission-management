import { useEffect, useState } from "react";
import { Check, ChevronDown, CirclePlus, X } from "lucide-react";
import { validatePatient } from "./validation.js";

function emptyPatient() {
  return {
    name: "", age: "", gender: "", ward: "", department: "",
    doctor: "", admission_date: "", status: "Admitted",
  };
}

function FormField({ label, error, children }) {
  const message = Array.isArray(error) ? error.join(" ") : error;
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {message && <small className="field-error">{message}</small>}
    </label>
  );
}

function SelectField({ label, value, options, onChange, placeholder, error }) {
  return (
    <FormField label={label} error={error}>
      <div className="select-wrap">
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">{placeholder}</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <ChevronDown size={16} />
      </div>
    </FormField>
  );
}

export default function PatientForm({ patient, options, onSave, onCancel }) {
  const [form, setForm] = useState(emptyPatient);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Fill in the form when editing; clear it when starting a new patient.
  useEffect(() => {
    if (patient) {
      setForm({ ...patient, age: String(patient.age) });
    } else {
      setForm(emptyPatient());
    }
    setErrors({});
    setMessage("");
  }, [patient]);

  function changeField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validatePatient(form);
    setErrors(validationErrors);
    setMessage("");

    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      await onSave({ ...form, name: form.name.trim(), age: Number(form.age) });
      setForm(emptyPatient());
      setErrors({});
    } catch (serverErrors) {
      setErrors(serverErrors);
      setMessage("Please fix the errors shown in the form.");
    } finally {
      setSaving(false);
    }
  }

  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <section className="panel form-panel" id="patient-form">
      <div className="panel-heading">
        <div>
          <div className="panel-kicker">PATIENT DETAILS</div>
          <h2>{patient ? "Edit patient" : "Add a patient"}</h2>
          <p>Enter the admission details below.</p>
        </div>
        {patient && <button className="button button-quiet" type="button" onClick={onCancel}><X size={16} /> Cancel edit</button>}
      </div>

      {message && <div className="form-message" role="alert">{message}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <FormField label="Patient name *" error={errors.name}>
            <input value={form.name} onChange={(event) => changeField("name", event.target.value)} placeholder="e.g. Ananya Sharma" />
          </FormField>
          <FormField label="Age *" error={errors.age}>
            <input type="number" min="0" max="120" step="1" value={form.age} onChange={(event) => changeField("age", event.target.value)} placeholder="Age in years" />
          </FormField>
          <SelectField label="Gender *" value={form.gender} options={options.genders} onChange={(value) => changeField("gender", value)} placeholder="Select gender" error={errors.gender} />
          <SelectField label="Ward *" value={form.ward} options={options.wards} onChange={(value) => changeField("ward", value)} placeholder="Select ward" error={errors.ward} />
          <SelectField label="Department *" value={form.department} options={options.departments} onChange={(value) => changeField("department", value)} placeholder="Select department" error={errors.department} />
          <SelectField label="Doctor *" value={form.doctor} options={options.doctors} onChange={(value) => changeField("doctor", value)} placeholder="Select doctor" error={errors.doctor} />
          <FormField label="Admission date *" error={errors.admission_date}>
            <input type="date" max={maxDate} value={form.admission_date} onChange={(event) => changeField("admission_date", event.target.value)} />
          </FormField>
          <SelectField label="Status *" value={form.status} options={["Admitted", "Discharged"]} onChange={(value) => changeField("status", value)} placeholder="Select status" error={errors.status} />
        </div>

        <div className="form-actions">
          <span className="required-hint">* Required fields</span>
          <button className="button button-primary" disabled={saving}>
            {saving ? "Saving…" : patient ? <><Check size={16} /> Save changes</> : <><CirclePlus size={16} /> Add patient</>}
          </button>
        </div>
      </form>
    </section>
  );
}

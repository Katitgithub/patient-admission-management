// The parent (App.jsx) stores the form values and gives them to this component.
function FieldError({ error }) {
  if (!error) return null;
  return <small className="field-error">{Array.isArray(error) ? error.join(" ") : error}</small>;
}

function PatientForm({ form, options, errors, editing, onChange, onSubmit, onCancel }) {
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <section className="card" id="patient-form">
      <h2>{editing ? "Edit patient" : "Add a patient"}</h2>

      <form onSubmit={onSubmit} noValidate>
        <label>
          Patient name *
          <input value={form.name} onChange={(event) => onChange("name", event.target.value)} />
          <FieldError error={errors.name} />
        </label>

        <label>
          Age *
          <input type="number" min="0" max="120" value={form.age} onChange={(event) => onChange("age", event.target.value)} />
          <FieldError error={errors.age} />
        </label>

        <label>
          Gender *
          <select value={form.gender} onChange={(event) => onChange("gender", event.target.value)}>
            <option value="">Select gender</option>
            {options.genders.map((gender) => <option key={gender}>{gender}</option>)}
          </select>
          <FieldError error={errors.gender} />
        </label>

        <label>
          Ward *
          <select value={form.ward} onChange={(event) => onChange("ward", event.target.value)}>
            <option value="">Select ward</option>
            {options.wards.map((ward) => <option key={ward}>{ward}</option>)}
          </select>
          <FieldError error={errors.ward} />
        </label>

        <label>
          Department *
          <select value={form.department} onChange={(event) => onChange("department", event.target.value)}>
            <option value="">Select department</option>
            {options.departments.map((department) => <option key={department}>{department}</option>)}
          </select>
          <FieldError error={errors.department} />
        </label>

        <label>
          Doctor *
          <select value={form.doctor} onChange={(event) => onChange("doctor", event.target.value)}>
            <option value="">Select doctor</option>
            {options.doctors.map((doctor) => <option key={doctor}>{doctor}</option>)}
          </select>
          <FieldError error={errors.doctor} />
        </label>

        <label>
          Admission date *
          <input type="date" max={maxDate} value={form.admission_date} onChange={(event) => onChange("admission_date", event.target.value)} />
          <FieldError error={errors.admission_date} />
        </label>

        <label>
          Status *
          <select value={form.status} onChange={(event) => onChange("status", event.target.value)}>
            <option>Admitted</option>
            <option>Discharged</option>
          </select>
        </label>

        <div className="form-buttons">
          <button type="submit">{editing ? "Save changes" : "Add patient"}</button>
          {editing && <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>}
        </div>
      </form>
    </section>
  );
}

export default PatientForm;

// Check the form in React. Django checks the same rules again on the server.
export function validatePatient(patient) {
  const errors = {};
  const nameWithoutSpaces = patient.name.trim().replaceAll(" ", "");

  if (!nameWithoutSpaces || !/^\p{L}+$/u.test(nameWithoutSpaces)) {
    errors.name = "Use letters and spaces only.";
  }

  const age = Number(patient.age);
  if (patient.age === "" || !Number.isInteger(age) || age < 0 || age > 120) {
    errors.age = "Age must be between 0 and 120.";
  }

  if (!patient.gender) errors.gender = "Select a gender.";
  if (!patient.ward) errors.ward = "Select a ward.";
  if (!patient.department) errors.department = "Select a department.";
  if (!patient.doctor) errors.doctor = "Select a doctor.";

  if (!patient.admission_date) {
    errors.admission_date = "Admission date is required.";
  } else if (patient.admission_date > getToday()) {
    errors.admission_date = "Date cannot be in the future.";
  }

  return errors;
}

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

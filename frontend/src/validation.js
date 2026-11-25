// Check the form in the browser before sending it to Django.
export function validatePatient(patient) {
  const errors = {};
  const name = patient.name.trim();

  const nameWithoutSpaces = name.replaceAll(" ", "");
  if (!nameWithoutSpaces || !/^\p{L}+$/u.test(nameWithoutSpaces)) {
    errors.name = "Use letters and spaces only.";
  }

  const age = Number(patient.age);
  if (patient.age === "" || !Number.isInteger(age) || age < 0 || age > 120) {
    errors.age = "Enter an age from 0 to 120.";
  }

  ["gender", "ward", "department", "doctor"].forEach((field) => {
    if (!patient[field]) errors[field] = "Please select an option.";
  });

  if (!patient.admission_date) {
    errors.admission_date = "Admission date is required.";
  } else if (patient.admission_date > getLocalDate()) {
    errors.admission_date = "Date cannot be in the future.";
  }

  return errors;
}

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

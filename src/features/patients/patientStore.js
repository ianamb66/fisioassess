import { KEYS, storage } from '../../utils/storage';

export const createPatient = (partial = {}) => ({
  id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: partial.name || '',
  age: partial.age || '',
  sex: partial.sex || '',
  weightKg: partial.weightKg || '',
  heightCm: partial.heightCm || '',
  diagnosis: partial.diagnosis || '',
  comorbidities: partial.comorbidities || '',
  functionalLevel: partial.functionalLevel || '',
  clinicalNotes: partial.clinicalNotes || '',
  assessmentDate: partial.assessmentDate || new Date().toISOString().slice(0, 10),
  therapistName: partial.therapistName || '',
  evaluations: partial.evaluations || [],
  createdAt: partial.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const loadPatients = () => storage.get(KEYS.patients, []);
export const savePatients = (patients) => storage.set(KEYS.patients, patients);

export const loadActivePatientId = () => storage.get(KEYS.activePatientId, null);
export const saveActivePatientId = (id) => storage.set(KEYS.activePatientId, id);

export const upsertPatient = (patient) => {
  const patients = loadPatients();
  const idx = patients.findIndex((p) => p.id === patient.id);
  const next = {
    ...patient,
    updatedAt: new Date().toISOString(),
  };
  let out;
  if (idx >= 0) {
    out = [...patients];
    out[idx] = next;
  } else {
    out = [next, ...patients];
  }
  savePatients(out);
  return out;
};

export const deletePatient = (id) => {
  const out = loadPatients().filter((p) => p.id !== id);
  savePatients(out);
  const active = loadActivePatientId();
  if (active === id) saveActivePatientId(null);
  return out;
};

export const addEvaluationToPatient = ({ patientId, evaluation }) => {
  const patients = loadPatients();
  const idx = patients.findIndex((p) => p.id === patientId);
  if (idx < 0) return patients;

  const p = patients[idx];
  const nextEval = {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: new Date().toISOString(),
    ...evaluation,
  };
  const nextPatient = { ...p, evaluations: [nextEval, ...(p.evaluations || [])] };

  const out = [...patients];
  out[idx] = nextPatient;
  savePatients(out);
  return out;
};

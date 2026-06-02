import { openDB, DBSchema } from 'idb';

// Avoid SSR/prerender crashes: indexedDB exists only in the browser.
const canUseIndexedDB = typeof window !== 'undefined' && typeof indexedDB !== 'undefined';

export type Sex = 'M' | 'F' | 'X' | '';

export type Patient = {
  id: string;
  fullName: string;
  birthDate: string; // optional YYYY-MM-DD
  age: number | null; // primary field for speed
  sex: Sex;
  weightKg: number | null;
  heightCm: number | null;
  restingHeartRate: number | null;
  diagnosis: string;
  comorbidities: string;
  functionalLevel: string;
  clinicalNotes: string;
  therapistName: string;
  createdAt: string;
  updatedAt: string;
};

export type Evaluation = {
  id: string;
  patientId: string;
  toolId: string;
  toolTitle: string;
  category: string;
  date: string; // ISO
  mode: 'patient' | 'quick';
  inputs: any;
  results: any;
  referenceUsed: any;
  interpretation: any;
  alerts: any[];
  mcidAnalysis: any;
  therapistNotes: string;
  createdAt: string;
};

interface FisioAssessDB extends DBSchema {
  patients: {
    key: string;
    value: Patient;
    indexes: { 'by-name': string; 'by-updatedAt': string };
  };
  evaluations: {
    key: string;
    value: Evaluation;
    indexes: { 'by-patientId': string; 'by-toolId': string; 'by-date': string };
  };
  favorites: { key: string; value: { id: string; toolIds: string[] } };
  recents: { key: string; value: { id: string; items: any[] } };
  config: { key: string; value: any };
}

export const DB_NAME = 'fisioassess_db';
export const DB_VERSION = 1;

export const dbPromise = canUseIndexedDB
  ? openDB<FisioAssessDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const patients = db.createObjectStore('patients', { keyPath: 'id' });
        patients.createIndex('by-name', 'fullName');
        patients.createIndex('by-updatedAt', 'updatedAt');

        const evals = db.createObjectStore('evaluations', { keyPath: 'id' });
        evals.createIndex('by-patientId', 'patientId');
        evals.createIndex('by-toolId', 'toolId');
        evals.createIndex('by-date', 'date');

        db.createObjectStore('favorites', { keyPath: 'id' });
        db.createObjectStore('recents', { keyPath: 'id' });
        db.createObjectStore('config');
      },
    })
  : (null as any);

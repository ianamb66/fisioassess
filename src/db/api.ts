import { dbPromise, Patient, Evaluation } from './schema';

const uuid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const db = {
  async listPatients() {
    if (!dbPromise) return [];
    const db = await dbPromise;
    const all = await db.getAll('patients');
    return all.sort((a: Patient, b: Patient) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  },

  async getPatient(id: string) {
    if (!dbPromise) return undefined;
    const db = await dbPromise;
    return db.get('patients', id);
  },

  async upsertPatient(p: Partial<Patient> & { id?: string }) {
    if (!dbPromise) throw new Error('IndexedDB not available');
    const dbi = await dbPromise;
    const now = new Date().toISOString();
    const existing = p.id ? await dbi.get('patients', p.id) : null;
    const id = p.id || uuid();
    const next: Patient = {
      id,
      fullName: p.fullName ?? existing?.fullName ?? '',
      birthDate: p.birthDate ?? existing?.birthDate ?? '',
      age: (p as any).age ?? existing?.age ?? null,
      sex: (p.sex ?? existing?.sex ?? '') as any,
      weightKg: p.weightKg ?? existing?.weightKg ?? null,
      heightCm: p.heightCm ?? existing?.heightCm ?? null,
      restingHeartRate: p.restingHeartRate ?? existing?.restingHeartRate ?? null,
      diagnosis: p.diagnosis ?? existing?.diagnosis ?? '',
      comorbidities: p.comorbidities ?? existing?.comorbidities ?? '',
      functionalLevel: p.functionalLevel ?? existing?.functionalLevel ?? '',
      clinicalNotes: p.clinicalNotes ?? existing?.clinicalNotes ?? '',
      therapistName: p.therapistName ?? existing?.therapistName ?? '',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await dbi.put('patients', next);
    return next;
  },

  async deletePatient(id: string) {
    if (!dbPromise) return;
    const dbi = await dbPromise;
    // delete evaluations for patient
    const idx = dbi.transaction('evaluations', 'readwrite').store.index('by-patientId');
    const keys = await idx.getAllKeys(id);
    const tx = dbi.transaction(['evaluations', 'patients'], 'readwrite');
    for (const k of keys) await tx.objectStore('evaluations').delete(k as any);
    await tx.objectStore('patients').delete(id);
    await tx.done;
  },

  async listEvaluationsByPatient(patientId: string) {
    if (!dbPromise) return [];
    const dbi = await dbPromise;
    const idx = dbi.transaction('evaluations').store.index('by-patientId');
    const all = await idx.getAll(patientId);
    return all.sort((a: Evaluation, b: Evaluation) => String(b.date).localeCompare(String(a.date)));
  },

  async addEvaluation(e: Omit<Evaluation, 'id' | 'createdAt'>) {
    if (!dbPromise) throw new Error('IndexedDB not available');
    const dbi = await dbPromise;
    const entry: Evaluation = { id: uuid(), createdAt: new Date().toISOString(), ...e };
    await dbi.put('evaluations', entry);
    return entry;
  },

  async getFavorites() {
    if (!dbPromise) return [];
    const dbi = await dbPromise;
    const row = await dbi.get('favorites', 'default');
    return row?.toolIds || [];
  },

  async setFavorites(toolIds: string[]) {
    if (!dbPromise) return;
    const dbi = await dbPromise;
    await dbi.put('favorites', { id: 'default', toolIds });
  },

  async getRecents() {
    if (!dbPromise) return [];
    const dbi = await dbPromise;
    const row = await dbi.get('recents', 'default');
    return row?.items || [];
  },

  async setRecents(items: any[]) {
    if (!dbPromise) return;
    const dbi = await dbPromise;
    await dbi.put('recents', { id: 'default', items });
  },
};

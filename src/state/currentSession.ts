import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type StepStatus = 'pending' | 'done';

export type SessionStep = {
  toolId: string;
  status: StepStatus;
  inputsDraft: Record<string, any>;
  resultDraft: any | null;
  completedAt?: string;
};

export type CurrentSession = {
  sessionId: string;
  patientId: string | null;
  templateId: string | null;
  startedAt: string;
  shared: Record<string, any>;
  steps: SessionStep[];
  notesSOAP: { s: string; o: string; a: string; p: string };
};

const uuid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const emptySession = (): CurrentSession => ({
  sessionId: uuid(),
  patientId: null,
  templateId: null,
  startedAt: new Date().toISOString(),
  shared: {},
  steps: [],
  notesSOAP: { s: '', o: '', a: '', p: '' },
});

type Store = {
  session: CurrentSession | null;
  startSession: (args: { patientId: string | null; templateId: string | null; toolIds: string[] }) => void;
  setShared: (patch: Record<string, any>) => void;
  setStepDraft: (toolId: string, patch: Record<string, any>) => void;
  setStepDone: (toolId: string, resultDraft: any) => void;
  setSOAP: (patch: Partial<CurrentSession['notesSOAP']>) => void;
  clearSession: () => void;
};

export const useCurrentSession = create<Store>()(
  persist(
    (set, get) => ({
      session: null as CurrentSession | null,

      startSession: ({ patientId, templateId, toolIds }: { patientId: string | null; templateId: string | null; toolIds: string[] }) => {
        const sess = emptySession();
        sess.patientId = patientId;
        sess.templateId = templateId;
        sess.steps = toolIds.map((toolId) => ({ toolId, status: 'pending', inputsDraft: {}, resultDraft: null }));
        set({ session: sess });
      },

      setShared: (patch: Record<string, any>) => {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, shared: { ...s.shared, ...patch } } });
      },

      setStepDraft: (toolId: string, patch: Record<string, any>) => {
        const s = get().session;
        if (!s) return;
        const steps = s.steps.map((st) => (st.toolId === toolId ? { ...st, inputsDraft: { ...st.inputsDraft, ...patch } } : st));
        set({ session: { ...s, steps } });
      },

      setStepDone: (toolId: string, resultDraft: any) => {
        const s = get().session;
        if (!s) return;
        const steps: SessionStep[] = s.steps.map((st) =>
          st.toolId === toolId
            ? ({ ...st, status: 'done' as StepStatus, resultDraft, completedAt: new Date().toISOString() } as SessionStep)
            : st
        );
        set({ session: { ...s, steps } });
      },

      setSOAP: (patch: Partial<CurrentSession['notesSOAP']>) => {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, notesSOAP: { ...s.notesSOAP, ...patch } } });
      },

      clearSession: () => set({ session: null }),
    }),
    { name: 'fisioassess_current_session_v1' }
  )
);

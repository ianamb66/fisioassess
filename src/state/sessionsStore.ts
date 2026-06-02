import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SessionMeta = {
  therapistName: string;
  age: number | null;
  sex: 'M' | 'F' | 'X' | '';
  notesSOAP: { s: string; o: string; a: string; p: string };
};

export type CompletedTool = {
  toolId: string;
  toolTitle: string;
  category?: string;
  inputs: Record<string, any>;
  results: any;
  completedAt: string;
};

export type SavedSession = {
  id: string;
  createdAt: string;
  templateId: string | null;
  meta: SessionMeta;
  tools: CompletedTool[];
};

const uuid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

type Store = {
  sessions: SavedSession[];
  addSession: (s: Omit<SavedSession, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => SavedSession;
  deleteSession: (id: string) => void;
  clearSessions: () => void;
};

export const useSessionsStore = create<Store>()(
  persist(
    (set, get) => ({
      sessions: [],

      addSession: (s) => {
        const entry: SavedSession = {
          id: s.id || uuid(),
          createdAt: s.createdAt || new Date().toISOString(),
          templateId: s.templateId ?? null,
          meta: s.meta,
          tools: s.tools || [],
        };
        const next = [entry, ...get().sessions].slice(0, 200);
        set({ sessions: next });
        return entry;
      },

      deleteSession: (id) => set({ sessions: get().sessions.filter((x) => x.id !== id) }),
      clearSessions: () => set({ sessions: [] }),
    }),
    { name: 'fisioassess_sessions_v1' }
  )
);

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const storage = {
  get(key, fallback) {
    if (typeof window === 'undefined') return fallback;
    return safeParse(window.localStorage.getItem(key), fallback);
  },
  set(key, value) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, JSON.stringify(value));
  },
};

export const KEYS = {
  patients: 'fisioassess_patients_v1',
  activePatientId: 'fisioassess_active_patient_v1',
  favorites: 'fisioassess_favs_v1',
  recents: 'fisioassess_recents_v1',
  theme: 'fisioassess_theme_v1',
};

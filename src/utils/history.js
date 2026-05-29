import { formatDateTime } from './formatters';

const KEY = 'physiocalc_reports_v1';

export const loadReports = () => {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveReports = (reports) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(reports));
  } catch {
    // ignore
  }
};

export const saveReport = (tool, result, patientData, meta = {}) => {
  const reports = loadReports();
  const id = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const entry = {
    id,
    toolId: tool.id,
    toolTitle: tool.title,
    result,
    patientData,
    createdAt: new Date().toISOString(),
    ...meta,
  };
  const next = [entry, ...reports].slice(0, 50);
  saveReports(next);
  return entry;
};

export const deleteReport = (id) => {
  const next = loadReports().filter((r) => r.id !== id);
  saveReports(next);
};

export const clearReports = () => saveReports([]);

export const findPreviousForSTS = (reports, patientData) => {
  if (!patientData?.patientName) return null;
  const name = String(patientData.patientName).trim().toLowerCase();
  const matches = reports.filter((r) => (r.toolId === 'sts30') && String(r.patientData?.patientName || '').trim().toLowerCase() === name);
  return matches.length >= 2 ? matches[1] : null; // previous (older) since newest is [0]
};

export const summarizeReport = (r) => {
  return {
    id: r.id,
    title: r.toolTitle,
    patient: r.patientData?.patientName || 'Sin nombre',
    when: formatDateTime(r.createdAt),
    color: r?.result?.main?.statusColor || 'green',
  };
};

import React, { useMemo } from 'react';
import { Download, FileText, PlusCircle, Pencil, AlertCircle } from 'lucide-react';

export default function PatientProfilePage({ patient, evaluations, onNewEvaluation, onExportHTML, onPrint, onEdit }) {
  const latestByTool = useMemo(() => {
    const map = new Map();
    for (const e of evaluations || []) {
      if (!map.has(e.toolId)) map.set(e.toolId, e);
    }
    return Array.from(map.values());
  }, [evaluations]);

  if (!patient) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 text-gray-500">Selecciona un paciente.</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <div className="bg-white border border-gray-200 rounded-3xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Expediente</div>
            <div className="text-2xl font-extrabold text-gray-900 mt-1">{patient.fullName}</div>
            <div className="text-sm text-gray-500 mt-1">Edad: {patient.age ?? '—'}{patient.sex ? ` / ${patient.sex}` : ''}</div>
            <div className="text-sm text-gray-500">Dx: {patient.diagnosis || '—'}</div>
            <div className="text-sm text-gray-500">Comorbilidades: {patient.comorbidities || '—'}</div>
          </div>
          <button onClick={onEdit} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 font-semibold text-gray-700">
            <Pencil size={16}/> Editar
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onNewEvaluation} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 text-white font-semibold">
            <PlusCircle size={16}/> Nueva valoración
          </button>
          <button onClick={onExportHTML} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 font-semibold text-gray-700">
            <Download size={16}/> Exportar dashboard (HTML)
          </button>
          <button onClick={onPrint} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 font-semibold text-gray-700">
            <FileText size={16}/> Dashboard PDF (Imprimir)
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
          <AlertCircle size={12}/> Herramienta de apoyo clínico. La interpretación final depende del criterio profesional.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-3xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Estado actual</div>
          <div className="mt-3 space-y-2">
            {latestByTool.length === 0 ? (
              <div className="text-sm text-gray-500">Sin registro</div>
            ) : (
              latestByTool.slice(0, 8).map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-gray-800 truncate">{e.toolTitle}</div>
                  <div className="text-sm font-bold text-gray-900">{e?.results?.main?.value ?? '—'} {e?.results?.main?.unit ?? ''}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Historial (reciente)</div>
          <div className="mt-3 space-y-3">
            {(evaluations || []).slice(0, 8).map((e) => (
              <div key={e.id} className="border border-gray-200 rounded-2xl p-4">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{e.toolTitle}</div>
                <div className="text-lg font-extrabold text-gray-900 mt-1">{e?.results?.main?.value ?? '—'} {e?.results?.main?.unit ?? ''}</div>
                <div className="text-sm text-gray-500 mt-1">{new Date(e.date).toLocaleString()}</div>
              </div>
            ))}
            {(evaluations || []).length === 0 && <div className="text-sm text-gray-500">Sin registro</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function DashboardPrintView({ appName, patient, evaluations }) {
  if (!patient) return null;

  const latestByTool = new Map();
  for (const e of evaluations || []) {
    if (!latestByTool.has(e.toolId)) latestByTool.set(e.toolId, e);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 print:px-0">
      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-extrabold">{appName} — Dashboard clínico</h1>
        <p className="text-sm text-gray-600">Autocontenido (impresión desde la app)</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 print:p-0 print:border-0 print:rounded-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Paciente</div>
            <div className="text-xl font-extrabold text-gray-900 mt-1">{patient.fullName}</div>
            <div className="text-sm text-gray-500 mt-1">Edad: {patient.age ?? '—'}{patient.sex ? ` / ${patient.sex}` : ''}</div>
            <div className="text-sm text-gray-500">Dx: {patient.diagnosis || '—'}</div>
            <div className="text-sm text-gray-500">Comorbilidades: {patient.comorbidities || '—'}</div>
            <div className="text-sm text-gray-500">Fisio: {patient.therapistName || '—'}</div>
          </div>
          <div className="text-sm text-gray-500">Generado: {new Date().toLocaleString('es-MX')}</div>
        </div>

        <div className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Últimos resultados (por herramienta)</div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from(latestByTool.values()).slice(0, 12).map((e) => (
              <div key={e.id} className="border border-gray-200 rounded-2xl p-4">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{e.toolTitle}</div>
                <div className="text-lg font-extrabold text-gray-900 mt-1">{e?.results?.main?.value ?? '—'} {e?.results?.main?.unit ?? ''}</div>
                <div className="text-sm text-gray-500 mt-1">{new Date(e.date).toLocaleString('es-MX')}</div>
              </div>
            ))}
            {latestByTool.size === 0 && <div className="text-sm text-gray-500">Sin registro</div>}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Historial</div>
          <div className="mt-2 space-y-2">
            {(evaluations || []).slice(0, 60).map((e) => (
              <div key={e.id} className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{e.toolTitle}</div>
                    <div className="text-lg font-extrabold text-gray-900 mt-1">{e?.results?.main?.value ?? '—'} {e?.results?.main?.unit ?? ''}</div>
                    <div className="text-sm text-gray-500 mt-1">{new Date(e.date).toLocaleString('es-MX')}</div>
                  </div>
                </div>
              </div>
            ))}
            {(evaluations || []).length === 0 && <div className="text-sm text-gray-500">Sin registro</div>}
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Herramienta de apoyo clínico. La interpretación final depende del criterio profesional.
        </div>
      </div>
    </div>
  );
}

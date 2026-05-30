import React, { useMemo, useState } from 'react';
import { ArrowLeft, Download, Printer } from 'lucide-react';

export default function PatientTablePage({ appName, patient, evaluations, onBack, onExportHTML, onPrint }) {
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const s = (q || '').toLowerCase().trim();
    const all = evaluations || [];
    const filtered = !s
      ? all
      : all.filter((e) => (e.toolTitle || '').toLowerCase().includes(s) || (e.toolId || '').toLowerCase().includes(s));

    return filtered;
  }, [evaluations, q]);

  if (!patient) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <button onClick={onBack} className="inline-flex items-center gap-2 font-semibold text-gray-700">
          <ArrowLeft size={18} /> Volver
        </button>
        <div className="flex gap-2">
          <button onClick={onPrint} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 text-white font-semibold">
            <Printer size={16} /> Imprimir / PDF
          </button>
          <button onClick={onExportHTML} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 font-semibold text-gray-700">
            <Download size={16} /> Exportar HTML
          </button>
        </div>
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-3xl p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tabla clínica</div>
        <div className="text-xl font-extrabold text-gray-900 mt-1">{patient.fullName}</div>
        <div className="text-sm text-gray-500 mt-1">{appName} — Historial detallado</div>

        <div className="mt-4 print:hidden">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filtrar por herramienta..."
            className="w-full bg-slate-50 border border-gray-200 rounded-2xl py-3 px-4 font-medium"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[800px] w-full border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="py-3 px-2 border-b border-gray-200">Fecha</th>
                <th className="py-3 px-2 border-b border-gray-200">Herramienta</th>
                <th className="py-3 px-2 border-b border-gray-200">Resultado</th>
                <th className="py-3 px-2 border-b border-gray-200">Interpretación</th>
                <th className="py-3 px-2 border-b border-gray-200">Inputs</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="align-top">
                  <td className="py-3 px-2 border-b border-gray-100 text-sm text-gray-600 whitespace-nowrap">{new Date(e.date).toLocaleString('es-MX')}</td>
                  <td className="py-3 px-2 border-b border-gray-100 text-sm font-semibold text-gray-900">{e.toolTitle}</td>
                  <td className="py-3 px-2 border-b border-gray-100 text-sm text-gray-900">
                    <span className="font-extrabold">{e?.results?.main?.value ?? '—'}</span> {e?.results?.main?.unit ?? ''}
                  </td>
                  <td className="py-3 px-2 border-b border-gray-100 text-sm text-gray-700">{e?.interpretation?.general || e?.results?.interpretation || '—'}</td>
                  <td className="py-3 px-2 border-b border-gray-100 text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(e.inputs || {}, null, 2)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">Sin registros</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          Herramienta de apoyo clínico. La interpretación final depende del criterio profesional.
        </div>
      </div>
    </div>
  );
}

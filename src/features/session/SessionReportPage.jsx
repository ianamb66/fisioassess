import React, { useMemo } from 'react';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { clinicalTools } from '../../data/clinicalTools';
import { downloadHTML, generatePatientDashboardHTML } from '../../utils/exportDashboard';

export default function SessionReportPage({ appName, session, onBack }) {
  const tools = session?.tools || [];

  const summaryRows = useMemo(() => {
    return tools.map((t) => {
      const main = t?.results?.main;
      return {
        title: t.toolTitle,
        value: main ? `${main.value} ${main.unit || ''}` : '—',
        when: new Date(t.completedAt).toLocaleString('es-MX'),
      };
    });
  }, [tools]);

  if (!session) return null;

  const exportHTML = () => {
    // reuse dashboard generator structure (patient->session meta)
    const fauxPatient = {
      fullName: `Sesión ${new Date(session.createdAt).toLocaleDateString('es-MX')}`,
      age: session.meta.age,
      sex: session.meta.sex,
      diagnosis: '',
      comorbidities: '',
      therapistName: session.meta.therapistName,
    };
    const fauxEvaluations = tools.map((t, idx) => ({
      id: `${session.id}-${idx}`,
      toolId: t.toolId,
      toolTitle: t.toolTitle,
      date: t.completedAt,
      results: t.results,
      inputs: t.inputs,
      interpretation: { general: t?.results?.interpretation || '' },
      alerts: [],
    }));

    const out = generatePatientDashboardHTML({ appName, patient: fauxPatient, evaluations: fauxEvaluations });
    downloadHTML(out);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <button onClick={onBack} className="inline-flex items-center gap-2 font-semibold text-gray-700">
          <ArrowLeft size={18} /> Volver
        </button>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 text-white font-semibold">
            <Printer size={16} /> Imprimir / PDF
          </button>
          <button onClick={exportHTML} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 font-semibold text-gray-700">
            <Download size={16} /> Exportar HTML
          </button>
        </div>
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-3xl p-6 print:border-0 print:rounded-none">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Reporte por sesión</div>
        <div className="text-2xl font-extrabold text-gray-900 mt-1">{new Date(session.createdAt).toLocaleString('es-MX')}</div>
        <div className="text-sm text-gray-500 mt-1">Fisioterapeuta: {session.meta.therapistName || '—'}</div>
        <div className="text-sm text-gray-500">Edad/Sexo: {session.meta.age ?? '—'}{session.meta.sex ? ` / ${session.meta.sex}` : ''}</div>

        <div className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Resumen de pruebas</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {summaryRows.map((r, idx) => (
              <div key={idx} className="border border-gray-200 rounded-2xl p-4">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{r.title}</div>
                <div className="text-lg font-extrabold text-gray-900 mt-1">{r.value}</div>
                <div className="text-sm text-gray-500 mt-1">{r.when}</div>
              </div>
            ))}
            {summaryRows.length === 0 && <div className="text-sm text-gray-500">Sin pruebas guardadas en esta sesión.</div>}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SOAP title="S" label="Subjetivo" value={session.meta.notesSOAP.s} />
          <SOAP title="O" label="Objetivo" value={session.meta.notesSOAP.o} />
          <SOAP title="A" label="Análisis" value={session.meta.notesSOAP.a} />
          <SOAP title="P" label="Plan" value={session.meta.notesSOAP.p} />
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Herramienta de apoyo clínico. La interpretación final depende del criterio profesional.
        </div>
      </div>
    </div>
  );
}

function SOAP({ title, label, value }) {
  return (
    <div className="bg-slate-50 border border-gray-200 rounded-3xl p-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm">{title}</div>
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</div>
      </div>
      <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{value || '—'}</div>
    </div>
  );
}

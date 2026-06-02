import React, { useMemo, useState } from 'react';
import { CheckCircle2, Circle, FileText, ArrowLeft, Wand2 } from 'lucide-react';
import { clinicalTools } from '../../data/clinicalTools';
import ToolRunner from '../../components/ToolRunner';
import { useCurrentSession } from '../../state/currentSession';

import SessionMetaPanel from './SessionMetaPanel';
import { useSessionsStore } from '../../state/sessionsStore';

export default function SessionWizard({ onExit, onFinish }) {
  const { session, setStepDraft, setStepDone, setShared, setSOAP, clearSession } = useCurrentSession();
  const addSession = useSessionsStore((s) => s.addSession);
  const [activeToolId, setActiveToolId] = useState(session?.steps?.[0]?.toolId || null);
  const [meta, setMeta] = useState({ therapistName: '', age: null, sex: '', notesSOAP: { s: '', o: '', a: '', p: '' } });

  const steps = session?.steps || [];
  const activeStep = steps.find((s) => s.toolId === activeToolId) || steps[0];
  const activeTool = clinicalTools.find((t) => t.id === activeStep?.toolId);

  const initialFormData = useMemo(() => {
    if (!activeStep) return {};
    const base = { ...(activeStep.inputsDraft || {}) };
    // prefill commonly used fields from meta/shared
    if (meta?.age != null && base.edad === undefined) base.edad = meta.age;
    if (meta?.sex && base.sexo === undefined) base.sexo = meta.sex;
    if (session?.shared?.peso && base.peso === undefined) base.peso = session.shared.peso;
    if (session?.shared?.talla && base.talla === undefined) base.talla = session.shared.talla;
    return base;
  }, [activeStep?.toolId, activeStep?.inputsDraft, meta?.age, meta?.sex, session?.shared]);

  const completedCount = steps.filter((s) => s.status === 'done').length;

  const mergedPatientData = {};

  const onSave = ({ tool, result, formData }) => {
    setStepDone(tool.id, result);

    const sharedPatch = {};
    if (tool.id === 'imc') {
      if (formData.peso) sharedPatch.peso = formData.peso;
      if (formData.talla) sharedPatch.talla = formData.talla;
    }
    if (Object.keys(sharedPatch).length) setShared(sharedPatch);

    // After each prueba: return to "menu" (sidebar list). Keep same view; user can pick next.
    setActiveToolId(null);
  };

  const sidebar = (
    <aside className="hidden md:block w-72 flex-shrink-0">
      <div className="bg-white border border-gray-200 rounded-3xl p-5 sticky top-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sesión clínica</div>
            <div className="text-lg font-extrabold text-gray-900 mt-1">Progreso</div>
          </div>
          <div className="text-sm font-bold text-gray-700">{completedCount}/{steps.length}</div>
        </div>

        <div className="mt-4 space-y-2">
          {steps.map((s) => {
            const tool = clinicalTools.find((t) => t.id === s.toolId);
            const isActive = s.toolId === activeToolId;
            return (
              <button
                key={s.toolId}
                onClick={() => setActiveToolId(s.toolId)}
                className={`w-full text-left rounded-2xl px-3 py-2 border transition ${
                  isActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold truncate">{tool?.title || s.toolId}</div>
                  {s.status === 'done' ? (
                    <CheckCircle2 size={16} className={isActive ? 'text-white' : 'text-emerald-600'} />
                  ) : (
                    <Circle size={16} className={isActive ? 'text-white' : 'text-gray-300'} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={onExit} className="flex-1 px-3 py-2 rounded-2xl border border-gray-200 font-semibold text-gray-700">
            Salir
          </button>
          <button
            onClick={() => {
              clearSession();
              onExit();
            }}
            className="px-3 py-2 rounded-2xl border border-rose-200 font-semibold text-rose-700"
          >
            Limpiar
          </button>
        </div>
      </div>
    </aside>
  );

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 text-gray-500">No hay sesión activa.</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 pb-24">
      <div className="md:hidden mb-3 flex items-center justify-between">
        <button onClick={onExit} className="inline-flex items-center gap-2 font-semibold text-gray-700">
          <ArrowLeft size={18} /> Salir
        </button>
        <div className="text-sm font-bold text-gray-700">{completedCount}/{steps.length}</div>
      </div>

      <div className="flex gap-4">
        {sidebar}
        <div className="flex-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-extrabold text-gray-900">
                  <Wand2 size={18} /> Sesión (wizard)
                </div>
                <div className="text-sm text-gray-500 mt-1">Guarda cada prueba y regresa al menú para generar el reporte final.</div>
              </div>
              <button
                onClick={() => {
                  const done = steps.filter((s) => s.status === 'done' && s.resultDraft);
                  const toolsCompleted = done.map((s) => {
                    const tool = clinicalTools.find((t) => t.id === s.toolId);
                    return {
                      toolId: s.toolId,
                      toolTitle: tool?.title || s.toolId,
                      category: tool?.category,
                      inputs: s.inputsDraft,
                      results: s.resultDraft,
                      completedAt: s.completedAt || new Date().toISOString(),
                    };
                  });
                  addSession({ templateId: session.templateId, meta, tools: toolsCompleted });
                  clearSession();
                  onFinish?.();
                }}
                className="px-4 py-2 rounded-2xl bg-indigo-600 text-white font-extrabold"
              >
                Finalizar y generar reporte
              </button>
            </div>
          </div>

          <SessionMetaPanel meta={meta} onChange={setMeta} />

          {!activeToolId ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 text-gray-600">Selecciona una prueba del menú lateral para comenzar.</div>
          ) : (
            <ToolRunner
              tool={activeTool}
              onBack={() => setActiveToolId(null)}
              isFavorite={false}
              toggleFavorite={() => {}}
              patientData={mergedPatientData}
              initialFormData={initialFormData}
              onFormDataChange={(next) => {
                setStepDraft(activeTool.id, next);
              }}
              onSaveReport={({ tool, result, formData }) => onSave({ tool, result, formData })}
              previousReport={null}
            />
          )}
        </div>
      </div>
    </div>
  );
}

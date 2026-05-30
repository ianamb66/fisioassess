import React, { useMemo, useState } from 'react';
import { CheckCircle2, Circle, FileText, ArrowLeft, Wand2 } from 'lucide-react';
import { clinicalTools } from '../../data/clinicalTools';
import ToolRunner from '../../components/ToolRunner';
import { useCurrentSession } from '../../state/currentSession';

export default function SessionWizard({ onExit, onFinish }) {
  const { session, setStepDraft, setStepDone, setShared, clearSession } = useCurrentSession();
  const [activeToolId, setActiveToolId] = useState(session?.steps?.[0]?.toolId || null);

  const steps = session?.steps || [];
  const activeStep = steps.find((s) => s.toolId === activeToolId) || steps[0];
  const activeTool = clinicalTools.find((t) => t.id === activeStep?.toolId);

  const completedCount = steps.filter((s) => s.status === 'done').length;

  const mergedPatientData = {};

  const onSave = ({ tool, result, formData }) => {
    // 1) mark step done
    setStepDone(tool.id, result);

    // 2) autollenado a shared (muy básico por ahora)
    const sharedPatch = {};
    if (tool.id === 'imc') {
      if (formData.peso) sharedPatch.peso = formData.peso;
      if (formData.talla) sharedPatch.talla = formData.talla;
    }
    if (Object.keys(sharedPatch).length) setShared(sharedPatch);

    // 3) move next step
    const idx = steps.findIndex((s) => s.toolId === tool.id);
    const next = steps[idx + 1] || null;
    if (next) setActiveToolId(next.toolId);
    else onFinish?.();
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

  if (!session || !activeTool) {
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
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-3xl p-5 mb-4">
            <div className="flex items-center gap-2 font-extrabold text-gray-900">
              <Wand2 size={18} /> Wizard de evaluación
            </div>
            <div className="text-sm text-gray-500 mt-1">Completa pruebas y guarda cada una. Se marcarán con ✓.</div>
          </div>

          <ToolRunner
            tool={activeTool}
            onBack={onExit}
            isFavorite={false}
            toggleFavorite={() => {}}
            patientData={mergedPatientData}
            onSaveReport={({ tool, result, formData }) => onSave({ tool, result, formData })}
            previousReport={null}
          />
        </div>
      </div>
    </div>
  );
}

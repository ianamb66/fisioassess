import React, { useMemo, useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import ResultCard from './ResultCard';

import ClinicalTimer from './ClinicalTimer';

export default function ToolRunner({ tool, onBack, isFavorite, toggleFavorite, patientData, onSaveReport, previousReport }) {
  const [formData, setFormData] = useState({});

  const hasAnyInput = useMemo(() => {
    return Object.values(formData || {}).some((v) => v !== '' && v !== null && v !== undefined);
  }, [formData]);

  const result = useMemo(() => {
    if (!tool) return null;
    return tool.calculate(formData);
  }, [formData, tool]);

  const handleInputChange = (id, val) => setFormData((prev) => ({ ...prev, [id]: val }));

  const clearForm = () => setFormData({});

  const canSave = Boolean(patientData?.patientName) && Boolean(result) && !result?.error;

  return (
    <div className="max-w-2xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-4 sticky top-0 bg-slate-50/80 backdrop-blur-xl z-10 print:hidden border-b border-gray-200/50">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors" aria-label="Volver">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-semibold text-gray-800 text-lg truncate px-4">{tool.title}</h2>
        <div className="w-10" />
      </div>

      <div className="p-4 print:p-0">
        <div className="mb-6 print:mb-2 print:text-center">
          <h1 className="hidden print:block text-2xl font-bold text-gray-900 mb-1">{tool.title}</h1>
          <p className="text-gray-500 text-sm">{tool.description}</p>
        </div>

        <div className="space-y-4 print:hidden">
          {tool.timer && (
            <ClinicalTimer
              title={tool.timer.title || 'Cronómetro'}
              mode={tool.timer.mode || 'stopwatch'}
              durationSec={tool.timer.durationSec || 0}
              onStop={(ms) => {
                if (tool.timer?.outputField) {
                  // store seconds
                  setFormData((prev) => ({ ...prev, [tool.timer.outputField]: (ms / 1000).toFixed(1) }));
                }
                if (tool.timer?.onStopSet) {
                  // custom hook to populate additional fields
                  const patch = tool.timer.onStopSet({ ms, prev: formData });
                  if (patch && typeof patch === 'object') setFormData((p) => ({ ...p, ...patch }));
                }
              }}
            />
          )}

          {tool.counter && (
            <div className="bg-white border border-gray-200 rounded-3xl p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">{tool.counter.title || 'Contador'}</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-5xl font-extrabold tabular-nums text-gray-900">{Number(formData[tool.counter.field] || 0)}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData((prev) => ({ ...prev, [tool.counter.field]: Math.max(0, Number(prev[tool.counter.field] || 0) - 1) }))}
                    className="w-14 h-14 rounded-2xl border border-gray-200 bg-white text-gray-700 font-extrabold text-2xl"
                    aria-label="Restar"
                  >
                    −
                  </button>
                  <button
                    onClick={() => setFormData((prev) => ({ ...prev, [tool.counter.field]: Number(prev[tool.counter.field] || 0) + 1 }))}
                    className="w-14 h-14 rounded-2xl border border-indigo-600 bg-indigo-600 text-white font-extrabold text-2xl"
                    aria-label="Sumar"
                  >
                    +
                  </button>
                </div>
              </div>
              {tool.counter.hint && <div className="mt-2 text-sm text-gray-500">{tool.counter.hint}</div>}
            </div>
          )}
          {tool.type === 'form' &&
            tool.fields?.map((field) => (
              <div key={field.id} className="bg-white p-1 rounded-2xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
                <label htmlFor={field.id} className="block text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pt-2">
                  {field.label}
                </label>

                {field.type === 'select' ? (
                  <select
                    id={field.id}
                    name={field.id}
                    value={formData[field.id] ?? ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full bg-transparent p-3 outline-none text-gray-900 font-medium text-lg appearance-none"
                  >
                    <option value="" disabled>
                      Seleccione...
                    </option>
                    {field.options.map((o) => (
                      <option key={o.v} value={o.v}>
                        {o.l}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    step={field.step}
                    placeholder={field.placeholder || '0.0'}
                    value={formData[field.id] ?? ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full bg-transparent p-3 outline-none text-gray-900 font-medium text-xl"
                  />
                )}
              </div>
            ))}

          {tool.type === 'questionnaire' &&
            tool.questions?.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-4">
                <div className="bg-slate-50 px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">{idx + 1}</span>
                  <h3 className="font-semibold text-gray-800 text-sm">{q.text}</h3>
                </div>
                <div className="p-2 space-y-1">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = formData[q.id] === opt.v;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleInputChange(q.id, opt.v)}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all flex justify-between items-center ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-900 font-medium border-indigo-200 border'
                            : 'bg-transparent text-gray-600 hover:bg-gray-50 border border-transparent'
                        }`}
                        aria-label={`Seleccionar: ${opt.l}`}
                      >
                        <span>{opt.l}</span>
                        {isSelected && <span className="text-indigo-600 font-semibold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        <ResultCard
          result={result}
          onClear={clearForm}
          onSave={() => onSaveReport({ tool, result, formData, previousReport })}
          canSave={canSave}
          suppressErrorBox={!hasAnyInput}
        />

        <div className="mt-12 text-center print:mt-8">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <AlertCircle size={12} /> Herramienta de apoyo clínico. La interpretación final depende del criterio profesional.
          </p>
        </div>
      </div>
    </div>
  );
}

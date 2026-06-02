import React, { useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

export default function PatientEditor({ patient, onBack, onSave }) {
  const [v, setV] = useState(patient);
  const set = (k, val) => setV((prev) => ({ ...prev, [k]: val }));

  const canSave = useMemo(() => {
    return Boolean(String(v?.fullName || '').trim());
  }, [v]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-gray-700 font-semibold">
          <ArrowLeft size={18} /> Volver
        </button>
        <button
          onClick={() => onSave(v)}
          disabled={!canSave}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold ${
            canSave ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save size={18} /> Guardar
        </button>
      </div>

      <h2 className="mt-4 text-xl font-extrabold text-gray-900">Ficha del paciente</h2>
      <p className="text-sm text-gray-500 mt-1">Campos clínicos base. Fecha de nacimiento es opcional.</p>

      <div className="mt-6 bg-white border border-gray-200 rounded-3xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nombre completo" value={v.fullName} onChange={(x) => set('fullName', x)} placeholder="Ej. Juan Pérez" />
          <Field label="Edad (años)" type="number" value={v.age ?? ''} onChange={(x) => set('age', x === '' ? null : Number(x))} placeholder="Años" />

          <Select
            label="Sexo biológico"
            value={v.sex}
            onChange={(x) => set('sex', x)}
            options={[
              { v: '', l: 'Seleccione...' },
              { v: 'M', l: 'Hombre' },
              { v: 'F', l: 'Mujer' },
              { v: 'X', l: 'Otro / Prefiere no decir' },
            ]}
          />

          <Field label="Fecha de nacimiento (opcional)" type="date" value={v.birthDate || ''} onChange={(x) => set('birthDate', x)} />

          <Field label="Peso (kg)" type="number" value={v.weightKg ?? ''} onChange={(x) => set('weightKg', x === '' ? null : Number(x))} placeholder="kg" />
          <Field label="Estatura (cm)" type="number" value={v.heightCm ?? ''} onChange={(x) => set('heightCm', x === '' ? null : Number(x))} placeholder="cm" />

          <Field label="FC reposo (lpm)" type="number" value={v.restingHeartRate ?? ''} onChange={(x) => set('restingHeartRate', x === '' ? null : Number(x))} placeholder="lpm" />

          <Field label="Diagnóstico / condición principal" value={v.diagnosis} onChange={(x) => set('diagnosis', x)} placeholder="Ej. EPOC, Lumbalgia, Post Qx..." />
          <Field label="Comorbilidades" value={v.comorbidities} onChange={(x) => set('comorbidities', x)} placeholder="DM2, HAS, etc." />
          <Field label="Nivel funcional" value={v.functionalLevel} onChange={(x) => set('functionalLevel', x)} placeholder="Independiente, requiere apoyo, etc." />
          <Field label="Fisioterapeuta" value={v.therapistName} onChange={(x) => set('therapistName', x)} placeholder="Nombre" />

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Notas clínicas</label>
            <textarea
              value={v.clinicalNotes || ''}
              onChange={(e) => set('clinicalNotes', e.target.value)}
              rows={4}
              className="mt-1 w-full bg-slate-50 rounded-2xl py-3 px-4 text-gray-900 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
              placeholder="Contexto, observaciones, objetivos..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-slate-50 rounded-2xl py-3 px-4 text-gray-900 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
        placeholder={placeholder}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-slate-50 rounded-2xl py-3 px-4 text-gray-900 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </div>
  );
}

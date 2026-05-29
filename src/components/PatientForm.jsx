import React from 'react';

export default function PatientForm({ value, onChange, compact = false }) {
  const v = value || {};
  const set = (key, val) => onChange({ ...v, [key]: val });

  return (
    <div className={`bg-white border border-gray-200/60 rounded-3xl p-5 ${compact ? '' : 'shadow-sm'}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Datos del paciente</h3>
        <span className="text-xs text-gray-400">Se guardan localmente</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="patientName" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre del paciente</label>
          <input
            id="patientName"
            name="patientName"
            type="text"
            value={v.patientName || ''}
            onChange={(e) => set('patientName', e.target.value)}
            className="mt-1 w-full bg-slate-50 rounded-2xl py-3 px-4 text-gray-900 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            placeholder="Ej. Juan Pérez"
          />
        </div>

        <div>
          <label htmlFor="patientAge" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Edad</label>
          <input
            id="patientAge"
            name="patientAge"
            type="number"
            value={v.patientAge || ''}
            onChange={(e) => set('patientAge', e.target.value)}
            className="mt-1 w-full bg-slate-50 rounded-2xl py-3 px-4 text-gray-900 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            placeholder="Años"
          />
        </div>

        <div>
          <label htmlFor="patientSex" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Sexo</label>
          <select
            id="patientSex"
            name="patientSex"
            value={v.patientSex || ''}
            onChange={(e) => set('patientSex', e.target.value)}
            className="mt-1 w-full bg-slate-50 rounded-2xl py-3 px-4 text-gray-900 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          >
            <option value="" disabled>Seleccione...</option>
            <option value="M">Hombre</option>
            <option value="F">Mujer</option>
            <option value="X">Otro / Prefiere no decir</option>
          </select>
        </div>

        <div>
          <label htmlFor="assessmentDate" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha de valoración</label>
          <input
            id="assessmentDate"
            name="assessmentDate"
            type="date"
            value={v.assessmentDate || ''}
            onChange={(e) => set('assessmentDate', e.target.value)}
            className="mt-1 w-full bg-slate-50 rounded-2xl py-3 px-4 text-gray-900 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          />
        </div>

        <div>
          <label htmlFor="therapistName" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Fisioterapeuta</label>
          <input
            id="therapistName"
            name="therapistName"
            type="text"
            value={v.therapistName || ''}
            onChange={(e) => set('therapistName', e.target.value)}
            className="mt-1 w-full bg-slate-50 rounded-2xl py-3 px-4 text-gray-900 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            placeholder="Nombre del fisioterapeuta"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="clinicalNotes" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Notas clínicas</label>
          <textarea
            id="clinicalNotes"
            name="clinicalNotes"
            value={v.clinicalNotes || ''}
            onChange={(e) => set('clinicalNotes', e.target.value)}
            rows={3}
            className="mt-1 w-full bg-slate-50 rounded-2xl py-3 px-4 text-gray-900 font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            placeholder="Observaciones, contexto, comentarios..."
          />
        </div>
      </div>
    </div>
  );
}

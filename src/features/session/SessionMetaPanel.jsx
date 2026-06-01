import React from 'react';

export default function SessionMetaPanel({ meta, onChange }) {
  const v = meta || { therapistName: '', age: null, sex: '', notesSOAP: { s: '', o: '', a: '', p: '' } };
  const set = (k, val) => onChange({ ...v, [k]: val });

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Datos generales</div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Fisioterapeuta" value={v.therapistName || ''} onChange={(x) => set('therapistName', x)} placeholder="Nombre" />
        <Field label="Edad" type="number" value={v.age ?? ''} onChange={(x) => set('age', x === '' ? null : Number(x))} placeholder="Años" />
        <SelectSex value={v.sex || ''} onChange={(x) => set('sex', x)} />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <SOAP label="S (Subjetivo)" value={v.notesSOAP?.s || ''} onChange={(x) => set('notesSOAP', { ...v.notesSOAP, s: x })} />
        <SOAP label="O (Objetivo)" value={v.notesSOAP?.o || ''} onChange={(x) => set('notesSOAP', { ...v.notesSOAP, o: x })} />
        <SOAP label="A (Análisis)" value={v.notesSOAP?.a || ''} onChange={(x) => set('notesSOAP', { ...v.notesSOAP, a: x })} />
        <SOAP label="P (Plan)" value={v.notesSOAP?.p || ''} onChange={(x) => set('notesSOAP', { ...v.notesSOAP, p: x })} />
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-slate-50 border border-gray-200 rounded-2xl py-3 px-4 font-medium"
      />
    </div>
  );
}

function SOAP({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-1 w-full bg-slate-50 border border-gray-200 rounded-2xl py-3 px-4 font-medium"
      />
    </div>
  );
}

function SelectSex({ value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Sexo</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-slate-50 border border-gray-200 rounded-2xl py-3 px-4 font-medium"
      >
        <option value="">Seleccione...</option>
        <option value="M">Hombre</option>
        <option value="F">Mujer</option>
        <option value="X">Otro / Prefiere no decir</option>
      </select>
    </div>
  );
}

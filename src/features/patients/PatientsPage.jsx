import React, { useMemo, useState } from 'react';
import { Plus, Search, Trash2, Edit3, User } from 'lucide-react';

export default function PatientsPage({ patients, activePatientId, onSelect, onCreate, onDelete, onEdit }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = (q || '').trim().toLowerCase();
    if (!s) return patients;
    return patients.filter((p) => (p.fullName || '').toLowerCase().includes(s) || (p.diagnosis || '').toLowerCase().includes(s));
  }, [patients, q]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Pacientes</h2>
          <p className="text-sm text-gray-500 mt-1">Crea, busca y abre perfiles. Todo se guarda en este dispositivo.</p>
        </div>
        <button
          onClick={() => onCreate()}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-2xl"
        >
          <Plus size={18} /> Nuevo
        </button>
      </div>

      <div className="mt-5 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o diagnóstico..."
          className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 font-medium text-gray-900"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 text-gray-500">No hay pacientes aún.</div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className={`bg-white border rounded-3xl p-5 ${activePatientId === p.id ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200'}`}
            >
              <button onClick={() => onSelect(p.id)} className="w-full text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <User size={18} className="text-gray-400" />
                      <div className="text-lg font-bold text-gray-900">{p.fullName || 'Sin nombre'}</div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {p.age ? `${p.age} años` : 'Edad —'} {p.sex ? ` / ${p.sex}` : ''}
                    </div>
                    {p.diagnosis && <div className="text-sm text-gray-600 mt-2">Dx: {p.diagnosis}</div>}
                  </div>
                </div>
              </button>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => onEdit(p.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  <Edit3 size={16} /> Editar
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-2xl border border-rose-200 text-rose-700 font-semibold hover:bg-rose-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

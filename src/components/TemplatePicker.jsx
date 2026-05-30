import React from 'react';
import { Layers } from 'lucide-react';

export default function TemplatePicker({ templates, value, onChange }) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5">
      <div className="flex items-center gap-2 font-semibold text-gray-900">
        <Layers size={18} /> Plantillas
      </div>
      <p className="text-sm text-gray-500 mt-1">Opcional. Filtra herramientas por batería.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => onChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-semibold border ${
            !value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'
          }`}
        >
          Todas
        </button>
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              value === t.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { Home, Users, Stethoscope, Star, Clock, Settings } from 'lucide-react';

const items = [
  { id: 'home', label: 'Inicio', Icon: Home },
  { id: 'patients', label: 'Pacientes', Icon: Users },
  { id: 'tools', label: 'Herramientas', Icon: Stethoscope },
  { id: 'favorites', label: 'Favoritos', Icon: Star },
  { id: 'recents', label: 'Recientes', Icon: Clock },
  { id: 'settings', label: 'Config', Icon: Settings },
];

export default function TopNav({ active, onChange }) {
  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 print:hidden">
      <div className="max-w-5xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
        {items.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold border transition ${
              active === id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

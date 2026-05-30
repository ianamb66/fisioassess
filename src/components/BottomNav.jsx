import React from 'react';
import { Home, PlusCircle, FileText, MoreHorizontal } from 'lucide-react';

const items = [
  { id: 'home', label: 'Inicio', Icon: Home },
  { id: 'new', label: 'Nueva', Icon: PlusCircle },
  { id: 'reports', label: 'Reportes', Icon: FileText },
  { id: 'more', label: 'Más', Icon: MoreHorizontal },
];

export default function BottomNav({ active, onChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 md:hidden z-30">
      <div className="grid grid-cols-4 max-w-md mx-auto">
        {items.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`py-3 flex flex-col items-center gap-1 text-xs font-semibold ${
              active === id ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <Icon size={22} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

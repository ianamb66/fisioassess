import React from 'react';
import { Star } from 'lucide-react';

export default function CategoryTabs({ categories, activeCategory, onChange }) {
  return (
    <div className="flex overflow-x-auto gap-2 pb-4 -mx-4 px-4 scrollbar-hide snap-x">
      <button
        onClick={() => onChange('favorites')}
        className={`flex-shrink-0 snap-start px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
          activeCategory === 'favorites' ? 'bg-amber-100 text-amber-800' : 'bg-white text-gray-600 border border-gray-200'
        }`}
        aria-label="Ver favoritos"
      >
        <Star size={16} className={activeCategory === 'favorites' ? 'fill-amber-800' : ''} /> Favoritos
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex-shrink-0 snap-start px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeCategory === cat.id ? 'bg-indigo-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

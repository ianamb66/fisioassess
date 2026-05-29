import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative mt-4">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input
        id="search"
        name="search"
        type="text"
        placeholder="Buscar calculadoras, pruebas..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-medium placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
      />
    </div>
  );
}

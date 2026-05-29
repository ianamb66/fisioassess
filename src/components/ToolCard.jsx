import React from 'react';
import { Star } from 'lucide-react';

export default function ToolCard({ tool, isFav, onOpen }) {
  const Icon = tool.icon;
  return (
    <button
      onClick={() => onOpen(tool.id)}
      className="bg-white border border-gray-200/60 p-5 rounded-3xl text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon size={24} strokeWidth={2.5} />
        </div>
        {isFav && <Star size={18} className="text-amber-400 fill-amber-400" />}
      </div>
      <h3 className="font-bold text-gray-900 text-lg mb-1">{tool.title}</h3>
      <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{tool.description}</p>
    </button>
  );
}

import React from 'react';
import { Info, Printer, RefreshCcw, AlertTriangle } from 'lucide-react';
import StatusIcon from './StatusIcon';

export default function ResultCard({ result, onClear, onSave, canSave }) {
  if (!result) return null;

  // Error state
  if (result?.error) {
    return (
      <div className="mt-6 rounded-3xl border p-6 shadow-sm bg-amber-50 border-amber-200 print:border-gray-300">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-amber-600 mt-1" />
          <div>
            <p className="font-semibold text-amber-900">Revisa los datos</p>
            <p className="text-amber-800 text-sm mt-1">{result.error}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-3 print:hidden">
          <button
            onClick={onClear}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 font-medium py-3 px-4 rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
          >
            <RefreshCcw size={18} /> Limpiar
          </button>
        </div>
      </div>
    );
  }

  const { main, secondary, interpretation, formula } = result;

  const bgColors = {
    green: 'bg-emerald-50 border-emerald-100',
    yellow: 'bg-amber-50 border-amber-100',
    red: 'bg-rose-50 border-rose-100',
  };
  const textColors = {
    green: 'text-emerald-900',
    yellow: 'text-amber-900',
    red: 'text-rose-900',
  };

  return (
    <div className={`mt-6 rounded-3xl border p-6 shadow-sm print:shadow-none print:border-gray-300 ${bgColors[main.statusColor]} transition-all animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 print:text-gray-700">{main.label}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-5xl md:text-6xl font-bold tracking-tight ${textColors[main.statusColor]} print:text-black`}>{main.value}</span>
            <span className={`text-xl font-medium ${textColors[main.statusColor]} opacity-70 print:text-gray-600`}>{main.unit}</span>
          </div>
        </div>
        <StatusIcon color={main.statusColor} size={32} />
      </div>

      {secondary?.length > 0 && (
        <div className="grid grid-cols-2 gap-4 my-4 py-4 border-y border-white/40 print:border-gray-200">
          {secondary.map((item, idx) => (
            <div key={idx}>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{item.label}</p>
              <p className={`text-lg font-semibold ${textColors[main.statusColor]} print:text-black`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {interpretation && (
        <div className="mt-4 bg-white/60 print:bg-transparent rounded-2xl p-4">
          <p className="text-sm font-medium text-gray-800 print:text-black flex items-center gap-2">
            <Info size={16} className="text-gray-500" /> {interpretation}
          </p>
        </div>
      )}

      {formula && <p className="text-xs text-gray-400 mt-4 text-center italic print:text-gray-500">Fórmula: {formula}</p>}

      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        <button onClick={() => window.print()} className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-white text-gray-700 font-medium py-3 rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all">
          <Printer size={18} /> Imprimir
        </button>
        <button onClick={onClear} className="flex items-center justify-center w-12 bg-white text-gray-400 hover:text-gray-700 font-medium py-3 rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all" aria-label="Limpiar">
          <RefreshCcw size={18} />
        </button>
        <button
          onClick={onSave}
          disabled={!canSave}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 font-semibold py-3 rounded-2xl shadow-sm border transition-all active:scale-95 ${
            canSave ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          }`}
        >
          Guardar valoración
        </button>
      </div>
    </div>
  );
}

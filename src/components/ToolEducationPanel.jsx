import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { toolEducation } from '../data/toolEducation';

export default function ToolEducationPanel({ toolId }) {
  const ed = toolEducation?.[toolId];

  if (!ed) {
    return (
      <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 text-gray-800 font-semibold">
          <BookOpen size={18} /> Repaso clínico
        </div>
        <p className="text-sm text-gray-500 mt-2">Contenido educativo pendiente de cargar para esta herramienta.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2 text-gray-800 font-semibold">
        <BookOpen size={18} /> Repaso clínico
      </div>

      {ed.summary && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Resumen</p>
          <p className="text-sm text-gray-800 mt-1">{ed.summary}</p>
        </div>
      )}

      {ed.procedure && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Procedimiento</p>
          <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{ed.procedure}</p>
        </div>
      )}

      {ed.clinicalUse && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Uso clínico</p>
          <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{ed.clinicalUse}</p>
        </div>
      )}

      {ed.images?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Imágenes</p>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ed.images.map((img, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt || ''} className="w-full h-auto" />
              </div>
            ))}
          </div>
        </div>
      )}

      {ed.references?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Referencias</p>
          <ul className="mt-2 space-y-2">
            {ed.references.map((r, idx) => (
              <li key={idx}>
                <a className="text-sm text-indigo-700 font-medium inline-flex items-center gap-1" href={r.url} target="_blank" rel="noreferrer">
                  {r.title} <ExternalLink size={14} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!ed.summary && !ed.procedure && !ed.clinicalUse && (!ed.images || ed.images.length === 0) && (!ed.references || ed.references.length === 0) && (
        <p className="text-sm text-gray-500 mt-2">Contenido educativo pendiente de completar.</p>
      )}
    </div>
  );
}

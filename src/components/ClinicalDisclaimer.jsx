import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ClinicalDisclaimer({ compact = false }) {
  return (
    <div className={`rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-900 ${compact ? '' : 'my-4'}`}>
      <div className="flex items-start gap-2">
        <AlertCircle size={18} className="mt-0.5" />
        <div>
          <div className="font-extrabold">Aviso clínico</div>
          <div className="text-sm mt-1">
            FisioAssess es una herramienta de apoyo clínico. No sustituye el juicio profesional ni constituye diagnóstico.
            Verifica resultados y usa tu criterio.
          </div>
          <div className="text-xs text-amber-800 mt-2">
            Si vas a almacenar datos reales de pacientes, asegúrate de contar con consentimiento y políticas de privacidad.
          </div>
        </div>
      </div>
    </div>
  );
}

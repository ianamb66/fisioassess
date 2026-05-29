import React, { useMemo } from 'react';
import { formatDateTime } from '../utils/formatters';
import { compareSTSEvaluations } from '../utils/calculations';

export default function ReportPreview({ appName, tool, patientData, formData, result, previousReport }) {
  const compare = useMemo(() => {
    if (!previousReport || tool?.id !== 'sts30') return null;
    return compareSTSEvaluations(previousReport?.result, result);
  }, [previousReport, result, tool?.id]);

  if (!tool || !result || result?.error) return null;

  return (
    <section className="mt-6 print:mt-0">
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">{appName}</h1>
        <p className="text-sm text-gray-600">Reporte imprimible</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-6 print:border-gray-300 print:rounded-none print:p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Fecha</p>
            <p className="font-semibold">{patientData?.assessmentDate || formatDateTime(new Date())}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Fisioterapeuta</p>
            <p className="font-semibold">{patientData?.therapistName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Paciente</p>
            <p className="font-semibold">{patientData?.patientName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Edad / Sexo</p>
            <p className="font-semibold">
              {patientData?.patientAge || '—'} {patientData?.patientSex ? ` / ${patientData.patientSex}` : ''}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Herramienta</p>
          <p className="text-lg font-bold text-gray-900">{tool.title}</p>
          <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Datos capturados</p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {Object.entries(formData || {}).map(([k, v]) => (
              <div key={k} className="text-sm">
                <span className="text-gray-500">{k}:</span> <span className="font-medium">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Resultado</p>
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900">{result.main.value} <span className="text-lg font-medium text-gray-600">{result.main.unit}</span></div>
            {result.secondary?.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                {result.secondary.map((s, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="text-gray-500">{s.label}</div>
                    <div className="font-semibold">{s.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {(result.interpretation || result.formula) && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            {result.interpretation && (
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Interpretación</p>
                <p className="mt-1 text-sm text-gray-800">{result.interpretation}</p>
              </div>
            )}
            {result.formula && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Fórmula</p>
                <p className="mt-1 text-xs text-gray-600 italic">{result.formula}</p>
              </div>
            )}
          </div>
        )}

        {compare && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Comparación STS (previo vs actual)</p>
            <p className="mt-1 font-semibold">{compare.headline}</p>
            <div className="grid grid-cols-3 gap-3 mt-2 text-sm">
              <div>
                <div className="text-gray-500">Δ Repeticiones</div>
                <div className="font-semibold">{compare.deltaReps}</div>
              </div>
              <div>
                <div className="text-gray-500">Δ Potencia bilateral</div>
                <div className="font-semibold">{compare.deltaBilateralPower.toFixed(0)} W</div>
              </div>
              <div>
                <div className="text-gray-500">Δ Potencia relativa</div>
                <div className="font-semibold">{compare.deltaRelativePower.toFixed(2)} W/kg</div>
              </div>
            </div>
          </div>
        )}

        {patientData?.clinicalNotes && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Notas clínicas</p>
            <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{patientData.clinicalNotes}</p>
          </div>
        )}

        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500">Herramienta de apoyo clínico. La interpretación final depende del criterio profesional.</p>
        </div>
      </div>
    </section>
  );
}

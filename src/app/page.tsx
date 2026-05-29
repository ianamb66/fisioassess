'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Home,
  Info,
  Printer,
  RefreshCcw,
  Scale,
  Search,
  Star,
  StarOff,
  Stethoscope,
  Heart,
  Calculator,
} from 'lucide-react';

// --- UTILS & DATA ---

type CategoryId =
  | 'all'
  | 'basicas'
  | 'dosificacion'
  | 'funcionales'
  | 'escalas'
  | 'dolor'
  | 'respiratorio'
  | 'favorites';

type ToolType = 'form' | 'questionnaire';

type Field =
  | {
      id: string;
      label: string;
      type: 'number' | 'text';
      step?: string;
      placeholder?: string;
    }
  | {
      id: string;
      label: string;
      type: 'select';
      options: { v: string; l: string }[];
    };

type Question = {
  id: string;
  text: string;
  options: { l: string; v: number }[];
};

type ToolResult = {
  main: { value: string | number; unit: string; label: string; statusColor: 'green' | 'yellow' | 'red' };
  secondary?: { label: string; value: string }[];
  interpretation?: string;
  formula?: string;
} | null;

type ClinicalTool = {
  id: string;
  title: string;
  category: Exclude<CategoryId, 'favorites'>;
  type: ToolType;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  description: string;
  fields?: Field[];
  questions?: Question[];
  calculate: (values: Record<string, any>) => ToolResult;
};

const CATEGORIES: { id: Exclude<CategoryId, 'favorites'>; name: string }[] = [
  { id: 'all', name: 'Todas' },
  { id: 'basicas', name: 'Medidas Básicas' },
  { id: 'dosificacion', name: 'Dosificación' },
  { id: 'funcionales', name: 'Pruebas Funcionales' },
  { id: 'escalas', name: 'Escalas Clínicas' },
  { id: 'dolor', name: 'Dolor y Discapacidad' },
  { id: 'respiratorio', name: 'Respiratorio' },
];

const clinicalTools: ClinicalTool[] = [
  // --- BÁSICAS ---
  {
    id: 'imc',
    title: 'Índice de Masa Corporal (IMC)',
    category: 'basicas',
    type: 'form',
    icon: Scale,
    description: 'Calcula la relación entre el peso y la talla.',
    fields: [
      { id: 'peso', label: 'Peso (kg)', type: 'number', step: '0.1' },
      { id: 'talla', label: 'Estatura (m)', type: 'number', step: '0.01' },
    ],
    calculate: (v) => {
      const p = parseFloat(v.peso);
      const t = parseFloat(v.talla);
      if (!p || !t) return null;
      const imc = p / (t * t);
      let status = 'Normal',
        color: 'green' | 'yellow' | 'red' = 'green';
      if (imc < 18.5) {
        status = 'Bajo peso';
        color = 'yellow';
      } else if (imc >= 25 && imc < 30) {
        status = 'Sobrepeso';
        color = 'yellow';
      } else if (imc >= 30) {
        status = 'Obesidad';
        color = 'red';
      }
      return {
        main: { value: imc.toFixed(1), unit: 'kg/m²', label: 'IMC', statusColor: color },
        interpretation: `Clasificación: ${status}`,
        formula: 'Peso (kg) / Estatura (m)²',
      };
    },
  },
  {
    id: 'fcmax',
    title: 'Frecuencia Cardiaca Máxima',
    category: 'basicas',
    type: 'form',
    icon: Heart,
    description: 'Estimación de la FC máxima esperada por edad.',
    fields: [{ id: 'edad', label: 'Edad (años)', type: 'number' }],
    calculate: (v) => {
      const e = parseInt(v.edad);
      if (!e) return null;
      const fcmax = 220 - e;
      return {
        main: { value: fcmax, unit: 'lpm', label: 'FC Máxima', statusColor: 'green' },
        interpretation: 'Estimación teórica estándar.',
        formula: '220 - edad',
      };
    },
  },

  // --- DOSIFICACIÓN ---
  {
    id: 'karvonen',
    title: 'Fórmula de Karvonen',
    category: 'dosificacion',
    type: 'form',
    icon: Activity,
    description: 'Zonas de entrenamiento basadas en FC de reserva.',
    fields: [
      { id: 'fcmax', label: 'FC Máxima (lpm)', type: 'number' },
      { id: 'fcrep', label: 'FC Reposo (lpm)', type: 'number' },
      { id: 'intensidad', label: 'Intensidad Objetivo (%)', type: 'number', placeholder: 'Ej. 60' },
    ],
    calculate: (v) => {
      const max = parseInt(v.fcmax);
      const rep = parseInt(v.fcrep);
      const int = parseFloat(v.intensidad);
      if (!max || !rep || !int) return null;
      const res = max - rep;
      const target = res * (int / 100) + rep;
      return {
        main: { value: Math.round(target), unit: 'lpm', label: `FC al ${int}%`, statusColor: 'green' },
        secondary: [{ label: 'FC de Reserva', value: `${res} lpm` }],
        interpretation: 'Frecuencia cardiaca objetivo para el entrenamiento.',
        formula: '[(FCmax - FCrep) × %] + FCrep',
      };
    },
  },

  // --- FUNCIONALES ---
  {
    id: 'tug',
    title: 'Timed Up and Go (TUG)',
    category: 'funcionales',
    type: 'form',
    icon: ClipboardList,
    description: 'Evalúa movilidad, equilibrio y riesgo de caídas.',
    fields: [{ id: 'tiempo', label: 'Tiempo (segundos)', type: 'number', step: '0.1' }],
    calculate: (v) => {
      const t = parseFloat(v.tiempo);
      if (!t) return null;
      let color: 'green' | 'yellow' | 'red' = 'green';
      let interp = 'Movilidad funcional normal. Bajo riesgo de caída.';
      if (t >= 10 && t <= 13.5) {
        color = 'yellow';
        interp = 'Rendimiento moderado. Posible declive funcional.';
      } else if (t > 13.5 && t <= 20) {
        color = 'red';
        interp = 'Posible mayor riesgo de caída. Requiere intervención.';
      } else if (t > 20) {
        color = 'red';
        interp = 'Movilidad severamente limitada. Alto riesgo.';
      }
      return {
        main: { value: t.toFixed(1), unit: 'seg', label: 'Tiempo', statusColor: color },
        interpretation: interp,
        formula: 'Tiempo en levantarse, caminar 3m, girar y sentarse.',
      };
    },
  },
  {
    id: '6mwt',
    title: '6 Minute Walk Test (6MWT)',
    category: 'funcionales',
    type: 'form',
    icon: Activity,
    description: 'Prueba de caminata de 6 minutos. Distancia y valores.',
    fields: [
      { id: 'sexo', label: 'Sexo', type: 'select', options: [
        { v: 'M', l: 'Hombre' },
        { v: 'F', l: 'Mujer' },
      ] },
      { id: 'edad', label: 'Edad', type: 'number' },
      { id: 'peso', label: 'Peso (kg)', type: 'number' },
      { id: 'talla', label: 'Estatura (cm)', type: 'number' },
      { id: 'distancia', label: 'Distancia (m)', type: 'number' },
      { id: 'spo2i', label: 'SpO2 Inicial (%)', type: 'number' },
      { id: 'spo2f', label: 'SpO2 Final (%)', type: 'number' },
    ],
    calculate: (v) => {
      if (!v.sexo || !v.edad || !v.peso || !v.talla || !v.distancia) return null;
      const e = parseFloat(v.edad);
      const p = parseFloat(v.peso);
      const t = parseFloat(v.talla);
      const d = parseFloat(v.distancia);
      let pred = 0;
      if (v.sexo === 'M') pred = 7.57 * t - 5.02 * e - 1.76 * p - 309;
      else pred = 2.11 * t - 2.29 * p - 5.78 * e + 667;

      const perc = (d / pred) * 100;
      let color: 'green' | 'yellow' | 'red' = perc >= 80 ? 'green' : perc >= 60 ? 'yellow' : 'red';

      const sec: { label: string; value: string }[] = [{ label: 'Predicho', value: `${Math.round(pred)} m` }];
      if (v.spo2i && v.spo2f) {
        const drop = parseFloat(v.spo2i) - parseFloat(v.spo2f);
        sec.push({ label: 'Caída SpO2', value: `${drop}%` });
        if (drop >= 4) color = 'red';
      }

      return {
        main: { value: perc.toFixed(1), unit: '%', label: '% del Predicho', statusColor: color },
        secondary: sec,
        interpretation: perc >= 80 ? 'Capacidad funcional conservada.' : 'Capacidad funcional reducida.',
        formula: 'Ecuación de Enright & Sherrill',
      };
    },
  },

  // --- ESCALAS CUESTIONARIOS ---
  {
    id: 'barthel',
    title: 'Índice de Barthel',
    category: 'escalas',
    type: 'questionnaire',
    icon: ClipboardList,
    description: 'Evalúa el nivel de independencia en Actividades Básicas.',
    questions: [
      { id: 'q1', text: 'Comer', options: [{ l: 'Totalmente independiente', v: 10 }, { l: 'Necesita ayuda para cortar carne/pan', v: 5 }, { l: 'Dependiente', v: 0 }] },
      { id: 'q2', text: 'Lavarse (bañarse)', options: [{ l: 'Independiente', v: 5 }, { l: 'Dependiente', v: 0 }] },
      { id: 'q3', text: 'Vestirse', options: [{ l: 'Independiente', v: 10 }, { l: 'Necesita ayuda', v: 5 }, { l: 'Dependiente', v: 0 }] },
      { id: 'q4', text: 'Arreglarse', options: [{ l: 'Independiente', v: 5 }, { l: 'Dependiente', v: 0 }] },
      { id: 'q5', text: 'Deposiciones (Intestino)', options: [{ l: 'Continente', v: 10 }, { l: 'Accidente ocasional', v: 5 }, { l: 'Incontinente', v: 0 }] },
      { id: 'q6', text: 'Micción (Vejiga)', options: [{ l: 'Continente', v: 10 }, { l: 'Accidente ocasional', v: 5 }, { l: 'Incontinente', v: 0 }] },
      { id: 'q7', text: 'Ir al retrete', options: [{ l: 'Independiente', v: 10 }, { l: 'Necesita ayuda', v: 5 }, { l: 'Dependiente', v: 0 }] },
      { id: 'q8', text: 'Traslado cama/sillón', options: [{ l: 'Independiente', v: 15 }, { l: 'Mínima ayuda', v: 10 }, { l: 'Gran ayuda', v: 5 }, { l: 'Dependiente', v: 0 }] },
      { id: 'q9', text: 'Deambulación', options: [{ l: 'Independiente 50m', v: 15 }, { l: 'Necesita ayuda física/verbal 50m', v: 10 }, { l: 'Independiente silla ruedas 50m', v: 5 }, { l: 'Dependiente', v: 0 }] },
      { id: 'q10', text: 'Escaleras', options: [{ l: 'Independiente', v: 10 }, { l: 'Necesita ayuda', v: 5 }, { l: 'Dependiente', v: 0 }] },
    ],
    calculate: (answers) => {
      if (Object.keys(answers).length < 10) return null;
      const total = Object.values(answers).reduce((a: number, b: any) => a + Number(b), 0);
      let status = '';
      let color: 'green' | 'yellow' | 'red' = 'green';
      if (total === 100) {
        status = 'Independencia total';
        color = 'green';
      } else if (total >= 91) {
        status = 'Dependencia escasa/leve';
        color = 'green';
      } else if (total >= 61) {
        status = 'Dependencia moderada';
        color = 'yellow';
      } else if (total >= 21) {
        status = 'Dependencia severa';
        color = 'red';
      } else {
        status = 'Dependencia total';
        color = 'red';
      }
      return {
        main: { value: total, unit: 'pts', label: 'Puntuación', statusColor: color },
        interpretation: status,
        formula: 'Suma total de 10 ítems (Max 100)',
      };
    },
  },
  {
    id: 'borg',
    title: 'Escala de Borg Modificada',
    category: 'escalas',
    type: 'questionnaire',
    icon: Stethoscope,
    description: 'Percepción subjetiva del esfuerzo o disnea.',
    questions: [
      {
        id: 'q1',
        text: 'Nivel de esfuerzo percibido',
        options: [
          { l: '0 - Nada', v: 0 },
          { l: '1 - Muy leve', v: 1 },
          { l: '2 - Leve', v: 2 },
          { l: '3 - Moderado', v: 3 },
          { l: '4 - Algo intenso', v: 4 },
          { l: '5 - Intenso', v: 5 },
          { l: '6 - Intenso', v: 6 },
          { l: '7 - Muy intenso', v: 7 },
          { l: '8 - Muy intenso', v: 8 },
          { l: '9 - Muy, muy intenso', v: 9 },
          { l: '10 - Máximo', v: 10 },
        ],
      },
    ],
    calculate: (answers) => {
      if (answers.q1 === undefined) return null;
      const v = Number(answers.q1);
      const color: 'green' | 'yellow' | 'red' = v <= 3 ? 'green' : v <= 6 ? 'yellow' : 'red';
      return {
        main: { value: v, unit: '/10', label: 'Puntuación', statusColor: color },
        interpretation: 'Monitorización subjetiva. Valores > 7 indican fatiga/disnea severa.',
      };
    },
  },

  // --- DOLOR E INCIDENCIA ---
  {
    id: 'oswestry',
    title: 'Oswestry Disability Index',
    category: 'dolor',
    type: 'questionnaire',
    icon: AlertTriangle,
    description: 'Nivel de discapacidad por dolor lumbar.',
    questions: Array.from({ length: 10 }, (_, i) => ({
      id: `q${i + 1}`,
      text: `Sección ${i + 1}`,
      options: [
        { l: 'Primera opción (Sin limitación/dolor)', v: 0 },
        { l: 'Segunda opción', v: 1 },
        { l: 'Tercera opción', v: 2 },
        { l: 'Cuarta opción', v: 3 },
        { l: 'Quinta opción', v: 4 },
        { l: 'Sexta opción (Máxima limitación)', v: 5 },
      ],
    })),
    calculate: (answers) => {
      const answeredKeys = Object.keys(answers);
      if (answeredKeys.length === 0) return null;
      const score = Object.values(answers).reduce((a: number, b: any) => a + Number(b), 0);
      const maxPossible = answeredKeys.length * 5;
      const percentage = (score / maxPossible) * 100;

      let status = '';
      let color: 'green' | 'yellow' | 'red' = 'green';
      if (percentage <= 20) {
        status = 'Discapacidad mínima';
        color = 'green';
      } else if (percentage <= 40) {
        status = 'Discapacidad moderada';
        color = 'yellow';
      } else if (percentage <= 60) {
        status = 'Discapacidad severa';
        color = 'red';
      } else if (percentage <= 80) {
        status = 'Discapacidad incapacitante';
        color = 'red';
      } else {
        status = 'Postrado en cama / Exageración';
        color = 'red';
      }

      return {
        main: { value: Math.round(percentage), unit: '%', label: 'Discapacidad', statusColor: color },
        interpretation: status,
        formula: '(Puntaje total / Máx posible) × 100',
      };
    },
  },

  // --- RESPIRATORIO ---
  {
    id: 'desaturacion',
    title: 'Calculadora de Desaturación',
    category: 'respiratorio',
    type: 'form',
    icon: Stethoscope,
    description: 'Evalúa la caída de SpO2 durante el esfuerzo.',
    fields: [
      { id: 'i', label: 'SpO2 Inicial (%)', type: 'number' },
      { id: 'f', label: 'SpO2 Final (%)', type: 'number' },
    ],
    calculate: (v) => {
      if (!v.i || !v.f) return null;
      const drop = parseFloat(v.i) - parseFloat(v.f);
      let status = 'Sin caída relevante';
      let color: 'green' | 'yellow' | 'red' = 'green';
      if (drop >= 3 && drop < 5) {
        status = 'Caída leve';
        color = 'yellow';
      } else if (drop >= 5) {
        status = 'Caída significativa (Desaturación)';
        color = 'red';
      }

      if (parseFloat(v.f) < 90) status += ' - ALERTA: SpO2 final < 90%';

      return {
        main: { value: drop > 0 ? `-${drop}` : drop, unit: '%', label: 'Diferencia', statusColor: color },
        interpretation: status,
        formula: 'SpO2 Inicial - SpO2 Final',
      };
    },
  },
];

// --- COMPONENTS ---

function StatusIcon({ color, size = 24 }: { color: 'green' | 'yellow' | 'red'; size?: number }) {
  if (color === 'green') return <CheckCircle2 size={size} className="text-emerald-500" />;
  if (color === 'yellow') return <AlertCircle size={size} className="text-amber-500" />;
  return <AlertTriangle size={size} className="text-rose-500" />;
}

function ResultCard({ result, onClear }: { result: ToolResult; onClear: () => void }) {
  if (!result) return null;
  const { main, secondary, interpretation, formula } = result;

  const bgColors: Record<'green' | 'yellow' | 'red', string> = {
    green: 'bg-emerald-50 border-emerald-100',
    yellow: 'bg-amber-50 border-amber-100',
    red: 'bg-rose-50 border-rose-100',
  };
  const textColors: Record<'green' | 'yellow' | 'red', string> = {
    green: 'text-emerald-900',
    yellow: 'text-amber-900',
    red: 'text-rose-900',
  };

  return (
    <div
      className={`mt-6 rounded-3xl border p-6 shadow-sm print:shadow-none print:border-gray-300 ${bgColors[main.statusColor]} transition-all animate-in fade-in slide-in-from-bottom-4 duration-500`}
    >
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

      {secondary && secondary.length > 0 && (
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

      <div className="mt-6 flex gap-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 font-medium py-3 rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <Printer size={18} /> Imprimir
        </button>
        <button
          onClick={onClear}
          className="flex items-center justify-center w-12 bg-white text-gray-400 hover:text-gray-700 font-medium py-3 rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <RefreshCcw size={18} />
        </button>
      </div>
    </div>
  );
}

function ToolRunner({
  tool,
  onBack,
  isFavorite,
  toggleFavorite,
}: {
  tool: ClinicalTool;
  onBack: () => void;
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
}) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [result, setResult] = useState<ToolResult>(null);

  useEffect(() => {
    const res = tool.calculate(formData);
    setResult(res);
  }, [formData, tool]);

  const handleInputChange = (id: string, val: any) => setFormData((prev) => ({ ...prev, [id]: val }));

  const clearForm = () => {
    setFormData({});
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-4 sticky top-0 bg-slate-50/80 backdrop-blur-xl z-10 print:hidden border-b border-gray-200/50">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-semibold text-gray-800 text-lg truncate px-4">{tool.title}</h2>
        <button
          onClick={() => toggleFavorite(tool.id)}
          className="p-2 -mr-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
        >
          {isFavorite ? <Star size={24} className="text-amber-500 fill-amber-500" /> : <StarOff size={24} />}
        </button>
      </div>

      <div className="p-4 print:p-0">
        <div className="mb-6 print:mb-2 print:text-center">
          <h1 className="hidden print:block text-2xl font-bold text-gray-900 mb-1">{tool.title}</h1>
          <p className="text-gray-500 text-sm">{tool.description}</p>
        </div>

        <div className="space-y-4 print:hidden">
          {tool.type === 'form' &&
            tool.fields?.map((field) => (
              <div
                key={field.id}
                className="bg-white p-1 rounded-2xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all"
              >
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pt-2">{field.label}</label>

                {field.type === 'select' ? (
                  <select
                    value={formData[field.id] ?? ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full bg-transparent p-3 outline-none text-gray-900 font-medium text-lg appearance-none"
                  >
                    <option value="" disabled>
                      Seleccione...
                    </option>
                    {field.options.map((o) => (
                      <option key={o.v} value={o.v}>
                        {o.l}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    step={field.step}
                    placeholder={field.placeholder || '0.0'}
                    value={formData[field.id] ?? ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full bg-transparent p-3 outline-none text-gray-900 font-medium text-xl"
                  />
                )}
              </div>
            ))}

          {tool.type === 'questionnaire' &&
            tool.questions?.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-4">
                <div className="bg-slate-50 px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <h3 className="font-semibold text-gray-800 text-sm">{q.text}</h3>
                </div>
                <div className="p-2 space-y-1">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = formData[q.id] === opt.v;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleInputChange(q.id, opt.v)}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all flex justify-between items-center ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-900 font-medium border-indigo-200 border'
                            : 'bg-transparent text-gray-600 hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <span>{opt.l}</span>
                        {isSelected && <CheckCircle2 size={18} className="text-indigo-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        <ResultCard result={result} onClear={clearForm} />

        <div className="mt-12 text-center print:mt-8">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <AlertCircle size={12} /> Herramienta de apoyo clínico. La interpretación final depende del criterio profesional.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const item = window.localStorage.getItem('physiocalc_favs');
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('physiocalc_favs', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const filteredTools = useMemo(() => {
    return clinicalTools.filter((tool) => {
      const matchesSearch =
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory === 'all' || activeCategory === 'favorites' || tool.category === activeCategory;
      const matchesFav = activeCategory === 'favorites' ? favorites.includes(tool.id) : true;

      if (activeCategory === 'favorites') return matchesSearch && matchesFav;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory, favorites]);

  const activeTool = clinicalTools.find((t) => t.id === activeToolId);

  if (activeTool) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <ToolRunner tool={activeTool} onBack={() => setActiveToolId(null)} isFavorite={favorites.includes(activeTool.id)} toggleFavorite={toggleFavorite} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <header className="bg-indigo-600 text-white rounded-b-[2.5rem] p-6 shadow-lg shadow-indigo-600/20">
        <div className="flex items-center gap-3 mb-6 mt-2">
          <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-sm">
            <Activity size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PhysioCalc</h1>
            <p className="text-indigo-200 text-sm font-medium">Herramientas clínicas pro</p>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar calculadoras, pruebas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-medium placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          />
        </div>
      </header>

      <main className="px-4 mt-6 max-w-5xl mx-auto">
        <div className="flex overflow-x-auto gap-2 pb-4 -mx-4 px-4 scrollbar-hide snap-x">
          <button
            onClick={() => setActiveCategory('favorites')}
            className={`flex-shrink-0 snap-start px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              activeCategory === 'favorites' ? 'bg-amber-100 text-amber-800' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <Star size={16} className={activeCategory === 'favorites' ? 'fill-amber-800' : ''} /> Favoritos
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 snap-start px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat.id ? 'bg-indigo-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => {
              const Icon = tool.icon;
              const isFav = favorites.includes(tool.id);
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveToolId(tool.id)}
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
            })
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 flex flex-col items-center">
              <Calculator size={48} className="text-gray-300 mb-4" />
              <p className="font-medium text-lg text-gray-600">No se encontraron herramientas</p>
              <p className="text-sm mt-1">Prueba con otra búsqueda o categoría</p>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 pb-safe print:hidden">
        <div className="flex justify-around items-center p-3 max-w-md mx-auto">
          <button
            onClick={() => {
              setActiveCategory('all');
              window.scrollTo(0, 0);
            }}
            className={`p-3 rounded-2xl ${activeCategory !== 'favorites' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400'}`}
          >
            <Home size={24} />
          </button>
          <button
            onClick={() => setActiveCategory('favorites')}
            className={`p-3 rounded-2xl ${activeCategory === 'favorites' ? 'text-amber-600 bg-amber-50' : 'text-gray-400'}`}
          >
            <Star size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

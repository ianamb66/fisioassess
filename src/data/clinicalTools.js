import {
  Activity,
  ClipboardList,
  Heart,
  Scale,
  Stethoscope,
  AlertTriangle,
} from 'lucide-react';

import {
  calculate6MWT,
  calculateBarthel,
  calculateBorg,
  calculateDesaturacion,
  calculateFCMax,
  calculateIMC,
  calculateKarvonen,
  calculateOswestry,
  calculateSTSPower30s,
} from '../utils/calculations';
import { makeErrorResult, validateFields } from '../utils/validators';

export const clinicalTools = [
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
    calculate: calculateIMC,
  },
  {
    id: 'fcmax',
    title: 'Frecuencia Cardiaca Máxima',
    category: 'basicas',
    type: 'form',
    icon: Heart,
    description: 'Estimación de la FC máxima esperada por edad.',
    fields: [{ id: 'edad', label: 'Edad (años)', type: 'number' }],
    calculate: calculateFCMax,
  },
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
    calculate: calculateKarvonen,
  },
  {
    id: 'tug',
    title: 'Timed Up and Go (TUG)',
    category: 'funcionales',
    type: 'form',
    icon: ClipboardList,
    description: 'Evalúa movilidad, equilibrio y riesgo de caídas.',
    timer: { title: 'Cronómetro TUG', mode: 'stopwatch', outputField: 'tiempo' },
    fields: [{ id: 'tiempo', label: 'Tiempo (segundos)', type: 'number', step: '0.1' }],
    calculate: (v) => {
      const { calculateTUG } = require('../utils/calculations');
      return calculateTUG(v);
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
      { id: 'sexo', label: 'Sexo', type: 'select', options: [{ v: 'M', l: 'Hombre' }, { v: 'F', l: 'Mujer' }] },
      { id: 'edad', label: 'Edad (años)', type: 'number' },
      { id: 'peso', label: 'Peso (kg)', type: 'number' },
      { id: 'talla', label: 'Estatura (cm)', type: 'number' },
      { id: 'distancia', label: 'Distancia (m)', type: 'number' },
      { id: 'spo2i', label: 'SpO2 Inicial (%)', type: 'number' },
      { id: 'spo2f', label: 'SpO2 Final (%)', type: 'number' },
    ],
    calculate: calculate6MWT,
  },
  {
    id: 'sts30',
    title: 'STS 30 segundos (30CST)',
    category: 'funcionales',
    type: 'form',
    icon: Activity,
    description: 'Prueba funcional Sit-to-Stand en 30 segundos. Incluye contador y cronómetro.',
    timer: { title: 'Temporizador STS 30s', mode: 'countdown', durationSec: 30 },
    counter: { title: 'Repeticiones', field: 'repeticiones', hint: 'Usa + / − durante la prueba. Al finalizar, guarda la valoración.' },
    fields: [
      { id: 'peso', label: 'Peso (kg)', type: 'number', step: '0.1' },
      { id: 'talla', label: 'Estatura (m)', type: 'number', step: '0.01' },
      { id: 'silla', label: 'Altura de silla (m)', type: 'number', step: '0.01', placeholder: '0.45' },
      { id: 'repeticiones', label: 'Repeticiones en 30s', type: 'number', step: '1' },
      { id: 't10m', label: 'Tiempo caminata 10 m (seg) (opcional)', type: 'number', step: '0.1', placeholder: '' },
      { id: 'prension', label: 'Fuerza de prensión (kg) (opcional)', type: 'number', step: '0.1', placeholder: '' },
    ],
    calculate: (v) => {
      const chair = v.silla === '' || v.silla === undefined ? 0.45 : Number(v.silla);
      const rules = {
        peso: { label: 'peso', unit: 'kg', min: 30, max: 200, nonNegative: true },
        talla: { label: 'estatura', unit: 'm', min: 1.2, max: 2.2, nonNegative: true },
        silla: { label: 'altura de silla', unit: 'm', min: 0.3, max: 0.7, nonNegative: true, required: false },
        repeticiones: { label: 'repeticiones', unit: 'reps', min: 0, max: 60, nonNegative: true },
        t10m: { label: 'tiempo 10 m', unit: 'seg', min: 1, max: 60, nonNegative: true, required: false },
        prension: { label: 'prensión', unit: 'kg', min: 0, max: 100, nonNegative: true, required: false },
      };
      const ok = validateFields({ ...v, silla: chair }, rules);
      if (!ok.ok) return makeErrorResult(ok.message);

      const weightKg = Number(v.peso);
      const heightM = Number(v.talla);
      const repetitions = Number(v.repeticiones);

      if (chair >= heightM * 0.5) {
        return makeErrorResult('La altura de silla no puede ser mayor o igual a la mitad de la estatura.');
      }

      if (repetitions === 0) {
        return {
          main: { value: 0, unit: 'W', label: 'Potencia bilateral', statusColor: 'red' },
          secondary: [
            { label: 'Potencia relativa', value: '0 W/kg' },
            { label: 'Repeticiones', value: '0' },
          ],
          interpretation: 'No completó repeticiones. Conviene revisar movilidad, fuerza y capacidad funcional.',
          formula: 'Potencia = masa × 0.9 × 9.81 × velocidad media STS',
          outputs: { bilateralPower: 0, relativePower: 0 },
          inputs: { repeticiones: 0 },
        };
      }

      const out = calculateSTSPower30s({ weightKg, heightM, chairHeightM: chair, repetitions });

      let statusColor = out.relativePower < 2 ? 'red' : out.relativePower < 3 ? 'yellow' : 'green';
      let interpretation =
        out.relativePower < 2
          ? 'Potencia relativa baja. Conviene revisar movilidad, fuerza y capacidad funcional.'
          : out.relativePower < 3
            ? 'Potencia relativa intermedia. Útil para monitoreo y progresión.'
            : 'Potencia funcional conservada para seguimiento clínico.';

      const secondary = [
        { label: 'Potencia relativa', value: `${out.relativePower.toFixed(2)} W/kg` },
        { label: 'Potencia unilateral est.', value: `${out.unilateralEstimatedPower.toFixed(0)} W` },
        { label: 'Velocidad media', value: `${out.meanVelocity.toFixed(2)} m/s` },
        { label: 'Fuerza media', value: `${out.meanForce.toFixed(0)} N` },
        { label: 'Desplazamiento', value: `${out.displacement.toFixed(2)} m` },
        { label: 'Repeticiones', value: `${repetitions}` },
      ];

      if (v.t10m) {
        const speed = 10 / Number(v.t10m);
        secondary.push({ label: 'Velocidad marcha 10 m', value: `${speed.toFixed(2)} m/s` });
      }
      if (v.prension) secondary.push({ label: 'Prensión', value: `${Number(v.prension).toFixed(1)} kg` });

      return {
        main: { value: out.bilateralPower.toFixed(0), unit: 'W', label: 'Potencia bilateral STS', statusColor },
        secondary,
        interpretation,
        formula: 'Potencia = masa × 0.9 × 9.81 × velocidad media STS',
        outputs: out,
        inputs: { repeticiones: repetitions },
      };
    },
  },
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
      { id: 'q5', text: 'Deposiciones (intestino)', options: [{ l: 'Continente', v: 10 }, { l: 'Accidente ocasional', v: 5 }, { l: 'Incontinente', v: 0 }] },
      { id: 'q6', text: 'Micción (vejiga)', options: [{ l: 'Continente', v: 10 }, { l: 'Accidente ocasional', v: 5 }, { l: 'Incontinente', v: 0 }] },
      { id: 'q7', text: 'Ir al retrete', options: [{ l: 'Independiente', v: 10 }, { l: 'Necesita ayuda', v: 5 }, { l: 'Dependiente', v: 0 }] },
      { id: 'q8', text: 'Traslado cama/sillón', options: [{ l: 'Independiente', v: 15 }, { l: 'Mínima ayuda', v: 10 }, { l: 'Gran ayuda', v: 5 }, { l: 'Dependiente', v: 0 }] },
      { id: 'q9', text: 'Deambulación', options: [{ l: 'Independiente 50 m', v: 15 }, { l: 'Necesita ayuda física/verbal 50 m', v: 10 }, { l: 'Independiente silla de ruedas 50 m', v: 5 }, { l: 'Dependiente', v: 0 }] },
      { id: 'q10', text: 'Escaleras', options: [{ l: 'Independiente', v: 10 }, { l: 'Necesita ayuda', v: 5 }, { l: 'Dependiente', v: 0 }] },
    ],
    calculate: calculateBarthel,
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
    calculate: calculateBorg,
  },
  {
    id: 'oswestry',
    title: 'Oswestry Disability Index',
    category: 'dolor',
    type: 'questionnaire',
    icon: AlertTriangle,
    description: 'Nivel de discapacidad por dolor lumbar.',
    questions: [
      {
        id: 'q1',
        text: 'Intensidad del dolor',
        options: [
          { l: 'No tengo dolor en este momento.', v: 0 },
          { l: 'El dolor es muy leve en este momento.', v: 1 },
          { l: 'El dolor es moderado en este momento.', v: 2 },
          { l: 'El dolor es bastante fuerte en este momento.', v: 3 },
          { l: 'El dolor es muy fuerte en este momento.', v: 4 },
          { l: 'El dolor es el peor que puedo imaginar.', v: 5 },
        ],
      },
      {
        id: 'q2',
        text: 'Cuidado personal (lavarse / vestirse)',
        options: [
          { l: 'Puedo cuidarme normalmente sin aumentar el dolor.', v: 0 },
          { l: 'Puedo cuidarme normalmente, pero aumenta el dolor.', v: 1 },
          { l: 'Cuidarme aumenta el dolor y lo hago lentamente.', v: 2 },
          { l: 'Necesito ayuda, pero puedo hacer la mayor parte.', v: 3 },
          { l: 'Necesito ayuda todos los días en la mayoría de tareas.', v: 4 },
          { l: 'No puedo vestirme/lavarme; permanezco en cama.', v: 5 },
        ],
      },
      {
        id: 'q3',
        text: 'Levantar peso',
        options: [
          { l: 'Puedo levantar objetos pesados sin dolor adicional.', v: 0 },
          { l: 'Puedo levantar objetos pesados, pero aumenta el dolor.', v: 1 },
          { l: 'El dolor me impide levantar objetos pesados; puedo levantar ligeros.', v: 2 },
          { l: 'Solo puedo levantar objetos muy ligeros.', v: 3 },
          { l: 'No puedo levantar ni transportar objetos.', v: 4 },
          { l: 'No puedo levantar nada.', v: 5 },
        ],
      },
      {
        id: 'q4',
        text: 'Caminar',
        options: [
          { l: 'El dolor no me limita al caminar.', v: 0 },
          { l: 'El dolor me limita a caminar más de 1 km.', v: 1 },
          { l: 'El dolor me limita a caminar más de 500 m.', v: 2 },
          { l: 'El dolor me limita a caminar más de 100 m.', v: 3 },
          { l: 'Solo puedo caminar con bastón/muletas.', v: 4 },
          { l: 'Permanezco en cama la mayor parte del tiempo.', v: 5 },
        ],
      },
      {
        id: 'q5',
        text: 'Sentarse',
        options: [
          { l: 'Puedo sentarme en cualquier silla el tiempo que quiera.', v: 0 },
          { l: 'Puedo sentarme el tiempo que quiera, pero aumenta el dolor.', v: 1 },
          { l: 'El dolor me impide sentarme más de 1 hora.', v: 2 },
          { l: 'El dolor me impide sentarme más de 30 min.', v: 3 },
          { l: 'El dolor me impide sentarme más de 10 min.', v: 4 },
          { l: 'El dolor me impide sentarme en absoluto.', v: 5 },
        ],
      },
      {
        id: 'q6',
        text: 'Estar de pie',
        options: [
          { l: 'Puedo estar de pie el tiempo que quiera sin dolor.', v: 0 },
          { l: 'Puedo estar de pie el tiempo que quiera, pero aumenta el dolor.', v: 1 },
          { l: 'El dolor me impide estar de pie más de 1 hora.', v: 2 },
          { l: 'El dolor me impide estar de pie más de 30 min.', v: 3 },
          { l: 'El dolor me impide estar de pie más de 10 min.', v: 4 },
          { l: 'El dolor me impide estar de pie en absoluto.', v: 5 },
        ],
      },
      {
        id: 'q7',
        text: 'Dormir',
        options: [
          { l: 'El dolor no interfiere con mi sueño.', v: 0 },
          { l: 'Duermo bien solo con medicación ocasional.', v: 1 },
          { l: 'Incluso con medicación, duermo menos de lo normal.', v: 2 },
          { l: 'Duermo menos de la mitad de lo normal.', v: 3 },
          { l: 'Duermo menos de 2 horas.', v: 4 },
          { l: 'No puedo dormir en absoluto.', v: 5 },
        ],
      },
      {
        id: 'q8',
        text: 'Actividad personal (vida diaria)',
        options: [
          { l: 'Puedo realizar mis actividades normales sin dolor.', v: 0 },
          { l: 'Puedo realizar mis actividades normales, pero aumenta el dolor.', v: 1 },
          { l: 'El dolor me impide hacer actividades físicas intensas.', v: 2 },
          { l: 'El dolor me impide hacer muchas actividades, pero puedo hacer algunas.', v: 3 },
          { l: 'El dolor me impide hacer la mayoría de actividades.', v: 4 },
          { l: 'El dolor me impide hacer cualquier actividad.', v: 5 },
        ],
      },
      {
        id: 'q9',
        text: 'Vida social',
        options: [
          { l: 'Mi vida social es normal y no aumenta el dolor.', v: 0 },
          { l: 'Mi vida social es normal, pero aumenta el dolor.', v: 1 },
          { l: 'El dolor limita algunas actividades sociales.', v: 2 },
          { l: 'El dolor limita la mayoría de actividades sociales.', v: 3 },
          { l: 'El dolor me impide participar en actividades sociales.', v: 4 },
          { l: 'No tengo vida social debido al dolor.', v: 5 },
        ],
      },
      {
        id: 'q10',
        text: 'Viajar',
        options: [
          { l: 'Puedo viajar a cualquier lugar sin dolor.', v: 0 },
          { l: 'Puedo viajar a cualquier lugar, pero aumenta el dolor.', v: 1 },
          { l: 'El dolor me limita a viajes menores de 1 hora.', v: 2 },
          { l: 'El dolor me limita a viajes menores de 30 min.', v: 3 },
          { l: 'El dolor me impide viajar excepto para tratamiento.', v: 4 },
          { l: 'El dolor me impide viajar en absoluto.', v: 5 },
        ],
      },
    ],
    calculate: calculateOswestry,
  },
  {
    id: 'sts5',
    title: '5 Times Sit to Stand (5xSTS)',
    category: 'funcionales',
    type: 'form',
    icon: Activity,
    description: 'Tiempo para completar 5 bipedestaciones completas sin usar manos.',
    timer: { title: 'Cronómetro 5xSTS', mode: 'stopwatch', outputField: 'tiempo' },
    fields: [{ id: 'tiempo', label: 'Tiempo (segundos)', type: 'number', step: '0.1' }],
    calculate: (v) => {
      const { calculate5xSTS } = require('../utils/calculations');
      return calculate5xSTS(v);
    },
  },
  {
    id: 'eva',
    title: 'Escala de Dolor (EVA)',
    category: 'dolor',
    type: 'form',
    icon: AlertTriangle,
    description: 'Escala visual análoga 0–10.',
    fields: [{ id: 'dolor', label: 'Dolor (0-10)', type: 'number', step: '1' }],
    calculate: (v) => {
      const { calculateEVA } = require('../utils/calculations');
      return calculateEVA(v);
    },
  },
  {
    id: 'oxford',
    title: 'Escala Oxford (0–5)',
    category: 'basicas',
    type: 'form',
    icon: Stethoscope,
    description: 'Fuerza analítica por grupos musculares (0–5).',
    fields: [{ id: 'grado', label: 'Grado (0-5)', type: 'number', step: '1' }],
    calculate: (v) => {
      const { calculateOxford } = require('../utils/calculations');
      return calculateOxford(v);
    },
  },
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
    calculate: calculateDesaturacion,
  },
];

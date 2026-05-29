import { makeErrorResult, validateFields } from './validators';

export const calculateIMC = (v) => {
  const rules = {
    peso: { label: 'peso', unit: 'kg', min: 30, max: 200, nonNegative: true },
    talla: { label: 'estatura', unit: 'm', min: 1.2, max: 2.2, nonNegative: true }
  };
  const ok = validateFields(v, rules);
  if (!ok.ok) return makeErrorResult(ok.message);
  const p = Number(v.peso);
  const t = Number(v.talla);
  const imc = p / (t * t);
  let status = 'Normal', color = 'green';
  if (imc < 18.5) { status = 'Bajo peso'; color = 'yellow'; }
  else if (imc >= 25 && imc < 30) { status = 'Sobrepeso'; color = 'yellow'; }
  else if (imc >= 30) { status = 'Obesidad'; color = 'red'; }
  return {
    main: { value: imc.toFixed(1), unit: 'kg/m²', label: 'IMC', statusColor: color },
    interpretation: `Clasificación: ${status}`,
    formula: 'Peso (kg) / Estatura (m)²',
    inputs: { peso: p, talla: t }
  };
};

export const calculateFCMax = (v) => {
  const ok = validateFields(v, { edad: { label: 'edad', unit: 'años', min: 5, max: 110, nonNegative: true } });
  if (!ok.ok) return makeErrorResult(ok.message);
  const e = Number(v.edad);
  const fcmax = 220 - e;
  return {
    main: { value: fcmax, unit: 'lpm', label: 'FC Máxima', statusColor: 'green' },
    interpretation: 'Estimación teórica estándar.',
    formula: '220 - edad',
    inputs: { edad: e }
  };
};

export const calculateKarvonen = (v) => {
  const rules = {
    fcmax: { label: 'FC máxima', unit: 'lpm', min: 80, max: 240, nonNegative: true },
    fcrep: { label: 'FC de reposo', unit: 'lpm', min: 30, max: 140, nonNegative: true },
    intensidad: { label: 'intensidad', unit: '%', min: 10, max: 95, nonNegative: true }
  };
  const ok = validateFields(v, rules);
  if (!ok.ok) return makeErrorResult(ok.message);

  const max = Number(v.fcmax);
  const rep = Number(v.fcrep);
  const int = Number(v.intensidad);

  if (rep > max) return makeErrorResult('La FC de reposo no puede ser mayor que la FC máxima.');

  const res = max - rep;
  const target = (res * (int / 100)) + rep;

  return {
    main: { value: Math.round(target), unit: 'lpm', label: `FC al ${int}%`, statusColor: 'green' },
    secondary: [{ label: 'FC de Reserva', value: `${res} lpm` }],
    interpretation: 'Frecuencia cardiaca objetivo para el entrenamiento.',
    formula: '[(FCmax - FCrep) × %] + FCrep',
    inputs: { fcmax: max, fcrep: rep, intensidad: int }
  };
};

export const calculateTUG = (v) => {
  const ok = validateFields(v, { tiempo: { label: 'tiempo', unit: 'seg', min: 1, max: 120, nonNegative: true } });
  if (!ok.ok) return makeErrorResult(ok.message);

  const t = Number(v.tiempo);
  let status = 'Normal', color = 'green', interp = 'Movilidad funcional normal. Bajo riesgo de caída.';
  if (t >= 10 && t <= 13.5) { status = 'Precaución'; color = 'yellow'; interp = 'Rendimiento moderado. Posible declive funcional.'; }
  else if (t > 13.5 && t <= 20) { status = 'Alerta'; color = 'red'; interp = 'Posible mayor riesgo de caída. Requiere intervención.'; }
  else if (t > 20) { status = 'Alerta Severa'; color = 'red'; interp = 'Movilidad severamente limitada. Alto riesgo.'; }

  return {
    main: { value: t.toFixed(1), unit: 'seg', label: 'Tiempo', statusColor: color },
    interpretation: interp,
    formula: 'Tiempo en levantarse, caminar 3m, girar y sentarse.',
    inputs: { tiempo: t }
  };
};

export const calculate6MWT = (v) => {
  const required = ['sexo','edad','peso','talla','distancia'];
  for (const k of required) {
    if (v?.[k] === undefined || v?.[k] === null || v?.[k] === '') return makeErrorResult('Completa los campos requeridos para calcular el 6MWT.');
  }
  const rules = {
    edad: { label: 'edad', unit: 'años', min: 5, max: 110, nonNegative: true },
    peso: { label: 'peso', unit: 'kg', min: 30, max: 200, nonNegative: true },
    talla: { label: 'estatura', unit: 'cm', min: 120, max: 220, nonNegative: true },
    distancia: { label: 'distancia', unit: 'm', min: 1, max: 1500, nonNegative: true },
    spo2i: { label: 'SpO2 inicial', unit: '%', min: 50, max: 100, required: false },
    spo2f: { label: 'SpO2 final', unit: '%', min: 50, max: 100, required: false }
  };
  const ok = validateFields(v, rules);
  if (!ok.ok) return makeErrorResult(ok.message);

  const e = Number(v.edad);
  const p = Number(v.peso);
  const t = Number(v.talla);
  const d = Number(v.distancia);

  let pred = 0;
  if (v.sexo === 'M') pred = (7.57 * t) - (5.02 * e) - (1.76 * p) - 309;
  else pred = (2.11 * t) - (2.29 * p) - (5.78 * e) + 667;

  const perc = (d / pred) * 100;
  let color = perc >= 80 ? 'green' : (perc >= 60 ? 'yellow' : 'red');

  const sec = [{ label: 'Predicho', value: `${Math.round(pred)} m` }];
  if (v.spo2i && v.spo2f) {
    const drop = Number(v.spo2i) - Number(v.spo2f);
    sec.push({ label: 'Caída SpO2', value: `${drop}%` });
    if (drop >= 4) color = 'red';
  }

  return {
    main: { value: perc.toFixed(1), unit: '%', label: '% del Predicho', statusColor: color },
    secondary: sec,
    interpretation: perc >= 80 ? 'Capacidad funcional conservada.' : 'Capacidad funcional reducida.',
    formula: 'Ecuación de Enright & Sherrill',
    inputs: { ...v }
  };
};

export const calculateBarthel = (answers) => {
  if (Object.keys(answers || {}).length < 10) return null;
  const total = Object.values(answers).reduce((a, b) => a + Number(b), 0);
  let status = '', color = 'green';
  if (total === 100) { status = 'Independencia total'; color = 'green'; }
  else if (total >= 91) { status = 'Dependencia escasa/leve'; color = 'green'; }
  else if (total >= 61) { status = 'Dependencia moderada'; color = 'yellow'; }
  else if (total >= 21) { status = 'Dependencia severa'; color = 'red'; }
  else { status = 'Dependencia total'; color = 'red'; }
  return {
    main: { value: total, unit: 'pts', label: 'Puntuación', statusColor: color },
    interpretation: status,
    formula: 'Suma total de 10 ítems (Max 100)',
    inputs: { ...answers }
  };
};

export const calculateBorg = (answers) => {
  if (answers?.q1 === undefined) return null;
  const v = Number(answers.q1);
  const color = v <= 3 ? 'green' : (v <= 6 ? 'yellow' : 'red');
  return {
    main: { value: v, unit: '/10', label: 'Puntuación', statusColor: color },
    interpretation: 'Monitorización subjetiva. Valores > 7 indican fatiga/disnea severa.',
    inputs: { ...answers }
  };
};

export const calculateOswestry = (answers) => {
  const answeredKeys = Object.keys(answers || {});
  if (answeredKeys.length === 0) return null;
  const score = Object.values(answers).reduce((a, b) => a + Number(b), 0);
  const maxPossible = answeredKeys.length * 5;
  const percentage = (score / maxPossible) * 100;

  let status = '', color = 'green';
  if (percentage <= 20) { status = 'Discapacidad mínima'; color = 'green'; }
  else if (percentage <= 40) { status = 'Discapacidad moderada'; color = 'yellow'; }
  else if (percentage <= 60) { status = 'Discapacidad severa'; color = 'red'; }
  else if (percentage <= 80) { status = 'Discapacidad incapacitante'; color = 'red'; }
  else { status = 'Postrado en cama / Exageración'; color = 'red'; }

  return {
    main: { value: Math.round(percentage), unit: '%', label: 'Discapacidad', statusColor: color },
    interpretation: status,
    formula: '(Puntaje total / Máx posible) × 100',
    inputs: { ...answers }
  };
};

export const calculateDesaturacion = (v) => {
  const rules = {
    i: { label: 'SpO2 inicial', unit: '%', min: 50, max: 100, nonNegative: true },
    f: { label: 'SpO2 final', unit: '%', min: 50, max: 100, nonNegative: true }
  };
  const ok = validateFields(v, rules);
  if (!ok.ok) return makeErrorResult(ok.message);

  const drop = Number(v.i) - Number(v.f);
  let status = 'Sin caída relevante', color = 'green';
  if (drop >= 3 && drop < 5) { status = 'Caída leve'; color = 'yellow'; }
  else if (drop >= 5) { status = 'Caída significativa (Desaturación)'; color = 'red'; }
  if (Number(v.f) < 90) status += ' - ALERTA: SpO2 final < 90%';

  return {
    main: { value: drop > 0 ? `-${drop}` : drop, unit: '%', label: 'Diferencia', statusColor: color },
    interpretation: status,
    formula: 'SpO2 Inicial - SpO2 Final',
    inputs: { ...v }
  };
};

export const calculateSTSPower30s = ({ weightKg, heightM, chairHeightM = 0.45, repetitions }) => {
  const g = 9.81;
  const displacement = (heightM * 0.5) - chairHeightM;
  const concentricTimePerRep = (30 / repetitions) * 0.5;
  const meanVelocity = displacement / concentricTimePerRep;
  const meanForce = weightKg * 0.9 * g;
  const bilateralPower = meanForce * meanVelocity;
  const relativePower = bilateralPower / weightKg;
  const unilateralEstimatedPower = bilateralPower * 0.6;
  return { displacement, meanVelocity, meanForce, bilateralPower, relativePower, unilateralEstimatedPower };
};

export const compareSTSEvaluations = (previous, current) => {
  if (!previous || !current) return null;
  const prevReps = Number(previous?.inputs?.repeticiones ?? 0);
  const curReps = Number(current?.inputs?.repeticiones ?? 0);
  const deltaReps = curReps - prevReps;

  const prevPow = Number(previous?.outputs?.bilateralPower ?? 0);
  const curPow = Number(current?.outputs?.bilateralPower ?? 0);
  const deltaPow = curPow - prevPow;

  const prevRel = Number(previous?.outputs?.relativePower ?? 0);
  const curRel = Number(current?.outputs?.relativePower ?? 0);
  const deltaRel = curRel - prevRel;

  let headline = 'Cambio menor. Mantener seguimiento.';
  if (deltaReps >= 2) headline = 'Mejora funcional relevante en STS 30 segundos.';
  else if (deltaReps <= -2) headline = 'Disminución funcional relevante en STS 30 segundos.';

  return {
    deltaReps,
    deltaBilateralPower: deltaPow,
    deltaRelativePower: deltaRel,
    headline
  };
};

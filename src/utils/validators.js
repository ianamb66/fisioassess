export const isValidNumber = (value, min, max) => {
  if (value === undefined || value === null || value === '') return false;
  const n = Number(value);
  if (!Number.isFinite(n)) return false;
  if (min !== undefined && n < min) return false;
  if (max !== undefined && n > max) return false;
  return true;
};

export const validateFields = (values, rules = {}) => {
  /**
   * rules: { fieldId: { min, max, label, unit, required=true } }
   */
  for (const [key, rule] of Object.entries(rules)) {
    const required = rule.required !== false;
    const val = values?.[key];

    if ((val === undefined || val === null || val === '') && required) {
      return { ok: false, field: key, message: `Completa el campo: ${rule.label || key}.` };
    }

    if (val !== undefined && val !== null && val !== '') {
      if (!isValidNumber(val, rule.min, rule.max)) {
        const minTxt = rule.min !== undefined ? rule.min : '';
        const maxTxt = rule.max !== undefined ? rule.max : '';
        const unitTxt = rule.unit ? ` ${rule.unit}` : '';
        if (rule.min !== undefined && rule.max !== undefined) {
          return { ok: false, field: key, message: `Ingresa un(a) ${rule.label || key} válido(a) entre ${minTxt} y ${maxTxt}${unitTxt}.` };
        }
        return { ok: false, field: key, message: `Ingresa un(a) ${rule.label || key} válido(a).` };
      }
      if (rule.nonNegative && Number(val) < 0) {
        return { ok: false, field: key, message: `${rule.label || key} no puede ser negativo.` };
      }
    }
  }

  return { ok: true };
};

export const makeErrorResult = (message) => ({
  error: message
});

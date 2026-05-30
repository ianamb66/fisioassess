import { referenceValues } from '../data/referenceValues';

/**
 * getReferenceValue(toolId, patientProfile, rawResult)
 * Returns an object with reference info for UI OR null if no reference table exists.
 * NOTE: This is a scaffold. Do not invent normative values.
 */
export function getReferenceValue(toolId, patientProfile, rawResult) {
  try {
    const toolKey = String(toolId || '').trim();
    if (!toolKey) return null;

    const table = referenceValues?.[toolKey] || referenceValues?.[mapToolId(toolKey)];
    if (!table || Object.keys(table).length === 0) return null;

    // Future: use patientProfile.age/sex/population/comorbidities to find a matching band.
    // For now return null unless table has a top-level "_default" entry.
    if (table._default) return table._default;

    return null;
  } catch {
    return null;
  }
}

function mapToolId(id) {
  // allow aliases
  if (id === '6mwt') return 'sixMinuteWalk';
  if (id === 'sts30') return 'stsPower30s';
  return id;
}

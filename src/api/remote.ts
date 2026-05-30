import { supabase } from '../supabase/client';

export const remote = {
  async listPatients() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapPatient);
  },

  async upsertPatient(patient: any) {
    if (!supabase) throw new Error('Supabase not configured');
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');

    const row = {
      id: patient.id || undefined,
      user_id: user.id,
      full_name: patient.fullName,
      birth_date: patient.birthDate || null,
      age: patient.age ?? null,
      sex: patient.sex || null,
      weight_kg: patient.weightKg ?? null,
      height_cm: patient.heightCm ?? null,
      resting_heart_rate: patient.restingHeartRate ?? null,
      diagnosis: patient.diagnosis || null,
      comorbidities: patient.comorbidities || null,
      functional_level: patient.functionalLevel || null,
      clinical_notes: patient.clinicalNotes || null,
      therapist_name: patient.therapistName || null,
    };

    const { data, error } = await supabase
      .from('patients')
      .upsert(row)
      .select('*')
      .single();
    if (error) throw error;
    return mapPatient(data);
  },

  async deletePatient(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) throw error;
  },

  async listEvaluationsByPatient(patientId: string) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapEvaluation);
  },

  async addEvaluation(e: any) {
    if (!supabase) throw new Error('Supabase not configured');
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');

    const row = {
      user_id: user.id,
      patient_id: e.patientId,
      tool_id: e.toolId,
      tool_title: e.toolTitle,
      category: e.category || null,
      date: e.date || new Date().toISOString(),
      mode: e.mode || 'patient',
      inputs: e.inputs || {},
      results: e.results || {},
      reference_used: e.referenceUsed || null,
      interpretation: e.interpretation || null,
      alerts: e.alerts || [],
      mcid_analysis: e.mcidAnalysis || null,
      therapist_notes: e.therapistNotes || null,
    };

    const { data, error } = await supabase.from('evaluations').insert(row).select('*').single();
    if (error) throw error;
    return mapEvaluation(data);
  },
};

function mapPatient(r: any) {
  return {
    id: r.id,
    fullName: r.full_name,
    birthDate: r.birth_date || '',
    age: r.age,
    sex: r.sex || '',
    weightKg: r.weight_kg,
    heightCm: r.height_cm,
    restingHeartRate: r.resting_heart_rate,
    diagnosis: r.diagnosis || '',
    comorbidities: r.comorbidities || '',
    functionalLevel: r.functional_level || '',
    clinicalNotes: r.clinical_notes || '',
    therapistName: r.therapist_name || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapEvaluation(r: any) {
  return {
    id: r.id,
    patientId: r.patient_id,
    toolId: r.tool_id,
    toolTitle: r.tool_title,
    category: r.category,
    date: r.date,
    mode: r.mode,
    inputs: r.inputs,
    results: r.results,
    referenceUsed: r.reference_used,
    interpretation: r.interpretation,
    alerts: r.alerts,
    mcidAnalysis: r.mcid_analysis,
    therapistNotes: r.therapist_notes,
    createdAt: r.created_at,
  };
}

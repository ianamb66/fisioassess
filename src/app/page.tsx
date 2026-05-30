'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Clock,
  Download,
  FileText,
  Search,
  Star,
  Stethoscope,
  Users,
} from 'lucide-react';

import BottomNav from '../components/BottomNav';
import ClinicalDisclaimer from '../components/ClinicalDisclaimer';
import ToolRunner from '../components/ToolRunner';
import ToolCard from '../components/ToolCard';
import SearchBar from '../components/SearchBar';
import CategoryTabs from '../components/CategoryTabs';
import PatientEditor from '../features/patients/PatientEditor';
import PatientsPage from '../features/patients/PatientsPage';
import PatientProfilePage from '../features/patients/PatientProfilePage';
import PatientTablePage from '../features/patients/PatientTablePage';
import DashboardPrintView from '../components/DashboardPrintView';
import ToolEducationPanel from '../components/ToolEducationPanel';
import TemplatePicker from '../components/TemplatePicker';
import SessionWizard from '../features/session/SessionWizard';
import { useCurrentSession } from '../state/currentSession';

import { clinicalTools } from '../data/clinicalTools';
import { CATEGORIES } from '../data/categories';
import { assessmentTemplates } from '../data/assessmentTemplates';

import { getReferenceValue } from '../utils/getReferenceValue';
import { downloadHTML, generatePatientDashboardHTML } from '../utils/exportDashboard';

import AuthPanel from '../components/AuthPanel';
import { useSession } from '../supabase/useSession';
import { supabase } from '../supabase/client';
import { remote } from '../api/remote';

const APP_NAME = 'FisioAssess';
const APP_SUBTITLE = 'Valoración fisioterapéutica centrada en paciente';

type ViewId = 'home' | 'patients' | 'new' | 'reports' | 'more' | 'tool' | 'patient' | 'dashboard' | 'table' | 'session';

export default function Page() {
  const [view, setView] = useState<ViewId>('home');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  const [patients, setPatients] = useState<any[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [editingPatient, setEditingPatient] = useState<any | null>(null);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<any[]>([]);

  const [patientEvals, setPatientEvals] = useState<any[]>([]);

  const { session, loading: authLoading, error: authError } = useSession();
  const startWizardSession = useCurrentSession((s: any) => s.startSession);

  // Load remote state (Supabase)
  useEffect(() => {
    (async () => {
      if (!session) return;
      const pats = await remote.listPatients();
      setPatients(pats);

      // active patient from localStorage (preference only)
      try {
        const raw = window.localStorage.getItem('fisioassess_active_patient_pref_v1');
        if (raw) setActivePatientId(JSON.parse(raw));
      } catch {}
    })();
  }, [session]);

  useEffect(() => {
    (async () => {
      if (!session) return;
      if (!activePatientId) {
        setPatientEvals([]);
        return;
      }
      const evs = await remote.listEvaluationsByPatient(activePatientId);
      setPatientEvals(evs);
    })();
  }, [activePatientId, session]);

  // favorites/recents: keep local for now

  useEffect(() => {
    try {
      window.localStorage.setItem('fisioassess_active_patient_pref_v1', JSON.stringify(activePatientId));
    } catch {
      // ignore
    }
  }, [activePatientId]);

  const activePatient = useMemo(() => patients.find((p) => p.id === activePatientId) || null, [patients, activePatientId]);

  const activeTool = useMemo(() => clinicalTools.find((t) => t.id === activeToolId) || null, [activeToolId]);

  const filteredTools = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    const template = activeTemplateId ? assessmentTemplates.find((t) => t.id === activeTemplateId) : null;

    const base = clinicalTools.filter((tool) => {
      const t = (tool.title || '').toLowerCase();
      const d = (tool.description || '').toLowerCase();
      const matchesSearch = t.includes(q) || d.includes(q);
      const matchesCat = activeCategory === 'all' || tool.category === activeCategory;
      const matchesTemplate = template ? template.toolIds.includes(tool.id) : true;
      return matchesSearch && matchesCat && matchesTemplate;
    });

    return [...base].sort((a, b) => (favorites.includes(b.id) ? 1 : 0) - (favorites.includes(a.id) ? 1 : 0));
  }, [searchQuery, activeCategory, favorites, activeTemplateId]);

  const favoriteTools = useMemo(() => clinicalTools.filter((t) => favorites.includes(t.id)), [favorites]);

  const openTool = (toolId: string) => {
    setActiveToolId(toolId);
    setView('tool');

    const tool = clinicalTools.find((t) => t.id === toolId);
    if (!tool) return;

    setRecents((prev) => {
      const next = [{ toolId, toolTitle: tool.title, lastUsedAt: new Date().toISOString() }, ...prev.filter((r) => r.toolId !== toolId)];
      return next.slice(0, 30);
    });
  };

  const closeTool = () => {
    setActiveToolId(null);
    setView('home');
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  };

  const createNewPatientDraft = () => {
    setEditingPatient({
      id: undefined,
      fullName: '',
      birthDate: '',
      age: null,
      sex: '',
      weightKg: null,
      heightCm: null,
      restingHeartRate: null,
      diagnosis: '',
      comorbidities: '',
      functionalLevel: '',
      clinicalNotes: '',
      therapistName: '',
    });
  };

  const savePatient = async (patient: any) => {
    const saved = await remote.upsertPatient(patient);
    const pats = await remote.listPatients();
    setPatients(pats);
    setActivePatientId(saved.id);
    setEditingPatient(null);
    setView('home');
  };

  const deletePatient = async (id: string) => {
    await remote.deletePatient(id);
    const pats = await remote.listPatients();
    setPatients(pats);
    if (activePatientId === id) setActivePatientId(null);
  };

  const onSaveEvaluation = async ({ tool, result, formData }: any) => {
    if (!tool || !result || result?.error) return;

    if (!activePatientId) return;

    const ref = getReferenceValue(tool.id, activePatient, result);

    await remote.addEvaluation({
      patientId: activePatientId,
      toolId: tool.id,
      toolTitle: tool.title,
      category: tool.category,
      date: new Date().toISOString(),
      mode: 'patient',
      inputs: formData,
      results: result,
      referenceUsed: ref,
      interpretation: { general: result.interpretation || '', referenceMissing: !ref },
      alerts: [],
      mcidAnalysis: null,
      therapistNotes: '',
    });

    const evs = await remote.listEvaluationsByPatient(activePatientId);
    setPatientEvals(evs);

    setActiveToolId(null);
    setView('patient');
  };

  const exportDashboard = async () => {
    if (!activePatientId) return;
    const patient = patients.find((p) => p.id === activePatientId);
    if (!patient) return;
    const evaluations = await remote.listEvaluationsByPatient(activePatientId);
    const out = generatePatientDashboardHTML({ appName: APP_NAME, patient, evaluations });
    downloadHTML(out);
  };

  const openDashboard = () => setView('dashboard');
  const printDashboard = () => {
    // user can "Save as PDF" in print dialog
    setView('dashboard');
    setTimeout(() => window.print(), 50);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-gray-500">Cargando…</div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-lg bg-white border border-rose-200 rounded-3xl p-6 text-rose-900">
          <div className="font-extrabold">Error de autenticación</div>
          <div className="text-sm mt-2">{authError}</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-indigo-600 text-white rounded-b-[2.5rem] p-6 shadow-lg shadow-indigo-600/20">
          <div className="flex items-center gap-3 mb-2 mt-2">
            <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-sm">
              <Activity size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
              <p className="text-indigo-200 text-sm font-medium">Acceso profesional</p>
            </div>
          </div>
        </header>
        <AuthPanel />
        <div className="max-w-3xl mx-auto px-4">
          <ClinicalDisclaimer />
        </div>
      </div>
    );
  }

  // TOOL VIEW
  if (view === 'tool' && activeTool) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <div className="max-w-2xl mx-auto px-4 pt-4">
          {!activePatientId ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5" size={18} />
                <div>
                  <div className="font-semibold">Modo rápido</div>
                  <div className="text-sm mt-1">Los resultados no se guardan en historial de paciente.</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-gray-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Paciente activo</div>
              <div className="font-bold text-gray-900 mt-1">{activePatient?.fullName || '—'}</div>
              <div className="text-sm text-gray-500">
                {activePatient?.age ? `${activePatient.age} años` : 'Edad —'}{activePatient?.sex ? ` / ${activePatient.sex}` : ''}
              </div>
            </div>
          )}
        </div>

        <ToolRunner
          tool={activeTool}
          onBack={closeTool}
          isFavorite={favorites.includes(activeTool.id)}
          toggleFavorite={toggleFavorite}
          patientData={{ patientName: activePatient?.fullName || '' }}
          onSaveReport={({ tool, result, formData }: any) => onSaveEvaluation({ tool, result, formData })}
          previousReport={null}
        />

        <div className="max-w-2xl mx-auto px-4 pb-16">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 mt-6">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
              <BookOpen size={18} /> Ayuda clínica
            </div>
            <p className="text-sm text-gray-500 mt-2">Procedimiento, referencias y notas (pendiente de cargar).</p>
          </div>

          <ToolEducationPanel toolId={activeTool.id} />
        </div>

        <BottomNav active={'home'} onChange={(id: any) => setView(id)} />
      </div>
    );
  }

  // PATIENT EDIT
  if (editingPatient) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <PatientEditor patient={editingPatient} onBack={() => setEditingPatient(null)} onSave={savePatient} />
        <BottomNav active={view} onChange={(id: any) => setView(id)} />
      </div>
    );
  }

  // Pages
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-indigo-600 text-white rounded-b-[2.5rem] p-6 shadow-lg shadow-indigo-600/20">
        <div className="flex items-center gap-3 mb-2 mt-2">
          <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-sm">
            <Activity size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
            <p className="text-indigo-200 text-sm font-medium">{APP_SUBTITLE}</p>
          </div>
        </div>

        <div className="mt-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </header>

      {/* Content */}
      {view === 'patients' && (
        <PatientsPage
          patients={patients}
          activePatientId={activePatientId}
          onSelect={(id: string) => {
            setActivePatientId(id);
            setView('patient');
          }}
          onCreate={() => {
            createNewPatientDraft();
          }}
          onDelete={deletePatient}
          onEdit={async (id: string) => {
            const p = patients.find((x) => x.id === id);
            if (p) setEditingPatient(p);
          }}
        />
      )}

      {view === 'home' && (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          <ClinicalDisclaimer compact />

          {/* 3 primary actions */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <PrimaryAction
              title="Nueva valoración"
              subtitle="Aplicar una prueba y guardar"
              Icon={Stethoscope}
              onClick={() => setView('new')}
            />
            <PrimaryAction
              title="Buscar paciente"
              subtitle="Abrir expediente"
              Icon={Users}
              onClick={() => setView('patients')}
            />
            <PrimaryAction
              title="Herramienta rápida"
              subtitle="Sin guardar en paciente"
              Icon={ArrowRight}
              onClick={() => {
                setActivePatientId(null);
                setView('new');
              }}
            />
          </section>

          {/* Active patient */}
          <section className="bg-white border border-gray-200 rounded-3xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Paciente activo</div>
                <div className="text-lg font-bold text-gray-900 mt-1">{activePatient?.fullName || 'Modo rápido (sin paciente)'}</div>
                <div className="text-sm text-gray-500">
                  {activePatient ? `${activePatient?.age ?? '—'} años${activePatient?.sex ? ` / ${activePatient.sex}` : ''}` : 'Los resultados no se guardan en historial de paciente.'}
                </div>
              </div>
              <button onClick={() => setView('patients')} className="text-sm font-semibold text-indigo-700">
                {activePatient ? 'Cambiar' : 'Seleccionar'}
              </button>
            </div>

            {activePatient && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={exportDashboard}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 text-white font-semibold"
                >
                  <Download size={16} /> Exportar dashboard HTML
                </button>
                <button
                  onClick={() => setView('reports')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 font-semibold text-gray-700"
                >
                  <FileText size={16} /> Ver reportes
                </button>
              </div>
            )}
          </section>

          {/* last evaluations */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Últimas valoraciones</h2>
              <button onClick={() => setView('reports')} className="text-sm font-semibold text-gray-500 hover:text-gray-700">Ver todo</button>
            </div>
            {patientEvals.length === 0 ? (
              <div className="mt-3 bg-white border border-gray-200 rounded-3xl p-5 text-gray-500">Sin registro.</div>
            ) : (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {patientEvals.slice(0, 3).map((e) => (
                  <div key={e.id} className="bg-white border border-gray-200 rounded-3xl p-5">
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{e.toolTitle}</div>
                    <div className="text-lg font-bold text-gray-900 mt-1">{e?.results?.main?.value ?? '—'} {e?.results?.main?.unit ?? ''}</div>
                    <div className="text-sm text-gray-500 mt-1">{new Date(e.date).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Favorites */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Favoritos</h2>
              <button onClick={() => setView('more')} className="text-sm font-semibold text-gray-500 hover:text-gray-700">Gestionar</button>
            </div>
            {favoriteTools.length === 0 ? (
              <div className="mt-3 bg-white border border-gray-200 rounded-3xl p-5 text-gray-500">Aún no hay favoritos.</div>
            ) : (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteTools.slice(0, 6).map((tool) => (
                  <ToolCard key={tool.id} tool={tool} isFav={true} onOpen={openTool} />
                ))}
              </div>
            )}
          </section>

          {/* Frecuentes/Recientes */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Frecuentes</h2>
              <button onClick={() => setView('more')} className="text-sm font-semibold text-gray-500 hover:text-gray-700">Ver más</button>
            </div>
            {recents.length === 0 ? (
              <div className="mt-3 bg-white border border-gray-200 rounded-3xl p-5 text-gray-500">Aún no hay herramientas frecuentes.</div>
            ) : (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {recents.slice(0, 3).map((r) => (
                  <button
                    key={r.toolId}
                    onClick={() => openTool(r.toolId)}
                    className="bg-white border border-gray-200 rounded-3xl p-5 text-left hover:shadow-md transition"
                  >
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{r.toolTitle}</div>
                    <div className="text-sm text-gray-500 mt-1">Último uso: {new Date(r.lastUsedAt).toLocaleString()}</div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {view === 'session' && (
        <SessionWizard
          onExit={() => setView('patient')}
          onFinish={() => setView('patient')}
        />
      )}

      {view === 'new' && (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Nueva valoración</h2>
              <p className="text-sm text-gray-500 mt-1">Selecciona una herramienta. {activePatientId ? 'Se guardará en el expediente.' : 'Modo rápido: no se guarda en paciente.'}</p>
            </div>
            {activePatientId && (
              <button onClick={exportDashboard} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 font-semibold text-gray-700">
                <Download size={16} /> Exportar
              </button>
            )}
          </div>

          <TemplatePicker templates={assessmentTemplates} value={activeTemplateId} onChange={setActiveTemplateId} />

          {activePatientId && (
            <div className="bg-white border border-gray-200 rounded-3xl p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sesión</div>
              <div className="text-sm text-gray-500 mt-1">Inicia un flujo guiado (wizard) usando la plantilla seleccionada.</div>
              <button
                onClick={() => {
                  const t = activeTemplateId ? assessmentTemplates.find((x) => x.id === activeTemplateId) : assessmentTemplates.find((x) => x.id === 'quick');
                  const toolIds = (t?.toolIds || []).filter((id) => clinicalTools.some((ct) => ct.id === id));
                  startWizardSession({ patientId: activePatientId, templateId: t?.id || null, toolIds });
                  setView('session');
                }}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 text-white font-semibold"
              >
                Iniciar sesión guiada
              </button>
            </div>
          )}

          <div>
            <CategoryTabs categories={CATEGORIES} activeCategory={activeCategory} onChange={setActiveCategory} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} isFav={favorites.includes(tool.id)} onOpen={openTool} />
            ))}
          </div>
        </main>
      )}

      {view === 'reports' && (
        <main className="max-w-5xl mx-auto px-4 py-6">
          <h2 className="text-xl font-extrabold text-gray-900">Reportes</h2>
          <p className="text-sm text-gray-500 mt-1">Historial del paciente activo.</p>

          {!activePatientId ? (
            <div className="mt-4 bg-white border border-amber-200 rounded-3xl p-6 text-amber-900">
              <div className="font-semibold">Selecciona un paciente para ver reportes.</div>
              <button onClick={() => setView('patients')} className="mt-2 text-sm font-semibold text-indigo-700">Ir a pacientes</button>
            </div>
          ) : patientEvals.length === 0 ? (
            <div className="mt-4 bg-white border border-gray-200 rounded-3xl p-6 text-gray-500">Sin registro.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {patientEvals.slice(0, 40).map((e) => (
                <div key={e.id} className="bg-white border border-gray-200 rounded-3xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{e.toolTitle}</div>
                      <div className="text-lg font-bold text-gray-900 mt-1">{e?.results?.main?.value ?? '—'} {e?.results?.main?.unit ?? ''}</div>
                      <div className="text-sm text-gray-500 mt-1">{new Date(e.date).toLocaleString()}</div>
                    </div>
                    <button
                      onClick={exportDashboard}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-gray-200 font-semibold text-gray-700"
                    >
                      <Download size={16} /> Dashboard
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {view === 'patient' && (
        <PatientProfilePage
          patient={activePatient}
          evaluations={patientEvals}
          onNewEvaluation={() => setView('new')}
          onExportHTML={exportDashboard}
          onPrint={printDashboard}
          onViewTable={() => setView('table')}
          onEdit={async () => {
            if (!activePatientId) return;
            const p = patients.find((x) => x.id === activePatientId);
            if (p) setEditingPatient(p);
          }}
        />
      )}

      {view === 'table' && (
        <PatientTablePage
          appName={APP_NAME}
          patient={activePatient}
          evaluations={patientEvals}
          onBack={() => setView('patient')}
          onExportHTML={exportDashboard}
          onPrint={printDashboard}
        />
      )}

      {view === 'dashboard' && (
        <div className="pb-24">
          <div className="max-w-4xl mx-auto px-4 py-4 print:hidden flex items-center justify-between">
            <div className="font-extrabold text-gray-900">Dashboard PDF</div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="px-4 py-2 rounded-2xl bg-indigo-600 text-white font-semibold">Imprimir / Guardar PDF</button>
              <button onClick={() => setView('patient')} className="px-4 py-2 rounded-2xl border border-gray-200 font-semibold text-gray-700">Volver</button>
            </div>
          </div>
          <DashboardPrintView appName={APP_NAME} patient={activePatient} evaluations={patientEvals} />
        </div>
      )}

      {view === 'more' && (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          <h2 className="text-xl font-extrabold text-gray-900">Más</h2>

          <section className="bg-white border border-gray-200 rounded-3xl p-5">
            <div className="flex items-center gap-2 font-semibold text-gray-900"><Stethoscope size={18}/> Herramientas</div>
            <p className="text-sm text-gray-500 mt-1">Catálogo completo.</p>
            <button onClick={() => setView('new')} className="mt-3 inline-flex items-center gap-2 text-indigo-700 font-semibold">Abrir catálogo <ArrowRight size={16}/></button>
          </section>

          <section className="bg-white border border-gray-200 rounded-3xl p-5">
            <div className="flex items-center gap-2 font-semibold text-gray-900"><Star size={18}/> Favoritos</div>
            <p className="text-sm text-gray-500 mt-1">Marca herramientas para acceso rápido.</p>
          </section>

          <section className="bg-white border border-gray-200 rounded-3xl p-5">
            <div className="flex items-center gap-2 font-semibold text-gray-900"><Clock size={18}/> Recientes</div>
            <p className="text-sm text-gray-500 mt-1">Herramientas usadas con frecuencia.</p>
          </section>

          <section className="bg-white border border-gray-200 rounded-3xl p-5">
            <div className="flex items-center gap-2 font-semibold text-gray-900"><Search size={18}/> Ayuda clínica</div>
            <p className="text-sm text-gray-500 mt-1">Panel educativo por herramienta (pendiente).</p>
          </section>
        </main>
      )}

      <BottomNav active={view} onChange={(id: any) => {
        if (id === 'new') setView('new');
        else setView(id);
      }} />
    </div>
  );
}

function PrimaryAction({ title, subtitle, Icon, onClick }: any) {
  return (
    <button onClick={onClick} className="bg-white border border-gray-200 rounded-3xl p-5 text-left hover:shadow-md transition">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
        <Icon size={24} />
      </div>
      <div className="mt-3 font-extrabold text-gray-900">{title}</div>
      <div className="mt-1 text-sm text-gray-500">{subtitle}</div>
    </button>
  );
}

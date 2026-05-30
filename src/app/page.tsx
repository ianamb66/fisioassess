'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle } from 'lucide-react';

import TopNav from '../components/TopNav';
import ToolRunner from '../components/ToolRunner';
import ToolCard from '../components/ToolCard';
import SearchBar from '../components/SearchBar';
import CategoryTabs from '../components/CategoryTabs';
import PatientEditor from '../features/patients/PatientEditor';
import PatientsPage from '../features/patients/PatientsPage';
import ToolEducationPanel from '../components/ToolEducationPanel';

import { clinicalTools } from '../data/clinicalTools';
import { CATEGORIES } from '../data/categories';

import { KEYS, storage } from '../utils/storage';
import { getReferenceValue } from '../utils/getReferenceValue';
import {
  addEvaluationToPatient,
  deletePatient,
  loadActivePatientId,
  loadPatients,
  saveActivePatientId,
  upsertPatient,
} from '../features/patients/patientStore';

const APP_NAME = 'FisioAssess';
const APP_SUBTITLE = 'Sistema de valoración fisioterapéutica';

type ViewId = 'home' | 'patients' | 'tools' | 'favorites' | 'recents' | 'settings';

export default function Page() {
  const [view, setView] = useState<ViewId>('home');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<any[]>([]);

  const [patients, setPatients] = useState<any[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

  // Load persisted state
  useEffect(() => {
    setFavorites(storage.get(KEYS.favorites, []));
    setRecents(storage.get(KEYS.recents, []));
    setPatients(loadPatients());
    setActivePatientId(loadActivePatientId());
  }, []);

  useEffect(() => {
    storage.set(KEYS.favorites, favorites);
  }, [favorites]);

  useEffect(() => {
    storage.set(KEYS.recents, recents);
  }, [recents]);

  const activePatient = useMemo(() => patients.find((p) => p.id === activePatientId) || null, [patients, activePatientId]);

  const filteredTools = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    const base = clinicalTools.filter((tool) => {
      const t = (tool.title || '').toLowerCase();
      const d = (tool.description || '').toLowerCase();
      const matchesSearch = t.includes(q) || d.includes(q);
      const matchesCat = activeCategory === 'all' || tool.category === activeCategory;
      return matchesSearch && matchesCat;
    });

    // favorites first when in tools view
    return [...base].sort((a, b) => {
      const af = favorites.includes(a.id) ? 1 : 0;
      const bf = favorites.includes(b.id) ? 1 : 0;
      return bf - af;
    });
  }, [searchQuery, activeCategory, favorites]);

  const activeTool = useMemo(() => clinicalTools.find((t) => t.id === activeToolId) || null, [activeToolId]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  };

  const openTool = (toolId: string) => {
    setActiveToolId(toolId);
    const tool = clinicalTools.find((t) => t.id === toolId);
    if (!tool) return;

    setRecents((prev) => {
      const next = [{ toolId, toolTitle: tool.title, lastUsedAt: new Date().toISOString() }, ...prev.filter((r) => r.toolId !== toolId)];
      return next.slice(0, 20);
    });
  };

  const closeTool = () => setActiveToolId(null);

  const savePatient = (patient: any) => {
    const next = upsertPatient(patient);
    setPatients(next);
    setActivePatientId(patient.id);
    saveActivePatientId(patient.id);
    setEditingPatientId(null);
    setView('home');
  };

  const selectPatient = (id: string | null) => {
    setActivePatientId(id);
    saveActivePatientId(id);
  };

  const handleCreatePatient = (patient: any) => {
    // open editor with a newly created patient object
    setPatients((prev) => prev);
    setEditingPatientId(patient.id);
    // store in memory-only until save
    tempPatientDrafts.current[patient.id] = patient;
  };

  const handleDeletePatient = (id: string) => {
    const next = deletePatient(id);
    setPatients(next);
  };

  const tempPatientDrafts = React.useRef<Record<string, any>>({});

  const editingPatient = useMemo(() => {
    if (!editingPatientId) return null;
    return patients.find((p) => p.id === editingPatientId) || tempPatientDrafts.current[editingPatientId] || null;
  }, [editingPatientId, patients]);

  const onSaveEvaluation = ({ tool, result, formData }: any) => {
    if (!tool || !result || result?.error) return;

    if (!activePatientId) return;

    const ref = getReferenceValue(tool.id, activePatient, result);

    const evaluation = {
      toolId: tool.id,
      toolTitle: tool.title,
      inputs: formData,
      results: result,
      reference: ref,
      interpretation: {
        general: result.interpretation || '',
        referenceMissing: !ref,
      },
    };

    const next = addEvaluationToPatient({ patientId: activePatientId, evaluation });
    setPatients(next);
  };

  // TOOL RUNNER VIEW
  if (activeTool) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopNav active={view} onChange={(v: any) => setView(v)} />

        <div className="max-w-2xl mx-auto px-4 pt-4">
          {!activePatientId ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5" size={18} />
                <div>
                  <div className="font-semibold">Modo rápido</div>
                  <div className="text-sm mt-1">Los resultados no están personalizados por edad, sexo o población. Para guardar en historial, selecciona/crea un paciente.</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setView('patients');
                  closeTool();
                }}
                className="mt-3 text-sm font-semibold text-indigo-700"
              >
                Ir a Pacientes
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-gray-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Paciente activo</div>
              <div className="font-bold text-gray-900 mt-1">{activePatient?.name || '—'}</div>
              <div className="text-sm text-gray-500">{activePatient?.age ? `${activePatient.age} años` : 'Edad —'}{activePatient?.sex ? ` / ${activePatient.sex}` : ''}</div>
            </div>
          )}
        </div>

        <ToolRunner
          tool={activeTool}
          onBack={closeTool}
          isFavorite={favorites.includes(activeTool.id)}
          toggleFavorite={toggleFavorite}
          patientData={{ patientName: activePatient?.name || '' }}
          onSaveReport={({ tool, result, formData }: any) => onSaveEvaluation({ tool, result, formData })}
          previousReport={null}
        />

        <div className="max-w-2xl mx-auto px-4 pb-16">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 mt-6">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
              <Activity size={18} /> Valores de referencia
            </div>
            <p className="text-sm text-gray-500 mt-2">{activePatientId ? 'Se mostrarán cuando existan tablas cargadas para este perfil.' : 'Disponible al seleccionar un paciente.'}</p>
            <p className="text-sm text-gray-500 mt-2 italic">Valores de referencia pendientes de cargar para esta población.</p>
          </div>

          <ToolEducationPanel toolId={activeTool.id} />
        </div>
      </div>
    );
  }

  // PATIENT EDITOR VIEW
  if (editingPatient) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopNav active={view} onChange={(v: any) => setView(v)} />
        <PatientEditor
          patient={editingPatient}
          onBack={() => setEditingPatientId(null)}
          onSave={savePatient}
        />
      </div>
    );
  }

  // MAIN SHELL
  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav active={view} onChange={(v: any) => setView(v)} />

      {view === 'patients' && (
        <PatientsPage
          patients={patients}
          activePatientId={activePatientId}
          onSelect={(id: string) => {
            selectPatient(id);
            setView('home');
          }}
          onCreate={handleCreatePatient}
          onDelete={handleDeletePatient}
          onEdit={(id: string) => setEditingPatientId(id)}
        />
      )}

      {view !== 'patients' && (
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
      )}

      {view === 'home' && (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          <section className="bg-white border border-gray-200 rounded-3xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Paciente activo</div>
                <div className="text-lg font-bold text-gray-900 mt-1">{activePatient?.name || 'Modo rápido (sin paciente)'}</div>
                <div className="text-sm text-gray-500">
                  {activePatient ? `${activePatient?.age || '—'} años${activePatient?.sex ? ` / ${activePatient.sex}` : ''}` : 'Interpretación general. No se guarda historial por paciente.'}
                </div>
              </div>
              <button
                onClick={() => setView('patients')}
                className="text-sm font-semibold text-indigo-700"
              >
                {activePatient ? 'Cambiar' : 'Seleccionar'}
              </button>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Recientes</h2>
              <button onClick={() => setRecents([])} className="text-sm font-semibold text-gray-500 hover:text-gray-700">Limpiar</button>
            </div>
            {recents.length === 0 ? (
              <div className="mt-3 bg-white border border-gray-200 rounded-3xl p-5 text-gray-500">Aún no hay herramientas recientes.</div>
            ) : (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {recents.slice(0, 6).map((r) => (
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

          <section>
            <h2 className="font-bold text-gray-900">Herramientas</h2>
            <div className="mt-3">
              <CategoryTabs categories={CATEGORIES} activeCategory={activeCategory} onChange={setActiveCategory} />
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} isFav={favorites.includes(tool.id)} onOpen={openTool} />
              ))}
            </div>
          </section>
        </main>
      )}

      {view === 'favorites' && (
        <main className="max-w-5xl mx-auto px-4 py-6">
          <h2 className="text-xl font-extrabold text-gray-900">Favoritos</h2>
          <p className="text-sm text-gray-500 mt-1">Se guardan localmente.</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinicalTools.filter((t) => favorites.includes(t.id)).map((tool) => (
              <ToolCard key={tool.id} tool={tool} isFav={true} onOpen={openTool} />
            ))}
            {clinicalTools.filter((t) => favorites.includes(t.id)).length === 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 text-gray-500">Aún no hay favoritos.</div>
            )}
          </div>
        </main>
      )}

      {view === 'recents' && (
        <main className="max-w-5xl mx-auto px-4 py-6">
          <h2 className="text-xl font-extrabold text-gray-900">Recientes</h2>
          <p className="text-sm text-gray-500 mt-1">Últimas herramientas usadas.</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {recents.map((r) => (
              <button
                key={r.toolId}
                onClick={() => openTool(r.toolId)}
                className="bg-white border border-gray-200 rounded-3xl p-5 text-left hover:shadow-md transition"
              >
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{r.toolTitle}</div>
                <div className="text-sm text-gray-500 mt-1">{new Date(r.lastUsedAt).toLocaleString()}</div>
              </button>
            ))}
            {recents.length === 0 && <div className="bg-white border border-gray-200 rounded-3xl p-6 text-gray-500">Aún no hay recientes.</div>}
          </div>
        </main>
      )}

      {view === 'tools' && (
        <main className="max-w-5xl mx-auto px-4 py-6">
          <h2 className="text-xl font-extrabold text-gray-900">Herramientas</h2>
          <p className="text-sm text-gray-500 mt-1">Busca y ejecuta herramientas. Selecciona un paciente para personalizar.</p>
          <div className="mt-3">
            <CategoryTabs categories={CATEGORIES} activeCategory={activeCategory} onChange={setActiveCategory} />
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} isFav={favorites.includes(tool.id)} onOpen={openTool} />
            ))}
          </div>
        </main>
      )}

      {view === 'settings' && (
        <main className="max-w-3xl mx-auto px-4 py-6">
          <h2 className="text-xl font-extrabold text-gray-900">Configuración</h2>
          <p className="text-sm text-gray-500 mt-1">Próximamente: tema, modo oscuro y personalización de marca.</p>

          <div className="mt-4 bg-white border border-gray-200 rounded-3xl p-5">
            <div className="font-semibold text-gray-900">Datos locales</div>
            <p className="text-sm text-gray-500 mt-1">Pacientes, favoritos y recientes se guardan en tu navegador (localStorage). No hay backend.</p>
            <div className="mt-4 flex gap-2">
              <button
                className="px-4 py-2 rounded-2xl border border-gray-200 font-semibold text-gray-700"
                onClick={() => {
                  setFavorites([]);
                  setRecents([]);
                }}
              >
                Limpiar favoritos/recientes
              </button>
              <button
                className="px-4 py-2 rounded-2xl border border-rose-200 font-semibold text-rose-700"
                onClick={() => {
                  storage.set(KEYS.patients, []);
                  storage.set(KEYS.activePatientId, null);
                  setPatients([]);
                  setActivePatientId(null);
                }}
              >
                Borrar pacientes
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
            <AlertCircle size={12} /> Herramienta de apoyo clínico. La interpretación final depende del criterio profesional.
          </div>
        </main>
      )}
    </div>
  );
}

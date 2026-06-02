'use client';

import React, { useMemo, useState } from 'react';
import { Activity, ArrowRight, FileText, MoreHorizontal, Stethoscope } from 'lucide-react';

import BottomNav from '../components/BottomNav';
import ClinicalDisclaimer from '../components/ClinicalDisclaimer';
import ToolCard from '../components/ToolCard';
import ToolRunner from '../components/ToolRunner';
import TemplatePicker from '../components/TemplatePicker';

import SessionWizard from '../features/session/SessionWizard';
import SessionReportPage from '../features/session/SessionReportPage';

import { clinicalTools } from '../data/clinicalTools';
import { assessmentTemplates } from '../data/assessmentTemplates';
import { useSessionsStore } from '../state/sessionsStore';

const APP_NAME = 'FisioAssess';
const APP_SUBTITLE = 'Sistema de valoración fisioterapéutica por sesión';

type ViewId = 'home' | 'new' | 'tool' | 'session' | 'reports' | 'more' | 'report';

export default function Page() {
  const [view, setView] = useState<ViewId>('home');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  const sessions = useSessionsStore((s) => s.sessions);

  const activeTool = useMemo(() => clinicalTools.find((t) => t.id === activeToolId) || null, [activeToolId]);
  const activeSession = useMemo(() => sessions.find((s) => s.id === activeReportId) || null, [sessions, activeReportId]);

  const filteredTools = useMemo(() => {
    const template = activeTemplateId ? assessmentTemplates.find((t) => t.id === activeTemplateId) : null;
    const allowed = template ? new Set(template.toolIds) : null;
    return clinicalTools.filter((t) => (allowed ? allowed.has(t.id) : true));
  }, [activeTemplateId]);

  const openTool = (toolId: string) => {
    setActiveToolId(toolId);
    setView('tool');
  };

  const header = (
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
    </header>
  );

  if (view === 'session') {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        {header}
        <SessionWizard onExit={() => setView('home')} onFinish={() => setView('reports')} />
        <BottomNav active={'new'} onChange={(id: any) => setView(id)} />
      </div>
    );
  }

  if (view === 'tool' && activeTool) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        {header}
        <ToolRunner
          tool={activeTool}
          onBack={() => {
            setActiveToolId(null);
            setView('new');
          }}
          isFavorite={false}
          toggleFavorite={() => {}}
          patientData={{}}
          initialFormData={{}}
          onFormDataChange={() => {}}
          onSaveReport={() => {
            // In modo aislado, el guardado real ocurre en la sesión guiada.
          }}
          previousReport={null}
        />
        <BottomNav active={'new'} onChange={(id: any) => setView(id)} />
      </div>
    );
  }

  if (view === 'report' && activeSession) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        {header}
        <SessionReportPage appName={APP_NAME} session={activeSession} onBack={() => setView('reports')} />
        <BottomNav active={'reports'} onChange={(id: any) => setView(id)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {header}

      {view === 'home' && (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          <ClinicalDisclaimer compact />

          <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PrimaryAction
              title="Nueva sesión"
              subtitle="Wizard + reporte final"
              Icon={Stethoscope}
              onClick={() => setView('new')}
            />
            <PrimaryAction
              title="Reportes"
              subtitle="Sesiones guardadas"
              Icon={FileText}
              onClick={() => setView('reports')}
            />
          </section>
        </main>
      )}

      {view === 'new' && (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Nueva sesión</h2>
            <p className="text-sm text-gray-500 mt-1">Selecciona una plantilla o usa “Todas”. Luego inicia sesión guiada o abre una herramienta.</p>
          </div>

          <TemplatePicker templates={assessmentTemplates} value={activeTemplateId} onChange={setActiveTemplateId} />

          <div className="bg-white border border-gray-200 rounded-3xl p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sesión guiada</div>
            <div className="text-sm text-gray-500 mt-1">Completa varias pruebas y genera un reporte único (PDF/HTML).</div>
            <button
              onClick={() => setView('session')}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 text-white font-extrabold"
            >
              Iniciar sesión guiada <ArrowRight size={18} />
            </button>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Herramientas</div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} isFav={false} onOpen={openTool} />
              ))}
            </div>
          </div>
        </main>
      )}

      {view === 'reports' && (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Reportes</h2>
            <p className="text-sm text-gray-500 mt-1">Sesiones guardadas localmente en este dispositivo.</p>
          </div>

          {sessions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 text-gray-500">Aún no hay sesiones.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sessions.slice(0, 30).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveReportId(s.id);
                    setView('report');
                  }}
                  className="bg-white border border-gray-200 rounded-3xl p-5 text-left hover:shadow-md transition"
                >
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{new Date(s.createdAt).toLocaleString('es-MX')}</div>
                  <div className="text-sm text-gray-600 mt-1">Fisio: {s.meta.therapistName || '—'} | Edad/Sexo: {s.meta.age ?? '—'}{s.meta.sex ? ` / ${s.meta.sex}` : ''}</div>
                  <div className="text-sm text-gray-500 mt-2">Pruebas: {s.tools.length}</div>
                </button>
              ))}
            </div>
          )}
        </main>
      )}

      {view === 'more' && (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
          <h2 className="text-xl font-extrabold text-gray-900">Más</h2>
          <div className="bg-white border border-gray-200 rounded-3xl p-5">
            <div className="flex items-center gap-2 font-semibold text-gray-900"><MoreHorizontal size={18}/> Ajustes</div>
            <p className="text-sm text-gray-500 mt-1">Próximamente: modo oscuro, tema, export/import.</p>
          </div>
          <div className="text-xs text-gray-400">Herramienta de apoyo clínico. La interpretación final depende del criterio profesional.</div>
        </main>
      )}

      <BottomNav active={view === 'tool' ? 'new' : view} onChange={(id: any) => setView(id)} />
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

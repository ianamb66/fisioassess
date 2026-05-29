import React, { useMemo, useState } from 'react';
import { Calculator, Home as HomeIcon, Star } from 'lucide-react';

import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryTabs from '../components/CategoryTabs';
import ToolCard from '../components/ToolCard';
import PatientForm from '../components/PatientForm';

import { CATEGORIES } from '../data/categories';
import { clinicalTools } from '../data/clinicalTools';

export default function Home({
  appName = 'FisioAssess',
  subtitle = 'Sistema de valoración fisioterapéutica',
  activeCategory = 'all',
  setActiveCategory = () => {},
  searchQuery = '',
  setSearchQuery = () => {},
  favorites = [],
  setActiveToolId = () => {},
  patientData = {},
  setPatientData = () => {},
  recentReports = [],
  onOpenReport = () => {},
  onClearHistory = () => {},
}) {
  const filteredTools = useMemo(() => {
    return clinicalTools.filter((tool) => {
      const q = (searchQuery || '').toLowerCase();
      const t = (tool.title || '').toLowerCase();
      const d = (tool.description || '').toLowerCase();
      const matchesSearch = t.includes(q) || d.includes(q);
      const matchesCat = activeCategory === 'all' || tool.category === activeCategory;
      const matchesFav = activeCategory === 'favorites' ? favorites.includes(tool.id) : true;
      if (activeCategory === 'favorites') return matchesSearch && matchesFav;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory, favorites]);

  const dashboard = useMemo(() => {
    const total = clinicalTools.length;
    const tests = clinicalTools.filter((t) => t.category === 'funcionales').length;
    const scales = clinicalTools.filter((t) => t.category === 'escalas' || t.category === 'dolor').length;
    const reports = recentReports.length;
    const last = recentReports[0];
    return { total, tests, scales, reports, last };
  }, [recentReports]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <Header appName={appName} subtitle={subtitle}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </Header>

      <main className="px-4 mt-6 max-w-5xl mx-auto">
        {/* Perfil funcional (dashboard) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200/60 rounded-3xl p-5">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Perfil funcional</p>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="rounded-2xl bg-indigo-50 p-4">
                <div className="text-2xl font-extrabold text-indigo-900">{dashboard.total}</div>
                <div className="text-xs font-semibold text-indigo-700 mt-1">Herramientas</div>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <div className="text-2xl font-extrabold text-emerald-900">{dashboard.tests}</div>
                <div className="text-xs font-semibold text-emerald-700 mt-1">Pruebas funcionales</div>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <div className="text-2xl font-extrabold text-amber-900">{dashboard.scales}</div>
                <div className="text-xs font-semibold text-amber-700 mt-1">Escalas clínicas</div>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <div className="text-2xl font-extrabold text-slate-900">{dashboard.reports}</div>
                <div className="text-xs font-semibold text-slate-700 mt-1">Reportes guardados</div>
              </div>
            </div>
            {dashboard.last && (
              <div className="mt-4 text-sm text-gray-600">
                <span className="font-semibold">Última valoración:</span> {dashboard.last.toolTitle} — {dashboard.last.patientData?.patientName || 'Sin nombre'}
              </div>
            )}
          </div>

          <PatientForm value={patientData} onChange={setPatientData} compact />
        </section>

        {/* Historial reciente */}
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Historial reciente</h2>
            {recentReports.length > 0 && (
              <button onClick={onClearHistory} className="text-sm font-semibold text-rose-600 hover:text-rose-700">Limpiar historial</button>
            )}
          </div>

          {recentReports.length === 0 ? (
            <div className="mt-3 bg-white border border-gray-200/60 rounded-3xl p-5 text-gray-500">
              Aún no hay valoraciones guardadas. Ejecuta una herramienta y usa “Guardar valoración”.
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentReports.slice(0, 6).map((r) => (
                <button
                  key={r.id}
                  onClick={() => onOpenReport(r.id)}
                  className="bg-white border border-gray-200/60 rounded-3xl p-5 text-left hover:shadow-md transition"
                >
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{r.toolTitle}</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">{r.patientData?.patientName || 'Sin nombre'}</div>
                  <div className="text-sm text-gray-500 mt-1">{new Date(r.createdAt).toLocaleString()}</div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Categories */}
        <div className="mt-8">
          <CategoryTabs categories={CATEGORIES} activeCategory={activeCategory} onChange={setActiveCategory} />
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} isFav={favorites.includes(tool.id)} onOpen={setActiveToolId} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 flex flex-col items-center">
              <Calculator size={48} className="text-gray-300 mb-4" />
              <p className="font-medium text-lg text-gray-600">No se encontraron herramientas</p>
              <p className="text-sm mt-1">Prueba con otra búsqueda o categoría</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 pb-safe print:hidden">
        <div className="flex justify-around items-center p-3 max-w-md mx-auto">
          <button
            onClick={() => {
              setActiveCategory('all');
              window.scrollTo(0, 0);
            }}
            className={`p-3 rounded-2xl ${activeCategory !== 'favorites' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400'}`}
            aria-label="Inicio"
          >
            <HomeIcon size={24} />
          </button>
          <button
            onClick={() => setActiveCategory('favorites')}
            className={`p-3 rounded-2xl ${activeCategory === 'favorites' ? 'text-amber-600 bg-amber-50' : 'text-gray-400'}`}
            aria-label="Favoritos"
          >
            <Star size={24} />
          </button>
        </div>
      </div>

      <footer className="hidden md:block mt-10 pb-24 text-center text-xs text-gray-400">
        Herramienta de apoyo clínico. La interpretación final depende del criterio profesional.
      </footer>
    </div>
  );
}

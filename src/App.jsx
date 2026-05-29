import React, { useEffect, useMemo, useState } from 'react';
import HomePage from './pages/Home';
import ToolPage from './pages/ToolPage';
import ReportPreview from './components/ReportPreview';
import PatientForm from './components/PatientForm';

import { clinicalTools } from './data/clinicalTools';
import { CATEGORIES } from './data/categories';
import { clearReports, deleteReport, findPreviousForSTS, loadReports, saveReport } from './utils/history';

export const APP_NAME = 'FisioAssess';
export const APP_SUBTITLE = 'Sistema de valoración fisioterapéutica';

export default function App() {
  const [activeToolId, setActiveToolId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const [favorites, setFavorites] = useState(() => {
    try {
      const item = window.localStorage.getItem('physiocalc_favs');
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });

  const [patientData, setPatientData] = useState(() => {
    try {
      const raw = window.localStorage.getItem('physiocalc_patient_v1');
      return raw ? JSON.parse(raw) : { assessmentDate: new Date().toISOString().slice(0, 10) };
    } catch {
      return { assessmentDate: new Date().toISOString().slice(0, 10) };
    }
  });

  const [reports, setReports] = useState(() => {
    try {
      return loadReports();
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

  useEffect(() => {
    try {
      window.localStorage.setItem('physiocalc_patient_v1', JSON.stringify(patientData));
    } catch {
      // ignore
    }
  }, [patientData]);

  const toggleFavorite = (id) => setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  const activeTool = clinicalTools.find((t) => t.id === activeToolId);

  const openReportById = (id) => {
    const r = reports.find((x) => x.id === id);
    if (!r) return;
    // Open tool and keep patient data (do not overwrite). This is just for navigation.
    setActiveToolId(r.toolId);
  };

  const clearHistory = () => {
    clearReports();
    setReports([]);
  };

  const onSaveReport = ({ tool, result, formData, previousReport }) => {
    const entry = saveReport(tool, result, patientData, { formData });
    setReports((prev) => [entry, ...prev].slice(0, 50));
  };

  const previousSTS = useMemo(() => {
    if (!activeTool || activeTool.id !== 'sts30') return null;
    return findPreviousForSTS(reports, patientData);
  }, [activeTool, reports, patientData]);

  if (activeTool) {
    return (
      <ToolPage
        appName={APP_NAME}
        tool={activeTool}
        onBack={() => setActiveToolId(null)}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        patientData={patientData}
        onSaveReport={onSaveReport}
        previousReport={previousSTS}
      />
    );
  }

  return (
    <HomePage
      appName={APP_NAME}
      subtitle={APP_SUBTITLE}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      favorites={favorites}
      setActiveToolId={setActiveToolId}
      patientData={patientData}
      setPatientData={setPatientData}
      recentReports={reports}
      onOpenReport={openReportById}
      onClearHistory={clearHistory}
    />
  );
}

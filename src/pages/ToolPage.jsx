import React, { useMemo } from 'react';
import ToolRunner from '../components/ToolRunner';
import ReportPreview from '../components/ReportPreview';

export default function ToolPage({ appName, tool, onBack, favorites, toggleFavorite, patientData, onSaveReport, previousReport }) {
  if (!tool) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <ToolRunner
        tool={tool}
        onBack={onBack}
        isFavorite={favorites.includes(tool.id)}
        toggleFavorite={toggleFavorite}
        patientData={patientData}
        onSaveReport={onSaveReport}
        previousReport={previousReport}
      />
      {/* Report preview prints cleanly (CSS via print hides UI buttons) */}
    </div>
  );
}

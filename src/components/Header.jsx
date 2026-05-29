import React from 'react';
import { Activity } from 'lucide-react';

export default function Header({ appName, subtitle, children }) {
  return (
    <header className="bg-indigo-600 text-white rounded-b-[2.5rem] p-6 shadow-lg shadow-indigo-600/20">
      <div className="flex items-center gap-3 mb-6 mt-2">
        <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-sm">
          <Activity size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{appName}</h1>
          <p className="text-indigo-200 text-sm font-medium">{subtitle}</p>
        </div>
      </div>
      {children}
    </header>
  );
}

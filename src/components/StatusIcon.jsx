import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function StatusIcon({ color, size = 24 }) {
  if (color === 'green') return <CheckCircle2 size={size} className="text-emerald-500" />;
  if (color === 'yellow') return <AlertCircle size={size} className="text-amber-500" />;
  return <AlertTriangle size={size} className="text-rose-500" />;
}

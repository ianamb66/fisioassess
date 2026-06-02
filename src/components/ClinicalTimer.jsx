import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

/**
 * ClinicalTimer
 * - mode: 'stopwatch' | 'countdown'
 * - durationSec: number (for countdown)
 * - onStop: (elapsedMs:number) => void
 */
export default function ClinicalTimer({
  mode = 'stopwatch',
  durationSec = 0,
  autoStart = false,
  onStop,
  onTick,
  title = 'Cronómetro',
}) {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [remainingMs, setRemainingMs] = useState(durationSec * 1000);

  const rafRef = useRef(null);
  const lastRef = useRef(null);

  const currentMs = mode === 'countdown' ? remainingMs : elapsedMs;

  const mmss = useMemo(() => {
    const totalSec = Math.max(0, Math.round(currentMs / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [currentMs]);

  useEffect(() => {
    if (!autoStart) return;
    setRunning(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
      return;
    }

    const loop = (t) => {
      if (!lastRef.current) lastRef.current = t;
      const dt = t - lastRef.current;
      lastRef.current = t;

      if (mode === 'countdown') {
        setRemainingMs((prev) => {
          const next = prev - dt;
          if (next <= 0) {
            // stop at 0
            setRunning(false);
            const totalElapsed = (durationSec * 1000) - 0;
            onStop?.(durationSec * 1000);
            return 0;
          }
          return next;
        });
      } else {
        setElapsedMs((prev) => prev + dt);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, mode, durationSec, onStop]);

  useEffect(() => {
    onTick?.(mode === 'countdown' ? remainingMs : elapsedMs);
  }, [elapsedMs, remainingMs, mode, onTick]);

  const reset = () => {
    setRunning(false);
    setElapsedMs(0);
    setRemainingMs(durationSec * 1000);
  };

  const stop = () => {
    setRunning(false);
    const ms = mode === 'countdown' ? (durationSec * 1000 - remainingMs) : elapsedMs;
    onStop?.(ms);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</div>
          <div className="text-4xl font-extrabold text-gray-900 mt-1 tabular-nums">{mmss}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => (running ? stop() : setRunning(true))}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-semibold ${
              running ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-indigo-600 border-indigo-600 text-white'
            }`}
            aria-label={running ? 'Pausar' : 'Iniciar'}
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            onClick={reset}
            className="w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-200 text-gray-600 bg-white"
            aria-label="Reiniciar"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
        <div>{mode === 'countdown' ? `Duración: ${durationSec}s` : 'Modo: cronómetro'}</div>
        {running && (
          <button onClick={stop} className="font-semibold text-gray-700">
            Finalizar
          </button>
        )}
      </div>
    </div>
  );
}

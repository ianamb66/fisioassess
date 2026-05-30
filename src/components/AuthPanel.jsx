import React, { useMemo, useState } from 'react';
import { Lock, LogIn } from 'lucide-react';
import { supabase } from '../supabase/client';

export default function AuthPanel() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(() => {
    return email.includes('@') && password.length >= 6;
  }, [email, password]);

  const submit = async () => {
    if (!supabase) {
      setStatus({ type: 'error', msg: 'Supabase no está configurado (env vars faltantes).' });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setStatus({ type: 'ok', msg: 'Cuenta creada. Revisa tu correo si Supabase requiere confirmación.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setStatus({ type: 'ok', msg: 'Sesión iniciada.' });
      }
    } catch (e) {
      setStatus({ type: 'error', msg: e?.message || 'Error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 font-extrabold text-gray-900 text-lg">
          <Lock size={18} /> Acceso
        </div>
        <p className="text-sm text-gray-500 mt-1">Inicia sesión para ver tus pacientes y respaldos en la nube.</p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 px-4 py-2 rounded-2xl font-semibold border ${mode === 'login' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'}`}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 px-4 py-2 rounded-2xl font-semibold border ${mode === 'signup' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'}`}
          >
            Crear cuenta
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field label="Password" type="password" value={password} onChange={setPassword} hint="Mínimo 6 caracteres" />
        </div>

        {status && (
          <div className={`mt-4 text-sm rounded-2xl p-3 ${status.type === 'ok' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'}`}>
            {status.msg}
          </div>
        )}

        <button
          onClick={submit}
          disabled={!canSubmit || busy}
          className={`mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-extrabold ${canSubmit && !busy ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          <LogIn size={18} /> {mode === 'signup' ? 'Crear cuenta' : 'Entrar'}
        </button>

        <div className="mt-4 text-xs text-gray-400">
          Nota: necesitas configurar las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-slate-50 border border-gray-200 rounded-2xl py-3 px-4 font-medium"
      />
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}

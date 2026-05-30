import { useEffect, useState } from 'react';
import { supabase } from './client';

export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: any = null;

    (async () => {
      if (!supabase) {
        setError('Supabase no configurado. Falta NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.getSession();
      if (error) setError(error.message);
      setSession(data?.session || null);
      setLoading(false);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
        setSession(sess);
      });
      unsub = sub?.subscription;
    })();

    return () => {
      try { unsub?.unsubscribe?.(); } catch {}
    };
  }, []);

  return { session, loading, error };
}

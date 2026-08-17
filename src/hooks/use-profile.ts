import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  plan: 'free' | 'pro';
}

export interface UseProfileResult {
  profile: Profile | null;
  loading: boolean;
  /** Call after a plan upgrade to refresh the profile row */
  refresh: () => Promise<void>;
}

/**
 * Fetches the signed-in user's auth data and their profiles row.
 * Re-runs whenever the auth session changes.
 */
export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setProfile(null); return; }

      const user = session.user;

      // Try to get the profiles row
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, plan')
        .eq('id', user.id)
        .single();

      setProfile({
        id:        user.id,
        email:     user.email ?? null,
        full_name: data?.full_name
          ?? (user.user_metadata?.full_name as string | undefined)
          ?? null,
        plan: (data?.plan as 'free' | 'pro') ?? 'free',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();

    // Re-fetch if the session changes (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { profile, loading, refresh: fetchProfile };
}

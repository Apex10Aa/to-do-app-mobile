import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AppSplashScreen } from '@/components/app-splash-screen';
import { BiometricLockScreen } from '@/components/biometric-lock-screen';
import { ToastProvider } from '@/components/toast';
import { Brand, FontAssets } from '@/constants/theme';
import { useBiometricLock } from '@/hooks/use-biometric-lock';
import { supabase } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

// ---------------------------------------------------------------------------
// Auth state
// ---------------------------------------------------------------------------
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

function useAuthStatus(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? 'authenticated' : 'unauthenticated');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setStatus(session ? 'authenticated' : 'unauthenticated')
    );

    return () => subscription.unsubscribe();
  }, []);

  return status;
}

// ---------------------------------------------------------------------------
// Auth guard
// ---------------------------------------------------------------------------
function AuthGuard({ authStatus }: { authStatus: AuthStatus }) {
  const segments = useSegments();
  const router   = useRouter();

  useEffect(() => {
    if (authStatus === 'loading') return;
    const inAuthGroup = segments[0] === '(auth)';
    if (authStatus === 'unauthenticated' && !inAuthGroup) router.replace('/(auth)/login');
    else if (authStatus === 'authenticated' && inAuthGroup) router.replace('/(app)');
  }, [authStatus, segments, router]);

  return null;
}

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const authStatus  = useAuthStatus();
  const isAuth      = authStatus === 'authenticated';

  const [fontsLoaded, fontError]          = useFonts(FontAssets);
  const [nativeHidden, setNativeHidden]   = useState(false);
  const [appSplashDone, setAppSplashDone] = useState(false);

  const { isLocked, authFailed, unlock } = useBiometricLock(isAuth);
  const router = useRouter();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().then(() => setNativeHidden(true));
    }
  }, [fontsLoaded, fontError]);

  const handleSplashDone = useCallback(() => setAppSplashDone(true), []);

  async function handleBioLogout() {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  }

  const navTheme = colorScheme === 'dark'
    ? { ...DarkTheme,    colors: { ...DarkTheme.colors,    background: Brand.championBlue, card: '#1e1a3a',  border: '#2d2856', primary: Brand.lavenderTonic } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#f2effe',          card: '#ffffff',  border: '#ddd6f8', primary: Brand.lavenderTonic } };

  return (
    <ThemeProvider value={navTheme}>
      <ToastProvider>
        <Slot />
        {appSplashDone && <AuthGuard authStatus={authStatus} />}

        {isLocked && appSplashDone && isAuth && (
          <BiometricLockScreen
            authFailed={authFailed}
            onRetry={unlock}
            onLogout={handleBioLogout}
          />
        )}

        {nativeHidden && !appSplashDone && (
          <AppSplashScreen onAnimationComplete={handleSplashDone} />
        )}
      </ToastProvider>
    </ThemeProvider>
  );
}

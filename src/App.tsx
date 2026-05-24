import { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { useDbSync } from './hooks/useDbSync';
import { SURFACE, getAccent } from './lib/tokens';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardScreen } from './screens/DashboardScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { MobileScreen } from './screens/MobileScreen';
import { LoginScreen } from './screens/LoginScreen';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

const GUEST_KEY = 'cadence-guest';

export default function App() {
  const { state, dispatch } = useApp();
  const { user, loading, signOut } = useAuth();
  const isMobile = useIsMobile();
  const t = SURFACE[state.theme];
  const accent = getAccent(state.mode, state.palette);
  const isDark = state.theme === 'dark';

  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === 'true');

  useDbSync(user?.id ?? null);

  function handleGuest() {
    localStorage.setItem(GUEST_KEY, 'true');
    setIsGuest(true);
  }

  async function handleSignOut() {
    if (user) await signOut();
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  }

  if (loading) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: t.bg, color: t.textMuted,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: 14,
      }}>
        Loading…
      </div>
    );
  }

  if (!user && !isGuest) {
    return <LoginScreen onGuest={handleGuest} />;
  }

  if (isMobile) {
    return (
      <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden' }}>
        <MobileScreen theme={t} accent={accent} />
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      background: t.bg, color: t.text,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex',
      fontFeatureSettings: '"cv11", "ss01"',
      backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(255,255,255,0.055)' : 'rgba(0,0,0,0.09)'} 1px, transparent 1px)`,
      backgroundSize: '22px 22px',
    }}>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <Sidebar
        theme={t} accent={accent}
        active={state.currentScreen}
        isDark={isDark}
        themeSource={state.themeSource}
        userEmail={user?.email ?? 'Guest'}
        isGuest={isGuest && !user}
        onNavigate={(screen) => dispatch({ type: 'SET_SCREEN', screen })}
        onSetThemeSource={(source) => dispatch({ type: 'SET_THEME_SOURCE', source })}
        onSignOut={handleSignOut}
      />

      <div id="main-content" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {(state.currentScreen === 'timer' || state.currentScreen === 'tasks') && (
          <DashboardScreen theme={t} accent={accent} />
        )}
        {state.currentScreen === 'analytics' && (
          <AnalyticsScreen theme={t} accent={accent} />
        )}
        {state.currentScreen === 'settings' && (
          <SettingsScreen theme={t} accent={accent} />
        )}
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import type { SurfaceTokens } from '../types';
import { Btn, NumberStepper, Toggle } from '../components/ui';
import { useApp } from '../context/AppContext';

interface SettingsScreenProps {
  theme: SurfaceTokens;
  accent: string;
}

function Section({ t, title, hint, children, delay = 0 }: { t: SurfaceTokens; title: string; hint?: string; children: ReactNode; delay?: number }) {
  return (
    <div
      className="settings-section card-enter"
      style={{
        background: t.surface, border: `1px solid ${t.borderSoft}`,
        borderRadius: 12, padding: '20px 24px',
        display: 'flex', flexDirection: 'column', gap: 16,
        animationDelay: `${delay}s`, animationFillMode: 'both',
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: t.text, letterSpacing: -0.2 }}>{title}</h3>
        {hint && <div style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Row({ t, label, hint, control }: { t: SurfaceTokens; label: string; hint?: string; control: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '4px 0' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: t.text }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{hint}</div>}
      </div>
      {control}
    </div>
  );
}

export function SettingsScreen({ theme: t, accent }: SettingsScreenProps) {
  const { state, dispatch } = useApp();
  const s = state.settings;

  function update(key: keyof typeof s, val: unknown) {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { [key]: val } });
  }

  return (
    <main className="screen-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: `1px solid ${t.borderSoft}`, flexShrink: 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: t.text, letterSpacing: -0.4 }}>Settings</h1>
          <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>Tune timing, automation, and notifications</div>
        </div>
        <Btn theme={t} accent={accent} variant="secondary" onClick={() => dispatch({ type: 'RESET_SETTINGS' })}>Reset to defaults</Btn>
      </div>

      <div style={{ flex: 1, padding: 28, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'minmax(0, 640px)', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
          <Section t={t} title="Timer durations" hint="The intervals that shape one full cycle." delay={0.04}>
            <Row t={t} label="Pomodoro" hint="Deep work block"
              control={<NumberStepper theme={t} accent={accent} value={s.pomodoroMins} unit="min" min={1} max={60} onChange={(v) => update('pomodoroMins', v)} />} />
            <Row t={t} label="Short break" hint="Quick reset between sessions"
              control={<NumberStepper theme={t} accent={accent} value={s.shortBreakMins} unit="min" min={1} max={30} onChange={(v) => update('shortBreakMins', v)} />} />
            <Row t={t} label="Long break" hint="After a full cycle"
              control={<NumberStepper theme={t} accent={accent} value={s.longBreakMins} unit="min" min={5} max={60} onChange={(v) => update('longBreakMins', v)} />} />
            <Row t={t} label="Long break after" hint="Number of pomodoros before a long break"
              control={<NumberStepper theme={t} accent={accent} value={s.longBreakAfter} unit="cycles" min={2} max={8} onChange={(v) => update('longBreakAfter', v)} />} />
          </Section>

          <Section t={t} title="Automation" hint="Let sessions flow without manual restarts." delay={0.08}>
            <Row t={t} label="Auto-start breaks" hint="Begin a break as soon as a pomodoro ends"
              control={<Toggle theme={t} on={s.autoStartBreaks} accent={accent} label="" onChange={(v) => update('autoStartBreaks', v)} />} />
            <Row t={t} label="Auto-start pomodoros" hint="Jump into the next focus block after a break"
              control={<Toggle theme={t} on={s.autoStartPomodoros} accent={accent} label="" onChange={(v) => update('autoStartPomodoros', v)} />} />
            <Row t={t} label="Pause when inactive" hint="Detect when you walk away"
              control={<Toggle theme={t} on={s.pauseWhenInactive} accent={accent} label="" onChange={(v) => update('pauseWhenInactive', v)} />} />
          </Section>

          <Section t={t} title="Sound & notifications" delay={0.12}>
            <Row t={t} label="Browser notifications"
              control={<Toggle theme={t} on={s.browserNotifications} accent={accent} label="" onChange={(v) => update('browserNotifications', v)} />} />
            <Row t={t} label="Sound effects" hint="Play a soft chime at start and end"
              control={<Toggle theme={t} on={s.soundEffects} accent={accent} label="" onChange={(v) => update('soundEffects', v)} />} />
          </Section>

          <Section t={t} title="Timer visualization" delay={0.16}>
            <Row t={t} label="Style" hint="Choose how the timer progress is displayed"
              control={
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['bars', 'circle'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      className="timer-style-btn"
                      onClick={() => dispatch({ type: 'SET_TIMER_STYLE', style })}
                      style={{
                        padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                        border: `1px solid ${state.timerStyle === style ? accent : t.border}`,
                        background: state.timerStyle === style ? `${accent}15` : 'transparent',
                        color: state.timerStyle === style ? accent : t.textMuted,
                        cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
                      }}
                    >{style}</button>
                  ))}
                </div>
              }
            />
          </Section>

          <Section t={t} title="Danger zone" delay={0.2}>
            <Row t={t} label="Export all data" hint="Tasks, sessions, and settings as JSON"
              control={
                <Btn theme={t} accent={accent} variant="secondary" onClick={() => {
                  const data = JSON.stringify({ tasks: state.tasks, settings: state.settings }, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'cadence-export.json'; a.click();
                  URL.revokeObjectURL(url);
                }}>Export</Btn>
              }
            />
            <Row t={t} label="Clear all tasks" hint="Remove all tasks. This cannot be undone."
              control={
                <Btn theme={t} accent={accent} variant="danger" onClick={() => {
                  if (confirm('Delete all tasks? This cannot be undone.')) {
                    state.tasks.forEach((task) => dispatch({ type: 'DELETE_TASK', id: task.id }));
                  }
                }}>Clear</Btn>
              }
            />
          </Section>
        </div>
      </div>
    </main>
  );
}

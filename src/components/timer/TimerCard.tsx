import type { SurfaceTokens, Mode, TimerState, TimerStyle, Task } from '../../types';
import { MODES, alpha } from '../../lib/tokens';
import { formatTime } from '../../lib/data';
import { Btn, IconBtn, PomodoroDots, PriorityDot } from '../ui';
import { Icons } from '../icons';
import { BarTimer } from './BarTimer';
import { CircleTimer } from './CircleTimer';

interface TimerCardProps {
  theme: SurfaceTokens;
  accent: string;
  mode: Mode;
  timerState: TimerState;
  secondsLeft: number;
  totalSecs: number;
  timerStyle: TimerStyle;
  sessionCount: number;
  totalSessions: number;
  linkedTask: Task | null;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export function TimerCard({
  theme: t, accent, mode, timerState, secondsLeft, totalSecs,
  timerStyle, sessionCount, totalSessions, linkedTask,
  onStart, onPause, onReset, onSkip,
}: TimerCardProps) {
  const running = timerState === 'running';
  const isIdle = timerState === 'idle';
  const isPaused = timerState === 'paused';
  const isComplete = timerState === 'complete';

  const primaryLabel = isIdle ? 'Start' : isPaused || isComplete ? 'Resume' : 'Pause';
  const primaryIcon = running ? <Icons.pause size={14} /> : <Icons.play size={14} />;
  const handlePrimary = running ? onPause : onStart;

  const elapsedSecs = totalSecs - secondsLeft;
  const [mins, secs] = formatTime(secondsLeft).split(':');

  return (
    <div className="card-enter" style={{
      background: t.surface, border: `1px solid ${t.borderSoft}`,
      borderRadius: 16, padding: '32px 36px 28px',
      boxShadow: t.shadow, position: 'relative', overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999,
            background: alpha(accent, 0.12), color: accent,
            fontSize: 10, fontWeight: 600, letterSpacing: 1.2, fontFamily: '"JetBrains Mono", monospace',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: 3, background: accent,
              animation: running ? 'pulse 1.6s ease-in-out infinite' : 'none',
            }} />
            {MODES[mode].label.toUpperCase()}
          </span>
          <span style={{ fontSize: 12, color: t.textFaint, fontFamily: '"JetBrains Mono", monospace' }}>
            session {((sessionCount - 1) % totalSessions) + 1}/{totalSessions}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconBtn theme={t} icon={<Icons.bell size={16} />} accent={accent} />
          <IconBtn theme={t} icon={<Icons.dots size={16} />} accent={accent} />
        </div>
      </div>

      {/* time display */}
      <div style={{ textAlign: 'center', padding: '28px 0 24px' }}>
        <div
          role="timer"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${secondsLeft} seconds remaining`}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 88, fontWeight: 600, color: t.text,
            letterSpacing: -3, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4,
          }}>
          <span>{mins}</span>
          <span style={{ color: t.textFaint, fontWeight: 400 }}>:</span>
          <span>{secs}</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: t.textMuted, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 500 }}>
          {isIdle && 'Ready when you are'}
          {running && `Stay with it · ${Math.ceil(secondsLeft / 60)} min remaining`}
          {isPaused && 'Paused · resume to continue'}
          {isComplete && 'Session complete · nicely done'}
        </div>
      </div>

      {/* timer visualization */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        {timerStyle === 'bars' && (
          <BarTimer
            theme={t} accent={accent}
            totalMins={Math.ceil(totalSecs / 60)}
            elapsedSecs={elapsedSecs}
            running={running}
            size="lg"
          />
        )}
        {timerStyle === 'circle' && (
          <CircleTimer theme={t} accent={accent} totalSecs={totalSecs} elapsedSecs={elapsedSecs} size={140} strokeWidth={6} />
        )}
      </div>

      {/* controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <Btn theme={t} accent={accent} variant="secondary" size="md" icon={<Icons.reset size={14} />} onClick={onReset}>Reset</Btn>
        <Btn theme={t} accent={accent} variant="primary" size="lg" icon={primaryIcon} onClick={handlePrimary}
          style={{ minWidth: 140, justifyContent: 'center' }}>{primaryLabel}</Btn>
        <Btn theme={t} accent={accent} variant="secondary" size="md" icon={<Icons.skip size={14} />} onClick={onSkip}>Skip</Btn>
      </div>

      {/* linked task */}
      {linkedTask && (
        <div style={{
          marginTop: 28, padding: '14px 16px', borderRadius: 10,
          background: t.surfaceAlt, border: `1px solid ${t.borderSoft}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <PriorityDot priority={linkedTask.priority} size={8} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 500, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 2 }}>Working on</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{linkedTask.title}</div>
          </div>
          <PomodoroDots done={linkedTask.done} total={linkedTask.total} accent={accent} theme={t} />
          <span style={{ fontSize: 12, color: t.textMuted, fontFamily: '"JetBrains Mono", monospace', fontWeight: 500 }}>{linkedTask.done}/{linkedTask.total}</span>
        </div>
      )}
    </div>
  );
}

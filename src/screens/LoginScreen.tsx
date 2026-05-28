import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { alpha } from '../lib/tokens';
import { Icons } from '../components/icons';

const ACCENT = '#EF4444';
const ACCENT_DARK = '#C53030';

export function LoginScreen({ onGuest }: { onGuest: () => void }) {
  const { signInWithEmail } = useAuth();
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError('Enter your email address'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await signInWithEmail(email.trim());
    setLoading(false);
    if (err) { setError(err); return; }
    setSent(true);
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center" style={{ background: '#FAFAFA' }}>
      <div style={{
        width: 400, padding: '40px 36px',
        background: '#fff', borderRadius: 16,
        border: '1px solid #E5E5E5',
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      }}>
        {/* logo */}
        <div className="flex items-center gap-3 mb-8">
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 12px ${alpha(ACCENT, 0.35)}`,
          }}>
            <Icons.timer size={20} color="#fff" strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#171717', letterSpacing: -0.3 }}>Cadence</div>
            <div style={{ fontSize: 12, color: '#6B6B6B' }}>Pomodoro · task manager</div>
          </div>
        </div>

        {sent ? (
          <div className="text-center" style={{ padding: '8px 0' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 26, margin: '0 auto 16px',
              background: alpha('#10B981', 0.1),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icons.bell size={22} color="#10B981" />
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#171717', marginBottom: 8 }}>Check your email</div>
            <div style={{ fontSize: 14, color: '#737373', lineHeight: 1.6 }}>
              We sent a magic link to <strong style={{ color: '#171717' }}>{email}</strong>.<br />
              Click it to sign in — no password needed.
            </div>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              style={{
                marginTop: 24, fontSize: 13, color: '#737373',
                background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline',
              }}
            >Use a different email</button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div style={{ fontSize: 20, fontWeight: 600, color: '#171717', letterSpacing: -0.3 }}>Sign in</div>
              <div style={{ fontSize: 14, color: '#737373', marginTop: 4 }}>
                We'll email you a magic link — no password required.
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#737373', marginBottom: 6, letterSpacing: 0.2 }}>
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  autoFocus
                  style={{
                    width: '100%', height: 42, padding: '0 14px',
                    border: `1px solid ${error ? '#EF4444' : '#E5E5E5'}`,
                    borderRadius: 8, fontSize: 14, fontFamily: 'inherit',
                    outline: 'none', boxSizing: 'border-box',
                    background: '#fff', color: '#171717',
                    boxShadow: error ? `0 0 0 3px ${alpha('#EF4444', 0.1)}` : 'none',
                  }}
                />
                {error && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 6 }}>{error}</div>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2"
                style={{
                  height: 42, borderRadius: 8, background: ACCENT_DARK,
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
                }}
              >
                {loading ? 'Sending…' : <>Send magic link <Icons.chevR size={14} color="#fff" /></>}
              </button>
            </form>

            <div style={{ marginTop: 20, fontSize: 12, color: '#6B6B6B', textAlign: 'center', lineHeight: 1.6 }}>
              Your data is tied to your email and syncs across all your devices.
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={onGuest}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: '#6B6B6B', textDecoration: 'underline',
                  fontFamily: 'inherit',
                }}
              >
                Continue as guest
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

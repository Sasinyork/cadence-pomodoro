import { useState } from "react";
import type { CSSProperties, ReactNode, InputHTMLAttributes } from "react";
import type { SurfaceTokens, Priority } from "../../types";
import { alpha, PRIORITY_COLORS } from "../../lib/tokens";
import { Icons } from "../icons";

// ── Button ──────────────────────────────────────────────────────────────

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
type BtnSize = "sm" | "md" | "lg";

interface BtnProps {
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: ReactNode;
  children?: ReactNode;
  theme: SurfaceTokens;
  accent: string;
  style?: CSSProperties;
  full?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export function Btn({
  variant = "primary",
  size = "md",
  icon,
  children,
  theme: t,
  accent,
  style,
  full,
  disabled,
  onClick,
  type = "button",
}: BtnProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const pads: Record<BtnSize, string> = { sm: "6px 12px", md: "10px 18px", lg: "12px 28px" };
  const fs: Record<BtnSize, number> = { sm: 13, md: 14, lg: 15 };

  const base: Record<BtnVariant, CSSProperties> = {
    primary:   { background: accent, color: "#fff", border: `1px solid ${accent}`, boxShadow: `0 1px 2px ${alpha(accent, 0.3)}` },
    secondary: { background: "transparent", color: t.text, border: `1px solid ${t.border}` },
    ghost:     { background: "transparent", color: t.textMuted, border: "1px solid transparent" },
    danger:    { background: "transparent", color: "#EF4444", border: `1px solid ${alpha("#EF4444", 0.3)}` },
  };

  const hover: Record<BtnVariant, CSSProperties> = {
    primary:   { filter: "brightness(1.1)", boxShadow: `0 6px 18px ${alpha(accent, 0.42)}` },
    secondary: { background: t.surfaceAlt },
    ghost:     { background: alpha("#808080", 0.07) },
    danger:    { background: alpha("#EF4444", 0.06), borderColor: alpha("#EF4444", 0.5) },
  };

  const transform = disabled ? "none"
    : pressed  ? "scale(0.97)"
    : hovered  ? "translateY(-1px)"
    : "none";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => { if (!disabled) setHovered(true); }}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => { if (!disabled) setPressed(true); }}
      onMouseUp={() => setPressed(false)}
      className="inline-flex items-center gap-2 whitespace-nowrap"
      style={{
        padding: pads[size], borderRadius: 8,
        fontWeight: 600, fontSize: fs[size],
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all .15s ease",
        width: full ? "100%" : "auto",
        justifyContent: full ? "center" : "flex-start",
        opacity: disabled ? 0.55 : 1,
        transform,
        ...base[variant],
        ...(hovered && !disabled ? hover[variant] : {}),
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

// ── IconButton ────────────────────────────────────────────────────────────

interface IconBtnProps {
  icon: ReactNode;
  theme: SurfaceTokens;
  accent: string;
  onClick?: () => void;
  label?: string;
  style?: CSSProperties;
  active?: boolean;
}

export function IconBtn({ icon, theme: t, accent, onClick, label, style, active }: IconBtnProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="icon-btn inline-flex items-center justify-center shrink-0 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 36, height: 36, borderRadius: 8,
        background: active ? alpha(accent, 0.1) : hovered ? alpha(accent, 0.07) : "transparent",
        color: active || hovered ? accent : t.textMuted,
        border: "1px solid transparent",
        ...style,
      }}
    >
      {icon}
    </button>
  );
}

// ── Input ────────────────────────────────────────────────────────────────

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  theme: SurfaceTokens;
  accent: string;
  label?: string;
  fullWidth?: boolean;
  mono?: boolean;
  suffix?: string;
  error?: string;
}

export function Input({ theme: t, accent, label, fullWidth = true, mono = false, suffix, error, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <label className="flex flex-col gap-1.5" style={{ width: fullWidth ? "100%" : "auto" }}>
      {label && (
        <span style={{ fontSize: 12, fontWeight: 500, color: t.textMuted, letterSpacing: 0.2 }}>{label}</span>
      )}
      <div className="flex items-center" style={{
        background: t.surface,
        border: `1px solid ${error ? "#EF4444" : focused ? accent : t.border}`,
        borderRadius: 8, padding: "0 12px",
        boxShadow: error
          ? `0 0 0 3px ${alpha("#EF4444", 0.1)}`
          : focused
          ? `0 0 0 3px ${alpha(accent, 0.12)}`
          : "none",
        transition: "border-color 0.18s ease, box-shadow 0.18s ease",
      }}>
        <input
          {...rest}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); rest.onBlur?.(e); }}
          className="flex-1 border-none outline-none bg-transparent"
          style={{
            height: 38,
            color: t.text,
            fontFamily: mono ? '"JetBrains Mono", monospace' : "inherit",
            fontSize: 14, fontWeight: 500,
          }}
        />
        {suffix && <span style={{ fontSize: 13, color: t.textFaint, marginLeft: 8 }}>{suffix}</span>}
      </div>
      {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
    </label>
  );
}

// ── Textarea ─────────────────────────────────────────────────────────────

interface TextareaProps {
  theme: SurfaceTokens;
  label?: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  onChange?: (v: string) => void;
}

export function Textarea({ theme: t, label, value, placeholder, rows = 3, onChange }: TextareaProps) {
  const [focused, setFocused] = useState(false);

  return (
    <label className="flex flex-col gap-1.5">
      {label && <span style={{ fontSize: 12, fontWeight: 500, color: t.textMuted, letterSpacing: 0.2 }}>{label}</span>}
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="resize-y outline-none"
        style={{
          background: t.surface,
          border: `1px solid ${focused ? t.text + "40" : t.border}`,
          borderRadius: 8, padding: "10px 12px",
          color: t.text,
          fontFamily: "inherit", fontSize: 14,
          lineHeight: 1.5,
          boxShadow: focused ? `0 0 0 3px ${t.text === "#171717" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}` : "none",
          transition: "border-color 0.18s ease, box-shadow 0.18s ease",
        }}
      />
    </label>
  );
}

// ── NumberStepper ────────────────────────────────────────────────────────

interface NumberStepperProps {
  theme: SurfaceTokens;
  accent: string;
  value: number;
  unit?: string;
  width?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (v: number) => void;
}

export function NumberStepper({ theme: t, value, unit, width = 110, min = 1, max = 99, step = 1, onChange }: NumberStepperProps) {
  return (
    <div className="inline-flex items-stretch overflow-hidden" style={{
      height: 38,
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 8, width,
    }}>
      <div className="flex-1 flex items-center justify-center gap-1">
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 15, fontWeight: 600, color: t.text }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: 11, color: t.textFaint, marginLeft: 2 }}>{unit}</span>}
      </div>
      <div className="flex flex-col" style={{ borderLeft: `1px solid ${t.border}` }}>
        <button
          className="stepper-btn flex-1 flex items-center justify-center cursor-pointer"
          onClick={() => onChange?.(Math.min(max, value + step))}
          style={{
            width: 24, background: "transparent",
            border: "none", borderBottom: `1px solid ${t.border}`,
            color: t.textMuted, padding: 0,
          }}
        >
          <Icons.chev size={10} style={{ transform: "rotate(180deg)" }} />
        </button>
        <button
          className="stepper-btn flex-1 flex items-center justify-center cursor-pointer"
          onClick={() => onChange?.(Math.max(min, value - step))}
          style={{
            width: 24, background: "transparent",
            border: "none", color: t.textMuted, padding: 0,
          }}
        >
          <Icons.chev size={10} />
        </button>
      </div>
    </div>
  );
}

// ── Toggle ───────────────────────────────────────────────────────────────

interface ToggleProps {
  theme: SurfaceTokens;
  on: boolean;
  accent: string;
  label: string;
  hint?: string;
  onChange?: (v: boolean) => void;
}

export function Toggle({ theme: t, on, accent, label, hint, onChange }: ToggleProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center justify-between gap-4"
      onClick={() => onChange?.(!on)}
    >
      {label && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{label}</div>
          {hint && <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{hint}</div>}
        </div>
      )}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative shrink-0 cursor-pointer"
        style={{
          width: 40, height: 22, borderRadius: 11,
          background: on ? accent : t.border,
          transition: "background .2s ease, transform .15s ease, box-shadow .15s ease",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          boxShadow: hovered && on ? `0 0 0 3px ${alpha(accent, 0.2)}` : "none",
        }}
      >
        <div className="absolute" style={{
          top: 2, left: on ? 20 : 2,
          width: 18, height: 18, borderRadius: 9,
          background: "#fff",
          transition: "left .22s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
        }} />
      </div>
    </div>
  );
}

// ── TagPill ───────────────────────────────────────────────────────────────

export function TagPill({ theme: t, label }: { theme: SurfaceTokens; label: string }) {
  return (
    <span style={{
      background: t.surfaceAlt, color: t.textMuted,
      padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 500,
      letterSpacing: 0.2, fontFamily: '"JetBrains Mono", monospace',
      transition: "background 0.15s ease",
    }}>
      #{label}
    </span>
  );
}

// ── PriorityDot ───────────────────────────────────────────────────────────

export function PriorityDot({ priority, size = 8 }: { priority: Priority; size?: number }) {
  return (
    <span className="inline-block shrink-0" style={{
      width: size, height: size, borderRadius: size / 2,
      background: PRIORITY_COLORS[priority],
    }} />
  );
}

// ── PomodoroDots ───────────────────────────────────────────────────────────

interface PomodoroDotsProps {
  done: number;
  total: number;
  accent: string;
  theme: SurfaceTokens;
  size?: number;
}

export function PomodoroDots({ done, total, accent, theme: t, size = 10 }: PomodoroDotsProps) {
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: size, height: size, borderRadius: size / 2,
            background: i < done ? accent : "transparent",
            border: `1.5px solid ${i < done ? accent : t.border}`,
            transition: "all .2s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
      ))}
    </div>
  );
}

// ── ConfirmDialog ────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  theme: SurfaceTokens;
  accent: string;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ theme: t, accent, title, message, confirmLabel = "Confirm", onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100]"
      style={{
        background: "rgba(10,10,10,0.55)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.18s ease both",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="modal-enter overflow-hidden"
        style={{
          width: 380, background: t.surface,
          border: `1px solid ${t.borderSoft}`,
          borderRadius: 14, boxShadow: t.shadowLift,
        }}
      >
        <div style={{ padding: "22px 24px 18px" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: t.text, letterSpacing: -0.2, marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ fontSize: 13.5, color: t.textMuted, lineHeight: 1.55 }}>
            {message}
          </div>
        </div>
        <div className="flex justify-end gap-2" style={{
          padding: "14px 24px",
          borderTop: `1px solid ${t.borderSoft}`,
          background: t.surfaceAlt,
        }}>
          <Btn theme={t} accent={accent} variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn theme={t} accent={accent} variant="danger" onClick={onConfirm}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

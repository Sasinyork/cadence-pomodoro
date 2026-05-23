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
  const pads: Record<BtnSize, string> = {
    sm: "6px 12px",
    md: "10px 18px",
    lg: "12px 28px",
  };
  const fs: Record<BtnSize, number> = { sm: 13, md: 14, lg: 15 };
  const variants: Record<BtnVariant, CSSProperties> = {
    primary: {
      background: accent,
      color: "#fff",
      border: `1px solid ${accent}`,
      boxShadow: `0 1px 2px ${alpha(accent, 0.3)}`,
    },
    secondary: {
      background: "transparent",
      color: t.text,
      border: `1px solid ${t.border}`,
    },
    ghost: {
      background: "transparent",
      color: t.textMuted,
      border: "1px solid transparent",
    },
    danger: {
      background: "transparent",
      color: "#EF4444",
      border: `1px solid ${alpha("#EF4444", 0.3)}`,
    },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: pads[size],
        borderRadius: 8,
        fontWeight: 600,
        fontSize: fs[size],
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all .15s ease",
        whiteSpace: "nowrap",
        width: full ? "100%" : "auto",
        justifyContent: full ? "center" : "flex-start",
        opacity: disabled ? 0.55 : 1,
        ...variants[variant],
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

export function IconBtn({
  icon,
  theme: t,
  accent,
  onClick,
  label,
  style,
  active,
}: IconBtnProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? alpha(accent, 0.1) : "transparent",
        color: active ? accent : t.textMuted,
        border: "1px solid transparent",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background .15s",
        ...style,
      }}
    >
      {icon}
    </button>
  );
}

// ── Input ────────────────────────────────────────────────────────────────

interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "prefix"
> {
  theme: SurfaceTokens;
  accent: string;
  label?: string;
  fullWidth?: boolean;
  mono?: boolean;
  suffix?: string;
  error?: string;
}

export function Input({
  theme: t,
  accent,
  label,
  fullWidth = true,
  mono = false,
  suffix,
  error,
  ...rest
}: InputProps) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        width: fullWidth ? "100%" : "auto",
      }}
    >
      {label && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: t.textMuted,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: t.surface,
          border: `1px solid ${error ? "#EF4444" : t.border}`,
          borderRadius: 8,
          padding: "0 12px",
          boxShadow: error ? `0 0 0 3px ${alpha("#EF4444", 0.1)}` : "none",
        }}
      >
        <input
          {...rest}
          style={{
            flex: 1,
            height: 38,
            border: "none",
            outline: "none",
            background: "transparent",
            color: t.text,
            fontFamily: mono ? '"JetBrains Mono", monospace' : "inherit",
            fontSize: 14,
            fontWeight: 500,
          }}
        />
        {suffix && (
          <span style={{ fontSize: 13, color: t.textFaint, marginLeft: 8 }}>
            {suffix}
          </span>
        )}
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

export function Textarea({
  theme: t,
  label,
  value,
  placeholder,
  rows = 3,
  onChange,
}: TextareaProps) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: t.textMuted,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </span>
      )}
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          padding: "10px 12px",
          resize: "vertical",
          color: t.text,
          fontFamily: "inherit",
          fontSize: 14,
          outline: "none",
          lineHeight: 1.5,
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
  onChange?: (v: number) => void;
}

export function NumberStepper({
  theme: t,
  value,
  unit,
  width = 110,
  min = 1,
  max = 99,
  onChange,
}: NumberStepperProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "stretch",
        height: 38,
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 8,
        overflow: "hidden",
        width,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 15,
            fontWeight: 600,
            color: t.text,
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 11, color: t.textFaint, marginLeft: 2 }}>
            {unit}
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderLeft: `1px solid ${t.border}`,
        }}
      >
        <button
          onClick={() => onChange?.(Math.min(max, value + 1))}
          style={{
            width: 24,
            flex: 1,
            background: "transparent",
            border: "none",
            borderBottom: `1px solid ${t.border}`,
            cursor: "pointer",
            color: t.textMuted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <Icons.chev size={10} style={{ transform: "rotate(180deg)" }} />
        </button>
        <button
          onClick={() => onChange?.(Math.max(min, value - 1))}
          style={{
            width: 24,
            flex: 1,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: t.textMuted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
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

export function Toggle({
  theme: t,
  on,
  accent,
  label,
  hint,
  onChange,
}: ToggleProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
      onClick={() => onChange?.(!on)}
    >
      {label && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>
            {label}
          </div>
          {hint && (
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>
              {hint}
            </div>
          )}
        </div>
      )}
      <div
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          position: "relative",
          background: on ? accent : t.border,
          transition: "background .2s",
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: on ? 20 : 2,
            width: 18,
            height: 18,
            borderRadius: 9,
            background: "#fff",
            transition: "left .2s",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </div>
  );
}

// ── TagPill ───────────────────────────────────────────────────────────────

export function TagPill({
  theme: t,
  label,
}: {
  theme: SurfaceTokens;
  label: string;
}) {
  return (
    <span
      style={{
        background: t.surfaceAlt,
        color: t.textMuted,
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: 0.2,
        fontFamily: '"JetBrains Mono", monospace',
      }}
    >
      #{label}
    </span>
  );
}

// ── PriorityDot ───────────────────────────────────────────────────────────

export function PriorityDot({
  priority,
  size = 8,
}: {
  priority: Priority;
  size?: number;
}) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: PRIORITY_COLORS[priority],
        flexShrink: 0,
        display: "inline-block",
      }}
    />
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

export function PomodoroDots({
  done,
  total,
  accent,
  theme: t,
  size = 10,
}: PomodoroDotsProps) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            background: i < done ? accent : "transparent",
            border: `1.5px solid ${i < done ? accent : t.border}`,
            transition: "all .2s",
          }}
        />
      ))}
    </div>
  );
}

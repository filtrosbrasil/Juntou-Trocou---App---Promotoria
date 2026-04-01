import { useApp } from '../context/AppContext.jsx';

// ─── BADGE ───
export function Badge({ children, variant = 'navy' }) {
  const map = {
    navy:   { bg: 'var(--navy-light)',   color: 'var(--navy)' },
    green:  { bg: 'var(--green-light)',  color: 'var(--green)' },
    red:    { bg: 'var(--red-light)',    color: 'var(--red)' },
    amber:  { bg: 'var(--amber-light)',  color: 'var(--amber)' },
    gray:   { bg: 'var(--g100)',         color: 'var(--g400)' },
    purple: { bg: 'var(--purple-light)', color: 'var(--purple)' },
  };
  const s = map[variant] || map.navy;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '3px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>{children}</span>
  );
}

// ─── BUTTON ───
export function Btn({ children, onClick, variant = 'navy', size = 'md', disabled, style, type = 'button' }) {
  const variants = {
    navy:    { bg: 'var(--navy)',    color: '#fff', border: 'none' },
    red:     { bg: 'var(--red)',     color: '#fff', border: 'none' },
    green:   { bg: 'var(--green)',   color: '#fff', border: 'none' },
    outline: { bg: '#fff',           color: 'var(--g600)', border: '.5px solid var(--g200)' },
    ghost:   { bg: 'transparent',   color: 'var(--g600)', border: 'none' },
  };
  const sizes = {
    sm: { padding: '7px 12px', fontSize: 12 },
    md: { padding: '10px 16px', fontSize: 13 },
    lg: { padding: '14px 20px', fontSize: 15 },
    full: { padding: '14px', fontSize: 15, width: '100%' },
  };
  const v = variants[variant] || variants.navy;
  const sz = sizes[size] || sizes.md;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        fontFamily: 'var(--font)', fontWeight: 600, borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .15s', opacity: disabled ? .5 : 1,
        background: v.bg, color: v.color, border: v.border,
        ...sz, ...style,
      }}
    >{children}</button>
  );
}

// ─── INPUT ───
export function Input({ label, value, onChange, placeholder, type = 'text', required, error, hint, disabled, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          {label} {required && <span style={{ color: 'var(--red)' }}>*</span>}
        </label>
      )}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        style={{
          width: '100%', padding: '10px 12px',
          border: `1.5px solid ${error ? 'var(--red)' : 'var(--g200)'}`,
          borderRadius: 9, fontFamily: 'var(--font)', fontSize: 13,
          color: 'var(--g800)', background: disabled ? 'var(--g50)' : 'white',
          outline: 'none', transition: 'border-color .15s',
        }}
        onFocus={e => !error && (e.target.style.borderColor = 'var(--navy)')}
        onBlur={e => !error && (e.target.style.borderColor = 'var(--g200)')}
      />
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: 11, color: 'var(--g400)' }}>{hint}</span>}
    </div>
  );
}

// ─── SELECT ───
export function Select({ label, value, onChange, options, required, disabled, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          {label} {required && <span style={{ color: 'var(--red)' }}>*</span>}
        </label>
      )}
      <select
        value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        style={{
          width: '100%', padding: '10px 30px 10px 12px',
          border: '1.5px solid var(--g200)', borderRadius: 9,
          fontFamily: 'var(--font)', fontSize: 13, color: 'var(--g800)',
          background: `white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%239AA3B2' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center`,
          WebkitAppearance: 'none', outline: 'none', cursor: 'pointer',
        }}
      >
        {options.map(o => (
          <option key={o.val} value={o.val}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── CARD ───
export function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white', borderRadius: 12, border: '.5px solid var(--g200)',
        padding: 14, cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'all .15s' : undefined,
        ...style,
      }}
    >{children}</div>
  );
}

// ─── SECTION LABEL ───
export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: 'var(--navy)',
      textTransform: 'uppercase', letterSpacing: '.06em',
      paddingBottom: 7, borderBottom: '2px solid var(--red)', marginBottom: 12,
    }}>{children}</div>
  );
}

// ─── PROGRESS BAR ───
export function ProgressBar({ value, max = 100, color = 'var(--navy)', height = 7 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ background: 'var(--g100)', borderRadius: 4, height, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: color, transition: 'width .6s ease' }} />
    </div>
  );
}

// ─── TOGGLE ───
export function Toggle({ value, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontSize: 13, color: 'var(--g600)' }}>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 34, height: 20, borderRadius: 10, position: 'relative',
          background: value ? 'var(--navy)' : 'var(--g200)', transition: 'background .2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: value ? 17 : 3,
          width: 14, height: 14, borderRadius: '50%', background: 'white',
          transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        }} />
      </div>
      {label}
    </label>
  );
}

// ─── HEADER MOBILE ───
export function MobileHeader({ title, subtitle, onBack, backLabel = 'Voltar', right }) {
  return (
    <div style={{ background: 'var(--navy)', padding: '13px 16px 14px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: subtitle ? 6 : 0 }}>
        {onBack ? (
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', color: 'rgba(255,255,255,.8)',
            fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font)', padding: 0,
          }}>
            ← {backLabel}
          </button>
        ) : <div />}
        {right && <div>{right}</div>}
      </div>
      <div style={{ color: 'white', fontSize: 17, fontWeight: 600 }}>{title}</div>
      {subtitle && <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 12, marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}

// ─── BOTTOM NAV ───
export function BottomNav({ items }) {
  return (
    <div style={{
      background: 'white', borderTop: '.5px solid var(--g100)',
      display: 'flex', padding: `10px 0 calc(12px + var(--safe-bottom))`, flexShrink: 0,
    }}>
      {items.map(item => (
        <div
          key={item.id}
          onClick={item.onClick}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, cursor: 'pointer', padding: '2px 0',
          }}
        >
          <div style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</div>
          <span style={{ fontSize: 10, color: item.active ? 'var(--navy)' : 'var(--g400)', fontWeight: item.active ? 600 : 400 }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── TOAST GLOBAL ───
export function ToastGlobal() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className={`toast ${toast.tipo === 'error' ? 'error' : ''}`}>
      {toast.tipo === 'error' ? '✗' : '✓'} {toast.msg}
    </div>
  );
}

// ─── DEVICE SHELL (mobile frame) ───
export function DeviceShell({ children }) {
  return (
    <div style={{
      width: '100%', maxWidth: 420, margin: '0 auto',
      minHeight: '100dvh', background: 'var(--g50)',
      display: 'flex', flexDirection: 'column', position: 'relative',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

// ─── WEB SHELL (desktop frame) ───
export function WebShell({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--g50)' }}>
      {children}
    </div>
  );
}

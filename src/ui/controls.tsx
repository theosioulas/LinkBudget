import { useEffect, useState, type ReactNode } from 'react';

export function NumberField(props: {
  label: string; value: number; onChange: (v: number) => void; unit?: string; step?: number; min?: number; max?: number; digits?: number; title?: string;
}) {
  const { label, value, onChange, unit, step = 0.1, min, max, digits, title } = props;
  const fmt = (v: number) => (Number.isFinite(v) ? (digits !== undefined ? v.toFixed(digits) : String(+v.toFixed(6))) : '');
  const [txt, setTxt] = useState(fmt(value));
  const [focus, setFocus] = useState(false);
  useEffect(() => { if (!focus) setTxt(fmt(value)); }, [value, focus]); // eslint-disable-line react-hooks/exhaustive-deps
  const commit = (s: string) => {
    let v = parseFloat(s);
    if (!Number.isFinite(v)) return;
    if (min !== undefined) v = Math.max(min, v);
    if (max !== undefined) v = Math.min(max, v);
    if (v !== value) onChange(v);
  };
  return (
    <div className="field" title={title ?? label}>
      <label>{label}</label>
      <div className="input-wrap">
        <input type="number" value={txt} step={step} min={min} max={max}
          onFocus={() => setFocus(true)}
          onBlur={() => { setFocus(false); commit(txt); }}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          onChange={(e) => { setTxt(e.target.value); commit(e.target.value); }} />
        {unit && <span className="unit">{unit}</span>}
      </div>
    </div>
  );
}

export function TextField(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label>{props.label}</label>
      <div className="input-wrap"><input value={props.value} onChange={(e) => props.onChange(e.target.value)} style={{ fontFamily: 'var(--sans)' }} /></div>
    </div>
  );
}

export function SelectField<T extends string | number>(props: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="field">
      <label>{props.label}</label>
      <div className="input-wrap">
        <select value={String(props.value)} onChange={(e) => {
          const o = props.options.find(([v]) => String(v) === e.target.value);
          if (o) props.onChange(o[0]);
        }}>
          {props.options.map(([v, l]) => <option key={String(v)} value={String(v)}>{l}</option>)}
        </select>
      </div>
    </div>
  );
}

export function Toggle(props: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void; title?: string; disabled?: boolean }) {
  return (
    <label className={`toggle ${props.disabled ? 'locked' : ''}`} title={props.title}>
      <input type="checkbox" checked={props.checked} disabled={props.disabled} aria-label={typeof props.label === 'string' && props.label ? props.label : props.title} onChange={(e) => props.onChange(e.target.checked)} />
      <span className="sw" />
      {props.label}
    </label>
  );
}

export function Seg<T extends string | number>(props: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {props.options.map(([v, l]) => (
        <button key={String(v)} className={v === props.value ? 'on' : ''} onClick={() => props.onChange(v)}>{l}</button>
      ))}
    </div>
  );
}

export const Sect = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (
  <h4 className="sect">{children}{right && <span style={{ order: 3 }}>{right}</span>}</h4>
);

export function download(name: string, data: string | Blob, mime = 'text/plain') {
  const blob = typeof data === 'string' ? new Blob([data], { type: mime }) : data;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

export function pickFile(accept: string): Promise<File | null> {
  return new Promise((res) => {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = accept;
    i.onchange = () => res(i.files?.[0] ?? null);
    i.click();
  });
}

export const fmtNum = (v: number | string, d = 2) => (typeof v === 'string' ? v : Number.isFinite(v) ? v.toFixed(d) : v === Infinity ? '∞' : '—');

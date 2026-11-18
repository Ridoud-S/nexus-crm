import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as LX from 'lucide-react';
import { Icon, STAGES, TEMPS, META, LS_KEY, SUGGESTED, TONES, fmt, money, hrs, ago, agoTs, norm, sum, isOpen, stalled, stageIdx, stageName, uid, clamp, probOf, saludo, nextAction, analyzeNote, seed, loadState, rankScore, rank, names, funnelData, stats, healthScore, detect, answer, makeMsg, defaultTone } from '../lib/engine.jsx';

/* ───────────── Primitivos de UI ───────────── */
const Rich = ({ text }) => (
  <>{text.split(/\*\*(.+?)\*\*/g).map((s, i) => (i % 2 ? <strong key={i} className="font-semibold text-ink">{s}</strong> : <React.Fragment key={i}>{s}</React.Fragment>))}</>
);

const TempBadge = ({ temp, small }) => {
  const T = TEMPS[temp];
  return (
    <span style={{ background: T.bg, color: T.fg, borderColor: T.bd }}
      className={`inline-flex items-center gap-1 border rounded-full font-semibold whitespace-nowrap ${small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'}`}>
      <span>{T.emoji}</span>{T.label}
    </span>
  );
};

const Modal = ({ onClose, children, wide, z = 'z-[70]' }) => {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className={`fixed inset-0 ${z} flex items-end sm:items-center justify-center p-0 sm:p-4`}>
      <div className="absolute inset-0 bg-deep/60 backdrop-blur-sm no-print" onClick={onClose} />
      <div className={`relative bg-white w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[94vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl anim-up`}>
        {children}
      </div>
    </div>
  );
};

const Ring = ({ value, size = 84, stroke = 9, color = '#F97316', label }) => {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: 'stroke-dashoffset .8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-display font-extrabold text-ink" style={{ fontSize: size * 0.27 }}>{value}{label ? '' : '%'}</span>
        {label && <span className="text-[10px] text-slate-500 mt-0.5">{label}</span>}
      </div>
    </div>
  );
};

const BRAND_ICON = "data:image/webp;base64,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";
const BRAND_AVATAR = "data:image/webp;base64,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";
const Logo = ({ size = 34 }) => <img src={BRAND_ICON} alt="Nexus" style={{ height: size, width: 'auto' }} />;

const AiAvatar = ({ size = 'w-8 h-8' }) => <img src={BRAND_AVATAR} alt="Nexus AI" className={`${size} shrink-0 rounded-full ring-2 ring-white shadow`} />;

/* ───────────── Bloques embebidos en el chat ───────────── */
const FunnelBlock = ({ data }) => {
  const max = Math.max(1, data[0].count);
  return (
    <div className="bg-smoke border border-line rounded-xl p-3 space-y-2">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Conversión por etapa</p>
      {data.map((d, i) => (
        <div key={d.name}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600">{d.name}</span>
            <span className="font-semibold text-ink">{d.count} <span className="text-slate-400 font-normal">· {Math.round((d.count / max) * 100)}%</span></span>
          </div>
          <div className="h-2.5 rounded-full bg-white border border-line overflow-hidden">
            <div className="bar h-full rounded-full" style={{ width: `${(d.count / max) * 100}%`, background: i === 3 ? '#10B981' : i === 2 ? '#F97316' : '#475569' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const ScenariosBlock = ({ data }) => {
  const max = Math.max(...data.map((d) => d.v), META);
  const tones = ['#94A3B8', '#475569', '#F97316', '#1E293B'];
  return (
    <div className="bg-smoke border border-line rounded-xl p-3">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Proyección de ingresos del mes</p>
      <div className="relative flex items-end gap-2 h-36">
        <div className="absolute left-0 right-0 border-t border-dashed border-accent/70" style={{ bottom: `${(META / max) * 100}%` }}>
          <span className="absolute right-0 -top-4 text-[10px] text-accentd font-semibold">Meta {fmt(META)}</span>
        </div>
        {data.map((d, i) => (
          <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="text-[10px] font-semibold text-ink mb-1">{fmt(d.v)}</span>
            <div className="w-full rounded-t-lg" style={{ height: `${(d.v / max) * 82}%`, background: tones[i], transition: 'height .8s ease' }} />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-1.5">
        {data.map((d) => <span key={d.label} className="flex-1 text-center text-[10px] leading-tight text-slate-500">{d.label}</span>)}
      </div>
    </div>
  );
};

const KpisBlock = ({ data: S }) => (
  <div className="grid grid-cols-2 gap-2">
    {[['Dinero en juego', fmt(S.pipeline)], ['Cerradas', fmt(S.wonSum)], ['Calientes 🔥', S.hot.length], ['Sin seguimiento ⚠️', S.st.length]].map(([l, v]) => (
      <div key={l} className="bg-smoke border border-line rounded-xl p-2.5">
        <p className="text-[10px] text-slate-500">{l}</p>
        <p className="font-display font-bold text-ink text-lg leading-tight">{v}</p>
      </div>
    ))}
  </div>
);

const LeadsBlock = ({ items, prospects, onOpen }) => (
  <div className="space-y-2">
    {items.map(({ id, why }) => {
      const p = prospects.find((x) => x.id === id);
      if (!p) return null;
      return (
        <div key={id} className="bg-white border border-line rounded-xl p-3 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-display font-bold text-sm text-ink truncate">{p.empresa}</p>
              <p className="text-[11px] text-slate-500">{stageName(p.etapa)} · {agoTs(p.lastTs)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display font-bold text-sm text-ink">{fmt(p.valor)}</p>
              <TempBadge temp={p.temp} small />
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2">{why}</p>
          <div className="flex gap-2 mt-2.5">
            <button onClick={() => onOpen(id, 'wa')} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-accent hover:bg-accentd text-white text-xs font-semibold rounded-lg py-2 transition">
              <Icon n="MessageCircle" className="w-3.5 h-3.5" /> Redactar WhatsApp
            </button>
            <button onClick={() => onOpen(id)} className="px-3 text-xs font-semibold text-ink border border-line rounded-lg hover:bg-smoke transition">Ver ficha</button>
          </div>
        </div>
      );
    })}
  </div>
);

const Blocks = ({ blocks, prospects, onOpen }) => (
  <div className="space-y-2.5">
    {blocks.map((b, i) => {
      if (b.t === 'p') return <p key={i} className="text-sm leading-relaxed text-slate-700"><Rich text={b.text} /></p>;
      if (b.t === 'ul') return (
        <ul key={i} className="space-y-1.5">
          {b.items.map((it, j) => (
            <li key={j} className="text-sm leading-relaxed text-slate-700 flex gap-2"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" /><span><Rich text={it} /></span></li>
          ))}
        </ul>
      );
      if (b.t === 'funnel') return <FunnelBlock key={i} data={b.data} />;
      if (b.t === 'scenarios') return <ScenariosBlock key={i} data={b.data} />;
      if (b.t === 'kpis') return <KpisBlock key={i} data={b.data} />;
      if (b.t === 'leads') return <LeadsBlock key={i} items={b.items} prospects={prospects} onOpen={onOpen} />;
      return null;
    })}
  </div>
);

/* ───────────── Chat del Agente (compartido por vista completa y panel) ───────────── */
const Chat = ({ messages, thinking, onAsk, prospects, onOpen, compact }) => {
  const [text, setText] = useState('');
  const end = useRef(null);
  useEffect(() => { end.current && end.current.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, thinking]);
  const submit = (e) => { e.preventDefault(); if (!text.trim() || thinking) return; onAsk(null, text.trim()); setText(''); };
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-4">
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="flex justify-end anim-up">
              <div className="max-w-[85%] bg-ink text-white text-sm rounded-2xl rounded-br-md px-4 py-2.5">{m.text}</div>
            </div>
          ) : (
            <div key={i} className="flex gap-2.5 anim-up">
              <AiAvatar />
              <div className={`bg-white border border-line rounded-2xl rounded-tl-md px-4 py-3 shadow-sm ${compact ? 'max-w-[calc(100%-2.5rem)]' : 'max-w-[min(92%,640px)]'} min-w-0`}>
                <Blocks blocks={m.blocks} prospects={prospects} onOpen={onOpen} />
              </div>
            </div>
          )
        )}
        {thinking && (
          <div className="flex gap-2.5 anim-up">
            <AiAvatar />
            <div className="bg-white border border-line rounded-2xl rounded-tl-md px-4 py-3 shadow-sm flex items-center gap-3">
              <span className="flex gap-1">{[0, 1, 2].map((d) => <span key={d} className="dot w-1.5 h-1.5 rounded-full bg-accent" style={{ animationDelay: `${d * 0.15}s` }} />)}</span>
              <span className="text-xs text-slate-500">Nexus AI está analizando tus datos...</span>
            </div>
          </div>
        )}
        <div ref={end} />
      </div>
      <div className="border-t border-line bg-white px-3 sm:px-5 pt-3 pb-3">
        <div className={`flex gap-2 ${compact ? 'flex-wrap' : 'overflow-x-auto sm:flex-wrap'} pb-2`}>
          {SUGGESTED.map((s) => (
            <button key={s.id} disabled={thinking} onClick={() => onAsk(s.id, s.label)}
              className="text-[11px] sm:text-xs text-left bg-smoke hover:bg-orange-50 hover:border-accent/50 border border-line rounded-full px-3 py-1.5 text-slate-700 transition disabled:opacity-50 shrink-0 sm:shrink">
              {s.label}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Pregúntame sobre tus ventas, clientes o ingresos…"
            className="flex-1 min-w-0 text-sm border border-line rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent" />
          <button disabled={!text.trim() || thinking} className="bg-accent hover:bg-accentd disabled:opacity-40 text-white rounded-xl px-3.5 transition" aria-label="Enviar">
            <Icon n="Send" className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export { Rich, TempBadge, Modal, Ring, BRAND_ICON, BRAND_AVATAR, Logo, AiAvatar, FunnelBlock, ScenariosBlock, KpisBlock, LeadsBlock, Blocks, Chat };

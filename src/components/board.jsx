import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as LX from 'lucide-react';
import { Icon, STAGES, TEMPS, META, LS_KEY, SUGGESTED, TONES, fmt, money, hrs, ago, agoTs, norm, sum, isOpen, stalled, stageIdx, stageName, uid, clamp, probOf, saludo, nextAction, analyzeNote, seed, loadState, rankScore, rank, names, funnelData, stats, healthScore, detect, answer, makeMsg, defaultTone } from '../lib/engine.jsx';
import { Rich, TempBadge, Modal, Ring, BRAND_ICON, BRAND_AVATAR, Logo, AiAvatar, FunnelBlock, ScenariosBlock, KpisBlock, LeadsBlock, Blocks, Chat } from './ui.jsx';

/* ───────────── Tablero Kanban ───────────── */
const KpiBar = ({ prospects }) => {
  const S = stats(prospects);
  const items = [
    { l: 'Dinero en Juego', v: money(S.pipeline), i: 'Wallet', s: `${S.o.length} prospectos activos`, c: '#F97316' },
    { l: 'Ventas Cerradas del Mes', v: money(S.wonSum), i: 'Trophy', s: `${Math.round((S.wonSum / META) * 100)}% de tu meta`, c: '#10B981' },
    { l: 'Prospectos Calientes', v: S.hot.length, i: 'Flame', s: `${money(sum(S.hot))} por cerrar`, c: '#DC2626' },
    { l: 'Alertas de Seguimiento Hoy', v: S.st.length, i: 'AlertTriangle', s: S.st.length ? 'Más de 2 días sin contacto' : 'Todo al día ✅', c: '#D97706' },
  ];
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {items.map((k) => (
        <div key={k.l} className="bg-white border border-line rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: k.c + '1A', color: k.c }}>
            <Icon n={k.i} className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs text-slate-500 leading-tight">{k.l}</p>
            <p className="font-display font-extrabold text-ink text-lg sm:text-xl leading-tight mt-0.5 truncate">{k.v}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{k.s}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const DailyPlan = ({ prospects, onOpen }) => {
  const r = rank(prospects.filter(isOpen)).slice(0, 3);
  if (!r.length) return null;
  return (
    <div className="rounded-2xl bg-gradient-to-r from-ink to-deep text-white p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 shadow-sm">
      <div className="flex items-center gap-3 lg:w-64 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center"><Icon n="Sparkles" className="w-5 h-5 text-accent" /></div>
        <div>
          <p className="font-display font-bold leading-tight">Plan del día de Nexus</p>
          <p className="text-xs text-slate-400">Tus 3 contactos con más potencial hoy</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 flex-1">
        {r.map((p, i) => (
          <button key={p.id} onClick={() => onOpen(p.id, 'wa')} className="text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 transition group">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-accent font-semibold">#{i + 1}</span>
              <span className="text-[11px] text-slate-300">{fmt(p.valor)}</span>
            </div>
            <p className="text-sm font-semibold truncate">{p.empresa}</p>
            <p className="text-[11px] text-slate-400 line-clamp-1 truncate">{nextAction(p)}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

const LeadCard = ({ p, fresh, onOpen, onMove, dragging, setDrag }) => {
  const h = hrs(p.lastTs), warn = stalled(p), si = stageIdx(p.etapa);
  return (
    <div draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', p.id); e.dataTransfer.effectAllowed = 'move'; setDrag(p.id); }}
      onDragEnd={() => setDrag(null)}
      className={`bg-white border rounded-xl p-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-grab active:cursor-grabbing ${warn ? 'border-orange-300' : 'border-line'} ${dragging ? 'opacity-40' : ''} ${fresh ? 'anim-pop' : 'anim-up'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display font-bold text-ink text-sm leading-tight">{p.empresa}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{p.contacto}</p>
        </div>
        <TempBadge temp={p.temp} />
      </div>
      <p className="font-display font-extrabold text-ink text-xl mt-2">{money(p.valor)}</p>
      <p className="text-[11px] text-slate-500 truncate">{p.servicio}</p>
      <div className="mt-2.5 bg-smoke border border-line rounded-lg p-2 flex gap-1.5">
        <Icon n="Sparkles" className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
        <p className="text-[11.5px] leading-snug text-slate-600">{p.resumen}</p>
      </div>
      <div className={`mt-2.5 flex items-center gap-1.5 text-[11.5px] font-medium ${warn ? 'text-accentd' : 'text-slate-500'}`}>
        <Icon n={warn ? 'AlertTriangle' : 'Clock'} className="w-3.5 h-3.5" />
        <span>{ago(h)}{warn ? ' · Requiere seguimiento' : ''}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <select value={p.etapa} onChange={(e) => onMove(p.id, e.target.value)} aria-label="Mover de etapa"
          className="flex-1 min-w-0 text-[11.5px] border border-line rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent/40">
          {STAGES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {si < 3 && (
          <button onClick={() => onMove(p.id, STAGES[si + 1].id)} title="Avanzar a la siguiente etapa" aria-label="Avanzar etapa"
            className="w-8 h-8 rounded-lg border border-line hover:bg-orange-50 hover:border-accent/50 text-slate-600 flex items-center justify-center transition shrink-0">
            <Icon n="ArrowRight" className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => onOpen(p.id)} className="h-8 px-2.5 rounded-lg bg-ink hover:bg-deep text-white text-[11.5px] font-semibold transition shrink-0">Abrir</button>
      </div>
    </div>
  );
};

const Board = ({ prospects, freshId, onOpen, onMove, onNew }) => {
  const [q, setQ] = useState('');
  const [fT, setFT] = useState('todos');
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const sRef = useRef(null);
  useEffect(() => {
    const k = (e) => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); sRef.current && sRef.current.focus(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  const list = useMemo(() => {
    const t = norm(q);
    return prospects.filter((p) => (fT === 'todos' || p.temp === fT) && (!t || norm(p.empresa + ' ' + p.contacto + ' ' + p.servicio).includes(t)));
  }, [prospects, q, fT]);
  const filters = [['todos', 'Todos'], ['caliente', '🔥 Calientes'], ['tibio', '⚡ Tibios'], ['frio', '❄️ Fríos']];
  return (
    <div className="space-y-4">
      <KpiBar prospects={prospects} />
      <DailyPlan prospects={prospects} onOpen={onOpen} />
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 md:max-w-sm">
          <Icon n="Search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input ref={sRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o empresa…  ( / )"
            className="w-full bg-white border border-line rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto flex-1">
          {filters.map(([id, l]) => (
            <button key={id} onClick={() => setFT(id)}
              className={`text-xs font-semibold rounded-full px-3.5 py-2 border whitespace-nowrap transition ${fT === id ? 'bg-ink text-white border-ink' : 'bg-white text-slate-600 border-line hover:border-slate-300'}`}>{l}</button>
          ))}
        </div>
        <button onClick={onNew} className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accentd text-white font-semibold text-sm rounded-xl px-4 py-2.5 glow transition">
          <Icon n="Plus" className="w-4 h-4" /> Nuevo Prospecto
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto snap-x pb-3 lg:grid lg:grid-cols-4 lg:overflow-visible">
        {STAGES.map((s) => {
          const col = list.filter((p) => p.etapa === s.id);
          const total = sum(col);
          return (
            <div key={s.id}
              onDragOver={(e) => { e.preventDefault(); setOver(s.id); }}
              onDragLeave={() => setOver((o) => (o === s.id ? null : o))}
              onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain') || drag; if (id) onMove(id, s.id); setOver(null); setDrag(null); }}
              className={`snap-start shrink-0 w-[86%] sm:w-[330px] lg:w-auto lg:shrink rounded-2xl border transition ${over === s.id ? 'bg-orange-50/60 border-accent border-dashed' : 'bg-slate-100/70 border-line'}`}>
              <div className="p-3.5 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.dot }} />
                    <h3 className="font-display font-bold text-ink text-sm truncate">{s.name}</h3>
                  </div>
                  <span className="text-xs font-semibold bg-white border border-line text-slate-600 rounded-full px-2 py-0.5">{col.length}</span>
                </div>
                <p className="font-display font-extrabold text-ink text-lg mt-1">{money(total)}</p>
              </div>
              <div className="p-2.5 pt-1 space-y-2.5 min-h-[140px]">
                {col.map((p) => <LeadCard key={p.id} p={p} fresh={freshId === p.id} dragging={drag === p.id} setDrag={setDrag} onOpen={onOpen} onMove={onMove} />)}
                {!col.length && (
                  <div className="border-2 border-dashed border-slate-300/70 rounded-xl py-8 px-4 text-center text-xs text-slate-400">
                    {prospects.some((p) => p.etapa === s.id) ? 'Sin resultados con este filtro' : 'Arrastra aquí un prospecto'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ───────────── Nuevo prospecto ───────────── */
const NewLeadModal = ({ onClose, onCreate }) => {
  const [f, setF] = useState({ empresa: '', contacto: '', tel: '', servicio: '', valor: '', nota: '' });
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.empresa.trim()) er.empresa = 'Escribe el nombre de la empresa';
    if (!f.contacto.trim()) er.contacto = 'Escribe el nombre del contacto';
    const digits = f.tel.replace(/\D/g, '');
    if (digits.length < 10) er.tel = 'Escribe un WhatsApp de 10 dígitos';
    if (!f.servicio.trim()) er.servicio = '¿Qué le vas a vender?';
    const valor = parseInt(f.valor.replace(/\D/g, ''), 10);
    if (!valor) er.valor = 'Escribe el monto estimado';
    setErr(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    setTimeout(() => {
      const ai = analyzeNote({ nota: f.nota, servicio: f.servicio.trim() });
      onCreate({ empresa: f.empresa.trim(), contacto: f.contacto.trim(), tel: digits.length === 10 ? '521' + digits : digits, servicio: f.servicio.trim(), valor, nota: f.nota.trim(), ...ai });
    }, 800);
  };
  const Field = ({ k, label, ph, type = 'text', inputMode }) => (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <input value={f[k]} onChange={set(k)} placeholder={ph} type={type} inputMode={inputMode}
        className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent ${err[k] ? 'border-red-300 bg-red-50/40' : 'border-line'}`} />
      {err[k] && <span className="text-[11px] text-red-600">{err[k]}</span>}
    </label>
  );
  return (
    <Modal onClose={busy ? () => {} : onClose}>
      <form onSubmit={submit} className="p-5 sm:p-6 space-y-3.5 relative">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-extrabold text-xl text-ink">Nuevo prospecto</h2>
            <p className="text-xs text-slate-500 mt-0.5">Nexus lee tu nota y le asigna temperatura automáticamente.</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-smoke" aria-label="Cerrar"><Icon n="X" className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <Field k="empresa" label="Empresa" ph="Ej. Clínica Vida" />
          <Field k="contacto" label="Nombre del contacto" ph="Ej. Dra. Ana Pérez" />
          <Field k="tel" label="WhatsApp" ph="461 123 4567" type="tel" inputMode="tel" />
          <Field k="valor" label="Monto estimado (MXN)" ph="8,500" inputMode="numeric" />
        </div>
        <Field k="servicio" label="Servicio que le ofreces" ph="Ej. Página web + redes" />
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Nota rápida</span>
          <textarea value={f.nota} onChange={set('nota')} rows={3} placeholder='Ej. "Le urge para esta semana, ya tiene presupuesto"'
            className="mt-1 w-full border border-line rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent resize-none" />
        </label>
        <button disabled={busy} className="w-full bg-accent hover:bg-accentd text-white font-semibold rounded-xl py-3 glow transition disabled:opacity-60">Guardar y analizar con IA</button>
        {busy && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 rounded-2xl anim-up">
            <div className="w-12 h-12 rounded-2xl bg-ink flex items-center justify-center"><Icon n="Sparkles" className="w-6 h-6 text-accent" style={{ animation: 'spin 1s linear infinite' }} /></div>
            <p className="text-sm font-semibold text-ink">Nexus AI está leyendo tu nota…</p>
            <div className="w-40 h-2 rounded-full shimmer" />
          </div>
        )}
      </form>
    </Modal>
  );
};

/* ───────────── Detalle del prospecto ───────────── */
const Section = ({ icon, title, children, refEl }) => (
  <section ref={refEl} className="bg-white border border-line rounded-2xl p-4">
    <h3 className="flex items-center gap-2 font-display font-bold text-ink text-sm mb-3"><Icon n={icon} className="w-4 h-4 text-accent" />{title}</h3>
    {children}
  </section>
);

const LeadDrawer = ({ p, focus, onClose, onMove, onLog, onNote, onDelete, onQuote, toast }) => {
  const [tone, setTone] = useState(defaultTone(p));
  const [msg, setMsg] = useState(() => makeMsg(p, defaultTone(p)));
  const [confirm, setConfirm] = useState(false);
  const waRef = useRef(null);
  useEffect(() => { setMsg(makeMsg(p, tone)); }, [tone]);
  useEffect(() => { if (focus === 'wa' && waRef.current) setTimeout(() => waRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250); }, []);
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  const prob = probOf(p), pc = prob >= 70 ? '#DC2626' : prob >= 40 ? '#F97316' : '#0284C7';
  const copy = async () => { try { await navigator.clipboard.writeText(msg); toast('Mensaje copiado'); } catch (e) { toast('No se pudo copiar; selecciona el texto manualmente', 'warn'); } };
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-deep/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-smoke shadow-2xl flex flex-col anim-in">
        <header className="bg-ink text-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400">{stageName(p.etapa)}</p>
              <h2 className="font-display font-extrabold text-xl leading-tight truncate">{p.empresa}</h2>
              <p className="text-xs text-slate-300 mt-0.5">{p.contacto} · {p.servicio}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10" aria-label="Cerrar"><Icon n="X" className="w-5 h-5" /></button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="font-display font-extrabold text-2xl text-accent">{money(p.valor)}</p>
            <TempBadge temp={p.temp} />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
          <Section icon="Brain" title="Diagnóstico IA del prospecto">
            <div className="flex items-center gap-4">
              <Ring value={prob} color={pc} />
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Probabilidad de cierre</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <TempBadge temp={p.temp} />
                  <span className="text-[11px] text-slate-400">{ago(hrs(p.lastTs))}</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-snug">{p.resumen}</p>
              </div>
            </div>
            <div className="mt-3 rounded-xl bg-orange-50 border border-orange-200 p-3 flex gap-2.5">
              <Icon n="Lightbulb" className="w-4 h-4 text-accentd shrink-0 mt-0.5" />
              <div><p className="text-[11px] font-semibold text-accentd uppercase tracking-wide">Siguiente acción recomendada</p><p className="text-sm text-ink mt-0.5">{nextAction(p)}</p></div>
            </div>
            <label className="block mt-3">
              <span className="text-[11px] font-semibold text-slate-500">Etapa del embudo</span>
              <select value={p.etapa} onChange={(e) => onMove(p.id, e.target.value)} className="mt-1 w-full text-sm border border-line rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40">
                {STAGES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
          </Section>

          <Section icon="MessageCircle" title="Asistente redactor de WhatsApp" refEl={waRef}>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {TONES.map((t) => (
                <button key={t.id} onClick={() => setTone(t.id)} className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition ${tone === t.id ? 'bg-ink text-white border-ink' : 'bg-white text-slate-600 border-line hover:border-slate-300'}`}>{t.label}</button>
              ))}
            </div>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5}
              className="w-full border border-line rounded-xl px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none" />
            <div className="flex gap-2 mt-2.5">
              <a href={`https://wa.me/${p.tel}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer"
                onClick={() => onLog(p.id, 'Mensaje de seguimiento enviado hoy', true)}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-sm rounded-xl py-2.5 transition">
                <Icon n="Send" className="w-4 h-4" /> Enviar por WhatsApp
              </a>
              <button onClick={() => setMsg(makeMsg(p, tone))} title="Restablecer mensaje" className="px-3 border border-line rounded-xl hover:bg-smoke bg-white"><Icon n="RotateCcw" className="w-4 h-4 text-slate-600" /></button>
              <button onClick={copy} title="Copiar mensaje" className="px-3 border border-line rounded-xl hover:bg-smoke bg-white"><Icon n="Copy" className="w-4 h-4 text-slate-600" /></button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Se abre WhatsApp con el mensaje listo. Tel: +{p.tel}</p>
          </Section>

          <Section icon="FileText" title="Cotización formal">
            <button onClick={() => onQuote(p.id)} className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accentd text-white font-semibold text-sm rounded-xl py-2.5 glow transition">
              <Icon n="FileText" className="w-4 h-4" /> Generar Cotización PDF
            </button>
          </Section>

          <Section icon="StickyNote" title="Notas internas">
            <textarea defaultValue={p.nota} onBlur={(e) => onNote(p.id, e.target.value)} rows={3} placeholder="Escribe aquí lo que no quieres olvidar de este cliente…"
              className="w-full border border-line rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none" />
          </Section>

          <Section icon="History" title="Historial">
            <ol className="relative border-l-2 border-line ml-1.5 space-y-3">
              {[...p.historial].sort((a, b) => b.ts - a.ts).map((h, i) => (
                <li key={i} className="pl-4 relative">
                  <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-white border-2 border-accent" />
                  <p className="text-sm text-ink">{h.txt}</p>
                  <p className="text-[11px] text-slate-400">{agoTs(h.ts)}</p>
                </li>
              ))}
            </ol>
          </Section>

          <button onClick={() => (confirm ? onDelete(p.id) : (setConfirm(true), setTimeout(() => setConfirm(false), 3000)))}
            className={`w-full text-xs font-semibold rounded-xl py-2.5 border transition ${confirm ? 'bg-red-600 text-white border-red-600' : 'text-slate-500 border-line bg-white hover:text-red-600 hover:border-red-200'}`}>
            <Icon n="Trash2" className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />{confirm ? 'Haz clic otra vez para eliminar' : 'Eliminar prospecto'}
          </button>
        </div>
      </aside>
    </div>
  );
};

/* ───────────── Cotización PDF ───────────── */
const QuoteModal = ({ p, onClose, toast }) => {
  const sub = p.valor, iva = Math.round(sub * 0.16), total = sub + iva;
  const a = Math.round(sub * 0.15), b = Math.round(sub * 0.65), c = sub - a - b;
  const items = [['Diagnóstico y planeación', `Levantamiento de necesidades para ${p.servicio}`, a], [p.servicio, 'Implementación y configuración del servicio', b], ['Acompañamiento y soporte', 'Seguimiento durante el primer mes', c]];
  const today = new Date(), until = new Date(Date.now() + 15 * 864e5);
  const d = (x) => x.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const folio = `COT-${today.getFullYear()}-${String(p.id.replace(/\D/g, '').slice(-3) || '001').padStart(3, '0')}`;
  const doPrint = () => {
    try { window.print(); toast('Si no se abrió el diálogo, abre Nexus en pestaña completa y presiona Ctrl+P', 'info'); }
    catch (e) { toast('Tu navegador bloqueó la impresión en esta vista. Abre la app en pestaña completa.', 'warn'); }
  };
  const copy = async () => {
    const txt = `COTIZACIÓN ${folio}\nCliente: ${p.empresa} (${p.contacto})\n${items.map((i) => `- ${i[0]}: ${money(i[2])}`).join('\n')}\nSubtotal: ${money(sub)}\nIVA 16%: ${money(iva)}\nTOTAL: ${money(total)}\nVigencia: ${d(until)}`;
    try { await navigator.clipboard.writeText(txt); toast('Resumen de cotización copiado'); } catch (e) { toast('No se pudo copiar', 'warn'); }
  };
  return (
    <Modal onClose={onClose} wide z="z-[75]">
      <div className="no-print sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-line px-4 py-3 flex items-center justify-between gap-2">
        <p className="font-display font-bold text-ink text-sm">Vista previa de cotización</p>
        <div className="flex gap-2">
          <button onClick={copy} className="text-xs font-semibold border border-line rounded-lg px-3 py-2 hover:bg-smoke inline-flex items-center gap-1.5"><Icon n="Copy" className="w-3.5 h-3.5" />Copiar</button>
          <button onClick={doPrint} className="text-xs font-semibold bg-accent hover:bg-accentd text-white rounded-lg px-3 py-2 inline-flex items-center gap-1.5"><Icon n="Printer" className="w-3.5 h-3.5" />Imprimir / Guardar PDF</button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-smoke" aria-label="Cerrar"><Icon n="X" className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="p-3 sm:p-6 bg-slate-100">
        <div id="quote-doc" className="bg-white shadow-lg border border-line rounded-lg p-6 sm:p-10 text-ink">
          <div className="flex items-start justify-between gap-4 pb-5 border-b-4 border-accent">
            <div className="flex items-center gap-3"><Logo size={44} /><div><p className="font-display font-extrabold text-xl leading-tight">Mi Negocio Local</p><p className="text-xs text-slate-500">Soluciones para tu empresa · Celaya, Gto.</p></div></div>
            <div className="text-right"><p className="font-display font-extrabold text-lg text-accentd">COTIZACIÓN</p><p className="text-xs text-slate-500">Folio {folio}</p><p className="text-xs text-slate-500">{d(today)}</p></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 py-5 text-sm">
            <div><p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Preparada para</p><p className="font-display font-bold text-base">{p.empresa}</p><p className="text-slate-600">Atn. {p.contacto}</p><p className="text-slate-600">WhatsApp: +{p.tel}</p></div>
            <div className="sm:text-right"><p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Vigencia</p><p className="font-semibold">Hasta el {d(until)}</p><p className="text-slate-600">15 días naturales</p></div>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="bg-ink text-white text-left text-xs"><th className="px-3 py-2.5 rounded-l-lg">Concepto</th><th className="px-3 py-2.5 text-right rounded-r-lg">Importe</th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i[0]} className="border-b border-line align-top"><td className="px-3 py-3"><p className="font-semibold">{i[0]}</p><p className="text-xs text-slate-500">{i[1]}</p></td><td className="px-3 py-3 text-right font-medium whitespace-nowrap">{money(i[2])}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mt-4"><div className="w-full sm:w-72 text-sm space-y-1.5">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{money(sub)}</span></div>
            <div className="flex justify-between text-slate-600"><span>IVA (16%)</span><span>{money(iva)}</span></div>
            <div className="flex justify-between items-center bg-orange-50 border border-orange-200 rounded-lg px-3 py-2.5 font-display font-extrabold text-base"><span>Total</span><span className="text-accentd">{money(total)}</span></div>
          </div></div>
          <div className="mt-6 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-ink text-sm">Condiciones</p>
            <p>• Anticipo del 50% para iniciar; el resto al entregar.</p>
            <p>• Precios en pesos mexicanos (MXN). Esta cotización es válida hasta el {d(until)}.</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-8 text-center text-xs text-slate-500"><div className="border-t border-slate-300 pt-2">Mi Negocio Local</div><div className="border-t border-slate-300 pt-2">{p.contacto}</div></div>
        </div>
      </div>
    </Modal>
  );
};

export { KpiBar, DailyPlan, LeadCard, Board, NewLeadModal, Section, LeadDrawer, QuoteModal };

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as LX from 'lucide-react';
import { Icon, STAGES, TEMPS, META, LS_KEY, SUGGESTED, TONES, fmt, money, hrs, ago, agoTs, norm, sum, isOpen, stalled, stageIdx, stageName, uid, clamp, probOf, saludo, nextAction, analyzeNote, seed, loadState, rankScore, rank, names, funnelData, stats, healthScore, detect, answer, makeMsg, defaultTone } from '../lib/engine.jsx';
import { Rich, TempBadge, Modal, Ring, BRAND_ICON, BRAND_AVATAR, Logo, AiAvatar, FunnelBlock, ScenariosBlock, KpisBlock, LeadsBlock, Blocks, Chat } from './ui.jsx';
import { KpiBar, DailyPlan, LeadCard, Board, NewLeadModal, Section, LeadDrawer, QuoteModal } from './board.jsx';

/* ───────────── Dashboard ───────────── */
const Card = ({ title, icon, children, className = '' }) => (
  <section className={`bg-white border border-line rounded-2xl p-4 sm:p-5 shadow-sm ${className}`}>
    <h3 className="flex items-center gap-2 font-display font-bold text-ink mb-4"><Icon n={icon} className="w-4 h-4 text-accent" />{title}</h3>
    {children}
  </section>
);

const Donut = ({ parts, total }) => {
  const r = 52, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg viewBox="0 0 140 140" className="-rotate-90 w-full h-full">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#F1F5F9" strokeWidth="18" />
        {parts.map((p) => {
          const len = total ? (p.n / total) * c : 0;
          const el = <circle key={p.k} cx="70" cy="70" r={r} fill="none" stroke={p.fg} strokeWidth="18" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} style={{ transition: 'all .8s ease' }} />;
          off += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-display font-extrabold text-3xl text-ink leading-none">{total}</span><span className="text-[11px] text-slate-500">prospectos</span></div>
    </div>
  );
};

const Dashboard = ({ prospects, onOpen }) => {
  const S = stats(prospects);
  const f = funnelData(prospects);
  const eff = f[0].count ? Math.round((f[3].count / f[0].count) * 100) : 0;
  const health = healthScore(prospects);
  const waCount = prospects.reduce((n, p) => n + p.historial.filter((h) => /^Mensaje de seguimiento/.test(h.txt)).length, 0);
  const qCount = prospects.reduce((n, p) => n + p.historial.filter((h) => /^Cotización/.test(h.txt)).length, 0);
  const saved = (14 + prospects.length * 0.4 + waCount * 0.25 + qCount * 0.5).toFixed(1);
  const stalledRatio = S.o.length ? S.st.length / S.o.length : 0;
  const respRate = Math.round(92 - 30 * stalledRatio);
  const parts = Object.keys(TEMPS).map((k) => ({ k, fg: { caliente: '#DC2626', tibio: '#F59E0B', frio: '#0EA5E9' }[k], n: prospects.filter((p) => p.temp === k).length }));
  const maxStage = Math.max(1, ...STAGES.map((s) => sum(prospects.filter((p) => p.etapa === s.id))));
  const goal = Math.min(100, Math.round((S.wonSum / META) * 100));
  const top = [...S.o].sort((a, b) => b.valor * probOf(b) - a.valor * probOf(a)).slice(0, 5);
  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-ink to-deep text-white p-5 sm:p-6 relative overflow-hidden shadow-sm">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-accent/20 blur-2xl" />
          <div className="relative">
            <p className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider"><Icon n="Zap" className="w-4 h-4" />Impacto de Nexus</p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[[`${saved} h`, 'Horas ahorradas en seguimiento manual'], [`${respRate}%`, 'Tasa de respuesta promedio'], [`${Math.max(2, 3 + S.st.length * 2)} min`, 'Tiempo promedio de respuesta']].map(([v, l]) => (
                <div key={l}><p className="font-display font-extrabold text-2xl sm:text-4xl leading-none">{v}</p><p className="text-[11px] sm:text-xs text-slate-300 mt-1.5 leading-snug">{l}</p></div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4">Calculado con tus {waCount} mensajes de seguimiento, {qCount} cotización(es) y {prospects.length} prospectos analizados por IA.</p>
          </div>
        </div>
        <Card title="Salud del embudo" icon="HeartPulse">
          <div className="flex items-center gap-4">
            <Ring value={health} label="de 100" color={health >= 75 ? '#10B981' : health >= 55 ? '#F97316' : '#DC2626'} size={96} />
            <p className="text-sm text-slate-600 leading-snug">{health >= 75 ? 'Tu embudo está sano. Sigue dando seguimiento a tus calientes.' : health >= 55 ? 'Atención: hay seguimientos pendientes que pueden costarte ventas.' : 'Tu embudo necesita ayuda: reactiva a los prospectos desatendidos hoy.'}</p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Embudo de conversión" icon="Filter">
          <div className="space-y-3.5">
            {f.map((d, i) => {
              const w = f[0].count ? (d.count / f[0].count) * 100 : 0;
              const step = i ? (f[i - 1].count ? Math.round((d.count / f[i - 1].count) * 100) : 0) : null;
              return (
                <div key={d.name}>
                  <div className="flex justify-between items-baseline text-sm mb-1.5">
                    <span className="font-medium text-ink">{d.name}</span>
                    <span className="text-slate-500"><b className="text-ink">{d.count}</b> prospectos{step !== null && <span className="text-[11px] ml-1.5">({step}% pasa)</span>}</span>
                  </div>
                  <div className="h-7 bg-smoke border border-line rounded-lg overflow-hidden">
                    <div className="bar h-full rounded-lg flex items-center justify-end pr-2 text-[11px] text-white font-semibold" style={{ width: `${Math.max(w, 8)}%`, background: i === 3 ? '#10B981' : i === 2 ? '#F97316' : i === 1 ? '#475569' : '#1E293B' }}>{Math.round(w)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-xl bg-orange-50 border border-orange-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-slate-700">Efectividad total del embudo</span>
            <span className="font-display font-extrabold text-2xl text-accentd">{eff}%</span>
          </div>
        </Card>

        <Card title="Distribución por temperatura IA" icon="Thermometer">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Donut parts={parts} total={prospects.length} />
            <div className="flex-1 w-full space-y-2.5">
              {parts.map((p) => {
                const T = TEMPS[p.k];
                return (
                  <div key={p.k} style={{ background: T.bg, borderColor: T.bd, color: T.fg }} className="flex items-center justify-between border rounded-xl px-3.5 py-2.5">
                    <span className="text-sm font-semibold">{T.emoji} {T.label}s</span>
                    <span className="text-sm"><b>{p.n}</b> · {prospects.length ? Math.round((p.n / prospects.length) * 100) : 0}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Meta del mes" icon="Target">
          <p className="font-display font-extrabold text-3xl text-ink">{fmt(S.wonSum)}</p>
          <p className="text-xs text-slate-500">de {money(META)}</p>
          <div className="h-3 rounded-full bg-smoke border border-line mt-3 overflow-hidden"><div className="bar h-full rounded-full bg-gradient-to-r from-accent to-amber-400" style={{ width: `${goal}%` }} /></div>
          <p className="text-xs text-slate-600 mt-2">{goal}% logrado · te faltan <b>{money(Math.max(0, META - S.wonSum))}</b></p>
          <p className="text-xs text-slate-500 mt-3">Con tu dinero ponderado podrías llegar a <b className="text-ink">{money(S.wonSum + S.weighted)}</b>.</p>
        </Card>
        <Card title="Dinero por etapa" icon="BarChart3">
          <div className="space-y-3">
            {STAGES.map((s) => { const v = sum(prospects.filter((p) => p.etapa === s.id)); return (
              <div key={s.id}>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-600">{s.name}</span><b className="text-ink">{fmt(v)}</b></div>
                <div className="h-2.5 rounded-full bg-smoke border border-line overflow-hidden"><div className="bar h-full rounded-full" style={{ width: `${(v / maxStage) * 100}%`, background: s.dot }} /></div>
              </div>); })}
          </div>
        </Card>
        <Card title="Mejores oportunidades" icon="Star">
          <div className="space-y-2">
            {top.map((p, i) => (
              <button key={p.id} onClick={() => onOpen(p.id)} className="w-full flex items-center gap-3 text-left rounded-xl hover:bg-smoke px-2 py-1.5 transition">
                <span className="w-6 h-6 rounded-lg bg-ink text-white text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="flex-1 min-w-0"><span className="block text-sm font-semibold text-ink truncate">{p.empresa}</span><span className="block text-[11px] text-slate-500">{fmt(p.valor)} · {probOf(p)}% prob.</span></span>
                <TempBadge temp={p.temp} small />
              </button>
            ))}
            {!top.length && <p className="text-sm text-slate-500">Sin oportunidades abiertas.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ───────────── Vista completa del Agente ───────────── */
const AgentView = ({ chat, prospects, onOpen }) => {
  const S = stats(prospects);
  const health = healthScore(prospects);
  const risk = S.st.length;
  return (
    <div className="grid xl:grid-cols-[1fr_320px] gap-4">
      <div className="bg-smoke/60 border border-line rounded-2xl overflow-hidden shadow-sm h-[calc(100vh-9.5rem)] min-h-[520px] bg-white">
        <Chat {...chat} prospects={prospects} onOpen={onOpen} />
      </div>
      <div className="space-y-4 hidden xl:block">
        <Card title="Lo que Nexus ve ahora" icon="Eye">
          <div className="flex items-center gap-4">
            <Ring value={health} label="salud" size={78} stroke={8} color={health >= 75 ? '#10B981' : health >= 55 ? '#F97316' : '#DC2626'} />
            <div className="text-xs text-slate-600 space-y-1">
              <p><b className="text-ink">{S.o.length}</b> prospectos abiertos</p>
              <p><b className="text-ink">{S.hot.length}</b> calientes 🔥</p>
              <p><b className={risk ? 'text-accentd' : 'text-ink'}>{risk}</b> sin seguimiento ⚠️</p>
            </div>
          </div>
        </Card>
        <Card title="Pídele a Nexus" icon="MessageSquare">
          <ul className="space-y-2 text-xs text-slate-600">
            {['“¿Qué cotizaciones tengo abiertas?”', '“Dame un consejo para cerrar más”', '“¿Quiénes son mis clientes fríos?”', '“¿Cuánto dinero puedo ganar este mes?”'].map((q) => (
              <li key={q} className="bg-smoke border border-line rounded-lg px-3 py-2">{q}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

/* ───────────── Layout: barra lateral, encabezado ───────────── */
const NAV = [
  { id: 'tablero', label: 'Tablero de Ventas', icon: 'LayoutGrid' },
  { id: 'agente', label: 'Agente IA Analítico', icon: 'Bot' },
  { id: 'metricas', label: 'Métricas y Rendimiento', icon: 'BarChart3' },
];

const Sidebar = ({ view, setView, alerts, onReset, onClose }) => {
  const [arm, setArm] = useState(false);
  return (
    <div className="h-full bg-ink text-white flex flex-col">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5"><Logo /><span className="font-display font-extrabold text-xl tracking-tight">Nexus</span></div>
        {onClose && <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 lg:hidden" aria-label="Cerrar menú"><Icon n="X" className="w-5 h-5" /></button>}
      </div>
      <div className="px-4">
        <button className="w-full flex items-center gap-3 bg-deep/70 border border-white/10 rounded-xl px-3 py-2.5 text-left hover:border-white/20 transition">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Icon n="Building2" className="w-4 h-4 text-slate-200" /></div>
          <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">Mi Negocio Local</p><p className="text-[11px] text-accent">Plan Crecimiento</p></div>
          <Icon n="ChevronDown" className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <nav className="px-3 mt-6 space-y-1 flex-1">
        <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Menú</p>
        {NAV.map((n) => {
          const on = view === n.id;
          return (
            <button key={n.id} onClick={() => setView(n.id)} className={`relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${on ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
              {on && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-accent" />}
              <Icon n={n.icon} className={`w-[18px] h-[18px] ${on ? 'text-accent' : ''}`} />
              <span className="flex-1 text-left">{n.label}</span>
              {n.id === 'tablero' && alerts > 0 && <span className="text-[10px] font-bold bg-accent text-white rounded-full px-1.5 py-0.5">{alerts}</span>}
            </button>
          );
        })}
      </nav>
      <div className="p-4 space-y-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <p className="text-xs font-semibold flex items-center gap-1.5"><Icon n="Sparkles" className="w-3.5 h-3.5 text-accent" />IA activa</p>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">Nexus analiza cada prospecto y te avisa cuándo dar seguimiento.</p>
        </div>
        <button onClick={() => { if (arm) { onReset(); setArm(false); } else { setArm(true); setTimeout(() => setArm(false), 3000); } }}
          className={`w-full flex items-center justify-center gap-2 text-[11px] rounded-lg py-2 transition ${arm ? 'bg-accent text-white' : 'text-slate-500 hover:text-slate-300'}`}>
          <Icon n="RotateCcw" className="w-3 h-3" />{arm ? 'Clic otra vez para confirmar' : 'Restaurar Demo'}
        </button>
      </div>
    </div>
  );
};

const TopBar = ({ view, onMenu, prospects, onOpen }) => {
  const [bell, setBell] = useState(false);
  const S = stats(prospects);
  const titles = { tablero: ['Tablero de Ventas', 'Tu embudo, claro y en movimiento'], agente: ['Agente IA Analítico', 'Tu consultor de ventas 24/7'], metricas: ['Métricas y Rendimiento', 'Cómo va tu negocio hoy'] };
  const goal = Math.min(100, Math.round((S.wonSum / META) * 100));
  return (
    <header className="sticky top-0 z-30 bg-smoke/90 backdrop-blur border-b border-line px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
      <button onClick={onMenu} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white" aria-label="Abrir menú"><Icon n="Menu" className="w-5 h-5" /></button>
      <div className="min-w-0 flex-1">
        <h1 className="font-display font-extrabold text-ink text-lg sm:text-2xl leading-tight truncate">{titles[view][0]}</h1>
        <p className="text-xs text-slate-500 hidden sm:block">{titles[view][1]}</p>
      </div>
      <div className="hidden md:flex items-center gap-3 bg-white border border-line rounded-xl px-3 py-2">
        <Icon n="Target" className="w-4 h-4 text-accent" />
        <div><p className="text-[10px] text-slate-500 leading-none">Meta del mes</p><div className="w-28 h-1.5 rounded-full bg-line mt-1.5 overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${goal}%`, transition: 'width .6s' }} /></div></div>
        <span className="text-xs font-bold text-ink">{goal}%</span>
      </div>
      <div className="relative">
        <button onClick={() => setBell(!bell)} className="relative p-2.5 bg-white border border-line rounded-xl hover:border-slate-300" aria-label="Alertas">
          <Icon n="Bell" className="w-4 h-4 text-slate-600" />
          {S.st.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">{S.st.length}</span>}
        </button>
        {bell && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setBell(false)} />
            <div className="absolute right-0 mt-2 w-80 max-w-[85vw] bg-white border border-line rounded-2xl shadow-xl z-40 anim-up overflow-hidden">
              <p className="px-4 py-3 text-sm font-display font-bold border-b border-line">Alertas de seguimiento</p>
              {S.st.length ? S.st.map((p) => (
                <button key={p.id} onClick={() => { setBell(false); onOpen(p.id, 'wa'); }} className="w-full text-left px-4 py-3 hover:bg-smoke flex gap-3 border-b border-line last:border-0">
                  <Icon n="AlertTriangle" className="w-4 h-4 text-accentd mt-0.5 shrink-0" />
                  <span><span className="block text-sm font-semibold text-ink">{p.empresa}</span><span className="block text-[11px] text-slate-500">{ago(hrs(p.lastTs))} · {fmt(p.valor)} en juego</span></span>
                </button>
              )) : <p className="px-4 py-6 text-sm text-slate-500 text-center">Todo al día ✅</p>}
            </div>
          </>
        )}
      </div>
      <div className="w-9 h-9 rounded-xl bg-ink text-white font-display font-bold text-sm flex items-center justify-center">ML</div>
    </header>
  );
};

/* ───────────── App ───────────── */
const WELCOME = () => [{ role: 'ai', blocks: [
  { t: 'p', text: '¡Hola! Soy **Nexus AI**, tu consultor de ventas. Leo tu tablero en tiempo real, así que cada respuesta usa tus números actuales.' },
  { t: 'p', text: 'Elige una pregunta de abajo o escríbeme lo que necesites.' },
] }];
const VIEWS = ['tablero', 'agente', 'metricas'];

const App = () => {
  const [prospects, setProspects] = useState(loadState);
  const [view, setViewS] = useState(() => { const h = (location.hash || '').slice(1); return VIEWS.includes(h) ? h : 'tablero'; });
  const [menu, setMenu] = useState(false);
  const [panel, setPanel] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const [quoteId, setQuoteId] = useState(null);
  const [freshId, setFreshId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confetti, setConfetti] = useState(false);
  const [messages, setMessages] = useState(WELCOME);
  const [thinking, setThinking] = useState(false);
  const psRef = useRef(prospects);
  psRef.current = prospects;

  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(prospects)); } catch (e) {} }, [prospects]);
  useEffect(() => { const h = () => { const x = (location.hash || '').slice(1); if (VIEWS.includes(x)) setViewS(x); }; window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h); }, []);
  const setView = (v) => { setViewS(v); setMenu(false); try { location.hash = v; } catch (e) {} window.scrollTo({ top: 0 }); };

  const toast = useCallback((text, kind = 'ok') => {
    const id = Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const patch = (id, fn) => setProspects((ps) => ps.map((p) => (p.id === id ? fn(p) : p)));
  const move = (id, etapa) => {
    const cur = psRef.current.find((p) => p.id === id);
    if (!cur || cur.etapa === etapa) return;
    patch(id, (p) => ({
      ...p, etapa,
      resumen: etapa === 'cerrada' ? `¡Venta cerrada por ${money(p.valor)}! Programa el arranque con el cliente.` : p.resumen,
      historial: [...p.historial, { ts: Date.now(), txt: `Movido a «${stageName(etapa)}»` }],
    }));
    if (etapa === 'cerrada') { setConfetti(true); setTimeout(() => setConfetti(false), 2600); toast(`🎉 ¡Venta cerrada! ${cur.empresa} suma ${money(cur.valor)}`); }
    else toast(`${cur.empresa} → ${stageName(etapa)}`);
  };
  const log = (id, txt, contact) => patch(id, (p) => ({ ...p, lastTs: contact ? Date.now() : p.lastTs, historial: [...p.historial, { ts: Date.now(), txt }] }));
  const create = (d) => {
    const id = uid(), now = Date.now();
    const p = { id, etapa: 'informes', lastTs: now, createdTs: now, historial: [{ ts: now, txt: 'Prospecto agregado y analizado por Nexus AI' }], ...d };
    setProspects((ps) => [p, ...ps]);
    setNewOpen(false); setFreshId(id); setTimeout(() => setFreshId(null), 3000);
    toast(`${TEMPS[d.temp].emoji} ${d.empresa} clasificado como ${TEMPS[d.temp].label.toLowerCase()}`);
    setView('tablero');
  };
  const remove = (id) => { setProspects((ps) => ps.filter((p) => p.id !== id)); setDrawer(null); toast('Prospecto eliminado', 'info'); };
  const reset = () => { setProspects(seed()); setMessages(WELCOME()); setDrawer(null); toast('Datos demo restaurados'); };
  const openLead = (id, focus) => { setDrawer({ id, focus }); setMenu(false); };

  const ask = (intent, text) => {
    setMessages((m) => [...m, { role: 'user', text }]);
    setThinking(true);
    setTimeout(() => {
      const blocks = answer(intent || detect(text), psRef.current);
      setMessages((m) => [...m, { role: 'ai', blocks }]);
      setThinking(false);
    }, 1000 + Math.random() * 500);
  };
  const chat = { messages, thinking, onAsk: ask };

  const lead = drawer && prospects.find((p) => p.id === drawer.id);
  const quoteLead = quoteId && prospects.find((p) => p.id === quoteId);
  const alerts = stats(prospects).st.length;

  return (
    <div className="min-h-screen">
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-40"><Sidebar view={view} setView={setView} alerts={alerts} onReset={reset} /></aside>
      {menu && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-deep/60" onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 left-0 w-72 anim-inl"><Sidebar view={view} setView={setView} alerts={alerts} onReset={reset} onClose={() => setMenu(false)} /></div>
        </div>
      )}
      <div className="lg:pl-64">
        <TopBar view={view} onMenu={() => setMenu(true)} prospects={prospects} onOpen={openLead} />
        <main className="px-4 sm:px-6 lg:px-8 py-5 pb-28 max-w-[1500px] mx-auto">
          {view === 'tablero' && <Board prospects={prospects} freshId={freshId} onOpen={openLead} onMove={move} onNew={() => setNewOpen(true)} />}
          {view === 'agente' && <AgentView chat={chat} prospects={prospects} onOpen={openLead} />}
          {view === 'metricas' && <Dashboard prospects={prospects} onOpen={openLead} />}
        </main>
      </div>

      {view !== 'agente' && !panel && (
        <button onClick={() => setPanel(true)} className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 bg-accent hover:bg-accentd text-white font-semibold rounded-full pl-4 pr-5 py-3.5 glow transition hover:scale-105">
          <Icon n="Sparkles" className="w-5 h-5" /><span className="hidden sm:inline text-sm">Copiloto IA</span>
        </button>
      )}
      {panel && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-deep/30 sm:bg-transparent" onClick={() => setPanel(false)} />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[430px] bg-smoke border-l border-line shadow-2xl flex flex-col anim-in">
            <header className="bg-ink text-white px-4 py-3.5 flex items-center gap-3">
              <AiAvatar size="w-9 h-9" />
              <div className="flex-1"><p className="font-display font-bold leading-tight">Copiloto IA</p><p className="text-[11px] text-slate-400">Lee tu tablero en tiempo real</p></div>
              <button onClick={() => { setPanel(false); setView('agente'); }} className="text-[11px] text-slate-300 hover:text-white border border-white/20 rounded-lg px-2 py-1">Ampliar</button>
              <button onClick={() => setPanel(false)} className="p-1.5 rounded-lg hover:bg-white/10" aria-label="Cerrar"><Icon n="X" className="w-5 h-5" /></button>
            </header>
            <div className="flex-1 min-h-0 bg-white"><Chat {...chat} compact prospects={prospects} onOpen={openLead} /></div>
          </aside>
        </div>
      )}

      {newOpen && <NewLeadModal onClose={() => setNewOpen(false)} onCreate={create} />}
      {lead && <LeadDrawer key={lead.id} p={lead} focus={drawer.focus} onClose={() => setDrawer(null)} onMove={move} onLog={log} onNote={(id, nota) => patch(id, (p) => ({ ...p, nota }))} onDelete={remove} onQuote={(id) => { log(id, 'Cotización PDF generada'); setQuoteId(id); }} toast={toast} />}
      {quoteLead && <QuoteModal p={quoteLead} onClose={() => setQuoteId(null)} toast={toast} />}

      {confetti && Array.from({ length: 46 }).map((_, i) => (
        <span key={i} className="confetti" style={{ left: `${Math.random() * 100}%`, background: ['#F97316', '#10B981', '#1E293B', '#FBBF24', '#0EA5E9'][i % 5], animationDelay: `${Math.random() * 0.5}s`, borderRadius: i % 3 ? 2 : 9, transform: `rotate(${Math.random() * 90}deg)` }} />
      ))}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[95] space-y-2 w-[92%] max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="anim-up pointer-events-auto bg-deep text-white text-sm rounded-xl px-4 py-3 shadow-xl flex items-center gap-2.5 border border-white/10">
            <Icon n={t.kind === 'warn' ? 'AlertTriangle' : t.kind === 'info' ? 'Info' : 'CheckCircle2'} className={`w-4 h-4 shrink-0 ${t.kind === 'warn' ? 'text-amber-400' : t.kind === 'info' ? 'text-sky-400' : 'text-emerald-400'}`} />
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Card, Donut, Dashboard, AgentView, NAV, Sidebar, TopBar, WELCOME, VIEWS, App };
export default App;

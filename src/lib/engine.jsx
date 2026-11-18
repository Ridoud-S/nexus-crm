import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as LX from 'lucide-react';

const Icon = ({ n, className = 'w-4 h-4', ...p }) => {
  const C = LX[n];
  return C ? <C className={className} {...p} /> : <span className={className} />;
};

/* ───────────── Constantes ───────────── */
const STAGES = [
  { id: 'informes', name: 'Pidió Informes', dot: '#94A3B8', hint: 'Primer contacto' },
  { id: 'cotizacion', name: 'Cotización Enviada', dot: '#64748B', hint: 'Esperando respuesta' },
  { id: 'negociacion', name: 'En Negociación', dot: '#F97316', hint: 'A punto de decidir' },
  { id: 'cerrada', name: 'Venta Cerrada', dot: '#10B981', hint: '¡Dinero en caja!' },
];
const TEMPS = {
  caliente: { label: 'Caliente', emoji: '🔥', bg: '#FEF2F2', fg: '#DC2626', bd: '#FECACA' },
  tibio: { label: 'Tibio', emoji: '⚡', bg: '#FFFBEB', fg: '#D97706', bd: '#FDE68A' },
  frio: { label: 'Frío', emoji: '❄️', bg: '#F0F9FF', fg: '#0284C7', bd: '#BAE6FD' },
};
const META = 50000;
const LS_KEY = 'nexus-demo-v1';
const SUGGESTED = [
  { id: 'metrics', label: '📊 Analiza todas mis métricas actuales' },
  { id: 'hoy', label: '🔥 ¿A quién debo contactar hoy para cerrar ventas rápido?' },
  { id: 'fugas', label: '⚠️ Detecta fugas de dinero en mi embudo' },
  { id: 'proyec', label: '📈 Proyecta mis ingresos si cierro los prospectos calientes' },
];
const TONES = [
  { id: 'amable', label: 'Amable y cercano' },
  { id: 'urgencia', label: 'Urgencia / Cierre' },
  { id: 'recordatorio', label: 'Recordatorio de cotización' },
];

/* ───────────── Utilidades ───────────── */
const fmt = (n) => '$' + Math.round(n).toLocaleString('es-MX');
const money = (n) => fmt(n) + ' MXN';
const hrs = (ts) => (Date.now() - ts) / 36e5;
const ago = (h) =>
  h < 1 ? 'Hace minutos'
  : h < 24 ? `Hace ${Math.floor(h)} ${Math.floor(h) === 1 ? 'hora' : 'horas'}`
  : h < 48 ? 'Hace 1 día'
  : `Hace ${Math.floor(h / 24)} días`;
const agoTs = (ts) => ago(hrs(ts));
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const sum = (a) => a.reduce((s, p) => s + p.valor, 0);
const isOpen = (p) => p.etapa !== 'cerrada';
const stalled = (p) => isOpen(p) && hrs(p.lastTs) >= 48;
const stageIdx = (id) => STAGES.findIndex((s) => s.id === id);
const stageName = (id) => STAGES[stageIdx(id)].name;
const uid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const probOf = (p) => {
  if (p.etapa === 'cerrada') return 100;
  const base = { caliente: 68, tibio: 42, frio: 18 }[p.temp];
  const st = { informes: 0, cotizacion: 8, negociacion: 16 }[p.etapa];
  return clamp(base + st - (stalled(p) ? 8 : 0), 5, 95);
};

const saludo = (c) => {
  const parts = c.trim().split(/\s+/);
  if (parts.length > 1 && /\.$/.test(parts[0])) return parts[0] + ' ' + parts[parts.length - 1];
  return parts[0];
};

const nextAction = (p) => {
  const h = hrs(p.lastTs);
  if (p.etapa === 'cerrada') return 'Agenda el arranque con el cliente y pídele una reseña o un referido.';
  if (h >= 48) return `Escríbele hoy: lleva ${Math.floor(h / 24)} días sin respuesta y la venta se está enfriando.`;
  if (p.etapa === 'informes') return 'Envíale una cotización clara en las próximas horas.';
  if (p.etapa === 'cotizacion') return 'Pregunta si ya revisó la cotización y ofrece una llamada de 10 minutos.';
  return p.temp === 'caliente'
    ? 'Propón fecha de inicio y forma de pago para cerrar hoy.'
    : 'Resuelve su duda principal (precio o retorno) con un ejemplo real.';
};

function analyzeNote({ nota, servicio }) {
  const t = norm(nota || '');
  const cold = /(despues|proximo|mas adelante|sin prisa|solo cotiza|solo pregunta|el otro mes|trimestre|no tiene prisa|algun dia)/;
  const hot = /(urge|urgente|hoy|esta semana|cuanto antes|aprobo|presupuesto listo|listo para|manana|lo necesita|quiere arrancar|arrancar ya|ya decidio)/;
  const warm = /(duda|comparando|evaluando|cotizando|interesad|tal vez|pensando|precio|informes|opciones)/;
  const snippet = (nota || '').trim().slice(0, 70);
  if (!t.trim()) return { temp: 'tibio', resumen: `Prospecto nuevo para ${servicio}. Falta contexto: pregúntale qué necesita y para cuándo.` };
  if (cold.test(t) && !hot.test(t)) return { temp: 'frio', resumen: `Sin urgencia por ahora («${snippet}»). Déjalo en seguimiento ligero.` };
  if (hot.test(t)) return { temp: 'caliente', resumen: `Alta intención: «${snippet}». Respóndele hoy mismo y mándale cotización.` };
  if (warm.test(t)) return { temp: 'tibio', resumen: `Está evaluando opciones («${snippet}»). Aclara sus dudas y dale un siguiente paso.` };
  return { temp: 'tibio', resumen: `Interés moderado: «${snippet}». Confirma tiempos y presupuesto.` };
}

/* ───────────── Datos demo ───────────── */
function seed() {
  const n = Date.now();
  const H = (h) => n - h * 36e5;
  const L = (id, empresa, contacto, tel, servicio, valor, etapa, temp, resumen, h) => ({
    id, empresa, contacto, tel, servicio, valor, etapa, temp, resumen,
    lastTs: H(h), nota: '', createdTs: H(h + 120),
    historial: [
      { ts: H(h), txt: 'Último contacto con el cliente' },
      { ts: H(h + 120), txt: 'Prospecto agregado al embudo' },
    ],
  });
  return [
    L('p1', 'Clínica Dental Sonrisa', 'Dra. Mariana López', '5214611234567', 'Paquete Marketing Digital Mensual', 8500, 'negociacion', 'caliente', 'Urge arrancar campaña este lunes; ya aprobó presupuesto, solo falta enviar cotización formal.', 2),
    L('p2', 'Taller Automotriz El Rayo', 'Ing. Carlos Méndez', '5214619876543', 'Sistema de Inventario y Citas', 14000, 'cotizacion', 'caliente', 'Pidió descuentos por pago anual. Alta intención de compra si se le da seguimiento hoy.', 48),
    L('p3', 'Despacho Contable Martínez', 'C.P. Roberto Martínez', '5214615554433', 'Consultoría Fiscal y Nómina', 6200, 'informes', 'tibio', 'Preguntó por tiempos de implementación. Comparando con otro proveedor.', 5),
    L('p4', 'Gimnasio FitZone Celaya', 'Sofía Ramírez', '5214612223344', 'Rediseño Web + Pasarela de Pagos', 11500, 'cerrada', 'caliente', 'Anticipo del 50% confirmado. Cliente listo para onboarding.', 24),
    L('p5', 'Veterinaria Huellitas', 'Dr. Luis Hernández', '5214617778899', 'Gestión de Redes Sociales', 4800, 'informes', 'frio', 'Solo cotizando precios para el próximo trimestre. Sin urgencia inmediata.', 96),
    L('p6', 'Constructora Bajío Sur', 'Arq. Fernando Torres', '5214616661122', 'Licenciamiento Software ERP', 22000, 'cotizacion', 'caliente', 'Cotización abierta 3 veces. Decisión se toma mañana en junta directiva.', 24),
    L('p7', 'Estética & Spa Aura', 'Valeria Gómez', '5214613339900', 'Campaña WhatsApp Ads', 5500, 'negociacion', 'tibio', 'Interesada, pero tiene dudas sobre el retorno de inversión en el primer mes.', 72),
    L('p8', 'Cafetería Origen', 'Alejandro Ruiz', '5214614445566', 'Menú Digital y Punto de Venta', 7900, 'cerrada', 'caliente', 'Cerrado sin objeciones tras demostración rápida.', 48),
  ];
}
function loadState() {
  try {
    const r = localStorage.getItem(LS_KEY);
    if (r) { const d = JSON.parse(r); if (Array.isArray(d) && d.length) return d; }
  } catch (e) {}
  return seed();
}

/* ───────────── Motor del Agente IA (simulado) ───────────── */
const rankScore = (p) =>
  ({ caliente: 3, tibio: 2, frio: 1 }[p.temp]) * 10 + Math.min(hrs(p.lastTs) / 24, 4) * 5 + p.valor / 5000 + stageIdx(p.etapa) * 1.5;
const rank = (a) => [...a].sort((x, y) => rankScore(y) - rankScore(x));
const names = (a) => a.map((p) => `**${p.empresa}**`).join(', ');
const funnelData = (ps) =>
  STAGES.map((s, i) => ({ name: s.name, count: ps.filter((p) => stageIdx(p.etapa) >= i).length }));

function stats(ps) {
  const o = ps.filter(isOpen);
  const won = ps.filter((p) => !isOpen(p));
  return {
    o, won,
    hot: o.filter((p) => p.temp === 'caliente'),
    warm: o.filter((p) => p.temp === 'tibio'),
    cold: o.filter((p) => p.temp === 'frio'),
    st: o.filter(stalled),
    pipeline: sum(o), wonSum: sum(won),
    weighted: o.reduce((s, p) => s + (p.valor * probOf(p)) / 100, 0),
  };
}
function healthScore(ps) {
  const S = stats(ps);
  if (!S.o.length) return 90;
  let s = 100 - S.st.length * 9;
  if (!S.hot.length) s -= 12;
  if (S.cold.length / S.o.length > 0.4) s -= 10;
  const f = funnelData(ps);
  if (f[0].count && f[3].count / f[0].count < 0.2) s -= 8;
  return clamp(Math.round(s), 20, 99);
}

function detect(text) {
  const t = norm(text);
  if (/proyec|ingres|ganar|pronostic|dinero|vender|ventas del mes|cuanto/.test(t)) return 'proyec';
  if (/fuga|riesgo|pierd|perdi|estanc|olvid|atrasad/.test(t)) return 'fugas';
  if (/contactar|llamar|hoy|prioridad|a quien|urgente/.test(t)) return 'hoy';
  if (/frio/.test(t)) return 'frios';
  if (/caliente/.test(t)) return 'calientes';
  if (/cotiz/.test(t)) return 'cotiz';
  if (/metric|analiza|rendimiento|resumen|como voy|estado|embudo/.test(t)) return 'metrics';
  if (/cliente|prospecto/.test(t)) return 'clientes';
  if (/ayuda|consejo|que hago|recomienda|estrategia|como/.test(t)) return 'ayuda';
  return 'general';
}

function answer(intent, ps) {
  const S = stats(ps);
  const B = [];
  const p = (text) => B.push({ t: 'p', text });
  const ul = (items) => B.push({ t: 'ul', items: items.filter(Boolean) });
  const leads = (arr, why) => B.push({ t: 'leads', items: arr.map((x) => ({ id: x.id, why: why(x) })) });
  const pct = (v) => Math.round((v / META) * 100);
  const why = (x) => `${TEMPS[x.temp].emoji} ${nextAction(x)}`;

  if (!ps.length) { p('Tu tablero está vacío. Agrega tu primer prospecto con **+ Nuevo Prospecto** y empiezo a analizarlo.'); return B; }

  switch (intent) {
    case 'metrics': {
      const share = S.pipeline ? Math.round((sum(S.hot) / S.pipeline) * 100) : 0;
      p(`Revisé tus **${ps.length} prospectos**. Este es tu diagnóstico de hoy:`);
      ul([
        `Dinero en juego: **${money(S.pipeline)}** repartido en ${S.o.length} prospectos abiertos.`,
        `Ventas cerradas: **${money(S.wonSum)}** — llevas **${pct(S.wonSum)}%** de tu meta de ${money(META)}.`,
        `${S.hot.length} prospecto(s) caliente(s) suman **${money(sum(S.hot))}** (${share}% de tu dinero en juego).`,
        S.st.length ? `⚠️ ${S.st.length} prospecto(s) llevan más de 2 días sin contacto: ${names(S.st)}.` : '✅ No tienes prospectos desatendidos. ¡Buen ritmo!',
        `Si mantienes el ritmo, la probabilidad ponderada de cierre es de **${money(S.weighted)}**.`,
      ]);
      B.push({ t: 'funnel', data: funnelData(ps) });
      if (S.o.length) { const top = rank(S.o)[0]; p(`Mi recomendación: empieza por **${top.empresa}** (${money(top.valor)}). ${nextAction(top)}`); }
      break;
    }
    case 'hoy': {
      const r = rank(S.o).slice(0, 3);
      if (!r.length) { p('Todo tu embudo está cerrado 🎉. Agrega nuevos prospectos para seguir creciendo.'); break; }
      p(`Estos ${r.length} contactos tienen la mejor combinación de **intención de compra, monto y urgencia** hoy:`);
      leads(r, why);
      p(`Si los atiendes hoy, pones en movimiento **${money(sum(r))}**. Arranca por **${r[0].empresa}**.`);
      break;
    }
    case 'fugas': {
      const quotes = S.o.filter((x) => x.etapa === 'cotizacion' && hrs(x.lastTs) >= 24);
      const risk = [...new Map([...S.st, ...quotes].map((x) => [x.id, x])).values()];
      const top = [...S.o].sort((a, b) => b.valor - a.valor)[0];
      const conc = top && S.pipeline ? Math.round((top.valor / S.pipeline) * 100) : 0;
      p(`Encontré **${money(sum(risk))}** con riesgo de enfriarse. Esto es lo que detecto:`);
      ul([
        S.st.length ? `**Seguimiento atrasado:** ${names(S.st)} (${money(sum(S.st))}). Cada día sin respuesta baja la probabilidad de cierre.` : null,
        quotes.length ? `**Cotizaciones sin movimiento:** ${names(quotes)}. Una cotización sin seguimiento en 48 h suele enfriarse.` : null,
        S.cold.length ? `**Tiempo en prospectos fríos:** ${names(S.cold)} suman ${money(sum(S.cold))}. Mejor automatiza un recordatorio mensual.` : null,
        conc > 35 ? `**Dependencia de un solo cliente:** ${top.empresa} concentra el ${conc}% de tu dinero en juego.` : null,
      ]);
      if (risk.length) { leads(risk, why); } else p('Por ahora no veo fugas importantes. Sigue atendiendo a tus calientes. ✅');
      break;
    }
    case 'proyec': {
      const hotSum = sum(S.hot);
      B.push({
        t: 'scenarios',
        data: [
          { label: 'Ya cerrado', v: S.wonSum },
          { label: 'Realista', v: S.wonSum + S.weighted },
          { label: 'Si cierras calientes', v: S.wonSum + hotSum },
          { label: 'Si cierras todo', v: S.wonSum + S.pipeline },
        ],
      });
      if (S.hot.length) p(`Si cierras tus ${S.hot.length} prospecto(s) caliente(s) (${names(S.hot)}) sumarías **${money(hotSum)}** y llegarías a **${money(S.wonSum + hotSum)}**: ${pct(S.wonSum + hotSum)}% de tu meta mensual.`);
      else p('No tienes prospectos calientes abiertos. Esfuérzate en reactivar a los tibios con una oferta con fecha límite.');
      const gap = META - (S.wonSum + hotSum);
      ul([
        gap > 0 ? `Aun cerrando a los calientes te faltarían **${money(gap)}** para tu meta; apóyate en tus tibios.` : `Con los calientes superarías tu meta por **${money(-gap)}** 🎉.`,
        `Escenario realista (ponderado por probabilidad): **${money(S.wonSum + S.weighted)}**.`,
      ]);
      break;
    }
    case 'frios': {
      if (!S.cold.length) { p('No tienes prospectos fríos abiertos. Tu embudo está bien calificado ✅'); break; }
      p(`Tienes **${S.cold.length} prospecto(s) frío(s)** por ${money(sum(S.cold))}. No les dediques tiempo diario:`);
      ul(['Mándales un mensaje breve una vez al mes con un caso de éxito.', 'Avísales de promociones con fecha límite para detonar urgencia.', 'Si no responden en 3 intentos, archívalos y enfócate en tus calientes.']);
      leads(S.cold, () => '❄️ Seguimiento ligero: un mensaje mensual es suficiente.');
      break;
    }
    case 'calientes': {
      if (!S.hot.length) { p('Ahora mismo no tienes prospectos calientes abiertos. Vale la pena reactivar a tus tibios.'); break; }
      p(`Tienes **${S.hot.length} prospecto(s) caliente(s)** por **${money(sum(S.hot))}**. Son los más cercanos a cerrar:`);
      leads(rank(S.hot), why);
      break;
    }
    case 'cotiz': {
      const q = S.o.filter((x) => x.etapa === 'cotizacion');
      if (!q.length) { p('No tienes cotizaciones abiertas. Genera una desde la ficha del prospecto con **Generar Cotización PDF**.'); break; }
      p(`Hay **${q.length} cotización(es) abierta(s)** por **${money(sum(q))}**. Consejo: da seguimiento dentro de las primeras 48 h.`);
      leads(q, why);
      break;
    }
    case 'clientes': {
      p('Así se reparten tus prospectos en el embudo ahora mismo:');
      ul(STAGES.map((s) => { const a = ps.filter((x) => x.etapa === s.id); return `**${s.name}:** ${a.length} (${money(sum(a))})`; }));
      B.push({ t: 'funnel', data: funnelData(ps) });
      break;
    }
    case 'ayuda': {
      p('Estas son mis 3 recomendaciones prioritarias con tus datos de hoy:');
      const top = rank(S.o)[0];
      ul([
        top ? `**1. Cierra primero a ${top.empresa}** (${money(top.valor)}). ${nextAction(top)}` : null,
        S.st.length ? `**2. Rescata a ${S.st.length} prospecto(s) desatendido(s):** ${names(S.st)}.` : '**2. Mantén tu ritmo:** no tienes seguimientos atrasados.',
        S.cold.length ? `**3. Automatiza a tus fríos** (${names(S.cold)}) con un recordatorio mensual.` : '**3. Alimenta tu embudo:** agrega nuevos prospectos esta semana.',
      ]);
      break;
    }
    default: {
      p('Puedo ayudarte con tus **métricas, ingresos, clientes, calientes, fríos o cotizaciones**. Mientras tanto, esto es lo más importante hoy:');
      B.push({ t: 'kpis', data: S });
      if (S.o.length) p(`Prioridad: **${rank(S.o)[0].empresa}**. ${nextAction(rank(S.o)[0])}`);
    }
  }
  return B;
}

/* ───────────── Mensajes de WhatsApp y cotización ───────────── */
function makeMsg(p, tone) {
  const s = saludo(p.contacto);
  if (tone === 'urgencia')
    return `Hola ${s}, te escribo para avanzar con ${p.servicio} (${money(p.valor)}). Tengo espacio disponible para arrancar esta semana, pero lo estoy asignando hoy. ¿Lo confirmamos para dejarte agendado? 🚀`;
  if (tone === 'recordatorio')
    return `Hola ${s}, te recuerdo la cotización de ${p.servicio} para ${p.empresa} por ${money(p.valor)} (+ IVA). Sigue vigente y con gusto resuelvo cualquier duda. ¿Ya tuviste oportunidad de revisarla?`;
  return `Hola ${s}, ¡qué gusto saludarte! 😊 Te escribo para saber cómo vas con lo de "${p.servicio}" para ${p.empresa}. La propuesta está en ${money(p.valor)} y con gusto aclaro cualquier duda. ¿Platicamos un momento?`;
}
const defaultTone = (p) =>
  p.etapa === 'cotizacion' ? 'recordatorio' : p.etapa === 'negociacion' && p.temp === 'caliente' ? 'urgencia' : 'amable';

export { Icon, STAGES, TEMPS, META, LS_KEY, SUGGESTED, TONES, fmt, money, hrs, ago, agoTs, norm, sum, isOpen, stalled, stageIdx, stageName, uid, clamp, probOf, saludo, nextAction, analyzeNote, seed, loadState, rankScore, rank, names, funnelData, stats, healthScore, detect, answer, makeMsg, defaultTone };

import { addDays } from './utils'

export type Stage = 'nuevo' | 'contactado' | 'propuesta' | 'ganado'
export type Lead = {
  id: string; name: string; company: string; email: string; phone: string;
  value: number; stage: Stage; initials: string; tone: string;
  note: string; date: string;
}
export type Reminder = {
  id: string; title: string; leadId: string; due: string;
  priority: 'alta' | 'media' | 'baja'; done: boolean;
}
export type DemoData = { leads: Lead[]; reminders: Reminder[] }
export const stages: { id: Stage; label: string; description:string; dot: string; badge:string }[] = [
  {id:'nuevo', label:'Nuevo', description:'Por contactar', dot:'#7C92AA', badge:'bg-slate-100 text-slate-600'},
  {id:'contactado',label:'En contacto',description:'Conversación iniciada',dot:'#4985B6',badge:'bg-blue-50 text-blue-700'},
  {id:'propuesta',label:'Propuesta',description:'Esperando respuesta',dot:'#F37324',badge:'bg-orange-50 text-orange-700'},
  {id:'ganado',label:'Ganado',description:'Oportunidad cerrada',dot:'#2E9A71',badge:'bg-emerald-50 text-emerald-700'},
]
export const demoData = (): DemoData => ({
  leads: [
    {id:'l1', name:'Mariana Torres', company:'Clínica Vitalis', email:'mariana@vitalis.demo', phone:'461 555 0123', value:4800,stage:'nuevo',initials:'MT',tone:'bg-sky-100 text-sky-700',note:'Quiere organizar los seguimientos de nuevos pacientes.',date:addDays(-1)},
    {id:'l2', name:'Ricardo Flores', company:'Estudio Creativo F', email:'ricardo@creativof.demo',phone:'461 555 0189',value:2600,stage:'nuevo',initials:'RF',tone:'bg-violet-100 text-violet-700',note:'Preguntó por acceso desde el celular.',date:addDays(-2)},
    {id:'l3', name:'Valeria Soto', company:'Consultoría Ágil',email:'valeria@agil.demo',phone:'442 555 0102',value:7800,stage:'contactado',initials:'VS',tone:'bg-rose-100 text-rose-700',note:'Se agendó llamada para mostrar el tablero de ventas.',date:addDays(-3)},
    {id:'l4', name:'José Ramírez', company:'Dental Nova',email:'jose@dentalnova.demo',phone:'461 555 0119',value:3800,stage:'contactado',initials:'JR',tone:'bg-teal-100 text-teal-700',note:'Necesita administrar solicitudes de citas.',date:addDays(-4)},
    {id:'l5', name:'Fernanda López', company:'Agencia Enlace',email:'fernanda@enlace.demo',phone:'462 555 0112',value:6200,stage:'contactado',initials:'FL',tone:'bg-amber-100 text-amber-700',note:'Solicita una prueba antes de decidir.',date:addDays(-1)},
    {id:'l6', name:'Carlos Méndez', company:'Méndez Arquitectos',email:'carlos@mendez.demo',phone:'461 555 0156',value:7800,stage:'propuesta',initials:'CM',tone:'bg-indigo-100 text-indigo-700',note:'Se envió propuesta comercial. Dar seguimiento mañana.',date:addDays(-5)},
    {id:'l7', name:'Ana Beltrán', company:'Centro Balance',email:'ana@balance.demo',phone:'461 555 0176',value:4500,stage:'propuesta',initials:'AB',tone:'bg-fuchsia-100 text-fuchsia-700',note:'Interesada en el Plan Crecimiento.',date:addDays(-2)},
    {id:'l8', name:'Hugo Navarro', company:'Fotografía Norte',email:'hugo@norte.demo',phone:'461 555 0132',value:3800,stage:'ganado',initials:'HN',tone:'bg-lime-100 text-lime-700',note:'Se concretó la suscripción inicial.',date:addDays(-8)},
    {id:'l9', name:'Lucía Campos', company:'Despacho LC',email:'lucia@lc.demo',phone:'461 555 0110',value:7600,stage:'ganado',initials:'LC',tone:'bg-cyan-100 text-cyan-700',note:'Cierre confirmado para el equipo de dos personas.',date:addDays(-7)},
  ],
  reminders: [
    {id:'r1',title:'Llamar para confirmar interés',leadId:'l3',due:addDays(0),priority:'alta',done:false},
    {id:'r2',title:'Enviar demostración de NEXUS',leadId:'l4',due:addDays(0),priority:'media',done:false},
    {id:'r3',title:'Dar seguimiento a la propuesta',leadId:'l6',due:addDays(1),priority:'alta',done:false},
    {id:'r4',title:'Resolver dudas sobre el plan',leadId:'l7',due:addDays(2),priority:'media',done:false},
    {id:'r5',title:'Enviar material de bienvenida',leadId:'l8',due:addDays(-1),priority:'baja',done:true},
  ],
})

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export const money = (amount: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount)
export const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
export const addDays = (amount: number) => { const date = new Date(); date.setHours(12, 0, 0, 0); date.setDate(date.getDate() + amount); return localDate(date) }
export const friendlyDate = (value: string) => {
  if (value === addDays(0)) return 'Hoy'
  if (value === addDays(1)) return 'Mañana'
  if (value === addDays(-1)) return 'Ayer'
  return new Date(`${value}T12:00:00`).toLocaleDateString('es-MX', { day:'numeric', month:'short' })
}

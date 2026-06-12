import type { EstadoRecordatorio } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function getRecordatorioLabel(estado: EstadoRecordatorio, dias: number): string {
  if (estado === 'rojo') {
    return dias === 0 ? 'Cobro hoy' : dias < 0 ? `Vencido (${Math.abs(dias)} días)` : 'Cobro hoy';
  }
  if (estado === 'amarillo') {
    return `En ${dias} días`;
  }
  return `En ${dias} días`;
}

export function getRecordatorioClass(estado: EstadoRecordatorio): string {
  return `recordatorio recordatorio--${estado}`;
}

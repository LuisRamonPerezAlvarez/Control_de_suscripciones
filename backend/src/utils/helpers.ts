import { Frecuencia } from '../types';

export function costoMensual(costo: number, frecuencia: Frecuencia): number {
  switch (frecuencia) {
    case 'semanal':
      return costo * 4.33;
    case 'mensual':
      return costo;
    case 'trimestral':
      return costo / 3;
    case 'semestral':
      return costo / 6;
    case 'anual':
      return costo / 12;
    default:
      return costo;
  }
}

export function diasHastaCobro(fechaProximoCobro: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const cobro = new Date(fechaProximoCobro + 'T00:00:00');
  const diffMs = cobro.getTime() - hoy.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function estadoRecordatorio(fechaProximoCobro: string): 'rojo' | 'amarillo' | 'verde' {
  const dias = diasHastaCobro(fechaProximoCobro);
  if (dias <= 0) return 'rojo';
  if (dias <= 7) return 'amarillo';
  return 'verde';
}

export function mapSuscripcionRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    servicio_id: row.servicio_id !== null ? Number(row.servicio_id) : null,
    nombre_personalizado: String(row.nombre_personalizado),
    costo: Number(row.costo),
    frecuencia: row.frecuencia as Frecuencia,
    fecha_inicio: String(row.fecha_inicio).slice(0, 10),
    fecha_proximo_cobro: String(row.fecha_proximo_cobro).slice(0, 10),
    activa: Boolean(row.activa),
    servicio_nombre: row.servicio_nombre ? String(row.servicio_nombre) : null,
    categoria_nombre: row.categoria_nombre ? String(row.categoria_nombre) : null,
  };
}

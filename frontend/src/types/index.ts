export type Frecuencia = 'semanal' | 'mensual' | 'trimestral' | 'semestral' | 'anual';

export type EstadoRecordatorio = 'rojo' | 'amarillo' | 'verde';

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Servicio {
  id: number;
  nombre: string;
  categoria_id: number;
  sitio_web: string | null;
  logo: string | null;
  categoria_nombre?: string;
}

export interface Suscripcion {
  id: number;
  servicio_id: number | null;
  nombre_personalizado: string;
  costo: number;
  frecuencia: Frecuencia;
  fecha_inicio: string;
  fecha_proximo_cobro: string;
  activa: boolean;
  servicio_nombre?: string | null;
  categoria_nombre?: string | null;
  dias_restantes?: number;
  estado_recordatorio?: EstadoRecordatorio;
}

export interface SuscripcionInput {
  servicio_id?: number | null;
  nombre_personalizado: string;
  costo: number;
  frecuencia: Frecuencia;
  fecha_inicio: string;
  fecha_proximo_cobro: string;
  activa?: boolean;
}

export interface DashboardResumen {
  total_activas: number;
  gasto_mensual_total: number;
  gasto_anual_estimado: number;
  proximas_a_vencer: number;
}

export interface ProximoCobro {
  id: number;
  nombre: string;
  costo: number;
  frecuencia: Frecuencia;
  fecha_proximo_cobro: string;
  dias_restantes: number;
  estado_recordatorio: EstadoRecordatorio;
}

export const FRECUENCIAS: Frecuencia[] = [
  'semanal',
  'mensual',
  'trimestral',
  'semestral',
  'anual',
];

export const FRECUENCIA_LABELS: Record<Frecuencia, string> = {
  semanal: 'Semanal',
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
};

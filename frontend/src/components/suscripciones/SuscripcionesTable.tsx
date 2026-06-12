import type { Suscripcion } from '../../types';
import { FRECUENCIA_LABELS } from '../../types';
import {
  formatCurrency,
  formatDate,
  getRecordatorioClass,
  getRecordatorioLabel,
} from '../../utils/format';

interface Props {
  suscripciones: Suscripcion[];
  onEdit: (suscripcion: Suscripcion) => void;
  onDelete: (id: number) => void;
  onActivar: (id: number) => void;
  onDesactivar: (id: number) => void;
}

export default function SuscripcionesTable({
  suscripciones,
  onEdit,
  onDelete,
  onActivar,
  onDesactivar,
}: Props) {
  if (suscripciones.length === 0) {
    return <p className="empty-message">No hay suscripciones registradas.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Nombre</th>
            <th>Costo</th>
            <th>Frecuencia</th>
            <th>Próximo cobro</th>
            <th>Recordatorio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {suscripciones.map((s) => (
            <tr key={s.id} className={!s.activa ? 'table__row--inactive' : ''}>
              <td>
                {s.servicio_nombre ? (
                  <span>{s.servicio_nombre}</span>
                ) : (
                  <span className="badge badge--custom">Personalizado</span>
                )}
              </td>
              <td>{s.nombre_personalizado}</td>
              <td>{formatCurrency(s.costo)}</td>
              <td>{FRECUENCIA_LABELS[s.frecuencia]}</td>
              <td>{formatDate(s.fecha_proximo_cobro)}</td>
              <td>
                {s.estado_recordatorio && s.dias_restantes !== undefined && s.activa ? (
                  <span className={getRecordatorioClass(s.estado_recordatorio)}>
                    {getRecordatorioLabel(s.estado_recordatorio, s.dias_restantes)}
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td>
                <span className={`badge ${s.activa ? 'badge--active' : 'badge--inactive'}`}>
                  {s.activa ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td>
                <div className="table__actions">
                  <button
                    type="button"
                    className="btn btn--sm btn--secondary"
                    onClick={() => onEdit(s)}
                  >
                    Editar
                  </button>
                  {s.activa ? (
                    <button
                      type="button"
                      className="btn btn--sm btn--warning"
                      onClick={() => onDesactivar(s.id)}
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--sm btn--success"
                      onClick={() => onActivar(s.id)}
                    >
                      Activar
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn--sm btn--danger"
                    onClick={() => onDelete(s.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

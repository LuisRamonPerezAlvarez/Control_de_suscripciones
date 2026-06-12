import { formatCurrency, formatDate, getRecordatorioClass, getRecordatorioLabel } from '../../utils/format';
import type { ProximoCobro } from '../../types';
import { FRECUENCIA_LABELS } from '../../types';

interface Props {
  cobros: ProximoCobro[];
}

export default function ProximosCobrosList({ cobros }: Props) {
  if (cobros.length === 0) {
    return <p className="empty-message">No hay cobros próximos programados.</p>;
  }

  return (
    <ul className="cobros-list">
      {cobros.map((cobro) => (
        <li key={cobro.id} className="cobros-list__item">
          <div className="cobros-list__info">
            <strong>{cobro.nombre}</strong>
            <span className="cobros-list__meta">
              {formatDate(cobro.fecha_proximo_cobro)} · {FRECUENCIA_LABELS[cobro.frecuencia]}
            </span>
          </div>
          <div className="cobros-list__right">
            <span className="cobros-list__costo">{formatCurrency(cobro.costo)}</span>
            <span className={getRecordatorioClass(cobro.estado_recordatorio)}>
              {getRecordatorioLabel(cobro.estado_recordatorio, cobro.dias_restantes)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

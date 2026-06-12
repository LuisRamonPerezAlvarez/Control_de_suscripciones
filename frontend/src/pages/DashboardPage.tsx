import { api } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import { formatCurrency } from '../utils/format';
import ProximosCobrosList from '../components/dashboard/ProximosCobrosList';

export default function DashboardPage() {
  const { data: resumen, loading: loadingResumen, error: errorResumen } = useAsync(
    () => api.dashboard.getResumen(),
    []
  );

  const { data: proximosCobros, loading: loadingCobros, error: errorCobros } = useAsync(
    () => api.dashboard.getProximosCobros(),
    []
  );

  if (loadingResumen || loadingCobros) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  if (errorResumen || errorCobros) {
    return (
      <div className="error-message">
        {errorResumen || errorCobros}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <section className="cards-grid">
        <article className="card card--primary">
          <h3 className="card__label">Suscripciones activas</h3>
          <p className="card__value">{resumen?.total_activas ?? 0}</p>
        </article>
        <article className="card card--success">
          <h3 className="card__label">Gasto mensual total</h3>
          <p className="card__value">{formatCurrency(resumen?.gasto_mensual_total ?? 0)}</p>
        </article>
        <article className="card card--info">
          <h3 className="card__label">Gasto anual estimado</h3>
          <p className="card__value">{formatCurrency(resumen?.gasto_anual_estimado ?? 0)}</p>
        </article>
        <article className="card card--warning">
          <h3 className="card__label">Próximas a vencer (7 días)</h3>
          <p className="card__value">{resumen?.proximas_a_vencer ?? 0}</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h3>Próximos cobros</h3>
          <div className="leyenda">
            <span className="recordatorio recordatorio--rojo">Hoy / Vencido</span>
            <span className="recordatorio recordatorio--amarillo">≤ 7 días</span>
            <span className="recordatorio recordatorio--verde">&gt; 7 días</span>
          </div>
        </div>
        <ProximosCobrosList cobros={proximosCobros ?? []} />
      </section>
    </div>
  );
}

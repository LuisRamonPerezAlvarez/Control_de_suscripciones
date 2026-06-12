import { useState } from 'react';
import { api } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import type { Servicio } from '../types';

export default function ServiciosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');

  const { data: categorias } = useAsync(() => api.categorias.getAll(), []);

  const { data: servicios, loading, error } = useAsync(
    () =>
      api.servicios.getAll({
        busqueda: busqueda || undefined,
        categoria_id: categoriaId !== '' ? categoriaId : undefined,
      }),
    [busqueda, categoriaId]
  );

  return (
    <div className="page">
      <div className="page__header">
        <h3>Catálogo de servicios</h3>
      </div>

      <section className="panel">
        <div className="filters">
          <div className="form__group">
            <label htmlFor="busqueda" className="form__label">Buscar por nombre</label>
            <input
              id="busqueda"
              type="text"
              className="form__input"
              placeholder="Ej: Netflix, Spotify..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="form__group">
            <label htmlFor="categoria" className="form__label">Filtrar por categoría</label>
            <select
              id="categoria"
              className="form__input"
              value={categoriaId}
              onChange={(e) =>
                setCategoriaId(e.target.value === '' ? '' : Number(e.target.value))
              }
            >
              <option value="">Todas las categorías</option>
              {categorias?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="panel">
        {loading && <div className="loading">Cargando servicios...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <>
            {servicios && servicios.length > 0 ? (
              <div className="servicios-grid">
                {servicios.map((servicio: Servicio) => (
                  <article key={servicio.id} className="servicio-card">
                    <div className="servicio-card__header">
                      <div className="servicio-card__icon">
                        {servicio.logo ? (
                          <img src={servicio.logo} alt={servicio.nombre} />
                        ) : (
                          <span>{servicio.nombre.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="servicio-card__title">{servicio.nombre}</h4>
                        <span className="badge badge--category">
                          {servicio.categoria_nombre}
                        </span>
                      </div>
                    </div>
                    {servicio.sitio_web && (
                      <a
                        href={servicio.sitio_web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="servicio-card__link"
                      >
                        Visitar sitio web →
                      </a>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-message">No se encontraron servicios.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

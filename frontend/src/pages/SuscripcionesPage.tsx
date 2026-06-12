import { useState } from 'react';
import { api } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import SuscripcionesTable from '../components/suscripciones/SuscripcionesTable';
import SuscripcionForm from '../components/suscripciones/SuscripcionForm';
import type { Suscripcion, SuscripcionInput } from '../types';

export default function SuscripcionesPage() {
  const { data: suscripciones, loading, error, reload } = useAsync(
    () => api.suscripciones.getAll(),
    []
  );
  const { data: servicios } = useAsync(() => api.servicios.getAll(), []);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Suscripcion | null>(null);

  const handleCreate = async (data: SuscripcionInput) => {
    await api.suscripciones.create(data);
    setShowForm(false);
    reload();
  };

  const handleUpdate = async (data: SuscripcionInput) => {
    if (!editing) return;
    await api.suscripciones.update(editing.id, data);
    setEditing(null);
    reload();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta suscripción?')) return;
    await api.suscripciones.delete(id);
    reload();
  };

  const handleActivar = async (id: number) => {
    await api.suscripciones.activar(id);
    reload();
  };

  const handleDesactivar = async (id: number) => {
    await api.suscripciones.desactivar(id);
    reload();
  };

  if (loading) return <div className="loading">Cargando suscripciones...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page">
      <div className="page__header">
        <h3>Gestión de suscripciones</h3>
        {!showForm && !editing && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setShowForm(true)}
          >
            + Nueva suscripción
          </button>
        )}
      </div>

      {showForm && (
        <section className="panel">
          <h4>Nueva suscripción</h4>
          <SuscripcionForm
            servicios={servicios ?? []}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            submitLabel="Crear suscripción"
          />
        </section>
      )}

      {editing && (
        <section className="panel">
          <h4>Editar suscripción</h4>
          <SuscripcionForm
            initialData={{
              servicio_id: editing.servicio_id,
              nombre_personalizado: editing.nombre_personalizado,
              costo: editing.costo,
              frecuencia: editing.frecuencia,
              fecha_inicio: editing.fecha_inicio,
              fecha_proximo_cobro: editing.fecha_proximo_cobro,
              activa: editing.activa,
            }}
            servicios={servicios ?? []}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            submitLabel="Guardar cambios"
          />
        </section>
      )}

      <section className="panel">
        <SuscripcionesTable
          suscripciones={suscripciones ?? []}
          onEdit={setEditing}
          onDelete={handleDelete}
          onActivar={handleActivar}
          onDesactivar={handleDesactivar}
        />
      </section>
    </div>
  );
}

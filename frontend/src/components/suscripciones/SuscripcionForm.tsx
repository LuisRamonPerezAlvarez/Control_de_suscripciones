import { useEffect, useState } from 'react';
import type { Servicio, SuscripcionInput, Frecuencia } from '../../types';
import { FRECUENCIAS, FRECUENCIA_LABELS } from '../../types';

interface Props {
  initialData?: Partial<SuscripcionInput>;
  servicios: Servicio[];
  onSubmit: (data: SuscripcionInput) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const emptyForm: SuscripcionInput = {
  servicio_id: null,
  nombre_personalizado: '',
  costo: 0,
  frecuencia: 'mensual',
  fecha_inicio: new Date().toISOString().slice(0, 10),
  fecha_proximo_cobro: new Date().toISOString().slice(0, 10),
  activa: true,
};

export default function SuscripcionForm({
  initialData,
  servicios,
  onSubmit,
  onCancel,
  submitLabel,
}: Props) {
  const [form, setForm] = useState<SuscripcionInput>({ ...emptyForm, ...initialData });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [esPersonalizado, setEsPersonalizado] = useState(
    initialData?.servicio_id === null || initialData?.servicio_id === undefined
  );

  useEffect(() => {
    if (initialData) {
      setForm({ ...emptyForm, ...initialData });
      setEsPersonalizado(initialData.servicio_id === null || initialData.servicio_id === undefined);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    if (name === 'costo') {
      setForm((prev) => ({ ...prev, costo: parseFloat(value) || 0 }));
      return;
    }
    if (name === 'servicio_id') {
      const servicioId = value === '' ? null : Number(value);
      setForm((prev) => ({ ...prev, servicio_id: servicioId }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoChange = (personalizado: boolean) => {
    setEsPersonalizado(personalizado);
    if (personalizado) {
      setForm((prev) => ({ ...prev, servicio_id: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}

      <div className="form__group">
        <label className="form__label">Tipo de suscripción</label>
        <div className="form__radio-group">
          <label>
            <input
              type="radio"
              checked={!esPersonalizado}
              onChange={() => handleTipoChange(false)}
            />
            Servicio del catálogo
          </label>
          <label>
            <input
              type="radio"
              checked={esPersonalizado}
              onChange={() => handleTipoChange(true)}
            />
            Servicio personalizado
          </label>
        </div>
      </div>

      {!esPersonalizado && (
        <div className="form__group">
          <label htmlFor="servicio_id" className="form__label">Servicio</label>
          <select
            id="servicio_id"
            name="servicio_id"
            className="form__input"
            value={form.servicio_id ?? ''}
            onChange={handleChange}
            required={!esPersonalizado}
          >
            <option value="">Seleccionar servicio...</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} ({s.categoria_nombre})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form__group">
        <label htmlFor="nombre_personalizado" className="form__label">
          Nombre personalizado
        </label>
        <input
          id="nombre_personalizado"
          name="nombre_personalizado"
          type="text"
          className="form__input"
          value={form.nombre_personalizado}
          onChange={handleChange}
          required
          placeholder={esPersonalizado ? 'Ej: Gimnasio Local' : 'Ej: Plan Familiar'}
        />
      </div>

      <div className="form__row">
        <div className="form__group">
          <label htmlFor="costo" className="form__label">Costo</label>
          <input
            id="costo"
            name="costo"
            type="number"
            step="0.01"
            min="0"
            className="form__input"
            value={form.costo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form__group">
          <label htmlFor="frecuencia" className="form__label">Frecuencia</label>
          <select
            id="frecuencia"
            name="frecuencia"
            className="form__input"
            value={form.frecuencia}
            onChange={handleChange}
            required
          >
            {FRECUENCIAS.map((f) => (
              <option key={f} value={f}>
                {FRECUENCIA_LABELS[f as Frecuencia]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form__row">
        <div className="form__group">
          <label htmlFor="fecha_inicio" className="form__label">Fecha inicio</label>
          <input
            id="fecha_inicio"
            name="fecha_inicio"
            type="date"
            className="form__input"
            value={form.fecha_inicio}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form__group">
          <label htmlFor="fecha_proximo_cobro" className="form__label">
            Próximo cobro
          </label>
          <input
            id="fecha_proximo_cobro"
            name="fecha_proximo_cobro"
            type="date"
            className="form__input"
            value={form.fecha_proximo_cobro}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form__group">
        <label className="form__checkbox">
          <input
            type="checkbox"
            name="activa"
            checked={form.activa ?? true}
            onChange={handleChange}
          />
          Suscripción activa
        </label>
      </div>

      <div className="form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

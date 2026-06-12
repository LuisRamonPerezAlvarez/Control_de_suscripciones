import { Response } from 'express';
import mysql from 'mysql2/promise';
import pool from '../config/database';
import { mapSuscripcionRow, estadoRecordatorio, diasHastaCobro } from '../utils/helpers';
import { SuscripcionInput, Frecuencia } from '../types';
import { AuthRequest } from '../middleware/auth.middleware';

const SELECT_BASE = `
  SELECT s.id, s.servicio_id, s.nombre_personalizado, s.costo, s.frecuencia,
         s.fecha_inicio, s.fecha_proximo_cobro, s.activa,
         sv.nombre AS servicio_nombre, c.nombre AS categoria_nombre
  FROM suscripciones s
  LEFT JOIN servicios sv ON s.servicio_id = sv.id
  LEFT JOIN categorias c ON sv.categoria_id = c.id
`;

function validateInput(body: SuscripcionInput): string | null {
  if (!body.nombre_personalizado?.trim()) return 'El nombre personalizado es obligatorio';
  if (body.costo === undefined || body.costo === null || Number(body.costo) < 0) {
    return 'El costo debe ser un número válido';
  }
  const frecuencias: Frecuencia[] = ['semanal', 'mensual', 'trimestral', 'semestral', 'anual'];
  if (!frecuencias.includes(body.frecuencia)) return 'Frecuencia inválida';
  if (!body.fecha_inicio) return 'La fecha de inicio es obligatoria';
  if (!body.fecha_proximo_cobro) return 'La fecha de próximo cobro es obligatoria';
  return null;
}

export async function getSuscripciones(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      `${SELECT_BASE} WHERE s.user_id = ? ORDER BY s.fecha_proximo_cobro ASC`,
      [req.user?.id]
    );

    const suscripciones = rows.map((row) => {
      const mapped = mapSuscripcionRow(row);
      const fecha = mapped.fecha_proximo_cobro;
      return {
        ...mapped,
        dias_restantes: diasHastaCobro(fecha),
        estado_recordatorio: estadoRecordatorio(fecha),
      };
    });

    res.json(suscripciones);
  } catch (error) {
    console.error('Error en getSuscripciones:', error);
    res.status(500).json({ error: 'Error al obtener suscripciones' });
  }
}

export async function getSuscripcionById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      `${SELECT_BASE} WHERE s.id = ? AND s.user_id = ?`,
      [id, req.user?.id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Suscripción no encontrada' });
      return;
    }

    const mapped = mapSuscripcionRow(rows[0]);
    res.json({
      ...mapped,
      dias_restantes: diasHastaCobro(mapped.fecha_proximo_cobro),
      estado_recordatorio: estadoRecordatorio(mapped.fecha_proximo_cobro),
    });
  } catch (error) {
    console.error('Error en getSuscripcionById:', error);
    res.status(500).json({ error: 'Error al obtener suscripción' });
  }
}

export async function createSuscripcion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const body = req.body as SuscripcionInput;
    const error = validateInput(body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    const servicioId = body.servicio_id ?? null;

    if (servicioId !== null) {
      const [servicioRows] = await pool.query<mysql.RowDataPacket[]>(
        'SELECT id FROM servicios WHERE id = ?',
        [servicioId]
      );
      if (servicioRows.length === 0) {
        res.status(400).json({ error: 'El servicio seleccionado no existe' });
        return;
      }
    }

    const activa = body.activa !== undefined ? (body.activa ? 1 : 0) : 1;

    const [result] = await pool.query<mysql.ResultSetHeader>(
      `INSERT INTO suscripciones
        (servicio_id, user_id, nombre_personalizado, costo, frecuencia, fecha_inicio, fecha_proximo_cobro, activa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        servicioId,
        req.user?.id,
        body.nombre_personalizado.trim(),
        body.costo,
        body.frecuencia,
        body.fecha_inicio,
        body.fecha_proximo_cobro,
        activa,
      ]
    );

    req.params.id = String(result.insertId);
    await getSuscripcionById(req, res);
  } catch (error) {
    console.error('Error en createSuscripcion:', error);
    res.status(500).json({ error: 'Error al crear suscripción' });
  }
}

export async function updateSuscripcion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const body = req.body as SuscripcionInput;
    const error = validateInput(body);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    const [existing] = await pool.query<mysql.RowDataPacket[]>(
      'SELECT id FROM suscripciones WHERE id = ? AND user_id = ?',
      [id, req.user?.id]
    );
    if (existing.length === 0) {
      res.status(404).json({ error: 'Suscripción no encontrada' });
      return;
    }

    const servicioId = body.servicio_id ?? null;

    if (servicioId !== null) {
      const [servicioRows] = await pool.query<mysql.RowDataPacket[]>(
        'SELECT id FROM servicios WHERE id = ?',
        [servicioId]
      );
      if (servicioRows.length === 0) {
        res.status(400).json({ error: 'El servicio seleccionado no existe' });
        return;
      }
    }

    const activa = body.activa !== undefined ? (body.activa ? 1 : 0) : 1;

    await pool.query(
      `UPDATE suscripciones SET
        servicio_id = ?,
        nombre_personalizado = ?,
        costo = ?,
        frecuencia = ?,
        fecha_inicio = ?,
        fecha_proximo_cobro = ?,
        activa = ?
       WHERE id = ? AND user_id = ?`,
      [
        servicioId,
        body.nombre_personalizado.trim(),
        body.costo,
        body.frecuencia,
        body.fecha_inicio,
        body.fecha_proximo_cobro,
        activa,
        id,
        req.user?.id,
      ]
    );

    await getSuscripcionById(req, res);
  } catch (error) {
    console.error('Error en updateSuscripcion:', error);
    res.status(500).json({ error: 'Error al actualizar suscripción' });
  }
}

export async function deleteSuscripcion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const [result] = await pool.query<mysql.ResultSetHeader>(
      'DELETE FROM suscripciones WHERE id = ? AND user_id = ?',
      [id, req.user?.id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Suscripción no encontrada' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error en deleteSuscripcion:', error);
    res.status(500).json({ error: 'Error al eliminar suscripción' });
  }
}

export async function activarSuscripcion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const [result] = await pool.query<mysql.ResultSetHeader>(
      'UPDATE suscripciones SET activa = 1 WHERE id = ? AND user_id = ?',
      [id, req.user?.id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Suscripción no encontrada' });
      return;
    }

    await getSuscripcionById(req, res);
  } catch (error) {
    console.error('Error en activarSuscripcion:', error);
    res.status(500).json({ error: 'Error al activar suscripción' });
  }
}

export async function desactivarSuscripcion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const [result] = await pool.query<mysql.ResultSetHeader>(
      'UPDATE suscripciones SET activa = 0 WHERE id = ? AND user_id = ?',
      [id, req.user?.id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Suscripción no encontrada' });
      return;
    }

    await getSuscripcionById(req, res);
  } catch (error) {
    console.error('Error en desactivarSuscripcion:', error);
    res.status(500).json({ error: 'Error al desactivar suscripción' });
  }
}

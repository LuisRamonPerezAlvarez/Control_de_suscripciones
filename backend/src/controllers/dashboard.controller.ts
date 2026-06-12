import { Response } from 'express';
import mysql from 'mysql2/promise';
import pool from '../config/database';
import { costoMensual, diasHastaCobro, estadoRecordatorio } from '../utils/helpers';
import { Frecuencia } from '../types';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getResumen(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      `SELECT costo, frecuencia, fecha_proximo_cobro
       FROM suscripciones
       WHERE activa = 1 AND user_id = ?`,
      [req.user.id]
    );

    let gastoMensualTotal = 0;
    let proximasAVencer = 0;

    for (const row of rows) {
      gastoMensualTotal += costoMensual(Number(row.costo), row.frecuencia as Frecuencia);
      const dias = diasHastaCobro(String(row.fecha_proximo_cobro).slice(0, 10));
      if (dias <= 7) proximasAVencer++;
    }

    const [countRows] = await pool.query<mysql.RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM suscripciones WHERE activa = 1 AND user_id = ?',
      [req.user.id]
    );

    res.json({
      total_activas: Number(countRows[0].total),
      gasto_mensual_total: Math.round(gastoMensualTotal * 100) / 100,
      gasto_anual_estimado: Math.round(gastoMensualTotal * 12 * 100) / 100,
      proximas_a_vencer: proximasAVencer,
    });
  } catch (error) {
    console.error('Error en getResumen:', error);
    res.status(500).json({ error: 'Error al obtener resumen del dashboard' });
  }
}

export async function getProximosCobros(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      `SELECT s.id, s.nombre_personalizado, s.costo, s.frecuencia, s.fecha_proximo_cobro,
              sv.nombre AS servicio_nombre
       FROM suscripciones s
       LEFT JOIN servicios sv ON s.servicio_id = sv.id
       WHERE s.activa = 1 AND s.user_id = ?
       ORDER BY s.fecha_proximo_cobro ASC
       LIMIT 10`,
      [req.user.id]
    );

    const proximos = rows.map((row) => {
      const fecha = String(row.fecha_proximo_cobro).slice(0, 10);
      const dias = diasHastaCobro(fecha);
      return {
        id: Number(row.id),
        nombre: row.servicio_nombre
          ? `${row.servicio_nombre} (${row.nombre_personalizado})`
          : row.nombre_personalizado,
        costo: Number(row.costo),
        frecuencia: row.frecuencia as Frecuencia,
        fecha_proximo_cobro: fecha,
        dias_restantes: dias,
        estado_recordatorio: estadoRecordatorio(fecha),
      };
    });

    res.json(proximos);
  } catch (error) {
    console.error('Error en getProximosCobros:', error);
    res.status(500).json({ error: 'Error al obtener próximos cobros' });
  }
}

import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import pool from '../config/database';

export async function getServicios(req: Request, res: Response): Promise<void> {
  try {
    const { busqueda, categoria_id } = req.query;
    let sql = `
      SELECT s.id, s.nombre, s.categoria_id, s.sitio_web, s.logo, c.nombre AS categoria_nombre
      FROM servicios s
      INNER JOIN categorias c ON s.categoria_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (busqueda && typeof busqueda === 'string') {
      sql += ' AND s.nombre LIKE ?';
      params.push(`%${busqueda}%`);
    }

    if (categoria_id && typeof categoria_id === 'string') {
      sql += ' AND s.categoria_id = ?';
      params.push(Number(categoria_id));
    }

    sql += ' ORDER BY s.nombre ASC';

    const [rows] = await pool.query<mysql.RowDataPacket[]>(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error en getServicios:', error);
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
}

export async function getServicioById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      `SELECT s.id, s.nombre, s.categoria_id, s.sitio_web, s.logo, c.nombre AS categoria_nombre
       FROM servicios s
       INNER JOIN categorias c ON s.categoria_id = c.id
       WHERE s.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Servicio no encontrado' });
      return;
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error en getServicioById:', error);
    res.status(500).json({ error: 'Error al obtener servicio' });
  }
}

import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import pool from '../config/database';

export async function getCategorias(_req: Request, res: Response): Promise<void> {
  try {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      'SELECT id, nombre FROM categorias ORDER BY nombre ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en getCategorias:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
}

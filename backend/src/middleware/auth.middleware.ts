import { NextFunction, Request, Response } from 'express';
import mysql from 'mysql2/promise';
import pool from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token de autorización faltante o inválido' });
      return;
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      res.status(401).json({ error: 'Token de autorización inválido' });
      return;
    }

    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      `SELECT at.user_id AS id, u.username
       FROM auth_tokens at
       JOIN usuarios u ON at.user_id = u.id
       WHERE at.token = ? AND at.expires_at > NOW()
       LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: 'Token de autorización inválido o expirado' });
      return;
    }

    req.user = {
      id: Number(rows[0].id),
      username: String(rows[0].username),
    };

    next();
  } catch (error) {
    console.error('Error en auth middleware:', error);
    res.status(500).json({ error: 'Error en la verificación de autorización' });
  }
}

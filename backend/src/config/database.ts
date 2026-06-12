import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'control_suscripciones',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export async function testDatabaseConnection(): Promise<void> {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
}

export default pool;

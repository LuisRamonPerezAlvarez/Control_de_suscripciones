import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function testConnection(): Promise<void> {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'control_suscripciones',
  };

  console.log('Probando conexión a MySQL...');
  console.log(`  Host:     ${config.host}:${config.port}`);
  console.log(`  Usuario:  ${config.user}`);
  console.log(`  Base:     ${config.database}`);
  console.log('');

  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(config);

    const [dbRows] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT DATABASE() AS db, VERSION() AS version'
    );
    console.log(`Conexión exitosa a MySQL ${dbRows[0].version}`);
    console.log(`Base de datos activa: ${dbRows[0].db}`);

    const [tables] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
       ORDER BY TABLE_NAME`,
      [config.database]
    );

    console.log('\nTablas encontradas:');
    if (tables.length === 0) {
      console.log('  (ninguna) — Ejecuta backend/sql/full_database.sql en MySQL');
    } else {
      tables.forEach((t) => console.log(`  - ${t.TABLE_NAME}`));
    }

    const [procs] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT ROUTINE_NAME FROM information_schema.ROUTINES
       WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'
       ORDER BY ROUTINE_NAME`,
      [config.database]
    );

    console.log('\nProcedimientos almacenados:');
    if (procs.length === 0) {
      console.log('  (ninguno)');
    } else {
      procs.forEach((p) => console.log(`  - ${p.ROUTINE_NAME}`));
    }

    const [resumen] = await connection.query<mysql.RowDataPacket[]>(
      'CALL sp_dashboard_resumen()'
    ).catch(async () => {
      const [fallback] = await connection!.query<mysql.RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM suscripciones WHERE activa = 1'
      );
      return [fallback];
    });

    const data = Array.isArray(resumen[0]) ? resumen[0][0] : resumen[0];
    if (data) {
      console.log('\nResumen rápido:');
      console.log(`  Suscripciones activas: ${data.total_activas ?? data.total ?? 'N/A'}`);
    }

    console.log('\nTodo listo. Ejecuta "npm run dev" desde la raíz del proyecto.');
  } catch (error) {
    console.error('\nError de conexión:');
    if (error instanceof Error) {
      console.error(`  ${error.message}`);
    } else {
      console.error(error);
    }
    console.error('\nRevisa backend/.env y que MySQL esté en ejecución.');
    console.error('Ejecuta el script: backend/sql/full_database.sql');
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

testConnection();

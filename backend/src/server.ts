import dotenv from 'dotenv';
import app from './app';
import pool, { testDatabaseConnection } from './config/database';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

async function startServer(): Promise<void> {
  try {
    await testDatabaseConnection();
    console.log(`Conectado a MySQL → base de datos "${process.env.DB_NAME || 'control_suscripciones'}"`);

    app.listen(PORT, () => {
      console.log(`Servidor backend ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar con MySQL:', error);
    console.error('');
    console.error('Pasos para solucionarlo:');
    console.error('  1. Verifica que MySQL esté en ejecución');
    console.error('  2. Configura backend/.env con tu usuario y contraseña');
    console.error('  3. Ejecuta el script backend/sql/full_database.sql en MySQL');
    console.error('  4. Prueba la conexión con: npm run db:test --workspace=backend');
    process.exit(1);
  }
}

startServer();

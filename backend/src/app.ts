import express from 'express';
import cors from 'cors';
import dashboardRoutes from './routes/dashboard.routes';
import categoriasRoutes from './routes/categorias.routes';
import serviciosRoutes from './routes/servicios.routes';
import suscripcionesRoutes from './routes/suscripciones.routes';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Control de Suscripciones API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/suscripciones', suscripcionesRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

export default app;

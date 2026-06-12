import { Router } from 'express';
import { getServicios, getServicioById } from '../controllers/servicios.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/', getServicios);
router.get('/:id', getServicioById);

export default router;

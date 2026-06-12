import { Router } from 'express';
import { getResumen, getProximosCobros } from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/resumen', requireAuth, getResumen);
router.get('/proximos-cobros', requireAuth, getProximosCobros);

export default router;

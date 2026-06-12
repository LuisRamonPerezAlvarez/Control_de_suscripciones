import { Router } from 'express';
import { getCategorias } from '../controllers/categorias.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/', getCategorias);

export default router;

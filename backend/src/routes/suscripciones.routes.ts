import { Router } from 'express';
import {
  getSuscripciones,
  getSuscripcionById,
  createSuscripcion,
  updateSuscripcion,
  deleteSuscripcion,
  activarSuscripcion,
  desactivarSuscripcion,
} from '../controllers/suscripciones.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getSuscripciones);
router.get('/:id', getSuscripcionById);
router.post('/', createSuscripcion);
router.put('/:id', updateSuscripcion);
router.delete('/:id', deleteSuscripcion);
router.patch('/:id/activar', activarSuscripcion);
router.patch('/:id/desactivar', desactivarSuscripcion);

export default router;

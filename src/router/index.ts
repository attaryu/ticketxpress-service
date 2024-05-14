import { Router } from 'express';

import adminRoutes from './admin';

const router = Router();

router.use(adminRoutes);

export default router;

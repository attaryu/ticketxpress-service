import { Router } from 'express';

import adminRoutes from './admin';
import discountRoutes from './discount';

const router = Router();

router
  .use(adminRoutes)
  .use(discountRoutes);

export default router;

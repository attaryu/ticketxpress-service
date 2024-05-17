import { Router } from 'express';

import adminRoutes from './admin';
import discountRoutes from './discount';
import userRoutes from './user';

const router = Router();

router
  .use(adminRoutes)
  .use(discountRoutes)
  .use(userRoutes);

export default router;

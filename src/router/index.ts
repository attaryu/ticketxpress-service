import { Router } from 'express';

import adminRoutes from './admin';
import discountRoutes from './discount';
import scheduleRoutes from './schedule';
import ticketRoutes from './ticket';
import userRoutes from './user';

const router = Router();

router
  .use(adminRoutes)
  .use(discountRoutes)
  .use(scheduleRoutes)
  .use(ticketRoutes)
  .use(userRoutes);

export default router;

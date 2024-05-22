import { Router } from 'express';

import { getAdminHandler, loginAdminHandler } from '../controllers/admin.controller';
import checkAdmin from '../middleware/checkAdmin';

const adminRoutes = Router();

adminRoutes
  .get('/admin', checkAdmin, getAdminHandler)
  .post('/admin/login', loginAdminHandler);

export default adminRoutes;

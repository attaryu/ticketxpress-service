import { Router } from 'express';

import { getAdminHandler, loginAdminHandler } from '../controllers/admin.controller';

const adminRoutes = Router();

adminRoutes
  .get('/admin', getAdminHandler)
  .post('/admin/login', loginAdminHandler);

export default adminRoutes;

import { Router } from 'express';

import {
	getAdminHandler,
	loginAdminHandler,
	logoutHandler,
} from '../controllers/admin.controller';
import checkAdmin from '../middleware/checkAdmin';

const adminRoutes = Router();

adminRoutes
  .get('/admin', checkAdmin, getAdminHandler)
  .post('/admin/login', loginAdminHandler)
  .delete('/admin/logout', logoutHandler);

export default adminRoutes;

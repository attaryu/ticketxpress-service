import { Router } from 'express';

import {
  changeStatusScheduleHandler,
  createScheduleHandler,
  deleteScheduleHandler,
  getAllSchedulesHandler,
  getSchedulesRouteBasedHandler,
  updateScheduleHandler,
} from '../controllers/schedule.controller';
import checkAdmin from '../middleware/checkAdmin';

const scheduleRoutes = Router();

// * Admin routes

scheduleRoutes.route('/admin/schedule')
  .get(checkAdmin, getAllSchedulesHandler)
  .post(checkAdmin, createScheduleHandler)

scheduleRoutes.route('/admin/schedule/:scheduleId')
  .put(checkAdmin, updateScheduleHandler)
  .delete(checkAdmin, deleteScheduleHandler);

scheduleRoutes.patch('/admin/schedule/:scheduleId/status', checkAdmin, changeStatusScheduleHandler);

// * User routes

scheduleRoutes.get('/schedule', getSchedulesRouteBasedHandler);

export default scheduleRoutes;

import { Router } from 'express';

import {
  changeStatusScheduleHandler,
  createScheduleHandler,
  deleteScheduleHandler,
  getAllSchedulesHandler,
  getSchedulesRouteBasedHandler,
  updateScheduleHandler,
} from '../controllers/schedule.controller';

const scheduleRoutes = Router();

// * Admin routes

scheduleRoutes.route('/admin/schedule')
  .get(getAllSchedulesHandler)
  .post(createScheduleHandler)

scheduleRoutes.route('/admin/schedule/:scheduleId')
  .put(updateScheduleHandler)
  .delete(deleteScheduleHandler);

scheduleRoutes.patch('/admin/schedule/:scheduleId/status', changeStatusScheduleHandler);

// * User routes

scheduleRoutes.get('/schedule', getSchedulesRouteBasedHandler);

export default scheduleRoutes;

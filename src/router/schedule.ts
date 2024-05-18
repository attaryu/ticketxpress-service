import { Router } from 'express';

import {
  changeStatusScheduleHandler,
  createScheduleHandler,
  deleteScheduleHandler,
  getAllSchedulesHandler,
  updateScheduleHandler,
} from '../controllers/schedule.controller';

const scheduleRoutes = Router();

scheduleRoutes.route('/admin/schedule')
  .get(getAllSchedulesHandler)
  .post(createScheduleHandler)

scheduleRoutes.route('/admin/schedule/:scheduleId')
  .put(updateScheduleHandler)
  .delete(deleteScheduleHandler);

scheduleRoutes.patch('/admin/schedule/:scheduleId/status', changeStatusScheduleHandler);

export default scheduleRoutes;

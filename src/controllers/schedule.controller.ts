import type { Request, Response } from 'express';

import {
  changeStatusSchedule,
  createSchedule,
  deleteSchedule,
  getAllSchedules,
  getSchedulesRouteBased,
  updateSchedule,
} from '../services/schedule.service';
import { serverError } from '../utils/response';

export async function getAllSchedulesHandler(_req: Request, res: Response) {
  try {
    const newSchedule = await getAllSchedules();

    return res
      .status(newSchedule.code)
      .send(newSchedule);
  } catch (error) {
    console.error(error);
    return res
      .status(serverError.code)
      .send(serverError);
  }
}

export async function createScheduleHandler(req: Request, res: Response) {
  try {
    const newSchedule = await createSchedule(req.body);

    return res
      .status(newSchedule.code)
      .send(newSchedule);
  } catch (error) {
    console.error(error);

    return res
      .status(serverError.code)
      .send(serverError);
  }
}

export async function updateScheduleHandler(req: Request<{ scheduleId: string }>, res: Response) {
  try {
    const newSchedule = await updateSchedule({ ...req.body, id_jadwal: req.params.scheduleId });

    return res
      .status(newSchedule.code)
      .send(newSchedule);
  } catch (error) {
    console.error(error);

    return res
      .status(serverError.code)
      .send(serverError);
  }
}

export async function changeStatusScheduleHandler(req: Request<{ scheduleId: string }>, res: Response) {
  try {
    const newSchedule = await changeStatusSchedule(req.params.scheduleId);

    return res
      .status(newSchedule.code)
      .send(newSchedule);
  } catch (error) {
    console.error(error);

    return res
      .status(serverError.code)
      .send(serverError);
  }
}

export async function deleteScheduleHandler(req: Request<{ scheduleId: string }>, res: Response) {
  try {
    const newSchedule = await deleteSchedule(req.params.scheduleId);

    return res
      .status(newSchedule.code)
      .send(newSchedule);
  } catch (error) {
    console.error(error);

    return res
      .status(serverError.code)
      .send(serverError);
  }
}

export async function getSchedulesRouteBasedHandler(req: Request, res: Response) {
  try {
    const newSchedule = await getSchedulesRouteBased(req.query as any);

    return res
      .status(newSchedule.code)
      .send(newSchedule);
  } catch (error) {
    console.error(error);

    return res
      .status(serverError.code)
      .send(serverError);
  }
}

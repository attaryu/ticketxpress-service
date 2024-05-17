import type { Request, Response } from 'express';

import { changeUserStatus, deleteUser, getAllUsers } from '../services/user.service';
import { serverError } from '../utils/response';

export async function getAllUsersHandler(req: Request, res: Response) {
  try {
    const users = await getAllUsers();

    return res
      .status(users.code)
      .send(users);
  } catch (error) {
    console.error(error);
    return res.send(serverError);
  }
}

export async function changeUserStatusHandler(req: Request<{ userId: string }>, res: Response) {
  try {
    const result = await changeUserStatus(req.params.userId);

    return res
      .status(result.code)
      .send(result);
  } catch (error) {
    console.error(error);
    return res.send(serverError);
  }
}

export async function deleteUserHandler(req: Request<{ userId: string }>, res: Response) {
  try {
    const result = await deleteUser(req.params.userId);

    return res
      .status(result.code)
      .send(result);
  } catch (error) {
    console.error(error);
    return res.send(serverError);
  }
}

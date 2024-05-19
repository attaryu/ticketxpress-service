import type { Request, Response } from 'express';

import {
  changeUserStatus,
  deleteUser,
  getAllUsers,
  loginUser,
  registrationUser,
} from '../services/user.service';
import { serverError } from '../utils/response';

export async function getAllUsersHandler(req: Request, res: Response) {
  try {
    const users = await getAllUsers();

    return res
      .status(users.code)
      .send(users);
  } catch (error) {
    console.error(error);

    return res
      .status(serverError.code)
      .send(serverError);
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

    return res
      .status(serverError.code)
      .send(serverError);
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

    return res
      .status(serverError.code)
      .send(serverError);
  }
}

export async function registrationUserHandler(req: Request, res: Response) {
  try {
    const result = await registrationUser(req.body);

    return res
      .status(result.code)
      .send(result);
  } catch (error) {
    console.error(error);

    return res
      .status(serverError.code)
      .send(serverError);
  }
}

export async function loginUserHandler(req: Request, res: Response) {
  try {
    const user = await loginUser(req.body);

    if (user.payload) {
      res.cookie('request_token', user.payload.token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
    }

    return res
      .status(user.code)
      .send(user);
  } catch (error) {
    console.error(error);

    return res
      .status(serverError.code)
      .send(serverError);
  }
}


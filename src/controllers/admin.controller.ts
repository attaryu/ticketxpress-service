import type { Request, Response } from 'express';
import type { Admin } from '../models/admin.model';

import { getAdmin, loginAdmin } from '../services/admin.service';
import { serverError } from '../utils/response';
import { decodeToken } from '../utils/token';

export async function loginAdminHandler(req: Request<any, any, Admin>, res: Response) {
  try {
    const admin = await loginAdmin(req.body);

    if (admin.payload) {
      res.cookie('request_token', admin.payload.token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        httpOnly: true,
        secure: true,
	sameSite: 'none'
      });
    }

    return res
      .status(admin.code)
      .send(admin);
  } catch (error) {
    console.error(error);
    return res.send(serverError);
  }
}

export async function getAdminHandler(req: Request, res: Response) {
  try {
    const decodedToken = decodeToken<{ id: string }>(req.cookies.request_token);
    const admin = await getAdmin(decodedToken.id);

    return res
      .status(admin.code)
      .send(admin);
  } catch (error) {
    console.error(error);
    return res.send(serverError);
  }
}

export async function logoutHandler(req: Request, res: Response) {
  res.cookie('request_token', '', {
    expires: new Date(Date.now() - 1),
    httpOnly: true,
    sameSite: 'none',
  });

  return res
    .status(200)
    .send({
      code: 200,
      message: 'Sukses',
    });
}

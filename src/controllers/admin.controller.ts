import type { Request, Response } from 'express';

import { z } from 'zod';

import { getAdmin, loginAdmin } from '../services/admin.service';
import { serverError } from '../utils/response';
import { decodeToken } from '../utils/token';

export async function loginAdminHandler(req: Request, res: Response) {
  try {
    z.object({
      email: z.string(),
      password: z.string(),
    }).parse(req.body);

    const admin = await loginAdmin(req.body);

    if (admin.payload) {
      res.cookie('request_token', admin.payload.token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        httpOnly: true,
        secure: true,
        sameSite: 'none',
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

    if (!decodedToken) {
      return res
        .status(401)
        .send({
          code: 401,
          message: 'Request token tidak ditemukan',
        });
    }

    const admin = await getAdmin(decodedToken.id);

    return res
      .status(admin.code)
      .send(admin);
  } catch (error) {
    console.error(error);
    return res.send(serverError);
  }
}

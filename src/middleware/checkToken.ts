import type { Request, Response, NextFunction } from 'express';

import { verifyToken } from '../utils/token';

export default function checkToken(req: Request, res: Response, next: NextFunction) {
  if (/\/login/.test(req.path)) {
    return next();
  }

  const token: undefined | string = req.cookies.request_token;

  if (!token) {
    return res
      .status(400)
      .send({
        code: 400,
        message: 'Request token tidak ditemukan, harap login kembali!',
      });
  } else if (!verifyToken(token)) {
    return res
      .status(400)
      .send({
        code: 400,
        message: 'Request token tidak valid, harap login kembali!',
      });
  }

  return next();
}

import type { NextFunction, Request, Response } from 'express';
import { decodeToken } from '../utils/token';

export default function checkAdminRoute(req: Request, res: Response, next: NextFunction) {
  if (/\/admin/.test(req.path) && !(/(\/login|\/registration)/.test(req.path))) {
    const decode = decodeToken<{ role: 'admin' | 'user' }>(req.cookies.request_token);

    if (!decode) {
      return res
        .status(400)
        .send({
          code: 400,
          message: 'Request token tidak valid, harap login kembali!',
        });
    } else if (decode.role !== 'admin') {
      return res
        .status(401)
        .send({
          code: 401,
          message: 'Anda bukan admin!',
        });
    }
  }

  return next();
}

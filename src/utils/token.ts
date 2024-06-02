import type { JwtPayload,  } from 'jsonwebtoken';

import { sign, verify, decode } from 'jsonwebtoken';

export function createToken(payload: any) {
  return sign(payload, process.env.TOKEN_SECRET_KEY as string, { expiresIn: '1d' });
}

export function verifyToken(token: string) {
  try {
    const isValid = verify(token, process.env.TOKEN_SECRET_KEY as string);

    if (isValid) {
      return true
    }

    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export function decodeToken<T extends JwtPayload>(token: string): T {
  return decode(token) as T;
}

import { strict } from 'assert';
import type { JwtPayload,  } from 'jsonwebtoken';

import { sign, verify, decode } from 'jsonwebtoken';
import { string } from 'zod';

const TOKEN_SECRET_KEY = process.env.TOKEN_SECRET_KEY as string;

export function createToken(payload: any) {
  return sign(payload, process.env.TOKEN_SECRET_KEY as string, { expiresIn: '1d' });
}

export function verifyToken(token: string) {
  try {
    return verify(token, process.env.TOKEN_SECRET_KEY as string);
  } catch (error) {
    console.error(error);
    return false;
  }
}

export function decodeToken<T extends JwtPayload>(token: string): T | null {
  return decode(token) as T;
}

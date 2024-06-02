import type { Admin, AdminQueryResult } from '../models/admin.model';

import { compare } from 'bcrypt';

import getConnection from '../database';
import { createToken } from '../utils/token';

export async function loginAdmin(bodyRequest: Admin) {
  const db = await getConnection();

  try {
    // ? Check, apakah admin ada?

    const [result] = await db.query<AdminQueryResult[]>('SELECT * FROM admin WHERE email = ?', [bodyRequest.email]);

    if (!result.length) {
      return {
        code: 404,
        message: `Admin dengan email ${bodyRequest.email} tidak ditemukan!`,
      };
    }

    // ? Check, apakah password valid?

    const admin = result[0];
    const isPassworValid = await compare(bodyRequest.password, admin.password);

    if (!isPassworValid) {

      return {
        code: 404,
        message: 'Password salah!',
      };
    }

    // * Prep, buat token request

    const newToken = createToken({
      id: admin.id_admin,
      nama: admin.nama,
      email: admin.email,
      role: 'admin',
    });

    return {
      code: 200,
      message: 'Login berhasil!',
      payload: {
        token: newToken,
      }
    };
  } finally {
    db.destroy();
  }
}

export async function getAdmin(idAdmin: string) {
  const db = await getConnection();

  // ? Check, apakah admin ada?

  try {
    const [result] = await db.query<AdminQueryResult[]>('SELECT * FROM admin WHERE id_admin = ?', [idAdmin]);

    if (!result.length) {
      return {
        code: 404,
        message: `Admin dengan id ${idAdmin} tidak ditemukan!`,
      };
    }

    const admin = result[0];

    return {
      code: 200,
      message: 'Sukses!',
      payload: {
        id: admin.id_admin,
        nama: admin.nama,
        email: admin.email,
      },
    };
  } finally {
    db.destroy();
  }
}

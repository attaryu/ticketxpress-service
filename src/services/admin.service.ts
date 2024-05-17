import type { Admin, AdminQueryResult } from '../models/admin.model';

import { compare } from 'bcrypt';

import getConnection from '../database';
import { createToken } from '../utils/token';

export async function loginAdmin(bodyRequest: Admin) {
  const connection = await getConnection();
  const [result] = await connection.query<AdminQueryResult[]>('SELECT * FROM admin WHERE email = ?', [bodyRequest.email]);

  if (!result.length) {
    return {
      code: 404,
      message: `AdminQueryResult dengan email ${bodyRequest.email} tidak ditemukan!`,
    };
  }

  const admin = result[0];
  const isPassworValid = await compare(bodyRequest.password, admin.password);

  if (!isPassworValid) {
    return {
      code: 404,
      message: 'Password salah!',
    };
  }

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
}

export async function getAdmin(idAdmin: string) {
  const connection = await getConnection();
  const [result] = await connection.query<AdminQueryResult[]>('SELECT * FROM admin WHERE id_admin = ?', [idAdmin]);

  if (!result.length) {
    return {
      code: 404,
      message: `AdminQueryResult dengan id ${idAdmin} tidak ditemukan!`,
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
}

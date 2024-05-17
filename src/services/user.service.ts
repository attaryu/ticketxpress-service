import type { User, UserQueryResult } from '../models/user.model';
import type { ResultSetHeader } from 'mysql2';

import getConnection from '../database';

export async function getAllUsers() {
  const db = await getConnection();
  const [users] = await db.query<UserQueryResult[]>('SELECT id_pengguna, nama, email, no_telepon, jenis_identitas, identitas, aktif FROM pengguna');

  return {
    code: 200,
    message: 'Sukses',
    payload: users,
  };
}

export async function changeUserStatus(id: string) {
  const db = await getConnection();
  const [queryResult] = await db.query<UserQueryResult[]>('SELECT aktif FROM pengguna WHERE id_pengguna = ?', [id]);

  if (!queryResult.length) {
    return {
      code: 404,
      message: `User ${id} tidak ditemukan`,
    }
  }

  const user: Pick<User, 'aktif'> = queryResult[0];
  await db.query<ResultSetHeader>('UPDATE pengguna SET aktif = ? WHERE id_pengguna = ?', [!user.aktif, id]);

  return {
    code: 200,
    message: `sukses`,
  }
}

export async function deleteUser(id: string) {
  const db = await getConnection();
  const [result] = await db.query<ResultSetHeader>('DELETE FROM pengguna WHERE id_pengguna = ?', [id]);

  if (!result.affectedRows) {
    return {
      code: 404,
      message: `User ${id} tidak ditemukan`,
    }
  }

  return {
    code: 200,
    message: `sukses`,
  }
}

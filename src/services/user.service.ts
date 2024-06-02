import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { User, UserQueryResult } from '../models/user.model';

import { compare, hash } from 'bcrypt';

import getConnection from '../database';
import generateId from '../utils/generateId';
import { createToken } from '../utils/token';

export async function getAllUsers() {
  const db = await getConnection();

  try {
    const [users] = await db.query<UserQueryResult[]>(`
    SELECT
      id_pengguna,
      nama_lengkap,
      email,
      telepon,
      jenis_identitas,
      identitas,
      aktif
    FROM pengguna
  `);

    return {
      code: 200,
      message: 'Sukses',
      payload: users,
    };
  } finally {
    db.destroy();
  }
}

export async function changeUserStatus(userId: string) {
  const db = await getConnection();

  try {
    // ? Check: apakah user ada?

    const [queryResult] = await db.query<UserQueryResult[]>('SELECT aktif FROM pengguna WHERE id_pengguna = ?', [userId]);

    if (!queryResult.length) {
      return {
        code: 404,
        message: `User ${userId} tidak ditemukan`,
      }
    }

    const user: Pick<User, 'aktif'> = queryResult[0];

    // * Exec: ubah status user

    await db.query<ResultSetHeader>('UPDATE pengguna SET aktif = ? WHERE id_pengguna = ?', [!user.aktif, userId]);

    return {
      code: 200,
      message: `sukses`,
    }
  } finally {
    db.destroy();
  }
}

export async function deleteUser(userId: string) {
  const db = await getConnection();

  try {
    const [result] = await db.query<ResultSetHeader>('DELETE FROM pengguna WHERE id_pengguna = ?', [userId]);

    if (!result.affectedRows) {
      return {
        code: 404,
        message: `User ${userId} tidak ditemukan`,
      }
    }

    return {
      code: 200,
      message: `sukses`,
    }
  } finally {
    db.destroy();
  }
}

type RegistrationRequest = Omit<User, 'id_pengguna' | 'aktif'> & { confirm_password: string };

export async function registrationUser(registrationRequest: RegistrationRequest) {
  const db = await getConnection();

  try {
    const queryTemplate = 'SELECT id_pengguna FROM pengguna WHERE ';

    // ? Check: apakah email sudah ada?

    const [testEmail] = await db.query<RowDataPacket[]>(queryTemplate + 'email = ?', [registrationRequest.email]);

    if (testEmail.length) {
      return {
        code: 400,
        message: "Email telah digunakan",
      };
    }

    // ? Check: apakah nomor telepon sudah ada?

    const [testTelephone] = await db.query<RowDataPacket[]>(queryTemplate + 'telepon = ?', [registrationRequest.telepon]);

    if (testTelephone.length) {
      return {
        code: 400,
        message: "Nomor telepon telah digunakan",
      };
    }

    // ? Check: nomor identitas sudah ada?

    const [testIdentify] = await db.query<RowDataPacket[]>(queryTemplate + 'identitas = ?', [registrationRequest.identitas]);

    if (testIdentify.length) {
      return {
        code: 400,
        message: "Nomor identitas telah digunakan",
      };
    }

    // ? Check: apakah password dan confirm password sama?

    if (registrationRequest.password !== registrationRequest.confirm_password) {
      return {
        code: 400,
        message: "Password tidak sama",
      };
    }

    // * Prep: hashing password

    const id = generateId(8);
    const hashedPassword = await hash(registrationRequest.password, 10);

    // * Exec: insert

    await db.query(`
    INSERT INTO pengguna (
      id_pengguna,
      nama_lengkap,
      nama_panggilan,
      email,
      password,
      telepon,
      jenis_identitas,
      identitas
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
      id,
      registrationRequest.nama_lengkap,
      registrationRequest.nama_panggilan,
      registrationRequest.email,
      hashedPassword,
      registrationRequest.telepon,
      registrationRequest.jenis_identitas,
      registrationRequest.identitas,
    ]);

    return {
      code: 201,
      message: 'Sukses',
      payload: { id_pengguna: id },
    };
  } finally {
    db.destroy();
  }
}

export async function loginUser(loginRequest: Pick<RegistrationRequest, 'email' | 'password'>) {
  const db = await getConnection();

  try {
    // ? Check: apakah email sudah ada?

    const [user] = await db.query<UserQueryResult[]>(`
    SELECT
      id_pengguna,
      nama_lengkap,
      nama_panggilan,
      password,
      email
    FROM pengguna WHERE email = ?
  `, [loginRequest.email]);

    if (!user.length) {
      return {
        code: 400,
        message: "Email tidak ditemukan",
      };
    }

    // ? Check: apakah password benar?

    const isValidPassword = await compare(loginRequest.password, user[0].password);

    if (!isValidPassword) {
      return {
        code: 400,
        message: 'Password salah',
      };
    }

    // * Prep: buat token request

    const token = createToken({
      id: user[0].id_pengguna,
      nama: user[0].nama_panggilan,
      email: user[0].email,
      role: 'user',
    });

    return {
      code: 201,
      message: 'Sukses',
      payload: { token },
    };
  } finally {
    db.destroy();
  }
}

export async function getLoggedUser(id: string) {
  const db = await getConnection();

  try {
    const [user] = await db.query<UserQueryResult[]>(`
    SELECT id_pengguna,
      nama_lengkap,
      jenis_identitas,
      identitas
    FROM pengguna WHERE id_pengguna = ?
  `, [id]);

    return {
      code: 200,
      message: 'Sukses!',
      payload: user[0],
    }
  } finally {
    db.destroy();
  }
}

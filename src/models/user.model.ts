import type { RowDataPacket } from 'mysql2/promise';

export interface User {
  id_pengguna: string,
  nama_lengkap: string,
  nama_panggilan: string,
  email: string,
  password: string,
  telepon: string,
  jenis_identitas: 'ktp' | 'passpor',
  identitas: string,
  aktif: number,
}

export interface UserQueryResult extends RowDataPacket {
  id_pengguna: string,
  nama_lengkap: string,
  nama_panggilan: string,
  email: string,
  password: string,
  telepon: string,
  jenis_identitas: 'ktp' | 'passpor',
  identitas: string,
  aktif: number,
}

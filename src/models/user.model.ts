import type { RowDataPacket } from 'mysql2';

export interface User {
  id_pengguna: string,
  nama: string,
  email: string,
  password: string,
  no_telepon: string,
  saldo: number
  jenis_identitas: 'ktp' | 'passpor'
  identitas: string
  aktif: number
}

export interface UserQueryResult extends RowDataPacket {
  id_pengguna: string,
  nama: string,
  email: string,
  password: string,
  no_telepon: string,
  saldo: number
  jenis_identitas: 'ktp' | 'passpor'
  identitas: string
  aktif: number
}

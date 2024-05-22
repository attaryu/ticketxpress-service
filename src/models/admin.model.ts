import type { RowDataPacket } from 'mysql2';

export interface Admin {
  id_admin: number,
  nama: string,
  email: string,
  password: string,
  request_token: string,
}

export interface AdminQueryResult extends Admin, RowDataPacket {}

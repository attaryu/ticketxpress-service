import type { RowDataPacket } from 'mysql2';

export default interface Admin extends RowDataPacket {
  id_admin: number,
  nama: string,
  email: string,
  password: string,
  request_token: string,
};

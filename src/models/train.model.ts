import type { RowDataPacket } from 'mysql2/promise';

export interface Train {
  id_kereta: string,
  nama: string,
  aktif: boolean,
}

export interface TrainQueryResult extends RowDataPacket {
  id_kereta: string,
  nama: string,
  aktif: boolean,
}

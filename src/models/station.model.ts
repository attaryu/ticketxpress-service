import type { RowDataPacket } from 'mysql2/promise';

export interface Station {
  id_stasiun: string,
  nama: string,
  no_telepon: string,
}

export interface StationQueryResult extends Station, RowDataPacket {}

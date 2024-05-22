import type { RowDataPacket } from 'mysql2/promise';

export interface Route {
  id_rute: string,
  jadwal: string,
  stasiun: string,
  nomor_pemberhentian: number,
  waktu_kedatangan: Date,
  waktu_keberangkatan: Date,
}

export interface RouteQueryResult extends Route, RowDataPacket {}
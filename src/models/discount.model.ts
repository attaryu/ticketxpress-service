import type { RowDataPacket } from 'mysql2';

export interface Discount {
  id_diskon: string,
  judul: string,
  persentase: number,
  waktu_dimulai: Date,
  waktu_berakhir: Date,
  aktif: number,
}

export interface DiscountQueryResult extends Discount, RowDataPacket {}


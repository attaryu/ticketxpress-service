import { RowDataPacket } from 'mysql2/promise';

export interface Transaction {
  id_transaksi: string,
  jadwal: string,
  pengguna: string,
  stasiun_keberangkatan: string,
  stasiun_tujuan: string,
  diskon: string,
  status: 'aktif' | 'batal' | 'selesai',
  total_harga: number,
  tanggal_transaksi: Date,
}

export interface TransactionQueryResult extends Transaction, RowDataPacket {}

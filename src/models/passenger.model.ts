import { RowDataPacket } from 'mysql2/promise';

export interface Passenger {
  id_penumpang: string,
  transaksi: string,
  tiket: string,
  nama: string,
  jenis_identitas: 'ktp' | 'passpor',
  identitas: string,
  status: 'aktif' | 'hangus' | 'selesai',
}

export interface PassengerQueryResult extends Passenger, RowDataPacket {}

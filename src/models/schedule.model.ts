import type { RowDataPacket } from 'mysql2/promise';

export interface Schedule {
  id_jadwal: string,
  kereta: string,
  pemberhentian_terakhir: number,
  status: 'transit' | 'on rail',
  tanggal: Date,
}

export interface ScheduleQuertResult extends RowDataPacket {
  id_jadwal: string,
  kereta: string,
  pemberhentian_terakhir: number,
  status: 'transit' | 'on rail',
  tanggal: Date,
}

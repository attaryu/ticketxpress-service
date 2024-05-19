import type { RowDataPacket } from 'mysql2/promise';

export interface Ticket {
  id_tiket: string,
  jadwal: string,
  harga: number,
}

export interface TicketQueryResult extends RowDataPacket{
  id_tiket: string,
  jadwal: string,
  harga: number,
}

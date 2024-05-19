import { RowDataPacket } from 'mysql2/promise';

export interface StockTicket {
  id_stok_tiket: string,
  tiket: string,
  dipesan: boolean,
}

export interface StockTicketQueryResult extends RowDataPacket {
  id_stok_tiket: string,
  tiket: string,
  dipesan: boolean,
}

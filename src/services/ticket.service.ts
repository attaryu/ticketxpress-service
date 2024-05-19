import type { RowDataPacket } from 'mysql2/promise';
import type { ScheduleQuertResult } from '../models/schedule.model';
import type { Ticket, TicketQueryResult } from '../models/ticket.model';

import { randomUUID } from 'crypto';

import getConnection from '../database';
import generateId from '../utils/generateId';
import { serverError } from '../utils/response';

export async function getAllTickets() {
  const db = await getConnection();

  // * Exec: ambil semua tiket dari database sekaligus kalkulasi pada query

  const [ticket] = await db.query(`
    SELECT
      tiket.*,
      kereta.nama AS kereta,
      SUM(CASE WHEN stok_tiket.dipesan = TRUE THEN 1 ELSE 0 END) AS terjual,
      SUM(CASE WHEN stok_tiket.dipesan = TRUE THEN 0 ELSE 1 END) AS sisa
    FROM tiket
      JOIN stok_tiket ON tiket.id_tiket = stok_tiket.tiket
      JOIN jadwal ON tiket.jadwal = jadwal.id_jadwal
      JOIN kereta ON jadwal.kereta = kereta.id_kereta
    GROUP BY tiket.id_tiket
  `);

  return {
    code: 200,
    message: 'Sukses',
    payload: ticket,
  };
}

export async function createTicket(ticketRequest: { id_jadwal: string, stok: number } & Ticket) {
  const db = await getConnection();

  // ? Check: apakah jadwal ada?

  const [schedule] = await db.query<ScheduleQuertResult[]>('SELECT tanggal FROM jadwal WHERE id_jadwal = ?', [ticketRequest.id_jadwal]);

  if (!schedule.length) {
    return {
      code: 404,
      message: `Jadwal ${ticketRequest.id_jadwal} tidak ditemukan!`,
    };
  }

  // ? Check: apakah tiket pada jadwal tersebut sudah ada?

  const [ticket] = await db.query<TicketQueryResult[]>('SELECT id_tiket FROM tiket WHERE jadwal = ?', [ticketRequest.id_jadwal]);

  if (ticket.length) {
    return {
      code: 400,
      message: `Tiket pada jadwal ${ticketRequest.id_jadwal} sudah ada`,
    };
  }

  // ? Check: apakah harganya 10000?

  if (ticketRequest.harga <= 10000) {
    return {
      code: 400,
      message: 'Tiket tidak boleh memiliki harga dibawah 10000',
    };
  }

  // ? Check: apakah stok dibawah 100 atau lebih dari 1000?

  if (ticketRequest.stok < 100 || ticketRequest.stok > 1000) {
    return {
      code: 400,
      message: 'Jumlah stok tiket harus antara 100 hingga 1000',
    };
  }

  // * Prep: buat object tiket

  const newTicket: Ticket = {
    ...ticketRequest,
    id_tiket: generateId(8),
  };

  try {
    db.beginTransaction();

    // * Exec: kirim data tiket ke database

    await db.query('INSERT INTO tiket (id_tiket, jadwal, harga) VALUES (?, ?, ?)', [newTicket.id_tiket, ticketRequest.id_jadwal, newTicket.harga]);

    // * Exec: kirim data stok tiket ke database

    for (let i = 0; i < ticketRequest.stok; i++) {
      await db.query('INSERT INTO stok_tiket (id_stok_tiket, tiket) VALUES (?, ?)', [randomUUID(), newTicket.id_tiket]);
    }

    db.commit();

    return {
      code: 201,
      message: 'Sukses',
      payload: newTicket,
    };
  } catch (error) {
    db.rollback();
    console.error(error);

    return serverError;
  }
}

export async function deleteTicket(ticketRequest: { id_jadwal: string, id_tiket: string }) {
  // TODO: hapus sebuah tiket dari jadwal tertentu

  const db = await getConnection();

  // ? Check, apakah jadwal ada?

  const [schedule] = await db.query<RowDataPacket[]>('SELECT id_jadwal FROM jadwal WHERE id_jadwal = ?', [ticketRequest.id_jadwal]);

  if (!schedule.length) {
    return {
      code: 400,
      message: `Jadwal ${ticketRequest.id_jadwal} tidak ditemukan`,
    };
  }

  // ? Check, apakah tiket ada pada jadwal tersebut?

  const [ticket] = await db.query<RowDataPacket[]>('SELECT id_tiket FROM tiket WHERE jadwal = ? AND id_tiket = ?', [ticketRequest.id_jadwal, ticketRequest.id_tiket]);

  if (!ticket.length) {
    return {
      code: 400,
      message: `Tiket ${ticketRequest.id_tiket} pada jadwal ${ticketRequest.id_jadwal} tidak ditemukan`,
    };
  }

  // * Exec: delete data tiket dari database

  await db.query('DELETE FROM tiket WHERE id_tiket = ?', [ticketRequest.id_tiket]);

  return {
    code: 200,
    message: 'Sukses',
  };
}

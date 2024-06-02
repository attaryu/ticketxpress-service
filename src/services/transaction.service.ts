import type { RowDataPacket } from 'mysql2/promise';
import type { StockTicketQueryResult } from '../models/stockTicket.model';
import type { TicketQueryResult } from '../models/ticket.model';
import type { Transaction, TransactionQueryResult } from '../models/transaction.model';
import type { PassengerQueryResult } from '../models/passenger.model';

import { randomUUID } from 'crypto';

import getConnection from '../database';
import { getDiscount } from '../services/discount.service';
import { serverError } from '../utils/response';
import { getStation } from './station.service';
import { getTrain } from './train.service';

type TransactionRequest = {
  penumpang: Array<{ nama: string, jenis_identitas: 'ktp' | 'passpor', identitas: string }>,
} & Omit<Transaction, 'id_transaksi' | ''>;

export async function getAllTransactions() {
  const db = await getConnection();

  const [transactions] = await db.query<TransactionQueryResult[]>(`
    SELECT transaksi.*,
      jadwal.kereta,
      pengguna.nama_lengkap
    FROM transaksi
      JOIN jadwal ON transaksi.jadwal = jadwal.id_jadwal
      JOIN pengguna ON transaksi.pengguna = pengguna.id_pengguna
  `);

  const formattedTransactions: Array<(Transaction & { kereta: string })> = [];

  // * Exec: looping daftar transaksi

  for (const transaction of transactions) {
    // * Exec: ambil data kereta dan stasiun untuk masing masing transaksi

    const departureStation = await getStation(transaction.stasiun_keberangkatan);
    const destinationStation = await getStation(transaction.stasiun_tujuan);
    const train = await getTrain(transaction.kereta);

    formattedTransactions.push({
      ...transaction,
      stasiun_keberangkatan: departureStation.payload!.nama,
      stasiun_tujuan: destinationStation.payload!.nama,
      kereta: train.payload!.nama,
    });
  }

  return {
    code: 200,
    message: 'Sukses',
    payload: formattedTransactions,
  };
}

export async function createTransaction(transactionRequest: TransactionRequest) {
  const db = await getConnection();

  // ? Check: apakah tiket ada pada jadwal tersebut?

  const [ticket] = await db.query<TicketQueryResult[]>('SELECT harga FROM tiket WHERE jadwal = ?', [transactionRequest.jadwal]);

  if (!ticket.length) {
    return {
      code: 404,
      message: 'Jadwal tidak memiliki tiket',
    };
  }

  // ? Check: apakah jumlah penumpang lebih dari 4?

  if (transactionRequest.penumpang.length > 4) {
    return {
      code: 400,
      message: 'Penumpang tidak boleh lebih dari 4 pada satu kali transaksi',
    };
  }

  // ? Check: apakah transaksi memiliki dua atau lebih penumpang yang sama?

  const checkCredentials: any = {};

  transactionRequest.penumpang.forEach(({ identitas }) => {
    if (identitas in checkCredentials) {
      checkCredentials[identitas] = checkCredentials[identitas] + 1;
    } else {
      checkCredentials[identitas] = 1;
    }
  });

  for (const prop in checkCredentials) {
    if (checkCredentials[prop] > 1) {
      return {
        code: 400,
        message: "Penumpang tidak boleh memiliki nomor identitas yang sama",
      };
    }
  }

  // ? Check: jika transaksi dengan jadwal yang sama, apakah transaksi memiliki penumpang yang sama dengan transaksi sebelumnya?

  const [pastPassengers] = await db.query<PassengerQueryResult[]>(`
    SELECT penumpang.identitas
    FROM penumpang
      JOIN transaksi ON penumpang.transaksi = transaksi.id_transaksi
    WHERE jadwal = ?
      AND pengguna = ?;
  `, [transactionRequest.jadwal, transactionRequest.pengguna]);

  for (const passenger of pastPassengers) {
    if (passenger.identitas in checkCredentials) {
      return {
        code: 400,
        message: 'Transaksi memiliki penumpang yang sama dengan transaksi dengan jadwal yang sama sebelumnya',
      };
    }
  }

  // ? Check: apakah stok tiket yang dipesan masih tersedia?

  const [tickets] = await db.query<StockTicketQueryResult[]>(`
    SELECT id_stok_tiket
    FROM stok_tiket
      JOIN tiket ON stok_tiket.tiket = tiket.id_tiket
    WHERE jadwal = ?
      AND dipesan IS FALSE
    LIMIT ?
  `, [transactionRequest.jadwal, transactionRequest.penumpang.length]);

  if (tickets.length !== transactionRequest.penumpang.length) {
    return {
      code: 400,
      message: 'Jumlah penumpang lebih besar dari pada tiket yang tersedia',
    };
  }

  // * Prep: kalkulasi harga tiket dengan jumlah penumpang lalu potong dengan diskon bila ada

  let totalPrice: number = (ticket[0].harga * transactionRequest.penumpang.length);

  // ? Check: apakah user menggunakan diskon?

  if (transactionRequest.diskon) {

    // ? Check: apakah diskon ada?

    const discount = await getDiscount(transactionRequest.diskon);

    if (discount.code !== 200) {
      return discount;
    }

    // ? Check: apakah diskon sudah digunakan oleh pengguna?

    const [pastTransaction] = await db.query<RowDataPacket[]>(`
      SELECT id_transaksi
      FROM transaksi
      WHERE diskon = ? AND pengguna = ?
    `, [transactionRequest.diskon, transactionRequest.pengguna]);

    if (pastTransaction.length) {
      return {
        code: 400,
        message: 'Diskon tiket sudah pernah digunakan oleh pengguna',
      };
    }

    const discountPrice = totalPrice * discount.payload!.persentase;
    totalPrice -= discountPrice;
  }

  // * Prep: buat id transaksi

  const transactionId = randomUUID();

  try {
    await db.beginTransaction();

    // * Exec: lakukan insert transaksi

    await db.query(`
      INSERT INTO transaksi
        (id_transaksi, pengguna, jadwal, stasiun_keberangkatan, stasiun_tujuan, diskon, total_harga)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      transactionId,
      transactionRequest.pengguna,
      transactionRequest.jadwal,
      transactionRequest.stasiun_keberangkatan,
      transactionRequest.stasiun_tujuan,
      transactionRequest.diskon ? transactionRequest.diskon : null,
      totalPrice,
    ]);

    // * Exec: lakukan insert penumpang

    for (let i = 0; i < transactionRequest.penumpang.length; i++) {
      const passenger = transactionRequest.penumpang[i];
      const ticket = tickets[i].id_stok_tiket;

      await db.query(`
        INSERT INTO penumpang
          (id_penumpang, transaksi, tiket, nama, jenis_identitas, identitas)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        randomUUID(),
        transactionId,
        ticket,
        passenger.nama,
        passenger.jenis_identitas,
        passenger.identitas,
      ]);

      await db.query('UPDATE stok_tiket SET dipesan = TRUE WHERE id_stok_tiket = ?', [ticket]);
    }

    await db.commit();

    return {
      code: 201,
      message: 'Sukses',
      payload: { id_transaksi: transactionId },
    };
  } catch (error) {
    await db.rollback();
    console.error(error);

    return serverError;
  }
}

export async function getAllUserTransactions(userId: string) {
  const db = await getConnection();

  // * Exec: ambil seluruh transaksi dan penumpangnya berdasarkan id user yang login

  const [transactions] = await db.query<TransactionQueryResult[]>(`
    SELECT id_transaksi,
      jadwal.kereta,
      stasiun_keberangkatan,
      stasiun_tujuan,
      diskon,
      total_harga,
      tanggal_transaksi
    FROM transaksi
        JOIN jadwal ON transaksi.jadwal = jadwal.id_jadwal
    WHERE pengguna = ?
    ORDER BY tanggal_transaksi DESC
    LIMIT 10;
  `, [userId]);

  const formattedTransactions: Array<(Transaction & { kereta: string })> = [];

  // * Exec: looping daftar transaksi

  for (const transaction of transactions) {
    // * Exec: ambil data kereta dan stasiun untuk masing masing transaksi

    const departureStation = await getStation(transaction.stasiun_keberangkatan);
    const destinationStation = await getStation(transaction.stasiun_tujuan);
    const train = await getTrain(transaction.kereta);

    formattedTransactions.push({
      ...transaction,
      stasiun_keberangkatan: departureStation.payload!.nama,
      stasiun_tujuan: destinationStation.payload!.nama,
      kereta: train.payload!.nama,
    });
  }

  return {
    code: 200,
    message: 'Sukses',
    payload: formattedTransactions,
  };
}

export async function getTransaction(transactionId: string, userId: string) {
  const db = await getConnection();

  // * Exec: ambil transaksi dan penumpang berdasarkan id transaksi

  const [transaction] = await db.query<TransactionQueryResult[]>(`
    SELECT transaksi.*,
      jadwal.kereta
    FROM transaksi
      JOIN jadwal ON transaksi.jadwal = jadwal.id_jadwal
    WHERE id_transaksi = ?
  `, [transactionId, userId]);

  // ? Check: apakah transaksi ditemukan?

  if (!transaction.length) {
    return {
      code: 400,
      message: 'Transaksi tidak ditemukan',
    };
  }

  const [passengers] = await db.query<PassengerQueryResult[]>(`
    SELECT
      tiket,
      nama,
      jenis_identitas,
      identitas
    FROM penumpang
    WHERE transaksi = ?
  `, [transaction[0].id_transaksi]);

  const departureStation = await getStation(transaction[0].stasiun_keberangkatan);
  const destinationStation = await getStation(transaction[0].stasiun_tujuan);
  const train = await getTrain(transaction[0].kereta);

  const formatedPayload: Transaction & { kereta: string } = {
    ...transaction[0],
    stasiun_keberangkatan: departureStation.payload!.nama,
    stasiun_tujuan: destinationStation.payload!.nama,
    kereta: train.payload!.nama,
  };

  return {
    code: 200,
    message: 'Sukses',
    payload: {
      ...formatedPayload,
      penumpang: passengers,
    },
  };
}

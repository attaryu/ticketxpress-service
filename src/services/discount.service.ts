import type { Discount, DiscountQueryResult } from '../models/discount.model';
import type { ResultSetHeader } from 'mysql2';

import getConnection from '../database';
import path from 'path';
import { rm } from 'fs/promises';

export async function getAllDiscount() {
  const connection = await getConnection();
  const [result] = await connection.query<DiscountQueryResult[]>('SELECT * FROM diskon');

  return {
    code: 200,
    message: 'Sukses!',
    payload: result,
  };
}

export async function createNewDiscount(requestBody: Discount, filename: string) {
  const connection = await getConnection();
  const id = filename.match(/^\w+(?=\.jpg)/)![0];

  const [result] = await connection.query<ResultSetHeader>('INSERT INTO diskon (id_diskon, judul, persentase, waktu_dimulai, waktu_berakhir) VALUES (?, ?, ?, ?, ?)', [
    id,
    requestBody.judul,
    requestBody.persentase,
    new Date(requestBody.waktu_dimulai),
    new Date(requestBody.waktu_berakhir),
  ]);

  if (!result.affectedRows) {
    return {
      code: 500,
      message: 'Proses penambahan diskon gagal, silahkan coba lagi',
    };
  }

  return {
    code: 201,
    message: 'Diskon berhasil dibuat!',
    payload: { id_diskon: id },
  };
}

export async function getDiscount(id: string) {
  const connection = await getConnection();
  const [result] = await connection.query<DiscountQueryResult[]>('SELECT * FROM diskon WHERE id_diskon = ?', [id]);

  if (!result.length) {
    return {
      code: 404,
      message: 'Diskon tidak ditemukan!',
    };
  }

  const discount = result[0];

  return {
    code: 200,
    message: 'Sukses!',
    package: discount,
  };
}

export async function updateDiscount(discount: Partial<Discount>) {
  const connection = await getConnection();
  const [discountFromDatabase] = await connection.query<DiscountQueryResult[]>('SELECT judul, persentase, waktu_dimulai, waktu_berakhir, aktif FROM diskon WHERE id_diskon = ?', [discount.id_diskon]);

  if (!discountFromDatabase.length) {
    return {
      code: 404,
      message: `Discount dengan id ${discount.id_diskon} tidak ditemukan!`,
    };
  }

  const updatedDiscount: Discount = {
    ...discountFromDatabase[0],
    ...discount,
    waktu_dimulai: new Date(discount.waktu_dimulai ?? discountFromDatabase[0].waktu_dimulai),
    waktu_berakhir: new Date(discount.waktu_berakhir ?? discountFromDatabase[0].waktu_berakhir),
  };

  const [result] = await connection.query<ResultSetHeader>('UPDATE diskon SET judul = ?, persentase = ?, waktu_dimulai = ?, waktu_berakhir = ?, aktif = ? WHERE id_diskon = ?', [
    updatedDiscount.judul,
    updatedDiscount.persentase,
    updatedDiscount.waktu_dimulai,
    updatedDiscount.waktu_berakhir,
    updatedDiscount.aktif,
    updatedDiscount.id_diskon,
  ]);

  if (!result.affectedRows) {
    return {
      code: 500,
      message: `Perubahan diskon ${discount.id_diskon} tidak berhasil!`,
    };
  }

  return {
    code: 200,
    message: 'Sukses!',
    payload: { ...updatedDiscount }
  };
}

export async function deleteDiscount(id: string) {
  const connection = await getConnection();
  const [result] = await connection.query<ResultSetHeader>('DELETE FROM diskon WHERE id_diskon = ?', [id]);
  await rm( path.resolve('public', 'image', `${id}.jpg`));

  if (!result.affectedRows) {
    return {
      code: 500,
      message: `Hapus diskon ${id} tidak berhasil!`,
    };
  }

  return {
    code: 200,
    message: `Hapus diskon ${id} berhasil!`,
  }
}
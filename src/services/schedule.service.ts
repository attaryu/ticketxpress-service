import type { RowDataPacket } from 'mysql2/promise';
import type { Route } from '../models/route.model';
import type { Schedule, ScheduleQuertResult } from '../models/schedule.model';
import type { StationQueryResult } from '../models/station.model';
import type { TrainQueryResult } from '../models/train.model';

import getConnection from '../database';
import generateId from '../utils/generateId';
import { serverError } from '../utils/response';
import { checkAllRoutesRelation, createRoutes } from './route.service';

export async function getAllSchedules() {
  const db = await getConnection();
  const [schedules] = await db.query<ScheduleQuertResult[]>('SELECT jadwal.id_jadwal, kereta.nama as kereta, jadwal.tanggal, jadwal.status, pemberhentian_terakhir FROM jadwal JOIN kereta ON jadwal.kereta = kereta.id_kereta;');

  // * Mengubah response setiap jadwal bagian rute sesuai dengan status jadwal

  const schedulesCompleteForm = [];

  for (const schedule of schedules) {
    const bindingValue: Array<string | number> = [schedule.id_jadwal];
    let queryTemplate = 'SELECT stasiun.nama from stasiun JOIN rute ON stasiun.id_stasiun = rute.stasiun WHERE jadwal = ? AND ';

    if (schedule.status === 'transit') {
      // * Jika status transit, rute menjadi satu nama stasiun saat ini

      queryTemplate += 'nomor_pemberhentian = ? ';
      bindingValue.push(schedule.pemberhentian_terakhir);
    } else {
      // * Jika status on rail, rute menjadi nama stasiun sebelumnya dan selanjutnya

      queryTemplate += '(nomor_pemberhentian = ? OR nomor_pemberhentian = ?) ORDER BY nomor_pemberhentian';
      bindingValue.push(schedule.pemberhentian_terakhir, schedule.pemberhentian_terakhir + 1);
    }

    const [station] = await db.query<Pick<StationQueryResult, 'nama' | 'constructor'>[]>(queryTemplate, bindingValue);

    schedulesCompleteForm.push({
      ...schedule,
      rute: station.map(({ nama }) => nama).join(' - '),
    });
  }

  return {
    code: 200,
    message: 'Sukses',
    payload: schedulesCompleteForm,
  };
}

interface ScheduleRequest {
  kereta: Schedule['kereta'],
  tanggal: Schedule['tanggal'],
  rute: Pick<Route, 'stasiun' | 'nomor_pemberhentian'>[],
};

export async function createSchedule(scheduleRequest: ScheduleRequest) {
  // ? Check, apakah tanggal jadwal lebih dari 1 hari sebelum jadwal berlaku?

  const now = (Date.now()) + (1000 * 60 * 60 * 24);
  const scheduleDate = new Date(scheduleRequest.tanggal).getTime();

  if (scheduleDate <= now) {
    return {
      code: 400,
      message: 'Pembuatan jadwal minimal 1 hari sebelum hari ini',
    };
  }

  const db = await getConnection();

  // ? Check, apakah jadwal sudah ada dengan kereta dan tanggal yang sama?

  const [test1] = await db.query<RowDataPacket[]>('SELECT id_jadwal FROM jadwal WHERE kereta = ? AND tanggal = ?', [scheduleRequest.kereta, scheduleRequest.tanggal]);

  if (test1.length) {
    return {
      code: 400,
      message: `kereta ${scheduleRequest.kereta} memiliki jadwal pada tanggal ${scheduleRequest.tanggal}, harap ganti tanggal`,
    };
  }

  // ? Check, apakah kereta aktif?

  const [test2] = await db.query<Pick<TrainQueryResult, 'constructor' | 'aktif'>[]>('SELECT aktif FROM kereta WHERE id_kereta = ?', [scheduleRequest.kereta]);

  if (!test2[0].aktif) {
    return {
      code: 404,
      message: `Kereta ${scheduleRequest.kereta} sedang tidak aktif`,
    };
  }

  // ? Check, apakah stasiun saling terhubung?

  const checkRoute = await checkAllRoutesRelation(scheduleRequest.rute);

  if (checkRoute.code !== 200) {
    return checkRoute;
  }

  // * Prepare object jadwal baru

  const newSchedule: Omit<Schedule, 'status'> = {
    id_jadwal: generateId(8),
    kereta: scheduleRequest.kereta,
    tanggal: new Date(scheduleRequest.tanggal),
    pemberhentian_terakhir: 1,
  };

  try {
    await db.beginTransaction();

    await db.query('INSERT INTO jadwal (id_jadwal, kereta, pemberhentian_terakhir, tanggal) VALUES (?, ?, ?, ?)', [
      newSchedule.id_jadwal,
      newSchedule.kereta,
      newSchedule.pemberhentian_terakhir,
      newSchedule.tanggal,
    ]);

    await createRoutes(db, newSchedule, scheduleRequest.rute);

    await db.commit();

    return {
      code: 201,
      message: 'Sukses!',
      payload: { id_jadwal: newSchedule.id_jadwal },
    };
  } catch (error) {
    await db.rollback();
    console.error(error);

    return serverError;
  }
}

type UpdateScheduleRequest = {
  id_jadwal: Schedule['id_jadwal'],
  kereta: Schedule['kereta'],
  tanggal: Schedule['tanggal'],
  rute?: ScheduleRequest['rute'],
};

export async function updateSchedule(scheduleRequest: UpdateScheduleRequest) {
  const db = await getConnection();

  // ? Check, apakah jadwal ada?

  const [test] = await db.query<Pick<ScheduleQuertResult, 'constructor' | 'tanggal' | 'kereta'>[]>('SELECT id_jadwal FROM jadwal WHERE id_jadwal = ?', [scheduleRequest.id_jadwal]);

  if (!test.length) {
    return {
      code: 404,
      message: `Jadwal ${scheduleRequest.id_jadwal} tidak ditemukan`,
    };
  }

  // ? Check, apakah hari jadwal sama dengan hari jadwal lain dari kereta yang sama?

  const [test2] = await db.query<RowDataPacket[]>('SELECT id_jadwal FROM jadwal WHERE kereta = ? AND DATE(tanggal) = DATE(?)', [scheduleRequest.kereta, scheduleRequest.tanggal]);

  if (test2.length) {
    return {
      code: 400,
      message: `Jadwal ${scheduleRequest.id_jadwal} untuk kereta ${scheduleRequest.kereta} bertabrakan dengan jadwal lain`,
    };
  }

  // ? Check, apakah rute yang baru saling terhubung?

  if (scheduleRequest.rute) {
    const checkRoute = await checkAllRoutesRelation(scheduleRequest.rute);

    if (checkRoute.code !== 200) {
      return checkRoute;
    }
  }

  try {
    db.beginTransaction();

    // * Perbarui jadwal

    await db.query('UPDATE jadwal SET tanggal = ? WHERE id_jadwal = ?', [
      new Date(scheduleRequest.tanggal),
      scheduleRequest.id_jadwal
    ]);

    // * Hapus semua rute dari jadwal tersebut lalu buat lagi

    if (scheduleRequest.rute) {
      await db.query('DELETE FROM rute WHERE jadwal = ?', [scheduleRequest.id_jadwal]);
      await createRoutes(db, scheduleRequest, scheduleRequest.rute);
    }

    db.commit();

    return {
      code: 200,
      message: 'Sukses!',
      payload: { id_jadwal: scheduleRequest.id_jadwal },
    };
  } catch (error) {
    db.rollback();
    console.error(error);

    return serverError;
  }
}

export async function changeStatusSchedule(id: string) {
  const db = await getConnection();

  // ? Check, apakah jadwal ada?

  const [schedules] = await db.query<Pick<ScheduleQuertResult, 'constructor' | 'status' | 'pemberhentian_terakhir'>[]>('SELECT status, pemberhentian_terakhir FROM jadwal WHERE id_jadwal = ?', [id]);

  if (!schedules.length) {
    return {
      code: 404,
      message: `Jadwal ${id} tidak ditemukan!`,
    };
  }

  // ? Check, apakah jadwal dengan status transit berada di rute terakhir?

  if (schedules[0].status === 'transit') {
    const [routes] = await db.query<RowDataPacket[]>('SELECT id_rute FROM rute WHERE jadwal = ? AND nomor_pemberhentian = ?', [id, schedules[0].pemberhentian_terakhir + 1]);

    if (!routes.length) {
      return {
        code: 400,
        message: `Jadwal ${id} sudah berada di rute terakhir`,
      };
    }
  }

  if (schedules[0].status === 'transit') {
    // * Jika transit, ubah status ke on rail

    await db.query('UPDATE jadwal SET status = "on rail" WHERE id_jadwal = ?', [id]);
  } else {
    // * Jika ubah on rail, ubah status ke transit dan update pemberhentian terakhir + 1

    await db.query('UPDATE jadwal SET status = "transit", pemberhentian_terakhir = ? WHERE id_jadwal = ?', [schedules[0].pemberhentian_terakhir + 1, id]);
  }

  return {
    code: 200,
    message: `Status jadwal ${id} telah berhasil diubah`,
  };
}

export async function deleteSchedule(id: string) {
  const db = await getConnection();

  interface QueryResult extends RowDataPacket {
    pemberhentian_terakhir: number,
    rute_terakhir: number,
  }

  const [schedule] = await db.query<QueryResult[]>('SELECT jadwal.pemberhentian_terakhir, MAX(rute.nomor_pemberhentian) AS rute_terakhir FROM rute JOIN jadwal ON rute.jadwal = jadwal.id_jadwal WHERE jadwal = ?', [id]);

  // ? Check, apakah jadwal ada?

  if (!schedule.length) {
    return {
      code: 404,
      message: `Jadwal ${id} tidak ditemukan`,
    };
  }

  // ? Check, apakah jadwal berada di pemberhentian terakhir?

  if (schedule[0].pemberhentian_terakhir !== schedule[0].rute_terakhir) {
    return {
      code: 400,
      message: `Jadwal ${id} belum berakhir, tidak dapat dihapus`,
    };
  }

  await db.query('DELETE FROM jadwal WHERE id_jadwal = ?', [id]);

  return {
    code: 200,
    message: `Jadwal ${id} berhasil dihapus`,
  };
}
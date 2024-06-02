import type { Connection, RowDataPacket } from 'mysql2/promise';
import type { Route } from '../models/route.model';
import type { Schedule } from '../models/schedule.model';

import getConnection from '../database';

export async function checkAllRoutesRelation(routes: Pick<Route, 'stasiun' | 'nomor_pemberhentian'>[]) {
  const db = await getConnection();

  try {
    for (let i = 0; i < routes.length - 1; i++) {
      // * Prep: mengambil rute sekarang dan rute selanjutnya

      const route = routes[i];
      const nextRoute = routes[i + 1];

      // ? Check: apakah rute sekarang dan selanjutnya terhubung?

      const [result] = await db.query<RowDataPacket[]>('SELECT * FROM relasi_stasiun WHERE (stasiun_1 = ? AND stasiun_2 = ?) OR (stasiun_1 = ? AND stasiun_2 = ?)', [route.stasiun, nextRoute.stasiun, nextRoute.stasiun, route.stasiun]);

      if (!result.length) {
        return {
          code: 400,
          message: `Stasiun ${route.stasiun} tidak terhubung dengan stasiun ${nextRoute.stasiun}`,
        }
      }
    }

    return { code: 200 };
  } finally {
    db.destroy();
  }
}

export async function createRoutes(db: Connection, schedule: Omit<Schedule, 'status' | 'pemberhentian_terakhir'>, routes: Pick<Route, 'stasiun' | 'nomor_pemberhentian'>[]) {
  // * Prep: menyiapkan durasi onrail (30 menit) dan transit (10 menit) pada miliseconds

  const oneMinute = 1000 * 60;
  const onrailDuration = oneMinute * 30;
  const transitDuration = oneMinute * 10;

  // * Prep: mengubah waktu jadwal menjadi miliseconds

  let routeDuration = new Date(schedule.tanggal).getTime();

  const formatedRoutes = routes.map((route): Omit<Route, 'id_rute' | 'terlewati'> => {
    // * Prep: waktu kedatangan berdasarkan durasi rute

    const arrivalTime = routeDuration;

    // * Prep: waktu keberangkatan berdasarkan durasi rute dijumlahkan dengan durasi transit

    const departureTime = routeDuration + transitDuration;

    // * Exec: menambah durasi rute dengan hasil penjumlahan waktu transit dan on rail

    routeDuration += (onrailDuration + transitDuration);

    return {
      ...route,
      jadwal: schedule.id_jadwal,
      waktu_kedatangan: new Date(arrivalTime),
      waktu_keberangkatan: new Date(departureTime),
    };
  });

  // * Exec: insert rute

  for (const route of formatedRoutes) {
    await db.query('INSERT INTO rute (jadwal, stasiun, nomor_pemberhentian, waktu_kedatangan, waktu_keberangkatan) VALUES (?, ?, ?, ?, ?)', [
      route.jadwal,
      route.stasiun,
      route.nomor_pemberhentian,
      route.waktu_kedatangan,
      route.waktu_keberangkatan,
    ]);
  }

  return true;
}

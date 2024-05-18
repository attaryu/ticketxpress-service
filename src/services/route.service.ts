import type { Connection, RowDataPacket } from 'mysql2/promise';
import type { Route } from '../models/route.model';
import type { Schedule } from '../models/schedule.model';

import getConnection from '../database';

export async function checkAllRoutesRelation(routes: Pick<Route, 'stasiun' | 'nomor_pemberhentian'>[]) {
  const db = await getConnection();

  for (let i = 0; i < routes.length - 1; i++) {
    const route = routes[i];
    const nextRoute = routes[i + 1];

    const [result] = await db.query<RowDataPacket[]>('SELECT * FROM relasi_stasiun WHERE (stasiun_1 = ? AND stasiun_2 = ?) OR (stasiun_1 = ? AND stasiun_2 = ?)', [route.stasiun, nextRoute.stasiun, nextRoute.stasiun, route.stasiun]);

    if (!result.length) {
      return {
        code: 400,
        message: `Stasiun ${route.stasiun} tidak terhubung dengan stasiun ${nextRoute.stasiun}`,
      }
    }
  }

  return { code: 200 };
}

export async function createRoutes(db: Connection, schedule: Omit<Schedule, 'status' | 'pemberhentian_terakhir'>, routes: Pick<Route, 'stasiun' | 'nomor_pemberhentian'>[]) {
  const oneMinute = 1000 * 60;
  const onrailDuration = oneMinute * 30;
  const transitDuration = oneMinute * 10;
  let routeDuration = new Date(schedule.tanggal).getTime();

  const formatedRoutes = routes.map((route): Omit<Route, 'id_rute' | 'terlewati'> => {
    const arrivalTime = routeDuration;
    const departureTime = routeDuration + transitDuration;

    routeDuration += (onrailDuration + transitDuration);

    return {
      ...route,
      jadwal: schedule.id_jadwal,
      waktu_kedatangan: new Date(arrivalTime),
      waktu_keberangkatan: new Date(departureTime),
    };
  });

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

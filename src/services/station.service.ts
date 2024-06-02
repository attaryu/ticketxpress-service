import { StationQueryResult } from '../models/station.model';

import getConnection from '../database';

export async function getStation(trainId: string) {
  const db = await getConnection();

  try {
    const [station] = await db.query<StationQueryResult[]>('SELECT * FROM stasiun WHERE id_stasiun = ?', [trainId]);

    if (!station.length) {
      return {
        code: 404,
        message: 'Stasiun tidak ditemukan',
      };
    }

    return {
      code: 200,
      message: 'Sukses',
      payload: station[0],
    };
  } finally {
    db.destroy();
  }
}
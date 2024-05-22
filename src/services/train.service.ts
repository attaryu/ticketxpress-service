import type { TrainQueryResult } from '../models/train.model';

import getConnection from '../database';

export async function getTrain(trainId: string) {
  const db = await getConnection();
  const [train] = await db.query<TrainQueryResult[]>('SELECT nama FROM kereta WHERE id_kereta = ?', [trainId]);

  if (!train.length) {
    return {
      code: 404,
      message: 'Kereta tidak ditemukan',
    };
  }

  return {
    code: 200,
    message: 'Sukses',
    payload: train[0],
  };
}
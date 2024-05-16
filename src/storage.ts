import type { DiscountQueryResult } from './models/discount.model';

import multer, { diskStorage } from 'multer';
import path from 'path';

import generateId from './utils/generateId';
import getConnection from './database';

const storage = diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, path.resolve('public', 'image'));
  },
  filename: async (req, file, callback) => {
    if (req.method === 'POST') {
      callback(null, generateId(6) + '.jpg');
    } else if (req.method === 'PUT') {
      try {
        const connection = await getConnection();
        const [discount] = await connection.query<DiscountQueryResult[]>('SELECT id_diskon FROM diskon WHERE id_diskon = ?', [req.params.discountId])

        if (!discount.length) {
          callback(new Error(`Diskon ${req.params.discountId} tidak ditemukan`), file.filename);
        }

        callback(null, discount[0].id_diskon + '.jpg');
      } catch (error) {
        console.error(error);
        callback(new Error('Server error'), file.filename);
      }
    }
  },
});

const uploadImage = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg')
      callback(new Error('Tipe file tidak valid!'));

    if (file.size >= 5242880)
      callback(new Error('Ukuran file terlalu besar!'));

    callback(null, true);
  },
});

export default uploadImage;

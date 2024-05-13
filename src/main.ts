import express from 'express';

import getConnection from './database';

const app = express();

app.get('/', async (_req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM pengguna;');

    return res
      .json({
        code: 200,
        message: 'success',
        payload: rows,
      });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({
        code: 500,
        message: 'server error!',
      });
  }
});

export default app;

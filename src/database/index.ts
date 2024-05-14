import mysql from 'mysql2/promise';

export default async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  });
  console.log('database connected');

  return connection;
}

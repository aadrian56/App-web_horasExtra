import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing connection pool with database:', process.env.DB_NAME);
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Password:', process.env.DB_PASSWORD);

try {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gad_sucua_horas_extra',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  const connection = await pool.getConnection();
  console.log('✅ Pool connection successful!');
  connection.release();
  await pool.end();
} catch (error) {
  console.error('❌ Pool connection failed!');
  console.error(error.message);
  console.error(error.stack);
}

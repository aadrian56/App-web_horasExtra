import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gad_sucua_horas_extra',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar conexión
try {
  const connection = await pool.getConnection();
  console.log('Conexión exitosa a la base de datos MySQL.');
  connection.release();
} catch (error) {
  console.error('Error al conectar a la base de datos MySQL:', error.message);
}

export default pool;

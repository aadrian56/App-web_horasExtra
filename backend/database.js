import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;
let useMock = false;

// --- ESTRUCTURAS EN MEMORIA DE RESPALDO (MOCK DB) ---
const mockUsers = [
  { id: 1, username: 'admin_sucua', password_hash: '$2b$10$a1w.iT72vLd1b7jM33Q6.OrpM3fA40R/r7Yc.R8j.322a3j0x1y1u', role: 'admin', estado: 1 },
  { id: 2, username: 'jefe_rrhh', password_hash: '$2b$10$a1w.iT72vLd1b7jM33Q6.OrpM3fA40R/r7Yc.R8j.322a3j0x1y1u', role: 'autorizador', estado: 1 },
  { id: 3, username: 'operador_1', password_hash: '$2b$10$a1w.iT72vLd1b7jM33Q6.OrpM3fA40R/r7Yc.R8j.322a3j0x1y1u', role: 'operador', estado: 1 }
];

const mockFuncionarios = [
  { id: 1, cedula: '1400654321', nombres_apellidos: 'Juan Carlos Perez Avila', tipo: 'guardia', rmu: 527.00, estado: 1 },
  { id: 2, cedula: '1400987654', nombres_apellidos: 'Maria Elena Chimbo Naula', tipo: 'limpieza', rmu: 497.00, estado: 1 },
  { id: 3, cedula: '1400123456', nombres_apellidos: 'Segundo Miguel Carchi Gomez', tipo: 'guardia', rmu: 527.00, estado: 0 }
];

const mockHorasExtra = [];

// Probar conexión a MySQL
try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gad_sucua_horas_extra',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  const connection = await pool.getConnection();
  console.log('Conexión exitosa a la base de datos MySQL.');
  connection.release();
} catch (error) {
  console.warn('⚠️ No se pudo conectar a MySQL. Activando Base de Datos Simulada en memoria (Mock DB) para desarrollo...');
  useMock = true;
}

// Interceptor de consultas para simular la base de datos si MySQL está inactivo
const dbAdapter = {
  query: async (sql, params = []) => {
    if (!useMock && pool) {
      try {
        return await pool.query(sql, params);
      } catch (err) {
        console.error('Error en consulta real MySQL:', err.message);
        throw err;
      }
    }

    // --- SIMULADOR DE QUERIES EN MEMORIA ---
    const sqlClean = sql.replace(/\s+/g, ' ').trim().toLowerCase();

    // 1. SELECT usuarios
    if (sqlClean.includes('select * from usuarios where username =')) {
      const username = params[0];
      const found = mockUsers.filter(u => u.username === username && u.estado === 1);
      return [found];
    }

    // 2. SELECT funcionarios ordenados
    if (sqlClean.includes('select * from funcionarios order by')) {
      const sorted = [...mockFuncionarios].sort((a, b) => a.nombres_apellidos.localeCompare(b.nombres_apellidos));
      return [sorted];
    }

    // 3. SELECT funcionario por id
    if (sqlClean.includes('select * from funcionarios where id =')) {
      const id = params[0];
      const found = mockFuncionarios.filter(f => f.id === id);
      return [found];
    }

    // 4. SELECT check cédula duplicada
    if (sqlClean.includes('select id from funcionarios where cedula =')) {
      const cedula = params[0];
      const found = mockFuncionarios.filter(f => f.cedula === cedula);
      return [found];
    }

    // 5. INSERT funcionario
    if (sqlClean.includes('insert into funcionarios')) {
      const [cedula, nombres_apellidos, tipo, rmu, estado] = params;
      const newId = mockFuncionarios.length > 0 ? Math.max(...mockFuncionarios.map(f => f.id)) + 1 : 1;
      mockFuncionarios.push({
        id: newId,
        cedula,
        nombres_apellidos,
        tipo,
        rmu,
        estado: estado !== undefined ? estado : true
      });
      return [{ insertId: newId }];
    }

    // 6. UPDATE funcionario
    if (sqlClean.includes('update funcionarios set')) {
      const id = params[params.length - 1];
      const index = mockFuncionarios.findIndex(f => f.id === parseInt(id));
      if (index !== -1) {
        const [cedula, nombres_apellidos, tipo, rmu, estado] = params;
        if (cedula !== undefined && cedula !== null) mockFuncionarios[index].cedula = cedula;
        if (nombres_apellidos !== undefined && nombres_apellidos !== null) mockFuncionarios[index].nombres_apellidos = nombres_apellidos;
        if (tipo !== undefined && tipo !== null) mockFuncionarios[index].tipo = tipo;
        if (rmu !== undefined && rmu !== null) mockFuncionarios[index].rmu = rmu;
        if (estado !== undefined && estado !== null) mockFuncionarios[index].estado = estado;
      }
      return [{}];
    }

    // 7. SELECT registro_horas_extra completo (JOIN)
    if (sqlClean.includes('select r.*, f.nombres_apellidos, f.cedula')) {
      const list = mockHorasExtra.map(r => {
        const f = mockFuncionarios.find(func => func.id === r.funcionario_id) || {};
        const u = mockUsers.find(user => user.id === r.autorizado_por) || {};
        return {
          ...r,
          nombres_apellidos: f.nombres_apellidos || 'Desconocido',
          cedula: f.cedula || '',
          funcionario_tipo: f.tipo || 'limpieza',
          autorizador_username: u.username || null
        };
      });
      // Ordenar por fecha desc, id desc
      list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime() || b.id - a.id);
      return [list];
    }

    // 8. SUM horas suplementarias diarias
    if (sqlClean.includes('sum(horas_calculadas) as total_dia')) {
      const [funcId, fecha] = params;
      const total = mockHorasExtra
        .filter(r => r.funcionario_id === funcId && r.fecha === fecha && r.tipo_jornada === 'suplementaria' && r.estado !== 'rechazado')
        .reduce((sum, curr) => sum + curr.horas_calculadas, 0);
      return [[{ total_dia: total }]];
    }

    // 9. SUM horas suplementarias semanales
    if (sqlClean.includes('between ? and ?') && sqlClean.includes('total_semana')) {
      const [funcId, start, end] = params;
      const total = mockHorasExtra
        .filter(r => r.funcionario_id === funcId && r.fecha >= start && r.fecha <= end && r.tipo_jornada === 'suplementaria' && r.estado !== 'rechazado')
        .reduce((sum, curr) => sum + curr.horas_calculadas, 0);
      return [[{ total_semana: total }]];
    }

    // 10. INSERT registro_horas_extra
    if (sqlClean.includes('insert into registro_horas_extra')) {
      const [funcionario_id, fecha, hora_inicio, hora_fin, tipo_jornada, horas_calculadas, valor_calculado, rmu_historico] = params;
      const newId = mockHorasExtra.length > 0 ? Math.max(...mockHorasExtra.map(r => r.id)) + 1 : 1;
      mockHorasExtra.push({
        id: newId,
        funcionario_id,
        fecha,
        hora_inicio,
        hora_fin,
        tipo_jornada,
        horas_calculadas,
        valor_calculado,
        rmu_historico,
        estado: 'pendiente',
        autorizado_por: null,
        fecha_autorizacion: null
      });
      return [{ insertId: newId }];
    }

    // 11. SELECT estado registro_horas_extra por id
    if (sqlClean.includes('select estado from registro_horas_extra')) {
      const id = params[0];
      const found = mockHorasExtra.filter(r => r.id === parseInt(id));
      return [found];
    }

    // 12. UPDATE estado registro_horas_extra
    if (sqlClean.includes('update registro_horas_extra set estado =')) {
      const [estado, autorizado_por, id] = params;
      const index = mockHorasExtra.findIndex(r => r.id === parseInt(id));
      if (index !== -1) {
        mockHorasExtra[index].estado = estado;
        mockHorasExtra[index].autorizado_por = autorizado_por;
        mockHorasExtra[index].fecha_autorizacion = new Date().toISOString();
      }
      return [{}];
    }

    // 13. SELECT reporte-mensual consolidado
    if (sqlClean.includes('group by f.id') && sqlClean.includes('year(r.fecha) =')) {
      const [year, month] = params;
      const result = [];

      // Filtrar registros autorizados por año y mes
      const filtered = mockHorasExtra.filter(r => {
        const d = new Date(r.fecha);
        const yMatch = d.getFullYear() === parseInt(year);
        // getUTCMonth + 1 o getMonth + 1. Usamos parseo directo del string fecha 'YYYY-MM-DD'
        const parts = r.fecha.split('-');
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]);
        return y === parseInt(year) && m === parseInt(month) && r.estado === 'autorizado';
      });

      // Agrupar por funcionario
      const groups = {};
      filtered.forEach(r => {
        if (!groups[r.funcionario_id]) {
          groups[r.funcionario_id] = [];
        }
        groups[r.funcionario_id].push(r);
      });

      Object.keys(groups).forEach(funcId => {
        const id = parseInt(funcId);
        const f = mockFuncionarios.find(func => func.id === id);
        if (f) {
          const list = groups[id];
          const totalSuplementarias = list.filter(r => r.tipo_jornada === 'suplementaria').reduce((sum, curr) => sum + curr.horas_calculadas, 0);
          const totalExtraordinarias = list.filter(r => r.tipo_jornada === 'extraordinaria').reduce((sum, curr) => sum + curr.horas_calculadas, 0);
          const totalPagar = list.reduce((sum, curr) => sum + parseFloat(curr.valor_calculado), 0);

          result.push({
            cedula: f.cedula,
            nombres_apellidos: f.nombres_apellidos,
            funcionario_tipo: f.tipo,
            total_suplementarias: totalSuplementarias,
            total_extraordinarias: totalExtraordinarias,
            total_pagar: totalPagar
          });
        }
      });

      // Ordenar por nombres
      result.sort((a, b) => a.nombres_apellidos.localeCompare(b.nombres_apellidos));
      return [result];
    }

    console.warn('Consulta simulada no identificada:', sqlClean);
    return [[]];
  }
};

export default dbAdapter;

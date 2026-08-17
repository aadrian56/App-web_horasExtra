import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gad_sucua_horas_extra'
  });

  console.log('Connected to MySQL for seeding...');

  try {
    // 1. Insertar Funcionarios
    const funcionarios = [
      { cedula: '1400111111', nombres: 'Carlos Antonio Torres Vaca', tipo: 'guardia', rmu: 550.00 },
      { cedula: '1400222222', nombres: 'Luis Alfonso Morocho Chamba', tipo: 'guardia', rmu: 527.00 },
      { cedula: '1400333333', nombres: 'Rosa Matilda Guaman Ortiz', tipo: 'limpieza', rmu: 497.00 }
    ];

    const insertedIds = {};

    for (const f of funcionarios) {
      // Verificar si ya existe
      const [rows] = await connection.query('SELECT id FROM funcionarios WHERE cedula = ?', [f.cedula]);
      if (rows.length > 0) {
        console.log(`Funcionario con cédula ${f.cedula} ya existe.`);
        insertedIds[f.cedula] = rows[0].id;
      } else {
        const [res] = await connection.query(
          'INSERT INTO funcionarios (cedula, nombres_apellidos, tipo, rmu, estado) VALUES (?, ?, ?, ?, 1)',
          [f.cedula, f.nombres, f.tipo, f.rmu]
        );
        console.log(`Funcionario ${f.nombres} creado con ID: ${res.insertId}`);
        insertedIds[f.cedula] = res.insertId;
      }
    }

    // 2. Insertar Registros de Horas Extra
    const idCarlos = insertedIds['1400111111'];
    const idLuis = insertedIds['1400222222'];
    const idRosa = insertedIds['1400333333'];

    const horasExtra = [
      // Carlos (RMU 550.00 -> Valor Hora 2.2917)
      // Suplementaria (17:00 - 20:00 = 3h, 2h diurnas x1.25, 1h nocturna x1.50) -> Valor: 9.17
      {
        funcionario_id: idCarlos,
        fecha: '2026-08-12',
        hora_inicio: '17:00:00',
        hora_fin: '20:00:00',
        tipo_jornada: 'suplementaria',
        horas_calculadas: 3.00,
        valor_calculado: 9.17,
        rmu_historico: 550.00,
        estado: 'pendiente'
      },
      // Extraordinaria (08:00 - 12:00 = 4h diurnas x2.00) -> Valor: 18.33
      {
        funcionario_id: idCarlos,
        fecha: '2026-08-15',
        hora_inicio: '08:00:00',
        hora_fin: '12:00:00',
        tipo_jornada: 'extraordinaria',
        horas_calculadas: 4.00,
        valor_calculado: 18.33,
        rmu_historico: 550.00,
        estado: 'autorizado',
        autorizado_por: 1
      },

      // Luis (RMU 527.00 -> Valor Hora 2.1958)
      // Suplementaria (18:00 - 21:00 = 3h, 1h diurna x1.25, 2h nocturnas x1.50) -> Valor: 9.33
      {
        funcionario_id: idLuis,
        fecha: '2026-08-13',
        hora_inicio: '18:00:00',
        hora_fin: '21:00:00',
        tipo_jornada: 'suplementaria',
        horas_calculadas: 3.00,
        valor_calculado: 9.33,
        rmu_historico: 527.00,
        estado: 'pendiente'
      },
      // Extraordinaria (07:00 - 11:00 = 4h diurnas x2.00) -> Valor: 17.57
      {
        funcionario_id: idLuis,
        fecha: '2026-08-16',
        hora_inicio: '07:00:00',
        hora_fin: '11:00:00',
        tipo_jornada: 'extraordinaria',
        horas_calculadas: 4.00,
        valor_calculado: 17.57,
        rmu_historico: 527.00,
        estado: 'autorizado',
        autorizado_por: 1
      },

      // Rosa (RMU 497.00 -> Valor Hora 2.0708)
      // Suplementaria (17:00 - 19:30 = 2.5h, 2h diurnas x1.25, 0.5h nocturnas x1.50) -> Valor: 6.73
      {
        funcionario_id: idRosa,
        fecha: '2026-08-14',
        hora_inicio: '17:00:00',
        hora_fin: '19:30:00',
        tipo_jornada: 'suplementaria',
        horas_calculadas: 2.50,
        valor_calculado: 6.73,
        rmu_historico: 497.00,
        estado: 'pendiente'
      },
      // Extraordinaria (09:00 - 13:00 = 4h diurnas x2.00) -> Valor: 16.57
      {
        funcionario_id: idRosa,
        fecha: '2026-08-15',
        hora_inicio: '09:00:00',
        hora_fin: '13:00:00',
        tipo_jornada: 'extraordinaria',
        horas_calculadas: 4.00,
        valor_calculado: 16.57,
        rmu_historico: 497.00,
        estado: 'autorizado',
        autorizado_por: 1
      }
    ];

    for (const h of horasExtra) {
      // Verificar si ya existe un registro idéntico
      const [existing] = await connection.query(
        'SELECT id FROM registro_horas_extra WHERE funcionario_id = ? AND fecha = ? AND hora_inicio = ? AND hora_fin = ?',
        [h.funcionario_id, h.fecha, h.hora_inicio, h.hora_fin]
      );

      if (existing.length > 0) {
        console.log(`Registro de horas para el funcionario ${h.funcionario_id} en fecha ${h.fecha} ya existe.`);
      } else {
        await connection.query(
          `INSERT INTO registro_horas_extra 
           (funcionario_id, fecha, hora_inicio, hora_fin, tipo_jornada, horas_calculadas, valor_calculado, rmu_historico, estado, autorizado_por, fecha_autorizacion) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            h.funcionario_id,
            h.fecha,
            h.hora_inicio,
            h.hora_fin,
            h.tipo_jornada,
            h.horas_calculadas,
            h.valor_calculado,
            h.rmu_historico,
            h.estado,
            h.autorizado_por || null,
            h.autorizado_por ? new Date() : null
          ]
        );
        console.log(`Registro insertado para funcionario ${h.funcionario_id} en fecha ${h.fecha}`);
      }
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await connection.end();
  }
}

seed();

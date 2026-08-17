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
    // 0. Crear la tabla feriados si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS feriados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        fecha DATE NOT NULL UNIQUE,
        recurrente BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    
    // Asegurar que la columna recurrente existe (por si la tabla ya fue creada previamente sin ella)
    try {
      await connection.query("ALTER TABLE feriados ADD COLUMN IF NOT EXISTS recurrente BOOLEAN DEFAULT FALSE;");
    } catch (err) {
      try {
        await connection.query("ALTER TABLE feriados ADD COLUMN recurrente BOOLEAN DEFAULT FALSE;");
      } catch (alterErr) {
        // Ignorar si la columna ya existe
      }
    }
    console.log("Tabla 'feriados' creada o ya existente.");

    // 0.B Crear la tabla administrativos si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS administrativos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombres_apellidos VARCHAR(150) NOT NULL,
        cargo ENUM('director_administrativo', 'director_finanzas', 'administrador_bienes', 'jefe_recursos') NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log("Tabla 'administrativos' creada o ya existente.");


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

    // 3. Insertar Feriados Semilla
    const feriadosSemilla = [
      { nombre: 'Año Nuevo', fecha: '2026-01-01', recurrente: 1 },
      { nombre: 'Día del Trabajo', fecha: '2026-05-01', recurrente: 1 },
      { nombre: 'Batalla de Pichincha', fecha: '2026-05-24', recurrente: 1 },
      { nombre: 'Primer Grito de Independencia', fecha: '2026-08-10', recurrente: 1 },
      { nombre: 'Cantonización de Sucúa', fecha: '2026-12-08', recurrente: 1 },
      { nombre: 'Navidad', fecha: '2026-12-25', recurrente: 1 }
    ];

    for (const f of feriadosSemilla) {
      const [existing] = await connection.query('SELECT id FROM feriados WHERE fecha = ?', [f.fecha]);
      if (existing.length > 0) {
        console.log(`Feriado para la fecha ${f.fecha} ya existe. Actualizando recurrencia.`);
        await connection.query('UPDATE feriados SET recurrente = ? WHERE id = ?', [f.recurrente, existing[0].id]);
      } else {
        await connection.query('INSERT INTO feriados (nombre, fecha, recurrente) VALUES (?, ?, ?)', [f.nombre, f.fecha, f.recurrente]);
        console.log(`Feriado '${f.nombre}' insertado para la fecha ${f.fecha}`);
      }
    }
    // 4. Insertar Administrativos Semilla
    const adminSemilla = [
      { nombres: 'Ing. Fabián Andrés Calle', cargo: 'director_administrativo', activo: 1 },
      { nombres: 'Mgs. Silvia Patricia Ortiz', cargo: 'director_finanzas', activo: 1 },
      { nombres: 'Dra. Gabriela Elizabeth Ríos', cargo: 'jefe_recursos', activo: 1 },
      { nombres: 'Tcnl. Hugo Vinicio Cueva', cargo: 'administrador_bienes', activo: 1 }
    ];

    for (const a of adminSemilla) {
      const [existing] = await connection.query('SELECT id FROM administrativos WHERE cargo = ? AND nombres_apellidos = ?', [a.cargo, a.nombres]);
      if (existing.length > 0) {
        console.log(`Administrativo ${a.nombres} con cargo ${a.cargo} ya existe.`);
      } else {
        await connection.query('INSERT INTO administrativos (nombres_apellidos, cargo, activo) VALUES (?, ?, ?)', [a.nombres, a.cargo, a.activo]);
        console.log(`Administrativo '${a.nombres}' insertado con cargo ${a.cargo}`);
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

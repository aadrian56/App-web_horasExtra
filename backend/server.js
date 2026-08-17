import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import db from './database.js';
import {
  validarCedulaEcuatoriana,
  calcularDuracionHoras,
  calcularHorasNocturnas
} from './utils.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE DE AUTENTICACIÓN ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });

  jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro_gad_sucua_2026', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado.' });
    req.user = user;
    next();
  });
}

// --- RUTAS DE AUTENTICACIÓN ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ? AND estado = 1', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas o usuario inactivo.' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secreto_super_seguro_gad_sucua_2026',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- RUTAS DE FUNCIONARIOS ---
app.get('/api/funcionarios', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM funcionarios ORDER BY nombres_apellidos ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/funcionarios', authenticateToken, async (req, res) => {
  const { cedula, nombres_apellidos, tipo, rmu, estado } = req.body;

  if (!cedula || !nombres_apellidos || !tipo || rmu === undefined) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben ser provistos.' });
  }

  if (!validarCedulaEcuatoriana(cedula)) {
    return res.status(400).json({ error: 'El formato de cédula ecuatoriana ingresado no es válido.' });
  }

  if (!['guardia', 'limpieza'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de funcionario inválido (debe ser guardia o limpieza).' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM funcionarios WHERE cedula = ?', [cedula]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya existe un funcionario registrado con esa cédula.' });
    }

    const [result] = await db.query(
      'INSERT INTO funcionarios (cedula, nombres_apellidos, tipo, rmu, estado) VALUES (?, ?, ?, ?, ?)',
      [cedula, nombres_apellidos, tipo, rmu, estado !== undefined ? estado : true]
    );

    res.status(201).json({ message: 'Funcionario creado exitosamente.', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/funcionarios/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { cedula, nombres_apellidos, tipo, rmu, estado } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM funcionarios WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Funcionario no encontrado.' });
    }

    if (cedula && !validarCedulaEcuatoriana(cedula)) {
      return res.status(400).json({ error: 'El formato de cédula ecuatoriana no es válido.' });
    }

    await db.query(
      'UPDATE funcionarios SET cedula = COALESCE(?, cedula), nombres_apellidos = COALESCE(?, nombres_apellidos), tipo = COALESCE(?, tipo), rmu = COALESCE(?, rmu), estado = COALESCE(?, estado) WHERE id = ?',
      [cedula, nombres_apellidos, tipo, rmu, estado, id]
    );

    res.json({ message: 'Funcionario actualizado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- RUTAS DE FERIADOS ---
app.get('/api/feriados', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM feriados ORDER BY fecha ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/feriados', authenticateToken, async (req, res) => {
  const { nombre, fecha, recurrente } = req.body;

  if (!nombre || !fecha) {
    return res.status(400).json({ error: 'El nombre y la fecha del feriado son requeridos.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden agregar feriados.' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM feriados WHERE fecha = ?', [fecha]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya existe un feriado registrado para esta fecha.' });
    }

    const [result] = await db.query(
      'INSERT INTO feriados (nombre, fecha, recurrente) VALUES (?, ?, ?)',
      [nombre, fecha, recurrente ? 1 : 0]
    );

    res.status(201).json({ message: 'Feriado registrado exitosamente.', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/feriados/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden eliminar feriados.' });
  }

  try {
    await db.query('DELETE FROM feriados WHERE id = ?', [id]);
    res.json({ message: 'Feriado eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- RUTAS DE ADMINISTRATIVOS ---
app.get('/api/administrativos', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM administrativos ORDER BY cargo ASC, activo DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/administrativos', authenticateToken, async (req, res) => {
  const { nombres_apellidos, cargo, activo } = req.body;

  if (!nombres_apellidos || !cargo) {
    return res.status(400).json({ error: 'El nombre y el cargo son requeridos.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden gestionar administrativos.' });
  }

  const isActivo = activo ? 1 : 0;

  try {
    if (isActivo === 1) {
      await db.query('UPDATE administrativos SET activo = 0 WHERE cargo = ?', [cargo]);
    }

    const [result] = await db.query(
      'INSERT INTO administrativos (nombres_apellidos, cargo, activo) VALUES (?, ?, ?)',
      [nombres_apellidos, cargo, isActivo]
    );

    res.status(201).json({ message: 'Administrativo registrado exitosamente.', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/administrativos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombres_apellidos, cargo, activo } = req.body;

  if (!nombres_apellidos || !cargo) {
    return res.status(400).json({ error: 'El nombre y el cargo son requeridos.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden gestionar administrativos.' });
  }

  const isActivo = activo ? 1 : 0;

  try {
    if (isActivo === 1) {
      await db.query('UPDATE administrativos SET activo = 0 WHERE cargo = ?', [cargo]);
    }

    await db.query(
      'UPDATE administrativos SET nombres_apellidos = ?, cargo = ?, activo = ? WHERE id = ?',
      [nombres_apellidos, cargo, isActivo, id]
    );

    res.json({ message: 'Administrativo actualizado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/administrativos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden gestionar administrativos.' });
  }

  try {
    await db.query('DELETE FROM administrativos WHERE id = ?', [id]);
    res.json({ message: 'Administrativo eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- RUTAS DE HORAS EXTRA ---
app.get('/api/horas-extra', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, f.nombres_apellidos, f.cedula, f.tipo as funcionario_tipo, u.username as autorizador_username
      FROM registro_horas_extra r
      JOIN funcionarios f ON r.funcionario_id = f.id
      LEFT JOIN usuarios u ON r.autorizado_por = u.id
      ORDER BY r.fecha DESC, r.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/horas-extra', authenticateToken, async (req, res) => {
  const { funcionario_id, fecha, hora_inicio, hora_fin, tipo_jornada } = req.body;

  if (!funcionario_id || !fecha || !hora_inicio || !hora_fin || !tipo_jornada) {
    return res.status(400).json({ error: 'Todos los campos son requeridos para registrar las horas.' });
  }

  try {
    // 0. Validar si la fecha corresponde a un feriado o fin de semana
    const dateParts = fecha.split('-').map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

    // A. Validar que la fecha no sea futura
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj > today) {
      return res.status(400).json({ error: 'No se pueden registrar horas extra para fechas futuras.' });
    }

    const dayOfWeek = dateObj.getDay(); // 0: Domingo, 6: Sábado
    const esFinDeSemana = dayOfWeek === 0 || dayOfWeek === 6;

    const [feriadoRows] = await db.query(
      'SELECT id FROM feriados WHERE fecha = ? OR (recurrente = 1 AND MONTH(fecha) = MONTH(?) AND DAY(fecha) = DAY(?))',
      [fecha, fecha, fecha]
    );
    const esFeriado = feriadoRows.length > 0;

    if ((esFinDeSemana || esFeriado) && tipo_jornada !== 'extraordinaria') {
      return res.status(400).json({ 
        error: `La fecha seleccionada (${fecha}) corresponde a un día de descanso obligatorio (${esFinDeSemana ? 'Fin de semana' : 'Feriado'}). Debe registrarse como jornada Extraordinaria.` 
      });
    }

    // 1. Obtener funcionario y congelar RMU
    const [funcRows] = await db.query('SELECT * FROM funcionarios WHERE id = ?', [funcionario_id]);
    if (funcRows.length === 0) {
      return res.status(404).json({ error: 'Funcionario no encontrado.' });
    }

    const funcionario = funcRows[0];
    if (!funcionario.estado) {
      return res.status(400).json({ error: 'No se pueden registrar horas extra para funcionarios inactivos.' });
    }

    const rmu = funcionario.rmu;
    const valorHoraOrdinaria = rmu / 240;

    // 2. Calcular duración y recargo nocturno
    const horasCalculadas = calcularDuracionHoras(hora_inicio, hora_fin);
    const horasNocturnas = calcularHorasNocturnas(hora_inicio, hora_fin);
    const horasDiurnas = horasCalculadas - horasNocturnas;

    // 3. Validar límites LOSEP (Suplementarias: Max 4h/día, 12h/semana)
    if (tipo_jornada === 'suplementaria') {
      // Sumar horas suplementarias registradas en la misma fecha
      const [diaRows] = await db.query(
        'SELECT SUM(horas_calculadas) as total_dia FROM registro_horas_extra WHERE funcionario_id = ? AND fecha = ? AND tipo_jornada = "suplementaria" AND estado != "rechazado"',
        [funcionario_id, fecha]
      );
      const totalDia = parseFloat(diaRows[0].total_dia || 0);
      if (totalDia + horasCalculadas > 4) {
        return res.status(400).json({ error: `Supera el límite legal de 4 horas suplementarias al día. Registradas hoy: ${totalDia}h.` });
      }

      // Validar límite semanal (Lunes a Domingo)
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

      const monday = new Date(dateObj);
      monday.setDate(dateObj.getDate() + diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const mondayDate = monday.toISOString().split('T')[0];
      const sundayDate = sunday.toISOString().split('T')[0];

      const [semanaRows] = await db.query(
        'SELECT SUM(horas_calculadas) as total_semana FROM registro_horas_extra WHERE funcionario_id = ? AND fecha BETWEEN ? AND ? AND tipo_jornada = "suplementaria" AND estado != "rechazado"',
        [funcionario_id, mondayDate, sundayDate]
      );
      const totalSemana = parseFloat(semanaRows[0].total_semana || 0);
      if (totalSemana + horasCalculadas > 12) {
        return res.status(400).json({ error: `Supera el límite legal de 12 horas suplementarias a la semana. Registradas esta semana: ${totalSemana}h.` });
      }
    }

    // 4. Calcular Valores a pagar
    // Fórmulas combinadas:
    // Suplementaria diurna: x1.25, nocturna: x1.50
    // Extraordinaria diurna: x2.00, nocturna: x2.25
    let factorDiurno = tipo_jornada === 'suplementaria' ? 1.25 : 2.00;
    let factorNocturno = tipo_jornada === 'suplementaria' ? 1.50 : 2.25;

    const valorDiurno = horasDiurnas * valorHoraOrdinaria * factorDiurno;
    const valorNocturno = horasNocturnas * valorHoraOrdinaria * factorNocturno;
    const valorCalculado = parseFloat((valorDiurno + valorNocturno).toFixed(2));

    // 5. Guardar en Base de Datos
    const [result] = await db.query(
      `INSERT INTO registro_horas_extra 
       (funcionario_id, fecha, hora_inicio, hora_fin, tipo_jornada, horas_calculadas, valor_calculado, rmu_historico, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      [funcionario_id, fecha, hora_inicio, hora_fin, tipo_jornada, horasCalculadas, valorCalculado, rmu]
    );

    res.status(201).json({
      message: 'Horas extra registradas correctamente.',
      id: result.insertId,
      valor_calculado: valorCalculado,
      horas_calculadas: horasCalculadas
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aprobación o rechazo de horas
app.put('/api/horas-extra/:id/estado', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // 'autorizado' o 'rechazado'

  if (!['autorizado', 'rechazado'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido.' });
  }

  try {
    const [rows] = await db.query('SELECT estado FROM registro_horas_extra WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado.' });
    }

    if (rows[0].estado === 'autorizado') {
      return res.status(400).json({ error: 'Este registro ya ha sido autorizado y no se puede modificar.' });
    }

    await db.query(
      'UPDATE registro_horas_extra SET estado = ?, autorizado_por = ?, fecha_autorizacion = NOW() WHERE id = ?',
      [estado, req.user.id, id]
    );

    res.json({ message: `Registro ${estado} exitosamente.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporte consolidado agrupado
app.get('/api/horas-extra/reporte-mensual', authenticateToken, async (req, res) => {
  const { anio, mes } = req.query;

  if (!anio || !mes) {
    return res.status(400).json({ error: 'Año y mes son requeridos.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT 
        f.cedula,
        f.nombres_apellidos,
        f.tipo as funcionario_tipo,
        SUM(CASE WHEN r.tipo_jornada = 'suplementaria' THEN r.horas_calculadas ELSE 0 END) as total_suplementarias,
        SUM(CASE WHEN r.tipo_jornada = 'extraordinaria' THEN r.horas_calculadas ELSE 0 END) as total_extraordinarias,
        SUM(r.valor_calculado) as total_pagar
      FROM registro_horas_extra r
      JOIN funcionarios f ON r.funcionario_id = f.id
      WHERE YEAR(r.fecha) = ? AND MONTH(r.fecha) = ? AND r.estado = 'autorizado'
      GROUP BY f.id
      ORDER BY f.nombres_apellidos ASC
    `, [anio, mes]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de Horas Extras ejecutándose en http://localhost:${PORT}`);
});

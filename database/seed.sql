-- Script de Inserción de Datos de Prueba (Seed) para el GAD Sucúa

USE gad_sucua_horas_extra;

-- 1. Insertar Usuarios de Prueba (Roles)
-- Contraseña por defecto para todos en texto plano (para hashing en desarrollo): "gad_sucua_2026"
-- Hash bcrypt correspondiente para: "$2b$10$a1w.iT72vLd1b7jM33Q6.OrpM3fA40R/r7Yc.R8j.322a3j0x1y1u"
INSERT INTO usuarios (username, password_hash, role, estado) VALUES
('admin_sucua', '$2b$10$a1w.iT72vLd1b7jM33Q6.OrpM3fA40R/r7Yc.R8j.322a3j0x1y1u', 'admin', 1),
('jefe_rrhh', '$2b$10$a1w.iT72vLd1b7jM33Q6.OrpM3fA40R/r7Yc.R8j.322a3j0x1y1u', 'autorizador', 1),
('operador_1', '$2b$10$a1w.iT72vLd1b7jM33Q6.OrpM3fA40R/r7Yc.R8j.322a3j0x1y1u', 'operador', 1)
ON DUPLICATE KEY UPDATE username=username;

-- 2. Insertar Funcionarios de Prueba (Guardia y Limpieza)
-- RMU basados en la tabla salarial típica de servidores públicos de Ecuador
INSERT INTO funcionarios (cedula, nombres_apellidos, tipo, rmu, estado) VALUES
('1400654321', 'Juan Carlos Perez Avila', 'guardia', 527.00, 1),
('1400987654', 'Maria Elena Chimbo Naula', 'limpieza', 497.00, 1),
('1400123456', 'Segundo Miguel Carchi Gomez', 'guardia', 527.00, 0) -- Funcionario Inactivo de prueba
ON DUPLICATE KEY UPDATE cedula=cedula;

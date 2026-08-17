-- Script de Inicialización de la Base de Datos para el Sistema de Horas Extra - GAD Sucúa

-- 1. Crear Base de Datos (si no existe)
CREATE DATABASE IF NOT EXISTS gad_sucua_horas_extra
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE gad_sucua_horas_extra;

-- 2. Tabla de Usuarios (Para acceso y roles)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'autorizador', 'operador') NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabla de Funcionarios (Personal del GAD de Sucúa)
CREATE TABLE IF NOT EXISTS funcionarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(10) NOT NULL UNIQUE,
    nombres_apellidos VARCHAR(150) NOT NULL,
    tipo ENUM('guardia', 'limpieza') NOT NULL,
    rmu DECIMAL(10, 2) NOT NULL CHECK (rmu > 0),
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cedula (cedula)
) ENGINE=InnoDB;

-- 4. Tabla de Registro de Horas Extra (Auditoría y Cálculos LOSEP)
CREATE TABLE IF NOT EXISTS registro_horas_extra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    funcionario_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tipo_jornada ENUM('suplementaria', 'extraordinaria') NOT NULL,
    horas_calculadas DECIMAL(5, 2) NOT NULL CHECK (horas_calculadas > 0),
    valor_calculado DECIMAL(10, 2) NOT NULL CHECK (valor_calculado >= 0),
    rmu_historico DECIMAL(10, 2) NOT NULL COMMENT 'RMU del funcionario congelado en este registro',
    estado ENUM('pendiente', 'autorizado', 'rechazado') DEFAULT 'pendiente',
    autorizado_por INT NULL,
    fecha_autorizacion DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (autorizado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_fecha (fecha),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- 5. Tabla de Feriados (Calendario dinámico)
CREATE TABLE IF NOT EXISTS feriados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Tabla de Administrativos (Autoridades y firmas)
CREATE TABLE IF NOT EXISTS administrativos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombres_apellidos VARCHAR(150) NOT NULL,
    cargo ENUM('director_administrativo', 'director_finanzas', 'administrador_bienes', 'jefe_recursos') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


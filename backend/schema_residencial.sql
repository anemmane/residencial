-- ======================================================
-- SCHEMA: residencial_db
-- Proyecto: Sistema Residencial
-- Autor: Manu Entz
-- Fecha: 2025-10-14
-- Descripción: Script para crear la base de datos y tablas
-- ======================================================

-- 1️⃣ Crear base de datos
DROP DATABASE IF EXISTS residencial_db;
CREATE DATABASE residencial_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE residencial_db;

-- 2️⃣ Tabla: residencias
CREATE TABLE residencias (
  id_residencia INT AUTO_INCREMENT PRIMARY KEY,
  nombre_familia VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  fecha_registro DATE NOT NULL
);

-- 3️⃣ Tabla: habitantes
CREATE TABLE habitantes (
  id_habitante INT AUTO_INCREMENT PRIMARY KEY,
  id_residencia INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE,
  status ENUM('Viviendo', 'Ausente', 'Ex-residente') DEFAULT 'Viviendo',
  FOREIGN KEY (id_residencia) REFERENCES residencias(id_residencia)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4️⃣ Tabla: pagos_mensuales
CREATE TABLE pagos_mensuales (
  id_pago INT AUTO_INCREMENT PRIMARY KEY,
  id_residencia INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_generacion DATE NOT NULL,
  fecha_limite DATE,
  concepto VARCHAR(200),
  estatus ENUM('Pendiente', 'Pagado', 'Vencido') DEFAULT 'Pendiente',
  linea_captura VARCHAR(100),
  medio_pago ENUM('Efectivo', 'Transferencia', 'En línea', 'Otro') DEFAULT 'Efectivo',
  FOREIGN KEY (id_residencia) REFERENCES residencias(id_residencia)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5️⃣ Tabla: emergencias
CREATE TABLE emergencias (
  id_emergencia INT AUTO_INCREMENT PRIMARY KEY,
  id_residencia INT NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_solicitud DATE NOT NULL,
  status ENUM('En proceso', 'Atendida', 'Cancelada') DEFAULT 'En proceso',
  FOREIGN KEY (id_residencia) REFERENCES residencias(id_residencia)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6️⃣ Tabla: votaciones
CREATE TABLE votaciones (
  id_votacion INT AUTO_INCREMENT PRIMARY KEY,
  id_residencia INT NOT NULL,
  concepto VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  voto ENUM('A favor', 'En contra', 'Abstención') NOT NULL,
  FOREIGN KEY (id_residencia) REFERENCES residencias(id_residencia)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- ======================================================
-- 7️⃣ Datos iniciales (opcional para pruebas)
-- ======================================================

INSERT INTO residencias (nombre_familia, direccion, fecha_registro)
VALUES
('Familia López', 'Calle 1 #45', CURDATE()),
('Familia Ramírez', 'Calle 2 #67', CURDATE()),
('Familia González', 'Calle 3 #89', CURDATE());

INSERT INTO habitantes (id_residencia, nombre, fecha_nacimiento, status)
VALUES
(1, 'Carlos López', '1980-05-14', 'Viviendo'),
(1, 'María López', '1983-07-22', 'Viviendo'),
(2, 'José Ramírez', '1975-10-10', 'Viviendo');

INSERT INTO pagos_mensuales (id_residencia, monto, fecha_generacion, fecha_limite, concepto, estatus, linea_captura, medio_pago)
VALUES
(1, 800.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'Cuota mantenimiento', 'Pendiente', 'LC12345', 'Efectivo'),
(2, 950.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'Mantenimiento jardín', 'Pendiente', 'LC12346', 'Transferencia');

INSERT INTO emergencias (id_residencia, descripcion, fecha_solicitud, status)
VALUES
(1, 'Fuga de agua en la calle principal', CURDATE(), 'En proceso');

INSERT INTO votaciones (id_residencia, concepto, fecha, voto)
VALUES
(1, 'Cambio de portón principal', CURDATE(), 'A favor'),
(2, 'Cambio de portón principal', CURDATE(), 'En contra');

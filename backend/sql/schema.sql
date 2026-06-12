CREATE DATABASE IF NOT EXISTS control_suscripciones
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE control_suscripciones;

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria_id INT NOT NULL,
  sitio_web VARCHAR(255) DEFAULT NULL,
  logo VARCHAR(255) DEFAULT NULL,
  CONSTRAINT fk_servicios_categoria
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS auth_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_auth_tokens_user
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS suscripciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  servicio_id INT DEFAULT NULL,
  user_id INT NOT NULL,
  nombre_personalizado VARCHAR(150) NOT NULL,
  costo DECIMAL(10, 2) NOT NULL,
  frecuencia ENUM('semanal', 'mensual', 'trimestral', 'semestral', 'anual') NOT NULL DEFAULT 'mensual',
  fecha_inicio DATE NOT NULL,
  fecha_proximo_cobro DATE NOT NULL,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_suscripciones_servicio
    FOREIGN KEY (servicio_id) REFERENCES servicios(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_suscripciones_user
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

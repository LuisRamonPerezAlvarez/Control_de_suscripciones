-- =============================================================================
-- CONTROL DE SUSCRIPCIONES - Script completo para MySQL 8+
-- Pegar y ejecutar completo en MySQL Workbench, phpMyAdmin o línea de comandos
-- =============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. BASE DE DATOS
-- -----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS db_equipo_05
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE db_equipo_05;

-- -----------------------------------------------------------------------------
-- 2. ELIMINAR OBJETOS EXISTENTES (orden inverso de dependencias)
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_desactivar_suscripcion;
DROP PROCEDURE IF EXISTS sp_activar_suscripcion;
DROP PROCEDURE IF EXISTS sp_delete_suscripcion;
DROP PROCEDURE IF EXISTS sp_update_suscripcion;
DROP PROCEDURE IF EXISTS sp_create_suscripcion;
DROP PROCEDURE IF EXISTS sp_get_suscripcion_by_id;
DROP PROCEDURE IF EXISTS sp_get_suscripciones;
DROP PROCEDURE IF EXISTS sp_get_servicio_by_id;
DROP PROCEDURE IF EXISTS sp_get_servicios;
DROP PROCEDURE IF EXISTS sp_get_categorias;
DROP PROCEDURE IF EXISTS sp_proximos_cobros;
DROP PROCEDURE IF EXISTS sp_dashboard_resumen;

DROP VIEW IF EXISTS v_proximos_cobros;
DROP VIEW IF EXISTS v_suscripciones_detalle;

DROP FUNCTION IF EXISTS fn_estado_recordatorio;
DROP FUNCTION IF EXISTS fn_dias_hasta_cobro;
DROP FUNCTION IF EXISTS fn_costo_mensual;

DROP TABLE IF EXISTS auth_tokens;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS suscripciones;
DROP TABLE IF EXISTS servicios;
DROP TABLE IF EXISTS categorias;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 3. TABLAS
-- -----------------------------------------------------------------------------

CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_categorias_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria_id INT NOT NULL,
  sitio_web VARCHAR(255) DEFAULT NULL,
  logo VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_servicios_categoria (categoria_id),
  KEY idx_servicios_nombre (nombre),
  CONSTRAINT fk_servicios_categoria
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auth_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_auth_tokens_user_id (user_id),
  INDEX idx_auth_tokens_expires_at (expires_at),
  CONSTRAINT fk_auth_tokens_user
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE suscripciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  servicio_id INT DEFAULT NULL,
  user_id INT NOT NULL,
  nombre_personalizado VARCHAR(150) NOT NULL,
  costo DECIMAL(10, 2) NOT NULL CHECK (costo >= 0),
  frecuencia ENUM('semanal', 'mensual', 'trimestral', 'semestral', 'anual') NOT NULL DEFAULT 'mensual',
  fecha_inicio DATE NOT NULL,
  fecha_proximo_cobro DATE NOT NULL,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_suscripciones_servicio (servicio_id),
  KEY idx_suscripciones_activa (activa),
  KEY idx_suscripciones_proximo_cobro (fecha_proximo_cobro),
  KEY idx_suscripciones_frecuencia (frecuencia),
  KEY idx_suscripciones_user_id (user_id),
  CONSTRAINT fk_suscripciones_servicio
    FOREIGN KEY (servicio_id) REFERENCES servicios(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_suscripciones_user
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. FUNCIONES AUXILIARES
-- -----------------------------------------------------------------------------

DELIMITER $$

CREATE FUNCTION fn_costo_mensual(
  p_costo DECIMAL(10,2),
  p_frecuencia ENUM('semanal','mensual','trimestral','semestral','anual')
) RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  CASE p_frecuencia
    WHEN 'semanal'    THEN RETURN ROUND(p_costo * 4.33, 2);
    WHEN 'mensual'    THEN RETURN p_costo;
    WHEN 'trimestral' THEN RETURN ROUND(p_costo / 3, 2);
    WHEN 'semestral'  THEN RETURN ROUND(p_costo / 6, 2);
    WHEN 'anual'      THEN RETURN ROUND(p_costo / 12, 2);
    ELSE RETURN p_costo;
  END CASE;
END$$

CREATE FUNCTION fn_dias_hasta_cobro(p_fecha DATE) RETURNS INT
DETERMINISTIC
NO SQL
BEGIN
  RETURN DATEDIFF(p_fecha, CURDATE());
END$$

CREATE FUNCTION fn_estado_recordatorio(p_fecha DATE) RETURNS VARCHAR(10)
DETERMINISTIC
NO SQL
BEGIN
  DECLARE v_dias INT;
  SET v_dias = DATEDIFF(p_fecha, CURDATE());
  IF v_dias <= 0 THEN
    RETURN 'rojo';
  ELSEIF v_dias <= 7 THEN
    RETURN 'amarillo';
  ELSE
    RETURN 'verde';
  END IF;
END$$

DELIMITER ;

-- -----------------------------------------------------------------------------
-- 5. VISTAS
-- -----------------------------------------------------------------------------

CREATE VIEW v_suscripciones_detalle AS
SELECT
  s.id,
  s.servicio_id,
  s.nombre_personalizado,
  s.costo,
  s.frecuencia,
  s.fecha_inicio,
  s.fecha_proximo_cobro,
  s.activa,
  sv.nombre AS servicio_nombre,
  c.nombre AS categoria_nombre,
  fn_costo_mensual(s.costo, s.frecuencia) AS costo_mensual,
  fn_dias_hasta_cobro(s.fecha_proximo_cobro) AS dias_restantes,
  fn_estado_recordatorio(s.fecha_proximo_cobro) AS estado_recordatorio
FROM suscripciones s
LEFT JOIN servicios sv ON s.servicio_id = sv.id
LEFT JOIN categorias c ON sv.categoria_id = c.id;

CREATE VIEW v_proximos_cobros AS
SELECT
  id,
  CASE
    WHEN servicio_nombre IS NOT NULL
      THEN CONCAT(servicio_nombre, ' (', nombre_personalizado, ')')
    ELSE nombre_personalizado
  END AS nombre,
  costo,
  frecuencia,
  fecha_proximo_cobro,
  dias_restantes,
  estado_recordatorio
FROM v_suscripciones_detalle
WHERE activa = 1
ORDER BY fecha_proximo_cobro ASC;

-- -----------------------------------------------------------------------------
-- 6. PROCEDIMIENTOS ALMACENADOS
-- -----------------------------------------------------------------------------

DELIMITER $$

-- Dashboard: resumen general
CREATE PROCEDURE sp_dashboard_resumen()
BEGIN
  SELECT
    COUNT(*) AS total_activas,
    ROUND(COALESCE(SUM(fn_costo_mensual(costo, frecuencia)), 0), 2) AS gasto_mensual_total,
    ROUND(COALESCE(SUM(fn_costo_mensual(costo, frecuencia)), 0) * 12, 2) AS gasto_anual_estimado,
    SUM(CASE WHEN fn_dias_hasta_cobro(fecha_proximo_cobro) <= 7 THEN 1 ELSE 0 END) AS proximas_a_vencer
  FROM suscripciones
  WHERE activa = 1;
END$$

-- Dashboard: próximos cobros (top 10)
CREATE PROCEDURE sp_proximos_cobros()
BEGIN
  SELECT
    id,
    nombre,
    costo,
    frecuencia,
    fecha_proximo_cobro,
    dias_restantes,
    estado_recordatorio
  FROM v_proximos_cobros
  LIMIT 10;
END$$

-- Categorías
CREATE PROCEDURE sp_get_categorias()
BEGIN
  SELECT id, nombre
  FROM categorias
  ORDER BY nombre ASC;
END$$

-- Servicios con filtros opcionales
CREATE PROCEDURE sp_get_servicios(
  IN p_busqueda VARCHAR(150),
  IN p_categoria_id INT
)
BEGIN
  SELECT
    s.id,
    s.nombre,
    s.categoria_id,
    s.sitio_web,
    s.logo,
    c.nombre AS categoria_nombre
  FROM servicios s
  INNER JOIN categorias c ON s.categoria_id = c.id
  WHERE (p_busqueda IS NULL OR p_busqueda = '' OR s.nombre LIKE CONCAT('%', p_busqueda, '%'))
    AND (p_categoria_id IS NULL OR p_categoria_id = 0 OR s.categoria_id = p_categoria_id)
  ORDER BY s.nombre ASC;
END$$

CREATE PROCEDURE sp_get_servicio_by_id(IN p_id INT)
BEGIN
  SELECT
    s.id,
    s.nombre,
    s.categoria_id,
    s.sitio_web,
    s.logo,
    c.nombre AS categoria_nombre
  FROM servicios s
  INNER JOIN categorias c ON s.categoria_id = c.id
  WHERE s.id = p_id;
END$$

-- Suscripciones
CREATE PROCEDURE sp_get_suscripciones()
BEGIN
  SELECT *
  FROM v_suscripciones_detalle
  ORDER BY fecha_proximo_cobro ASC;
END$$

CREATE PROCEDURE sp_get_suscripcion_by_id(IN p_id INT)
BEGIN
  SELECT *
  FROM v_suscripciones_detalle
  WHERE id = p_id;
END$$

CREATE PROCEDURE sp_create_suscripcion(
  IN p_servicio_id INT,
  IN p_user_id INT,
  IN p_nombre_personalizado VARCHAR(150),
  IN p_costo DECIMAL(10,2),
  IN p_frecuencia ENUM('semanal','mensual','trimestral','semestral','anual'),
  IN p_fecha_inicio DATE,
  IN p_fecha_proximo_cobro DATE,
  IN p_activa TINYINT
)
BEGIN
  INSERT INTO suscripciones (
    servicio_id, user_id, nombre_personalizado, costo, frecuencia,
    fecha_inicio, fecha_proximo_cobro, activa
  ) VALUES (
    p_servicio_id, p_user_id, p_nombre_personalizado, p_costo, p_frecuencia,
    p_fecha_inicio, p_fecha_proximo_cobro, IFNULL(p_activa, 1)
  );

  SELECT * FROM v_suscripciones_detalle WHERE id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE sp_update_suscripcion(
  IN p_id INT,
  IN p_servicio_id INT,
  IN p_user_id INT,
  IN p_nombre_personalizado VARCHAR(150),
  IN p_costo DECIMAL(10,2),
  IN p_frecuencia ENUM('semanal','mensual','trimestral','semestral','anual'),
  IN p_fecha_inicio DATE,
  IN p_fecha_proximo_cobro DATE,
  IN p_activa TINYINT
)
BEGIN
  UPDATE suscripciones SET
    servicio_id = p_servicio_id,
    user_id = p_user_id,
    nombre_personalizado = p_nombre_personalizado,
    costo = p_costo,
    frecuencia = p_frecuencia,
    fecha_inicio = p_fecha_inicio,
    fecha_proximo_cobro = p_fecha_proximo_cobro,
    activa = IFNULL(p_activa, 1)
  WHERE id = p_id;

  SELECT * FROM v_suscripciones_detalle WHERE id = p_id;
END$$

CREATE PROCEDURE sp_delete_suscripcion(IN p_id INT)
BEGIN
  DELETE FROM suscripciones WHERE id = p_id;
  SELECT ROW_COUNT() AS filas_eliminadas;
END$$

CREATE PROCEDURE sp_activar_suscripcion(IN p_id INT)
BEGIN
  UPDATE suscripciones SET activa = 1 WHERE id = p_id;
  SELECT * FROM v_suscripciones_detalle WHERE id = p_id;
END$$

CREATE PROCEDURE sp_desactivar_suscripcion(IN p_id INT)
BEGIN
  UPDATE suscripciones SET activa = 0 WHERE id = p_id;
  SELECT * FROM v_suscripciones_detalle WHERE id = p_id;
END$$

DELIMITER ;

-- -----------------------------------------------------------------------------
-- 7. DATOS INICIALES (SEED)
-- -----------------------------------------------------------------------------

INSERT INTO categorias (nombre) VALUES
  ('Streaming'),
  ('Música'),
  ('Productividad'),
  ('Gaming'),
  ('Almacenamiento');

INSERT INTO servicios (nombre, categoria_id, sitio_web, logo) VALUES
  ('Netflix',         1, 'https://www.netflix.com', 'https://img.icons8.com/?size=100&id=GJ1x26ZmfZ96&format=png&color=000000'),
  ('Disney+',         1, 'https://www.disneyplus.com', 'https://img.icons8.com/?size=100&id=o7YMV0TFYOgR&format=png&color=000000'),
  ('Spotify',         2, 'https://www.spotify.com', 'https://img.icons8.com/?size=100&id=vzJRN9S0Db0Q&format=png&color=000000'),
  ('Microsoft 365',   3, 'https://www.microsoft.com/microsoft-365', 'https://img.icons8.com/?size=100&id=g7UKWvv49CoI&format=png&color=000000'),
  ('Xbox Game Pass',  4, 'https://www.xbox.com/game-pass', 'https://img.icons8.com/?size=100&id=wlFMPtzt97an&format=png&color=000000'),
  ('Google One',      5, 'https://one.google.com', 'https://img.icons8.com/?size=100&id=EZnRgVqdsVRx&format=png&color=000000'),
  ('HBO Max',         1, 'https://www.max.com', 'https://img.icons8.com/?size=100&id=9tVdlpWe1F9k&format=png&color=000000'),
  ('Apple Music',     2, 'https://music.apple.com', 'https://img.icons8.com/?size=100&id=81TSi6Gqk0tm&format=png&color=000000'),
  ('Notion',          3, 'https://www.notion.so', 'https://img.icons8.com/?size=100&id=uVERmCBZZACL&format=png&color=000000'),
  ('PlayStation Plus',4, 'https://www.playstation.com/plus', 'https://img.icons8.com/?size=100&id=oDphkoWwBm40&format=png&color=000000');

INSERT INTO usuarios (username, password_hash) VALUES
  ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'),
  ('jane',  '27545b395a8e5915b48557d0e26ef3e05e368d0f65ae786a806df38f9f4e3bc5');

INSERT INTO suscripciones (servicio_id, user_id, nombre_personalizado, costo, frecuencia, fecha_inicio, fecha_proximo_cobro, activa) VALUES
  (1,  1, 'Netflix Familiar',    15.99, 'mensual',    '2025-01-15', '2026-06-15', 1),
  (3,  1, 'Spotify Premium',      9.99, 'mensual',    '2025-03-01', CURDATE(),    1),
  (4,  2, 'Office Personal',     99.99, 'anual',      '2025-06-01', '2026-06-01', 1),
  (NULL,2, 'Gimnasio Local',      35.00, 'mensual',    '2025-02-10', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 1),
  (2,  1, 'Disney+ Estándar',     7.99, 'mensual',    '2024-12-01', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 0),
  (NULL,2, 'Revista Digital',     4.99, 'mensual',    '2025-04-01', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 1),
  (5,  1, 'Xbox Game Pass',      12.99, 'mensual',    '2025-05-01', DATE_ADD(CURDATE(), INTERVAL 15 DAY), 1);

-- -----------------------------------------------------------------------------
-- 8. VERIFICACIÓN RÁPIDA
-- -----------------------------------------------------------------------------
SELECT 'Base de datos creada correctamente' AS mensaje;
CALL sp_dashboard_resumen();
CALL sp_get_categorias();
SELECT COUNT(*) AS total_servicios FROM servicios;
SELECT COUNT(*) AS total_suscripciones FROM suscripciones;

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================

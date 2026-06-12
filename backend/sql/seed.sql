USE control_suscripciones;

INSERT INTO categorias (nombre) VALUES
  ('Streaming'),
  ('Música'),
  ('Productividad'),
  ('Gaming'),
  ('Almacenamiento')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO servicios (nombre, categoria_id, sitio_web, logo) VALUES
  ('Netflix', 1, 'https://www.netflix.com', NULL),
  ('Disney+', 1, 'https://www.disneyplus.com', NULL),
  ('Spotify', 2, 'https://www.spotify.com', NULL),
  ('Microsoft 365', 3, 'https://www.microsoft.com/microsoft-365', NULL),
  ('Xbox Game Pass', 4, 'https://www.xbox.com/game-pass', NULL),
  ('Google One', 5, 'https://one.google.com', NULL)
ON DUPLICATE KEY UPDATE
  categoria_id = VALUES(categoria_id),
  sitio_web = VALUES(sitio_web);

INSERT INTO usuarios (username, password_hash) VALUES
  ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'),
  ('jane',  '27545b395a8e5915b48557d0e26ef3e05e368d0f65ae786a806df38f9f4e3bc5')
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash);

INSERT INTO suscripciones (servicio_id, user_id, nombre_personalizado, costo, frecuencia, fecha_inicio, fecha_proximo_cobro, activa) VALUES
  (1, 1, 'Netflix Familiar', 311.80, 'mensual', '2025-01-15', '2026-06-15', 1),
  (3, 1, 'Spotify Premium', 194.80, 'mensual', '2025-03-01', '2026-06-11', 1),
  (4, 2, 'Office Personal', 1949.80, 'anual', '2025-06-01', '2026-06-01', 1),
  (NULL, 2, 'Gimnasio Local', 682.50, 'mensual', '2025-02-10', '2026-06-18', 1),
  (2, 1, 'Disney+ Estándar', 155.80, 'mensual', '2024-12-01', '2026-06-05', 0);

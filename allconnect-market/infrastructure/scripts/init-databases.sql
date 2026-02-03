-- ============================================
-- AllConnect Market - Database Initialization
-- ============================================
-- This script creates all databases, tables, and test data
-- for the AllConnect Market microservices architecture

-- ============================================
-- CREATE DATABASES
-- ============================================

CREATE DATABASE IF NOT EXISTS orders_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS catalog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS customers_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS payments_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS notifications_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS billing_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS security_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS recommendations_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- GRANT PRIVILEGES TO APPLICATION USER
-- ============================================

GRANT ALL PRIVILEGES ON orders_db.* TO 'allconnect_user'@'%';
GRANT ALL PRIVILEGES ON catalog_db.* TO 'allconnect_user'@'%';
GRANT ALL PRIVILEGES ON customers_db.* TO 'allconnect_user'@'%';
GRANT ALL PRIVILEGES ON payments_db.* TO 'allconnect_user'@'%';
GRANT ALL PRIVILEGES ON notifications_db.* TO 'allconnect_user'@'%';
GRANT ALL PRIVILEGES ON billing_db.* TO 'allconnect_user'@'%';
GRANT ALL PRIVILEGES ON security_db.* TO 'allconnect_user'@'%';
GRANT ALL PRIVILEGES ON recommendations_db.* TO 'allconnect_user'@'%';
FLUSH PRIVILEGES;

-- ============================================
-- SECURITY_DB - Users and Authentication
-- ============================================

USE security_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role ENUM('CUSTOMER', 'ADMIN_NEGOCIO', 'ADMIN_CONTENIDO', 'ADMIN_IT', 'ADMIN_OPERACIONES') NOT NULL DEFAULT 'CUSTOMER',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    enabled BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Test users with BCrypt hashed passwords (password: "password123" for all)
-- BCrypt hash for "password123": $2a$10$AqX6QaZCwuDmKgdG3lyfi.0AEg69mRNlQRXfmf8HSrJTLg4bU44uW
INSERT INTO users (email, password_hash, first_name, last_name, role, active, enabled, email_verified) VALUES
('cliente@test.com', '$2a$10$AqX6QaZCwuDmKgdG3lyfi.0AEg69mRNlQRXfmf8HSrJTLg4bU44uW', 'Juan', 'Cliente', 'CUSTOMER', TRUE, TRUE, TRUE),
('cliente2@test.com', '$2a$10$AqX6QaZCwuDmKgdG3lyfi.0AEg69mRNlQRXfmf8HSrJTLg4bU44uW', 'Maria', 'Compradora', 'CUSTOMER', TRUE, TRUE, TRUE),
('admin.negocio@test.com', '$2a$10$AqX6QaZCwuDmKgdG3lyfi.0AEg69mRNlQRXfmf8HSrJTLg4bU44uW', 'Carlos', 'Negocio', 'ADMIN_NEGOCIO', TRUE, TRUE, TRUE),
('admin.contenido@test.com', '$2a$10$AqX6QaZCwuDmKgdG3lyfi.0AEg69mRNlQRXfmf8HSrJTLg4bU44uW', 'Ana', 'Contenido', 'ADMIN_CONTENIDO', TRUE, TRUE, TRUE),
('admin.it@test.com', '$2a$10$AqX6QaZCwuDmKgdG3lyfi.0AEg69mRNlQRXfmf8HSrJTLg4bU44uW', 'Pedro', 'TI', 'ADMIN_IT', TRUE, TRUE, TRUE),
('admin.operaciones@test.com', '$2a$10$AqX6QaZCwuDmKgdG3lyfi.0AEg69mRNlQRXfmf8HSrJTLg4bU44uW', 'Laura', 'Operaciones', 'ADMIN_OPERACIONES', TRUE, TRUE, TRUE);

-- ============================================
-- CUSTOMERS_DB - Customer Profiles
-- ============================================

USE customers_db;

CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    profile_image_url VARCHAR(500),
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    label VARCHAR(50) DEFAULT 'Casa',
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Costa Rica',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS wishlist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (customer_id, product_id),
    INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB;

-- Test customers (linked to security_db users)
INSERT INTO customers (user_id, email, first_name, last_name, phone, date_of_birth) VALUES
(1, 'cliente@test.com', 'Juan', 'Cliente', '+506 8888-1111', '1990-05-15'),
(2, 'cliente2@test.com', 'Maria', 'Compradora', '+506 8888-2222', '1985-08-22');

INSERT INTO addresses (customer_id, label, street_address, city, state, postal_code, is_default) VALUES
(1, 'Casa', 'Calle Principal 123', 'San José', 'San José', '10101', TRUE),
(1, 'Oficina', 'Avenida Central 456', 'San José', 'San José', '10102', FALSE),
(2, 'Casa', 'Barrio Los Ángeles 789', 'Heredia', 'Heredia', '40101', TRUE);

-- ============================================
-- CATALOG_DB - Products and Categories
-- ============================================

USE catalog_db;

CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id BIGINT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_parent_id (parent_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(12,2) NOT NULL,
    compare_at_price DECIMAL(12,2),
    cost DECIMAL(12,2),
    product_type ENUM('PHYSICAL', 'SERVICE', 'SUBSCRIPTION') NOT NULL,
    category_id BIGINT,
    provider_type ENUM('REST', 'SOAP', 'GRPC') NOT NULL,
    provider_product_id VARCHAR(100),
    stock INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 10,
    weight DECIMAL(8,2),
    dimensions VARCHAR(50),
    image_url VARCHAR(500),
    gallery_urls JSON,
    attributes JSON,
    tags JSON,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category_id (category_id),
    INDEX idx_product_type (product_type),
    INDEX idx_provider_type (provider_type),
    INDEX idx_is_active (is_active),
    INDEX idx_is_featured (is_featured),
    FULLTEXT INDEX idx_search (name, description)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB;

-- Categories
INSERT INTO categories (id, name, description, image_url) VALUES
(1, 'Electrónica', 'Productos electrónicos y gadgets', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500'),
(2, 'Ropa y Accesorios', 'Moda y complementos', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500'),
(3, 'Salud y Bienestar', 'Servicios de salud y bienestar', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'),
(4, 'Servicios Profesionales', 'Consultorías y asesorías', 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=500'),
(5, 'Entretenimiento Digital', 'Streaming y contenido digital', 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500'),
(6, 'Educación', 'Cursos y contenido educativo', 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500'),
(7, 'Hogar y Jardín', 'Productos para el hogar', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500'),
(8, 'Deportes', 'Artículos deportivos y fitness', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500');

-- Products - Physical (REST Provider)
INSERT INTO products (sku, name, description, short_description, price, compare_at_price, product_type, category_id, provider_type, provider_product_id, stock, image_url, is_featured, rating_average, rating_count) VALUES
('ELEC-LAPTOP-001', 'Laptop Gaming XPS 15', 'Laptop de alto rendimiento para gaming y trabajo profesional. Procesador Intel Core i9, 32GB RAM, 1TB SSD NVMe, NVIDIA RTX 4070. Pantalla 15.6" 4K OLED. Incluye garantía de 2 años.', 'Laptop gaming de alto rendimiento con RTX 4070', 1299.99, 1499.99, 'PHYSICAL', 1, 'REST', 'REST-001', 50, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500', TRUE, 4.8, 127),
('ELEC-PHONE-001', 'Smartphone Galaxy S24 Ultra', 'El smartphone más avanzado de Samsung. Pantalla Dynamic AMOLED 6.8", 200MP cámara, S Pen incluido, 512GB almacenamiento, 12GB RAM. Batería de 5000mAh con carga rápida 45W.', 'Smartphone Samsung flagship con S Pen', 899.99, 999.99, 'PHYSICAL', 1, 'REST', 'REST-002', 100, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500', TRUE, 4.7, 89),
('ELEC-AUDIO-001', 'Audífonos Bluetooth Pro ANC', 'Audífonos inalámbricos premium con cancelación activa de ruido. 40 horas de batería, audio Hi-Res, Bluetooth 5.3. Estuche de carga incluido.', 'Audífonos con cancelación de ruido premium', 199.99, 249.99, 'PHYSICAL', 1, 'REST', 'REST-003', 200, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', FALSE, 4.6, 234),
('ELEC-WATCH-001', 'Smartwatch Pro Series 8', 'Reloj inteligente con monitoreo de salud avanzado. GPS integrado, resistente al agua 50m, batería de 7 días. Compatible con iOS y Android.', 'Smartwatch con GPS y monitor de salud', 349.99, 399.99, 'PHYSICAL', 1, 'REST', 'REST-004', 75, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', TRUE, 4.5, 156),
('CLOTH-JACKET-001', 'Chaqueta Impermeable Adventure', 'Chaqueta técnica impermeable y transpirable. Ideal para senderismo y actividades outdoor. Capucha ajustable, múltiples bolsillos.', 'Chaqueta impermeable para outdoor', 129.99, 159.99, 'PHYSICAL', 2, 'REST', 'REST-005', 120, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', FALSE, 4.4, 67),
('HOME-COFFEE-001', 'Cafetera Espresso Automática', 'Máquina de espresso con molinillo integrado. 15 bares de presión, vaporizador de leche, pantalla táctil. Prepara cappuccino y latte automáticamente.', 'Cafetera espresso con molinillo integrado', 449.99, 549.99, 'PHYSICAL', 7, 'REST', 'REST-006', 40, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500', TRUE, 4.9, 203);

-- Products - Services (SOAP Provider)
INSERT INTO products (sku, name, description, short_description, price, product_type, category_id, provider_type, provider_product_id, stock, image_url, rating_average, rating_count) VALUES
('SERV-MED-001', 'Consulta Médica General', 'Consulta presencial con médico general certificado. Duración 30 minutos. Incluye receta digital y seguimiento por 7 días. Clínica ubicada en San José centro.', 'Consulta con médico general - 30 min', 50.00, 'SERVICE', 3, 'SOAP', 'SOAP-001', 999, 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500', 4.8, 312),
('SERV-LEGAL-001', 'Asesoría Legal 1 Hora', 'Consulta con abogado especializado en derecho civil y mercantil. Revisión de documentos, contratos, consultas generales. Asesoría presencial o virtual.', 'Asesoría legal especializada - 1 hora', 150.00, 'SERVICE', 4, 'SOAP', 'SOAP-002', 999, 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500', 4.6, 89),
('SERV-YOGA-001', 'Clase de Yoga Personal', 'Sesión privada de yoga con instructor certificado. 1 hora de duración. Adaptada a tu nivel y objetivos. Incluye esterilla y accesorios.', 'Clase privada de yoga - 1 hora', 35.00, 'SERVICE', 3, 'SOAP', 'SOAP-003', 999, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500', 4.9, 178),
('SERV-NUTRI-001', 'Consulta Nutricional', 'Evaluación nutricional completa con nutricionista certificado. Plan alimenticio personalizado, seguimiento mensual incluido.', 'Consulta nutricional con plan personalizado', 75.00, 'SERVICE', 3, 'SOAP', 'SOAP-004', 999, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500', 4.7, 145),
('SERV-PHOTO-001', 'Sesión Fotográfica Profesional', 'Sesión de fotos de 2 horas con fotógrafo profesional. Incluye 20 fotos editadas en alta resolución. Ideal para retratos, eventos o productos.', 'Sesión fotográfica 2 horas + 20 fotos', 120.00, 'SERVICE', 4, 'SOAP', 'SOAP-005', 999, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500', 4.8, 67),
('SERV-MASSAGE-001', 'Masaje Terapéutico', 'Masaje terapéutico de cuerpo completo con terapeuta certificado. 60 minutos. Técnicas de relajación y alivio de tensión muscular.', 'Masaje terapéutico completo - 60 min', 65.00, 'SERVICE', 3, 'SOAP', 'SOAP-006', 999, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500', 4.9, 234);

-- Products - Subscriptions (gRPC Provider)
INSERT INTO products (sku, name, description, short_description, price, product_type, category_id, provider_type, provider_product_id, stock, image_url, is_featured, rating_average, rating_count, attributes) VALUES
('SUBS-STREAM-001', 'Plan Streaming Premium', 'Acceso ilimitado a películas, series y documentales. Calidad 4K HDR, hasta 4 pantallas simultáneas. Contenido nuevo cada semana. Sin anuncios.', 'Streaming ilimitado 4K - 4 pantallas', 14.99, 'SUBSCRIPTION', 5, 'GRPC', 'GRPC-001', 999, 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500', TRUE, 4.7, 1523, '{"billing_cycle": "monthly", "screens": 4, "quality": "4K HDR"}'),
('SUBS-SOFT-001', 'Software Productividad Pro', 'Suite completa de herramientas de productividad. Incluye procesador de texto, hojas de cálculo, presentaciones, almacenamiento en la nube 1TB.', 'Suite productividad + 1TB nube', 9.99, 'SUBSCRIPTION', 5, 'GRPC', 'GRPC-002', 999, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500', FALSE, 4.5, 892, '{"billing_cycle": "monthly", "storage": "1TB", "apps": ["docs", "sheets", "slides"]}'),
('SUBS-EDU-001', 'Contenido Educativo Ilimitado', 'Acceso a más de 5000 cursos en línea. Certificados incluidos, aprendizaje a tu ritmo. Categorías: tecnología, negocios, idiomas, diseño.', 'Acceso ilimitado a cursos online', 19.99, 'SUBSCRIPTION', 6, 'GRPC', 'GRPC-003', 999, 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500', TRUE, 4.8, 678, '{"billing_cycle": "monthly", "courses": "5000+", "certificates": true}'),
('SUBS-MUSIC-001', 'Música Premium Sin Anuncios', 'Streaming de música sin límites ni anuncios. Más de 80 millones de canciones, podcasts exclusivos, descarga offline, audio lossless.', 'Música ilimitada sin anuncios', 9.99, 'SUBSCRIPTION', 5, 'GRPC', 'GRPC-004', 999, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500', FALSE, 4.6, 2341, '{"billing_cycle": "monthly", "songs": "80M+", "offline": true}'),
('SUBS-FITNESS-001', 'App Fitness Premium', 'Planes de entrenamiento personalizados, seguimiento de progreso, nutrición. Acceso a clases en vivo y biblioteca de ejercicios.', 'Fitness personalizado + clases en vivo', 12.99, 'SUBSCRIPTION', 3, 'GRPC', 'GRPC-005', 999, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500', FALSE, 4.4, 456, '{"billing_cycle": "monthly", "live_classes": true, "personal_trainer": "AI"}'),
('SUBS-NEWS-001', 'Noticias Premium Digital', 'Acceso ilimitado a noticias premium de los principales medios. Sin anuncios, newsletters exclusivos, archivo histórico completo.', 'Noticias premium sin anuncios', 7.99, 'SUBSCRIPTION', 5, 'GRPC', 'GRPC-006', 999, 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500', FALSE, 4.3, 234, '{"billing_cycle": "monthly", "sources": "50+", "archive": "unlimited"}');

-- Sample reviews
INSERT INTO product_reviews (product_id, customer_id, rating, title, comment, is_verified_purchase) VALUES
(1, 1, 5, 'Excelente laptop', 'Superó mis expectativas. El rendimiento es increíble para gaming y trabajo.', TRUE),
(1, 2, 4, 'Muy buena pero cara', 'Gran producto pero el precio es elevado. Vale la pena si buscas calidad.', TRUE),
(2, 1, 5, 'El mejor smartphone', 'La cámara es espectacular y la batería dura todo el día.', TRUE),
(7, 1, 5, 'Doctor muy profesional', 'Excelente atención, muy recomendado.', TRUE),
(13, 2, 5, 'Cursos de calidad', 'He aprendido muchísimo con esta plataforma.', TRUE);

-- ============================================
-- ORDERS_DB - Orders and Saga
-- ============================================

USE orders_db;

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'CREATED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'PROVIDER_PENDING', 'PROVIDER_CONFIRMED', 'PROVIDER_FAILED', 'COMPLETED') DEFAULT 'PENDING',
    order_type ENUM('PHYSICAL', 'SERVICE', 'SUBSCRIPTION', 'MIXED') NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    shipping_address_id BIGINT,
    shipping_address JSON,
    billing_address JSON,
    notes TEXT,
    provider_order_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_order_number (order_number),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_sku VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_type ENUM('PHYSICAL', 'SERVICE', 'SUBSCRIPTION') NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    provider_type ENUM('REST', 'SOAP', 'GRPC') NOT NULL,
    provider_item_id VARCHAR(100),
    reservation_date DATETIME,
    reservation_code VARCHAR(50),
    subscription_start DATE,
    subscription_end DATE,
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    comment TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB;

-- Saga orchestration tables
CREATE TABLE IF NOT EXISTS saga_instances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    saga_id VARCHAR(100) NOT NULL UNIQUE,
    saga_type VARCHAR(50) NOT NULL,
    order_id BIGINT,
    current_step VARCHAR(50) NOT NULL,
    status ENUM('STARTED', 'IN_PROGRESS', 'COMPLETED', 'COMPENSATING', 'FAILED') DEFAULT 'STARTED',
    payload JSON,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_saga_id (saga_id),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS saga_steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    saga_id VARCHAR(100) NOT NULL,
    step_name VARCHAR(50) NOT NULL,
    step_order INT NOT NULL,
    status ENUM('PENDING', 'EXECUTING', 'COMPLETED', 'FAILED', 'COMPENSATED') DEFAULT 'PENDING',
    request_payload JSON,
    response_payload JSON,
    error_message TEXT,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    INDEX idx_saga_id (saga_id)
) ENGINE=InnoDB;

-- Sample orders for testing
INSERT INTO orders (order_number, customer_id, status, order_type, subtotal, tax, shipping_cost, total, shipping_address) VALUES
('ORD-2024-0001', 1, 'DELIVERED', 'PHYSICAL', 1299.99, 169.00, 15.00, 1483.99, '{"street": "Calle Principal 123", "city": "San José", "country": "Costa Rica"}'),
('ORD-2024-0002', 1, 'CONFIRMED', 'SERVICE', 50.00, 6.50, 0, 56.50, NULL),
('ORD-2024-0003', 2, 'PROCESSING', 'SUBSCRIPTION', 14.99, 1.95, 0, 16.94, NULL);

INSERT INTO order_items (order_id, product_id, product_sku, product_name, product_type, quantity, unit_price, total_price, provider_type, status) VALUES
(1, 1, 'ELEC-LAPTOP-001', 'Laptop Gaming XPS 15', 'PHYSICAL', 1, 1299.99, 1299.99, 'REST', 'CONFIRMED'),
(2, 7, 'SERV-MED-001', 'Consulta Médica General', 'SERVICE', 1, 50.00, 50.00, 'SOAP', 'CONFIRMED'),
(3, 13, 'SUBS-STREAM-001', 'Plan Streaming Premium', 'SUBSCRIPTION', 1, 14.99, 14.99, 'GRPC', 'CONFIRMED');

INSERT INTO order_status_history (order_id, status, comment) VALUES
(1, 'PENDING', 'Orden creada'),
(1, 'CONFIRMED', 'Pago confirmado'),
(1, 'PROCESSING', 'Preparando envío'),
(1, 'SHIPPED', 'Enviado con tracking: CR123456789'),
(1, 'DELIVERED', 'Entregado al cliente');

-- ============================================
-- PAYMENTS_DB - Payments and Transactions
-- ============================================

USE payments_db;

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(100) NOT NULL UNIQUE,
    order_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED') DEFAULT 'PENDING',
    payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CASH') NOT NULL,
    payment_type ENUM('ONE_TIME', 'RECURRING', 'REFUND') DEFAULT 'ONE_TIME',
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    transaction_id VARCHAR(100),
    gateway_response JSON,
    error_message TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_payment_id (payment_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refunds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    refund_id VARCHAR(100) NOT NULL UNIQUE,
    payment_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    reason VARCHAR(255),
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    INDEX idx_payment_id (payment_id)
) ENGINE=InnoDB;

-- Sample payments
INSERT INTO payments (payment_id, order_id, customer_id, amount, status, payment_method, card_last_four, card_brand, transaction_id) VALUES
('PAY-2024-0001', 1, 1, 1483.99, 'COMPLETED', 'CREDIT_CARD', '4242', 'VISA', 'TXN-MOCK-001'),
('PAY-2024-0002', 2, 1, 56.50, 'COMPLETED', 'CREDIT_CARD', '4242', 'VISA', 'TXN-MOCK-002'),
('PAY-2024-0003', 3, 2, 16.94, 'COMPLETED', 'CREDIT_CARD', '5555', 'MASTERCARD', 'TXN-MOCK-003');

-- ============================================
-- NOTIFICATIONS_DB - Notifications and Templates
-- ============================================

USE notifications_db;

CREATE TABLE IF NOT EXISTS notification_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    channel ENUM('EMAIL', 'SMS', 'PUSH') NOT NULL,
    subject VARCHAR(255),
    body_template TEXT NOT NULL,
    variables JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_channel (channel)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_id VARCHAR(100) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    template_code VARCHAR(50),
    channel ENUM('EMAIL', 'SMS', 'PUSH') NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    status ENUM('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED') DEFAULT 'PENDING',
    error_message TEXT,
    metadata JSON,
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_channel (channel)
) ENGINE=InnoDB;

-- Notification templates
INSERT INTO notification_templates (code, name, channel, subject, body_template, variables) VALUES
('WELCOME_EMAIL', 'Email de Bienvenida', 'EMAIL', 'Bienvenido a AllConnect Market',
'Hola {{first_name}},\n\nBienvenido a AllConnect Market. Tu cuenta ha sido creada exitosamente.\n\nComienza a explorar nuestro catálogo de productos, servicios y suscripciones.\n\nSaludos,\nEl equipo de AllConnect',
'["first_name", "email"]'),
('ORDER_CONFIRMATION', 'Confirmación de Orden', 'EMAIL', 'Tu orden #{{order_number}} ha sido confirmada',
'Hola {{first_name}},\n\nTu orden #{{order_number}} ha sido confirmada.\n\nTotal: ${{total}}\n\nGracias por tu compra.\n\nSaludos,\nAllConnect Market',
'["first_name", "order_number", "total"]'),
('ORDER_SHIPPED', 'Orden Enviada', 'EMAIL', 'Tu orden #{{order_number}} ha sido enviada',
'Hola {{first_name}},\n\nTu orden #{{order_number}} ha sido enviada.\n\nNúmero de tracking: {{tracking_number}}\n\nSaludos,\nAllConnect Market',
'["first_name", "order_number", "tracking_number"]'),
('PAYMENT_RECEIVED', 'Pago Recibido', 'EMAIL', 'Hemos recibido tu pago',
'Hola {{first_name}},\n\nHemos recibido tu pago de ${{amount}} para la orden #{{order_number}}.\n\nSaludos,\nAllConnect Market',
'["first_name", "amount", "order_number"]'),
('SERVICE_REMINDER', 'Recordatorio de Servicio', 'EMAIL', 'Recordatorio: Tu cita es mañana',
'Hola {{first_name}},\n\nTe recordamos que tienes una cita programada:\n\nServicio: {{service_name}}\nFecha: {{date}}\nHora: {{time}}\n\nSaludos,\nAllConnect Market',
'["first_name", "service_name", "date", "time"]'),
('SUBSCRIPTION_ACTIVATED', 'Suscripción Activada', 'EMAIL', 'Tu suscripción ha sido activada',
'Hola {{first_name}},\n\nTu suscripción a {{subscription_name}} ha sido activada.\n\nYa puedes disfrutar de todos los beneficios.\n\nSaludos,\nAllConnect Market',
'["first_name", "subscription_name"]');

-- Sample notifications
INSERT INTO notifications (notification_id, customer_id, template_code, channel, recipient, subject, body, status, sent_at) VALUES
('NOTIF-001', 1, 'WELCOME_EMAIL', 'EMAIL', 'cliente@test.com', 'Bienvenido a AllConnect Market', 'Hola Juan, Bienvenido a AllConnect Market...', 'DELIVERED', NOW()),
('NOTIF-002', 1, 'ORDER_CONFIRMATION', 'EMAIL', 'cliente@test.com', 'Tu orden #ORD-2024-0001 ha sido confirmada', 'Hola Juan, Tu orden ha sido confirmada...', 'DELIVERED', NOW());

-- ============================================
-- BILLING_DB - Invoices and Billing
-- ============================================

USE billing_db;

CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    order_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_tax_id VARCHAR(50),
    billing_address JSON,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 13.00,
    tax_amount DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('DRAFT', 'ISSUED', 'PAID', 'CANCELLED', 'OVERDUE') DEFAULT 'DRAFT',
    issued_date DATE,
    due_date DATE,
    paid_date DATE,
    notes TEXT,
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_invoice_number (invoice_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS invoice_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_invoice_id (invoice_id)
) ENGINE=InnoDB;

-- Sample invoices
INSERT INTO invoices (invoice_number, order_id, customer_id, customer_name, customer_email, subtotal, tax_rate, tax_amount, total, status, issued_date, due_date, paid_date) VALUES
('INV-2024-0001', 1, 1, 'Juan Cliente', 'cliente@test.com', 1299.99, 13.00, 169.00, 1483.99, 'PAID', '2024-01-15', '2024-02-15', '2024-01-15'),
('INV-2024-0002', 2, 1, 'Juan Cliente', 'cliente@test.com', 50.00, 13.00, 6.50, 56.50, 'PAID', '2024-01-20', '2024-02-20', '2024-01-20');

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price) VALUES
(1, 'Laptop Gaming XPS 15', 1, 1299.99, 1299.99),
(1, 'Envío express', 1, 15.00, 15.00),
(2, 'Consulta Médica General', 1, 50.00, 50.00);

-- ============================================
-- RECOMMENDATIONS_DB - ML Recommendations
-- ============================================

USE recommendations_db;

CREATE TABLE IF NOT EXISTS user_interactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    interaction_type ENUM('VIEW', 'CLICK', 'ADD_TO_CART', 'PURCHASE', 'WISHLIST', 'REVIEW') NOT NULL,
    session_id VARCHAR(100),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customer_id),
    INDEX idx_product_id (product_id),
    INDEX idx_interaction_type (interaction_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_similarity (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    similar_product_id BIGINT NOT NULL,
    similarity_score DECIMAL(5,4) NOT NULL,
    algorithm VARCHAR(50) DEFAULT 'collaborative_filtering',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_pair (product_id, similar_product_id),
    INDEX idx_product_id (product_id),
    INDEX idx_similarity_score (similarity_score DESC)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trending_products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    category_id BIGINT,
    trend_score DECIMAL(10,4) NOT NULL,
    view_count INT DEFAULT 0,
    purchase_count INT DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_id (product_id),
    INDEX idx_trend_score (trend_score DESC),
    INDEX idx_period (period_start, period_end)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL UNIQUE,
    preferred_categories JSON,
    preferred_product_types JSON,
    price_range_min DECIMAL(12,2),
    price_range_max DECIMAL(12,2),
    brand_preferences JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB;

-- Sample interactions
INSERT INTO user_interactions (customer_id, product_id, interaction_type, session_id) VALUES
(1, 1, 'VIEW', 'sess-001'),
(1, 1, 'ADD_TO_CART', 'sess-001'),
(1, 1, 'PURCHASE', 'sess-001'),
(1, 2, 'VIEW', 'sess-002'),
(1, 3, 'VIEW', 'sess-002'),
(1, 13, 'VIEW', 'sess-003'),
(1, 13, 'PURCHASE', 'sess-003'),
(2, 7, 'VIEW', 'sess-004'),
(2, 7, 'PURCHASE', 'sess-004'),
(2, 8, 'VIEW', 'sess-005');

-- Product similarities
INSERT INTO product_similarity (product_id, similar_product_id, similarity_score) VALUES
(1, 2, 0.8500),
(1, 3, 0.7200),
(1, 4, 0.6800),
(2, 1, 0.8500),
(2, 3, 0.9100),
(2, 4, 0.8900),
(7, 8, 0.7500),
(7, 9, 0.6200),
(13, 14, 0.9200),
(13, 15, 0.8800);

-- Trending products
INSERT INTO trending_products (product_id, category_id, trend_score, view_count, purchase_count, period_start, period_end) VALUES
(1, 1, 95.5000, 1523, 127, CURDATE() - INTERVAL 7 DAY, CURDATE()),
(2, 1, 92.3000, 1234, 89, CURDATE() - INTERVAL 7 DAY, CURDATE()),
(13, 5, 88.7000, 2341, 156, CURDATE() - INTERVAL 7 DAY, CURDATE()),
(7, 3, 85.2000, 890, 312, CURDATE() - INTERVAL 7 DAY, CURDATE()),
(4, 1, 82.1000, 756, 156, CURDATE() - INTERVAL 7 DAY, CURDATE());

-- User preferences
INSERT INTO user_preferences (customer_id, preferred_categories, preferred_product_types, price_range_min, price_range_max) VALUES
(1, '[1, 5]', '["PHYSICAL", "SUBSCRIPTION"]', 50.00, 1500.00),
(2, '[3, 5, 6]', '["SERVICE", "SUBSCRIPTION"]', 10.00, 200.00);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify all databases exist
SELECT SCHEMA_NAME as 'Database' FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME IN ('orders_db', 'catalog_db', 'customers_db', 'payments_db', 'notifications_db', 'billing_db', 'security_db', 'recommendations_db');

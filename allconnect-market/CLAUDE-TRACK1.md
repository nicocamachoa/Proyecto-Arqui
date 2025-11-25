# Track 1: Infrastructure + Platform + Observability

## TU MISIÓN

Eres responsable de TODA la infraestructura. Sin ti, los otros tracks no pueden funcionar. Tu trabajo es la base de todo el sistema.

**Lee primero**: CLAUDE.md y TRACKS_DIVISION.md

---

## CHECKLIST DE TAREAS

Actualiza este checklist frecuentemente marcando con [x] lo completado:

### Fase 1: Infraestructura Base (Horas 0-2)

#### Docker Compose Básico
- [ ] Crear docker-compose.yml con estructura base
- [ ] MySQL 8.0 funcionando en puerto 3306
- [ ] Redis 7 funcionando en puerto 6379
- [ ] Verificar conectividad entre contenedores
- [ ] Crear scripts de inicialización de BD

#### Bases de Datos
- [ ] Schema `orders_db` creado
- [ ] Schema `catalog_db` creado
- [ ] Schema `customers_db` creado
- [ ] Schema `payments_db` creado
- [ ] Schema `notifications_db` creado
- [ ] Schema `billing_db` creado
- [ ] Schema `security_db` creado
- [ ] Schema `recommendations_db` creado
- [ ] Usuario de aplicación creado con permisos

#### Datos Iniciales
- [ ] Script SQL con usuarios de prueba cargado
- [ ] Script SQL con categorías cargado
- [ ] Script SQL con productos de ejemplo cargado
- [ ] Verificar que datos existen ejecutando queries

### Fase 2: Mensajería (Horas 2-3)

#### Kafka (KRaft mode)
- [ ] Kafka broker funcionando en puerto 9092
- [ ] Topics creados: order-events, payment-events, notification-events
- [ ] Verificar productor/consumidor de prueba
- [ ] UI de Kafka configurada (opcional: kafka-ui)

#### RabbitMQ
- [ ] RabbitMQ funcionando en puertos 5672/15672
- [ ] Management UI accesible
- [ ] Exchanges y queues para notificaciones creados
- [ ] Verificar conexión de prueba

### Fase 3: Platform Services (Horas 3-5)

#### Eureka Server
- [ ] Proyecto Spring Boot creado
- [ ] Configuración de Eureka Server
- [ ] Funcionando en puerto 8761
- [ ] Dashboard accesible en http://localhost:8761
- [ ] Verificar que acepta registros de servicios

#### API Gateway (Spring Cloud Gateway)
- [ ] Proyecto Spring Boot creado
- [ ] Registrado en Eureka
- [ ] Funcionando en puerto 8080
- [ ] Rutas configuradas para TODOS los servicios:
  - [ ] /api/customers/** → localhost:8093
  - [ ] /api/catalog/** → localhost:8092
  - [ ] /api/orders/** → localhost:8091
  - [ ] /api/payments/** → localhost:8094
  - [ ] /api/notifications/** → localhost:8095
  - [ ] /api/billing/** → localhost:8096
  - [ ] /api/security/** → localhost:8097
  - [ ] /api/recommendations/** → localhost:8098
  - [ ] /api/integration/** → localhost:8085
- [ ] CORS configurado para frontend
- [ ] Rate limiting básico (opcional)
- [ ] Health endpoint funcionando

#### MailDev (Email Testing)
- [ ] MailDev funcionando en puertos 1080 (UI) / 1025 (SMTP)
- [ ] UI accesible en http://localhost:1080
- [ ] Verificar envío de email de prueba

### Fase 4: Observabilidad (Horas 5-7)

#### Prometheus
- [ ] Prometheus funcionando en puerto 9090
- [ ] Configuración para scrapear todos los servicios
- [ ] Métricas básicas visibles
- [ ] Alertas básicas configuradas (opcional)

#### Grafana
- [ ] Grafana funcionando en puerto 3000
- [ ] Datasource de Prometheus configurado
- [ ] Dashboard básico con:
  - [ ] Estado de servicios (up/down)
  - [ ] Requests por segundo
  - [ ] Latencia promedio
  - [ ] Errores por servicio

#### Jaeger
- [ ] Jaeger funcionando en puerto 16686
- [ ] UI accesible
- [ ] Configuración de tracing para servicios

### Fase 5: Kubernetes (Horas 7-9)

#### Namespace y Configuración
- [ ] Namespace `allconnect` creado
- [ ] ConfigMaps creados
- [ ] Secrets creados (DB credentials, JWT secret)

#### Deployments de Infraestructura
- [ ] MySQL Deployment + Service + PVC
- [ ] Redis Deployment + Service
- [ ] Kafka Deployment + Service
- [ ] RabbitMQ Deployment + Service

#### Platform en K8s
- [ ] Eureka Deployment + Service
- [ ] Gateway Deployment + Service
- [ ] Ingress configurado

#### Verificación K8s
- [ ] `kubectl get pods -n allconnect` muestra todo Running
- [ ] Servicios accesibles via NodePort o Ingress
- [ ] Logs accesibles via `kubectl logs`

### Fase 6: Soporte e Integración (Horas 9-12)

- [ ] Ayudar a otros tracks con problemas de infra
- [ ] Optimizar configuraciones
- [ ] Debugging de conectividad
- [ ] Pruebas E2E del flujo completo
- [ ] Documentar problemas encontrados

---

## ARCHIVOS A CREAR

### docker-compose.yml (ubicación: /infrastructure/)
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_USER: allconnect
      MYSQL_PASSWORD: allconnect123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  kafka:
    image: bitnami/kafka:latest
    environment:
      - KAFKA_CFG_NODE_ID=0
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@kafka:9093
      - KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER
      - KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE=true
    ports:
      - "9092:9092"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: allconnect
      RABBITMQ_DEFAULT_PASS: allconnect123

  maildev:
    image: maildev/maildev
    ports:
      - "1080:1080"
      - "1025:1025"

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"  # 3001 para no conflicto con frontend
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

  jaeger:
    image: jaegertracing/all-in-one
    ports:
      - "16686:16686"
      - "14268:14268"

volumes:
  mysql_data:
  grafana_data:
```

### init-db.sql (ubicación: /infrastructure/scripts/)
```sql
-- Crear bases de datos
CREATE DATABASE IF NOT EXISTS orders_db;
CREATE DATABASE IF NOT EXISTS catalog_db;
CREATE DATABASE IF NOT EXISTS customers_db;
CREATE DATABASE IF NOT EXISTS payments_db;
CREATE DATABASE IF NOT EXISTS notifications_db;
CREATE DATABASE IF NOT EXISTS billing_db;
CREATE DATABASE IF NOT EXISTS security_db;
CREATE DATABASE IF NOT EXISTS recommendations_db;

-- Dar permisos
GRANT ALL PRIVILEGES ON *.* TO 'allconnect'@'%';
FLUSH PRIVILEGES;

-- Datos iniciales en security_db (usuarios de prueba)
USE security_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, password_hash, role) VALUES
('cliente@test.com', '$2a$10$hashedpassword123', 'CUSTOMER'),
('admin.negocio@test.com', '$2a$10$hashedpassword123', 'ADMIN_NEGOCIO'),
('admin.contenido@test.com', '$2a$10$hashedpassword123', 'ADMIN_CONTENIDO'),
('admin.it@test.com', '$2a$10$hashedpassword123', 'ADMIN_IT'),
('admin.operaciones@test.com', '$2a$10$hashedpassword123', 'ADMIN_OPERACIONES');

-- Datos iniciales en catalog_db
USE catalog_db;

CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    type ENUM('PHYSICAL', 'SERVICE', 'SUBSCRIPTION') NOT NULL,
    category_id BIGINT,
    provider_type ENUM('REST', 'SOAP', 'GRPC') NOT NULL,
    stock INT DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name, description) VALUES
('Electrónica', 'Productos electrónicos y gadgets'),
('Ropa y Accesorios', 'Moda y complementos'),
('Salud y Bienestar', 'Servicios de salud'),
('Servicios Profesionales', 'Consultorías y asesorías'),
('Entretenimiento Digital', 'Streaming y contenido digital'),
('Educación', 'Cursos y contenido educativo');

INSERT INTO products (name, description, price, type, category_id, provider_type, stock, image_url) VALUES
-- Productos físicos (REST)
('Laptop Gaming XPS 15', 'Laptop de alto rendimiento para gaming', 1299.99, 'PHYSICAL', 1, 'REST', 50, '/images/laptop.jpg'),
('Smartphone Galaxy S24', 'Último modelo Samsung', 899.99, 'PHYSICAL', 1, 'REST', 100, '/images/phone.jpg'),
('Audífonos Bluetooth Pro', 'Audífonos inalámbricos con cancelación de ruido', 199.99, 'PHYSICAL', 1, 'REST', 200, '/images/headphones.jpg'),
-- Servicios (SOAP)
('Consulta Médica General', 'Consulta con médico general, 30 minutos', 50.00, 'SERVICE', 3, 'SOAP', 999, '/images/medical.jpg'),
('Asesoría Legal 1 hora', 'Consulta con abogado especializado', 150.00, 'SERVICE', 4, 'SOAP', 999, '/images/legal.jpg'),
('Clase de Yoga Personal', 'Sesión privada de yoga, 1 hora', 35.00, 'SERVICE', 3, 'SOAP', 999, '/images/yoga.jpg'),
-- Suscripciones (gRPC)
('Plan Streaming Premium', 'Acceso ilimitado a películas y series', 14.99, 'SUBSCRIPTION', 5, 'GRPC', 999, '/images/streaming.jpg'),
('Software Productividad Pro', 'Suite de herramientas de productividad', 9.99, 'SUBSCRIPTION', 5, 'GRPC', 999, '/images/software.jpg'),
('Contenido Educativo Ilimitado', 'Acceso a todos los cursos', 19.99, 'SUBSCRIPTION', 6, 'GRPC', 999, '/images/education.jpg');
```

### Gateway application.yml
```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: customer-service
          uri: lb://CUSTOMER-SERVICE
          predicates:
            - Path=/api/customers/**
        - id: catalog-service
          uri: lb://CATALOG-SERVICE
          predicates:
            - Path=/api/catalog/**
        - id: order-service
          uri: lb://ORDER-SERVICE
          predicates:
            - Path=/api/orders/**
        - id: payment-service
          uri: lb://PAYMENT-SERVICE
          predicates:
            - Path=/api/payments/**
        - id: notification-service
          uri: lb://NOTIFICATION-SERVICE
          predicates:
            - Path=/api/notifications/**
        - id: billing-service
          uri: lb://BILLING-SERVICE
          predicates:
            - Path=/api/billing/**
        - id: security-service
          uri: lb://SECURITY-SERVICE
          predicates:
            - Path=/api/security/**
        - id: recommendation-service
          uri: lb://RECOMMENDATION-SERVICE
          predicates:
            - Path=/api/recommendations/**
        - id: integration-service
          uri: lb://INTEGRATION-SERVICE
          predicates:
            - Path=/api/integration/**
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods: "*"
            allowedHeaders: "*"

eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
```

---

## COMANDOS DE VERIFICACIÓN

```bash
# Levantar infraestructura
cd infrastructure && docker-compose up -d

# Verificar que todo está corriendo
docker-compose ps

# Probar MySQL
docker exec -it infrastructure-mysql-1 mysql -uallconnect -pallconnect123 -e "SHOW DATABASES;"

# Probar Redis
docker exec -it infrastructure-redis-1 redis-cli ping

# Ver UI de RabbitMQ
open http://localhost:15672

# Ver emails en MailDev
open http://localhost:1080

# Ver Eureka Dashboard
open http://localhost:8761

# Probar Gateway (cuando esté listo)
curl http://localhost:8080/actuator/health
```

---

## PROBLEMAS COMUNES Y SOLUCIONES

### MySQL no inicia
- Verificar que el puerto 3306 no está ocupado: `lsof -i :3306`
- Si hay datos corruptos: `docker-compose down -v && docker-compose up -d`

### Kafka no conecta
- Esperar 30-60 segundos después de iniciar
- Verificar logs: `docker-compose logs kafka`

### Gateway no encuentra servicios
- Verificar que Eureka está corriendo primero
- Verificar que los servicios están registrados en Eureka
- Revisar el nombre exacto del servicio en Eureka dashboard

### Servicios no se registran en Eureka
- Verificar dependencia `spring-cloud-starter-netflix-eureka-client`
- Verificar configuración `eureka.client.serviceUrl.defaultZone`
- Verificar que el nombre de la aplicación está configurado

---

## MÉTRICAS DE ÉXITO

Al finalizar tu track, debes poder decir SÍ a todas estas preguntas:

1. ¿`docker-compose up` levanta toda la infraestructura sin errores?
2. ¿Puedo conectarme a MySQL y ver las bases de datos creadas?
3. ¿Los datos de prueba existen en las tablas?
4. ¿Eureka está corriendo y accesible?
5. ¿El Gateway responde en puerto 8080?
6. ¿Las rutas del Gateway redirigen correctamente?
7. ¿MailDev recibe emails de prueba?
8. ¿Prometheus está scrapeando métricas?
9. ¿Grafana muestra el dashboard básico?
10. ¿Todo funciona también en Kubernetes (si aplica)?

---

## NOTAS PARA COORDINACIÓN

**Track 2 necesita de ti:**
- MySQL con schemas creados
- Eureka para registrar servicios
- Kafka para eventos
- Gateway configurado con sus rutas

**Track 3 necesita de ti:**
- Conectividad de red funcionando
- Gateway con rutas de integration

**Track 4 necesita de ti:**
- Gateway funcionando para CORS
- Todos los servicios accesibles via Gateway

**TÚ ERES EL CUELLO DE BOTELLA INICIAL. Las primeras 2-3 horas son críticas.**

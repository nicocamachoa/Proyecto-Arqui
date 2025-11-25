# Track 1: Infrastructure + Platform + Observability

## TU MISIÓN

Eres responsable de TODA la infraestructura. Sin ti, los otros tracks no pueden funcionar. Tu trabajo es la base de todo el sistema.

**Lee primero**: CLAUDE.md y TRACKS_DIVISION.md

---

## CHECKLIST DE TAREAS

Actualiza este checklist frecuentemente marcando con [x] lo completado:

### Fase 1: Infraestructura Base (Horas 0-2)

#### Docker Compose Básico
- [x] Crear docker-compose.yml con estructura base
- [x] MySQL 8.0 funcionando en puerto 3306
- [x] Redis 7 funcionando en puerto 6379
- [x] Verificar conectividad entre contenedores
- [x] Crear scripts de inicialización de BD

#### Bases de Datos
- [x] Schema `orders_db` creado
- [x] Schema `catalog_db` creado
- [x] Schema `customers_db` creado
- [x] Schema `payments_db` creado
- [x] Schema `notifications_db` creado
- [x] Schema `billing_db` creado
- [x] Schema `security_db` creado
- [x] Schema `recommendations_db` creado
- [x] Usuario de aplicación creado con permisos

#### Datos Iniciales
- [x] Script SQL con usuarios de prueba cargado
- [x] Script SQL con categorías cargado
- [x] Script SQL con productos de ejemplo cargado
- [x] Verificar que datos existen ejecutando queries

### Fase 2: Mensajería (Horas 2-3)

#### Kafka (KRaft mode)
- [x] Kafka broker funcionando en puerto 9092 (apache/kafka:3.7.0 - KRaft mode)
- [ ] Topics creados: order-events, payment-events, notification-events
- [ ] Verificar productor/consumidor de prueba
- [ ] UI de Kafka configurada (opcional: kafka-ui)

#### RabbitMQ
- [x] RabbitMQ funcionando en puertos 5672/15672
- [x] Management UI accesible (http://localhost:15672 - user: allconnect_user / pass: allconnect_pass_2025)
- [ ] Exchanges y queues para notificaciones creados
- [ ] Verificar conexión de prueba

### Fase 3: Platform Services (Horas 3-5)

#### Eureka Server
- [x] Proyecto Spring Boot creado (infrastructure/platform/eureka-server/)
- [x] Configuración de Eureka Server (Spring Boot 3.2.5, Spring Cloud 2023.0.1)
- [x] Funcionando en puerto 8761
- [x] Dashboard accesible en http://localhost:8761
- [x] Verificar que acepta registros de servicios (Health endpoint UP)

#### API Gateway (Spring Cloud Gateway)
- [x] Proyecto Spring Boot creado (infrastructure/platform/gateway/)
- [x] Registrado en Eureka (API-GATEWAY registrado exitosamente)
- [x] Funcionando en puerto 8080 (Netty server)
- [x] Rutas configuradas para TODOS los servicios (usando lb:// para load balancing via Eureka):
  - [x] /api/orders/** → lb://ORDER-SERVICE
  - [x] /api/catalog/** → lb://CATALOG-SERVICE
  - [x] /api/customers/** → lb://CUSTOMER-SERVICE
  - [x] /api/payments/** → lb://PAYMENT-SERVICE
  - [x] /api/notifications/** → lb://NOTIFICATION-SERVICE
  - [x] /api/billing/** → lb://BILLING-SERVICE
  - [x] /api/security/** → lb://SECURITY-SERVICE
  - [x] /api/recommendations/** → lb://RECOMMENDATION-SERVICE
  - [x] /api/integration/** → lb://INTEGRATION-SERVICE
- [x] CORS configurado para frontend (allowedOrigins: "*", all methods/headers)
- [ ] Rate limiting básico (opcional)
- [x] Health endpoint funcionando (/actuator/health retorna UP)
- [x] Gateway routes endpoint funcionando (/actuator/gateway/routes)

#### MailDev (Email Testing)
- [x] MailDev funcionando en puertos 1080 (UI) / 1025 (SMTP)
- [x] UI accesible en http://localhost:1080
- [ ] Verificar envío de email de prueba

### Fase 4: Observabilidad (Horas 5-7)

#### Prometheus
- [x] Prometheus funcionando en puerto 9090
- [x] Configuración para scrapear todos los servicios (prometheus/prometheus.yml)
- [ ] Métricas básicas visibles (requiere servicios Spring Boot corriendo)
- [ ] Alertas básicas configuradas (opcional)

#### Grafana
- [x] Grafana funcionando en puerto 3001 (3001 para evitar conflicto con frontend)
- [x] Datasource de Prometheus configurado (auto-provisioned)
- [ ] Dashboard básico con:
  - [ ] Estado de servicios (up/down)
  - [ ] Requests por segundo
  - [ ] Latencia promedio
  - [ ] Errores por servicio

#### Jaeger
- [x] Jaeger funcionando en puerto 16686
- [x] UI accesible (http://localhost:16686)
- [ ] Configuración de tracing para servicios (requiere servicios Spring Boot)

### Fase 5: Kubernetes (Horas 7-9)

#### Namespace y Configuración
- [x] Namespace `allconnect` creado (k8s/namespace.yaml)
- [x] ConfigMaps creados (app-config.yaml, prometheus-config.yaml)
- [x] Secrets creados (db-credentials.yaml, jwt-secret.yaml)

#### Deployments de Infraestructura
- [x] MySQL Deployment + Service + PVC (mysql-deployment.yaml, mysql-pvc.yaml)
- [x] Redis Deployment + Service (redis-deployment.yaml)
- [x] Kafka Deployment + Service (kafka-deployment.yaml) - KRaft mode
- [x] RabbitMQ Deployment + Service (rabbitmq-deployment.yaml)
- [x] MailDev Deployment + Service (maildev-deployment.yaml) - AGREGADO

#### Observability en K8s (NUEVO)
- [x] Prometheus Deployment + Service + ConfigMap (prometheus-deployment.yaml)
- [x] Grafana Deployment + Service + Datasources ConfigMap (grafana-deployment.yaml)
- [x] Jaeger Deployment + Service (jaeger-deployment.yaml)

#### Platform en K8s
- [x] Eureka Deployment + Service (eureka-deployment.yaml) - Placeholder, descomentar cuando imagen lista
- [x] Gateway Deployment + Service (gateway-deployment.yaml) - Placeholder, descomentar cuando imagen lista
- [x] Ingress configurado (main-ingress.yaml) - Rutas para API, Admin, Observability UIs

#### Correcciones realizadas
- [x] app-config.yaml: Corregidos puertos de servicios (8091-8098), agregadas variables observability
- [x] mysql-pvc.yaml: Cambiado storageClassName de 'hostpath' a default
- [x] main-ingress.yaml: Eliminadas referencias a tomcat (no existe), configurado para React frontend
- [x] kustomization.yaml: Actualizado de commonLabels (deprecated) a labels, agregados nuevos recursos

#### Verificación K8s
- [x] `kubectl kustomize k8s/` genera manifiestos sin errores
- [ ] `kubectl get pods -n allconnect` muestra todo Running (requiere cluster K8s)
- [ ] Servicios accesibles via NodePort o Ingress (requiere cluster K8s)
- [ ] Logs accesibles via `kubectl logs` (requiere cluster K8s)

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

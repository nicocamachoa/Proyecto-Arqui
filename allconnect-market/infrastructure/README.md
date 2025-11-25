# AllConnect Market - Infrastructure

Esta carpeta contiene toda la infraestructura necesaria para ejecutar AllConnect Market localmente.

## Requisitos Previos

Antes de ejecutar, asegúrate de tener instalado:

| Software | Versión | Verificar con |
|----------|---------|---------------|
| Docker Desktop | 4.x+ | `docker --version` |
| Java | 17+ | `java --version` |
| Maven | 3.8+ | `mvn --version` (o usar `./mvnw`) |

## Inicio Rápido

### 1. Levantar la infraestructura (Docker)

```bash
cd infrastructure
docker-compose up -d
```

Esto inicia:
- **MySQL 8.0** - Base de datos (puerto 3306)
- **Redis 7** - Caché (puerto 6379)
- **Kafka 3.7** - Event streaming (puerto 9092)
- **RabbitMQ** - Mensajería (puertos 5672, 15672)
- **MailDev** - Email testing (puertos 1080, 1025)
- **Prometheus** - Métricas (puerto 9090)
- **Grafana** - Dashboards (puerto 3001)
- **Jaeger** - Tracing (puerto 16686)

### 2. Iniciar Eureka Server

```bash
cd infrastructure/platform/eureka-server
./mvnw spring-boot:run
```

Dashboard disponible en: http://localhost:8761

### 3. Iniciar API Gateway

```bash
cd infrastructure/platform/gateway
./mvnw spring-boot:run
```

Gateway disponible en: http://localhost:8080

## URLs de Acceso

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| Eureka Dashboard | http://localhost:8761 | - |
| API Gateway | http://localhost:8080 | - |
| RabbitMQ Management | http://localhost:15672 | allconnect_user / allconnect_pass_2025 |
| MailDev (Emails) | http://localhost:1080 | - |
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3001 | admin / admin |
| Jaeger (Tracing) | http://localhost:16686 | - |

## Bases de Datos

MySQL contiene 8 bases de datos pre-configuradas:

| Database | Servicio | Puerto del servicio |
|----------|----------|---------------------|
| security_db | SecurityService | 8097 |
| customers_db | CustomerService | 8093 |
| catalog_db | CatalogService | 8092 |
| orders_db | OrderService | 8091 |
| payments_db | PaymentService | 8094 |
| notifications_db | NotificationService | 8095 |
| billing_db | BillingService | 8096 |
| recommendations_db | RecommendationService | 8098 |

### Credenciales MySQL

```
Host: localhost
Port: 3306
User: allconnect_user
Password: allconnect_pass_2025
Root Password: allconnect_root_2025
```

### Conectar a MySQL

```bash
# Via Docker
docker exec -it allconnect-mysql mysql -uallconnect_user -pallconnect_pass_2025

# O con cualquier cliente MySQL
mysql -h localhost -P 3306 -u allconnect_user -p
```

## Datos de Prueba

El script `scripts/init-databases.sql` crea automáticamente:

### Usuarios
| Email | Password | Rol |
|-------|----------|-----|
| cliente@test.com | password123 | CUSTOMER |
| cliente2@test.com | password123 | CUSTOMER |
| admin.negocio@test.com | password123 | ADMIN_NEGOCIO |
| admin.contenido@test.com | password123 | ADMIN_CONTENIDO |
| admin.it@test.com | password123 | ADMIN_IT |
| admin.operaciones@test.com | password123 | ADMIN_OPERACIONES |

### Productos
- **6 productos físicos** (REST provider) - Electrónicos, ropa
- **6 servicios** (SOAP provider) - Consultas médicas, legales, yoga
- **6 suscripciones** (gRPC provider) - Streaming, software, educación

### Categorías
- Electrónica, Ropa y Accesorios, Salud y Bienestar
- Servicios Profesionales, Entretenimiento Digital, Educación
- Hogar y Jardín, Deportes

## Comandos Útiles

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs de un servicio
docker-compose logs -f mysql
docker-compose logs -f kafka

# Reiniciar un servicio
docker-compose restart mysql

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: borra datos)
docker-compose down -v

# Reconstruir todo desde cero
docker-compose down -v && docker-compose up -d
```

## Verificar que todo funciona

```bash
# MySQL
docker exec allconnect-mysql mysql -uallconnect_user -pallconnect_pass_2025 -e "SHOW DATABASES;"

# Redis
docker exec allconnect-redis redis-cli ping

# Kafka
docker exec allconnect-kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list

# Prometheus
curl http://localhost:9090/-/healthy

# Grafana
curl http://localhost:3001/api/health
```

## Estructura de Carpetas

```
infrastructure/
├── docker-compose.yml      # Definición de todos los servicios
├── scripts/
│   └── init-databases.sql  # Inicialización de BD y datos de prueba
├── prometheus/
│   └── prometheus.yml      # Configuración de scraping
├── grafana/
│   └── provisioning/
│       └── datasources/    # Auto-configuración de Prometheus
└── platform/
    ├── eureka-server/      # Proyecto Spring Boot
    └── gateway/            # Proyecto Spring Boot
```

## Troubleshooting

### MySQL no inicia
```bash
# Verificar si el puerto está ocupado
lsof -i :3306

# Ver logs
docker-compose logs mysql

# Reiniciar con volúmenes limpios
docker-compose down -v && docker-compose up -d mysql
```

### Kafka tarda en iniciar
Kafka necesita ~60 segundos para estar completamente listo. Verifica con:
```bash
docker-compose logs -f kafka
# Espera ver "Kafka Server started"
```

### Eureka/Gateway no compila
```bash
# Asegúrate de tener Java 17
java --version

# Si usas Mac con Homebrew:
export JAVA_HOME=$(brew --prefix openjdk@17)
```

### Grafana no muestra datos
1. Verifica que Prometheus está corriendo
2. En Grafana, ve a Configuration > Data Sources > Prometheus
3. Test la conexión

## Para Kubernetes

Los manifiestos K8s están en `/k8s/`. Para desplegar:

```bash
# Verificar manifiestos
kubectl kustomize k8s/

# Aplicar (requiere cluster K8s activo)
kubectl apply -k k8s/

# Ver pods
kubectl get pods -n allconnect
```

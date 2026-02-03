# AllConnect Market

Plataforma multicanal para compra de productos físicos, servicios profesionales y contenido digital.

## Arquitectura

Este proyecto implementa una arquitectura **SOA (Service-Oriented Architecture)** con los siguientes componentes:

| Capa | Componentes | Tecnología |
|------|-------------|------------|
| **Infraestructura** | MySQL, Redis, Kafka, RabbitMQ, MailDev | Docker images |
| **Plataforma** | Eureka Server, API Gateway | Spring Boot + Spring Cloud |
| **Servicios SOA** | 8 servicios empresariales | Spring Boot (Java 21) |
| **Integración** | Integration Service + 3 Mock Providers | Spring Boot + .NET 9 |
| **Frontend** | Customer Portal, Admin Dashboard | React + Vite |
| **Observabilidad** | Prometheus, Grafana, Jaeger | Docker images |

**Total: 24 contenedores Docker**

## Estructura del Proyecto

```
allconnect-market/
├── infrastructure/              # Infraestructura base
│   ├── docker-compose.yml       # Orquestación Docker
│   ├── scripts/                 # Scripts SQL de inicialización
│   ├── prometheus/              # Configuración Prometheus
│   ├── grafana/                 # Configuración Grafana
│   └── platform/                # Eureka + Gateway
│       ├── eureka-server/
│       └── gateway/
├── services/                    # 8 Servicios SOA Empresariales
│   ├── security-service/        # Puerto 8097 - Autenticación/JWT
│   ├── customer-service/        # Puerto 8093 - Gestión de clientes
│   ├── catalog-service/         # Puerto 8092 - Catálogo de productos
│   ├── order-service/           # Puerto 8091 - Órdenes + Saga Pattern
│   ├── payment-service/         # Puerto 8094 - Procesamiento de pagos
│   ├── notification-service/    # Puerto 8095 - Notificaciones multicanal
│   ├── billing-service/         # Puerto 8096 - Facturación
│   └── recommendation-service/  # Puerto 8098 - Motor de recomendaciones
├── integration/                 # Capa de integración
│   ├── integration-service/     # Servicio principal de integración (Spring Boot)
│   └── mock-providers/          # Proveedores externos simulados (.NET 9)
│       ├── rest-provider/       # Puerto 4001 - API REST
│       ├── soap-provider/       # Puerto 4002 - Servicio SOAP/XML
│       └── grpc-provider/       # Puerto 4003 - Servicio gRPC
├── frontend/                    # Aplicaciones React
│   ├── customer-portal/         # Puerto 3000 - Portal de clientes
│   └── admin-dashboard/         # Puerto 3002 - Panel administrativo
├── k8s/                         # Kubernetes manifests
├── docs/                        # Documentación
├── deploy.sh                    # Script de despliegue (Linux/macOS)
├── deploy.ps1                   # Script de despliegue (Windows PowerShell)
├── deploy.bat                   # Script de despliegue (Windows CMD)
└── docker-compose.yml           # Orquestación principal
```

## Servicios y Puertos

### Infraestructura Base

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| MySQL | 3306 | Base de datos principal |
| Redis | 6379 | Cache y sesiones |
| Kafka | 9092 | Mensajería asíncrona (KRaft mode) |
| RabbitMQ | 5672 / 15672 | Cola de mensajes / UI Management |
| MailDev | 1025 / 1080 | SMTP Testing / Web UI |

### Plataforma SOA

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Eureka Server | 8761 | Service Discovery |
| API Gateway | 8080 | Gateway principal (routing, auth) |

### Servicios SOA Empresariales

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Security Service | 8097 | Autenticación JWT, gestión de usuarios |
| Customer Service | 8093 | Gestión de clientes y perfiles |
| Catalog Service | 8092 | Catálogo de productos |
| Order Service | 8091 | Gestión de órdenes (Saga Pattern) |
| Payment Service | 8094 | Procesamiento de pagos |
| Notification Service | 8095 | Notificaciones (email, SMS, push) |
| Billing Service | 8096 | Facturación electrónica |
| Recommendation Service | 8098 | Motor de recomendaciones |

### Capa de Integración

| Servicio | Puerto | Tecnología | Descripción |
|----------|--------|------------|-------------|
| Integration Service | 8086 | Spring Boot | Orquestador de integraciones |
| REST Provider | 4001 | .NET 9 | Mock provider REST/JSON |
| SOAP Provider | 4002 | .NET 9 | Mock provider SOAP/XML |
| gRPC Provider | 4003 | .NET 9 | Mock provider gRPC/Protobuf |

### Frontend

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Customer Portal | 3000 | Portal de clientes (React + Vite) |
| Admin Dashboard | 3002 | Panel administrativo (React + Vite) |

### Observabilidad

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Prometheus | 9090 | Métricas y alertas |
| Grafana | 3001 | Dashboards de visualización |
| Jaeger | 16686 | Distributed tracing |

## Requisitos

- **Docker Desktop** 4.x (con al menos 8GB RAM asignados)
- **Java 21** (Eclipse Temurin) - para desarrollo local
- **Node.js 18+** - para desarrollo frontend
- **.NET 9 SDK** - para desarrollo de providers
- **Maven 3.9+** - para builds Java

## Despliegue Automatizado

El proyecto incluye scripts de despliegue automatizado para todas las plataformas.

### ⚠️ IMPORTANTE: Primera Instalación

**Para garantizar que el login funcione correctamente**, usa el flag `--fresh` en la primera instalación:

```bash
# Linux / macOS / Git Bash
./deploy.sh --fresh

# Windows CMD
deploy.bat --fresh

# Windows PowerShell
.\deploy.ps1 -Fresh
```

El flag `--fresh` elimina volúmenes de MySQL existentes para forzar la ejecución del script de inicialización con los datos correctos. **Esto garantiza que el login funcione en cualquier máquina nueva.**

### Linux / macOS

```bash
# Dar permisos de ejecución (solo primera vez)
chmod +x deploy.sh

# PRIMERA INSTALACIÓN (recomendado - garantiza login funcional)
./deploy.sh --fresh

# Despliegue normal (preserva datos en volúmenes)
./deploy.sh

# Ver estado del despliegue
./deploy.sh --status

# Limpiar todo (detener y eliminar contenedores/volúmenes)
./deploy.sh --clean

# Mostrar ayuda
./deploy.sh --help
```

### Windows (PowerShell)

```powershell
# PRIMERA INSTALACIÓN (recomendado - garantiza login funcional)
.\deploy.ps1 -Fresh

# Despliegue normal (preserva datos en volúmenes)
.\deploy.ps1

# Ver estado del despliegue
.\deploy.ps1 -Status

# Limpiar todo
.\deploy.ps1 -Clean

# Mostrar ayuda
.\deploy.ps1 -Help
```

### Windows (CMD)

```cmd
REM PRIMERA INSTALACIÓN (recomendado - garantiza login funcional)
deploy.bat --fresh

REM Despliegue normal (preserva datos en volúmenes)
deploy.bat

REM Ver estado del despliegue
deploy.bat --status

REM Limpiar todo
deploy.bat --clean

REM Mostrar ayuda
deploy.bat --help
```

### Proceso de Despliegue

Los scripts ejecutan el despliegue en el siguiente orden:

1. **Verificación de prerequisitos** - Docker, docker-compose
2. **Limpieza de despliegue anterior** - docker-compose down
3. **Infraestructura base** - MySQL, Redis, Kafka, RabbitMQ, MailDev
4. **Plataforma** - Eureka Server, API Gateway
5. **Mock Providers** - REST, SOAP, gRPC (.NET)
6. **Integration Service** - Orquestador de integraciones
7. **Servicios SOA** - 8 servicios empresariales
8. **Frontend y Observabilidad** - Portales React, Prometheus, Grafana, Jaeger

**Tiempo estimado**: 5-10 minutos (dependiendo de si las imágenes están cacheadas)

## Despliegue Manual

Si prefieres desplegar manualmente:

```bash
cd allconnect-market

# 1. Infraestructura base
docker-compose up -d mysql redis kafka rabbitmq maildev
# Esperar 60 segundos para que los servicios estén healthy

# 2. Plataforma
docker-compose up -d eureka
# Esperar 30 segundos
docker-compose up -d gateway

# 3. Mock Providers
docker-compose up -d rest-provider soap-provider grpc-provider

# 4. Integration Service
docker-compose up -d integration-service

# 5. Servicios SOA
docker-compose up -d security-service customer-service catalog-service \
    order-service payment-service notification-service billing-service \
    recommendation-service

# 6. Frontend
docker-compose up -d customer-portal admin-dashboard

# 7. Observabilidad
docker-compose up -d prometheus grafana jaeger

# Verificar estado
docker-compose ps
```

## URLs de Acceso

### Frontend

| Aplicación | URL |
|------------|-----|
| Customer Portal | http://localhost:3000 |
| Admin Dashboard | http://localhost:3002 |

### Plataforma

| Servicio | URL |
|----------|-----|
| Eureka Dashboard | http://localhost:8761 |
| API Gateway | http://localhost:8080 |

### Observabilidad

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| Grafana | http://localhost:3001 | admin / admin |
| Prometheus | http://localhost:9090 | - |
| Jaeger | http://localhost:16686 | - |

### Herramientas

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| RabbitMQ Management | http://localhost:15672 | guest / guest |
| MailDev | http://localhost:1080 | - |

### Mock Providers

| Provider | URL |
|----------|-----|
| REST Provider | http://localhost:4001/api/products |
| SOAP Provider | http://localhost:4002/ProductService.asmx |
| gRPC Provider | http://localhost:4003 (health) |

## Endpoints de la API

### Autenticación

```bash
# Login
POST http://localhost:8080/api/security/login
Content-Type: application/json
{"email": "cliente@test.com", "password": "password123"}

# Registro
POST http://localhost:8080/api/security/register
Content-Type: application/json
{"email": "nuevo@test.com", "password": "pass123", "firstName": "Test", "lastName": "User"}
```

### Catálogo

```bash
# Listar productos
GET http://localhost:8080/api/catalog/products

# Producto por ID
GET http://localhost:8080/api/catalog/products/1

# Productos por categoría
GET http://localhost:8080/api/catalog/products/category/PHYSICAL
```

### Órdenes

```bash
# Crear orden (ejecuta Saga Pattern automáticamente)
POST http://localhost:8080/api/orders
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
{
  "customerId": 1,
  "shippingAddress": "{\"street\":\"Calle 123\",\"city\":\"Bogota\"}",
  "paymentMethod": "CREDIT_CARD",
  "items": [{
    "productId": 1,
    "productName": "Laptop",
    "productType": "PHYSICAL",
    "quantity": 1,
    "unitPrice": 1299.99
  }]
}

# Consultar órdenes de un cliente
GET http://localhost:8080/api/orders/customer/1
Authorization: Bearer <JWT_TOKEN>
```

### Integration Service

```bash
# Obtener productos de todos los providers
GET http://localhost:8080/api/integration/products

# Productos por tipo de provider
GET http://localhost:8080/api/integration/products/rest
GET http://localhost:8080/api/integration/products/soap
GET http://localhost:8080/api/integration/products/grpc
```

## Patrón Saga (Order Service)

El Order Service implementa el **Saga Pattern** para transacciones distribuidas:

```
CREATED → PAYMENT_PENDING → PAYMENT_COMPLETED → PROVIDER_PENDING → PROVIDER_CONFIRMED → COMPLETED
```

Estados:
1. **CREATED** - Orden creada inicialmente
2. **PAYMENT_PENDING** - Procesando pago
3. **PAYMENT_COMPLETED** - Pago exitoso
4. **PROVIDER_PENDING** - Confirmando con proveedor externo
5. **PROVIDER_CONFIRMED** - Proveedor confirmado
6. **COMPLETED** - Orden completada exitosamente

En caso de fallo, se ejecuta **compensación automática** en orden inverso.

## Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| cliente@test.com | password123 | CUSTOMER |
| admin.negocio@test.com | password123 | ADMIN_NEGOCIO |
| admin.it@test.com | password123 | ADMIN_IT |

## Comandos Útiles

```bash
# Ver estado de todos los contenedores
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f <servicio>

# Ver logs de errores
docker-compose logs --tail=100 | grep -i error

# Reiniciar un servicio
docker-compose restart <servicio>

# Reconstruir un servicio
docker-compose build --no-cache <servicio>
docker-compose up -d <servicio>

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (reset completo)
docker-compose down -v
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Puerto en uso | `netstat -ano \| findstr :PUERTO` (Windows) o `lsof -i :PUERTO` (Linux/Mac) |
| Servicio no registra en Eureka | Verificar variable EUREKA_CLIENT_SERVICEURL_DEFAULTZONE |
| MySQL no inicia | Verificar volumen y permisos, o ejecutar `docker-compose down -v` |
| Kafka unhealthy | Esperar más tiempo (start_period: 60s) o revisar logs |
| Build falla | `docker-compose build --no-cache <servicio>` |
| Frontend no carga | Verificar que el API Gateway esté corriendo |

## Equipo

- Nicolas Camacho
- Sara Albarracín
- Alejandro Caicedo
- Alejandro Pinzón

## Documentación

- [Decisiones Arquitectónicas](./ARQUITECTURA_DECISIONES.md)
- [Resultados de Pruebas de Integración](./PRUEBAS_INTEGRACION.md)
- [Infraestructura](./infrastructure/README.md)
- [Capa de Integración](./integration/README.md)

---

*Proyecto de Arquitectura de Software - Pontificia Universidad Javeriana - 2025*

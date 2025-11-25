# AllConnect Market

Plataforma multicanal para compra de productos físicos, servicios profesionales y contenido digital.

## Arquitectura

Este proyecto implementa una arquitectura **SOA (Service-Oriented Architecture)** con los siguientes componentes:

- **API Gateway**: Spring Cloud Gateway (Puerto 8080)
- **Service Discovery**: Eureka Server (Puerto 8761)
- **Enterprise Services**: 8 microservicios Spring Boot
- **Integration Layer**: Spring Boot con adaptadores de protocolo
- **Frontend**: React (Customer Portal + Admin Dashboard)
- **Base de Datos**: MySQL 8.0
- **Cache**: Redis 7
- **Mensajería**: Apache Kafka 3.7 + RabbitMQ 3
- **Observabilidad**: Prometheus + Grafana + Jaeger
- **Orquestación**: Docker Compose / Kubernetes

## Estructura del Proyecto

```
allconnect-market/
├── infrastructure/              # Infraestructura base
│   ├── docker-compose.yml       # Orquestación Docker
│   ├── scripts/                 # Scripts SQL de inicialización
│   └── platform/                # Eureka + Gateway
│       ├── eureka-server/
│       └── gateway/
├── services/                    # 8 Microservicios SOA
│   ├── security-service/        # Puerto 8097 - Autenticación/JWT
│   ├── customer-service/        # Puerto 8093 - Gestión de clientes
│   ├── catalog-service/         # Puerto 8092 - Catálogo de productos
│   ├── order-service/           # Puerto 8091 - Órdenes + Saga Pattern
│   ├── payment-service/         # Puerto 8094 - Procesamiento de pagos
│   ├── notification-service/    # Puerto 8095 - Notificaciones multicanal
│   ├── billing-service/         # Puerto 8096 - Facturación
│   └── recommendation-service/  # Puerto 8098 - Motor de recomendaciones
├── integration/                 # Capa de integración
│   ├── integration-service/     # Servicio principal de integración
│   └── adapters/                # Adaptadores de protocolo
│       ├── https-adapter/       # Adaptador REST/HTTPS
│       ├── soap-adapter/        # Adaptador SOAP/XML
│       └── rpc-adapter/         # Adaptador gRPC
├── frontend/                    # Aplicaciones React
│   ├── customer-portal/         # Portal de clientes
│   └── admin-dashboard/         # Panel administrativo
├── k8s/                         # Kubernetes manifests
└── docs/                        # Documentación
```

## Servicios y Puertos

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| MySQL | 3306 | Base de datos principal |
| Redis | 6379 | Cache y sesiones |
| Kafka | 9092 | Mensajería asíncrona |
| RabbitMQ | 5672/15672 | Cola de mensajes |
| Eureka | 8761 | Service Discovery |
| Gateway | 8080 | API Gateway |
| Security | 8097 | Autenticación JWT |
| Customer | 8093 | Gestión de clientes |
| Catalog | 8092 | Catálogo de productos |
| Order | 8091 | Gestión de órdenes (Saga) |
| Payment | 8094 | Procesamiento de pagos |
| Notification | 8095 | Notificaciones |
| Billing | 8096 | Facturación |
| Recommendation | 8098 | Recomendaciones |
| Prometheus | 9090 | Métricas |
| Grafana | 3001 | Dashboards |
| Jaeger | 16686 | Tracing distribuido |
| MailDev | 1080 | Testing de emails |

## Requisitos

- Docker Desktop 4.x
- Java 21 (Eclipse Temurin)
- Node.js 18+
- Maven 3.9+

## Quick Start con Docker Compose

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd allconnect-market

# 2. Iniciar infraestructura base
cd infrastructure
docker-compose up -d mysql redis kafka rabbitmq

# 3. Esperar a que los servicios estén healthy (30-60 segundos)
docker-compose ps

# 4. Iniciar servicios de plataforma
docker-compose up -d eureka gateway

# 5. Iniciar microservicios
cd ../services
docker-compose up -d

# 6. Verificar todos los servicios
docker-compose ps
```

## Endpoints Principales

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
```

### Órdenes
```bash
# Crear orden (ejecuta Saga Pattern automáticamente)
POST http://localhost:8080/api/orders
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
```

## Patrón Saga (Order Service)

El Order Service implementa el **Saga Pattern** para transacciones distribuidas:

1. **CREATED** → Orden creada
2. **PAYMENT_PENDING** → Procesando pago
3. **PAYMENT_COMPLETED** → Pago exitoso
4. **PROVIDER_PENDING** → Confirmando con proveedor
5. **PROVIDER_CONFIRMED** → Proveedor confirmado
6. **COMPLETED** → Orden completada

En caso de fallo, se ejecuta compensación automática en orden inverso.

## Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| cliente@test.com | password123 | CUSTOMER |
| admin.negocio@test.com | password123 | ADMIN_NEGOCIO |
| admin.it@test.com | password123 | ADMIN_IT |

## Monitoreo

- **Eureka Dashboard**: http://localhost:8761
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **Grafana**: http://localhost:3001 (admin/admin)
- **Jaeger UI**: http://localhost:16686
- **MailDev**: http://localhost:1080

## Equipo

- Nicolas Camacho
- Sara Albarracín
- Alejandro Caicedo
- Alejandro Pinzón

## Documentación

- [Decisiones Arquitectónicas](./ARQUITECTURA_DECISIONES.md)
- [División de Tracks](./TRACKS_DIVISION.md)
- [Track 1 - Infraestructura](./CLAUDE-TRACK1.md)
- [Track 2 - Servicios](./CLAUDE-TRACK2.md)
- [Track 3 - Integración](./CLAUDE-TRACK3.md)
- [Track 4 - Frontend](./CLAUDE-TRACK4.md)

---

*Proyecto de Arquitectura de Software - Pontificia Universidad Javeriana - 2025*

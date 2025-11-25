# Track 3: Integration Layer + Mock Providers

## Resumen

Este track implementa la capa de integración que conecta AllConnect Market con proveedores externos usando 3 protocolos diferentes (REST, SOAP, gRPC), demostrando la arquitectura SOA multicanal.

## Arquitectura

```
OrderService (Track 2)
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│              IntegrationService (:8085) [Spring Boot]             │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │RestAdapter  │  │SoapAdapter  │  │GrpcAdapter  │              │
│  │implements   │  │implements   │  │implements   │              │
│  │IProvider    │  │IProvider    │  │IProvider    │              │
│  │Adapter      │  │Adapter      │  │Adapter      │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼──────────────────────┘
          │                │                │
          ▼                ▼                ▼
   REST Provider     SOAP Provider    gRPC Provider
     (:4001)           (:4002)          (:4003)
     [.NET 9]          [.NET 9]         [.NET 9]
```

## Componentes

### Mock Providers (.NET 9)

| Provider | Puerto | Protocolo | Descripción |
|----------|--------|-----------|-------------|
| REST Provider | 4001 | REST/HTTP | Productos físicos (Amazon-like) |
| SOAP Provider | 4002 | SOAP/XML | Servicios profesionales (médicos, legales) |
| gRPC Provider | 4003 | gRPC/Protobuf | Suscripciones digitales (Netflix-like) |

### IntegrationService (Spring Boot)

- **Puerto**: 8085
- **Tecnologías**: Spring Boot 3.2, WebClient, Resilience4j
- **Registro**: Eureka

## Arquitectura de Adaptadores

Los adaptadores están implementados de forma **independiente**, cada uno especializado en su protocolo:

```
┌─────────────────────────────────────────────────────────────┐
│                    IntegrationService                        │
│                       (Spring Boot)                          │
│                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │ RestAdapter   │  │ SoapAdapter   │  │ GrpcAdapter   │   │
│  │ (HTTP/JSON)   │  │ (XML/WSDL)    │  │ (Protobuf)    │   │
│  │               │  │               │  │               │   │
│  │ - WebClient   │  │ - JAX-WS      │  │ - gRPC Stub   │   │
│  │ - Jackson     │  │ - JAXB        │  │ - Protobuf    │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Decisión de diseño:** Los adaptadores NO heredan de una interfaz genérica común. Cada uno maneja su protocolo de forma especializada, lo que permite:
- Mayor flexibilidad en el manejo de cada protocolo
- Código más explícito y fácil de entender
- Menor acoplamiento entre adaptadores
- Evolución independiente de cada integración

## Endpoints

### IntegrationService API

#### Orders (REST Provider)
- `POST /api/integration/orders` - Crear orden
- `GET /api/integration/orders/{id}/status` - Estado de orden
- `DELETE /api/integration/orders/{id}` - Cancelar orden
- `GET /api/integration/inventory/{productId}` - Consultar inventario

#### Bookings (SOAP Provider)
- `POST /api/integration/bookings` - Crear reserva
- `GET /api/integration/bookings/{id}` - Obtener reserva
- `DELETE /api/integration/bookings/{id}` - Cancelar reserva
- `GET /api/integration/availability/{serviceId}?date=YYYY-MM-DD` - Disponibilidad

#### Subscriptions (gRPC Provider)
- `POST /api/integration/subscriptions` - Crear suscripción
- `GET /api/integration/subscriptions/{id}` - Obtener suscripción
- `DELETE /api/integration/subscriptions/{id}` - Cancelar suscripción
- `GET /api/integration/subscriptions/{id}/access/{contentId}` - Verificar acceso

## Ejecución

### Prerrequisitos
- .NET 9 SDK
- Java 17+ y Maven
- Eureka Server (Track 1) - opcional, funciona sin él

### Iniciar Mock Providers

```bash
# REST Provider (Puerto 4001)
cd integration/mock-providers/rest-provider/RestProvider
dotnet run

# SOAP Provider (Puerto 4002)
cd integration/mock-providers/soap-provider/SoapProvider
dotnet run

# gRPC Provider (Puerto 4003)
cd integration/mock-providers/grpc-provider/GrpcProvider
dotnet run
```

### Iniciar IntegrationService

```bash
cd integration/integration-service
mvn spring-boot:run -DskipTests -Deureka.client.enabled=false
```

O con Docker:

```bash
cd integration/integration-service
docker build -t integration-service .
docker run -p 8085:8085 integration-service
```

### Iniciar Frontends Web (Opcionales - para demos)

```bash
# REST Provider Web UI (Puerto 5001)
cd integration/mock-providers/rest-provider/RestProvider.Web
dotnet run

# SOAP Provider Web UI (Puerto 5002)
cd integration/mock-providers/soap-provider/SoapProvider.Web
dotnet run

# gRPC Provider Web UI (Puerto 5003)
cd integration/mock-providers/grpc-provider/GrpcProvider.Web
dotnet run
```

### URLs de Acceso

| Servicio | URL | Descripcion |
|----------|-----|-------------|
| REST Provider API | http://localhost:4001 | API productos fisicos |
| SOAP Provider API | http://localhost:4002 | API servicios profesionales |
| gRPC Provider API | http://localhost:4003 | API suscripciones digitales |
| IntegrationService | http://localhost:8085 | Orquestador de integracion |
| **Swagger UI** | http://localhost:8085/swagger-ui/index.html | Documentacion API interactiva |
| REST Provider Web | http://localhost:5001 | UI web para productos |
| SOAP Provider Web | http://localhost:5002 | UI web para reservas |
| gRPC Provider Web | http://localhost:5003 | UI web para suscripciones |

## Pruebas

### REST Provider

```bash
# Obtener productos
curl http://localhost:4001/api/products

# Crear orden
curl -X POST http://localhost:4001/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST001","customerEmail":"test@test.com","items":[{"productId":"PROD001","quantity":1}],"shippingAddress":{"street":"Calle 123","city":"Bogotá","state":"Cundinamarca","zipCode":"110111","country":"Colombia"}}'
```

### IntegrationService - REST Provider

```bash
# Health check
curl http://localhost:8085/api/integration/health

# Crear orden via IntegrationService
curl -X POST http://localhost:8085/api/integration/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST001","customerEmail":"test@test.com","items":[{"productId":"PROD001","quantity":1}],"shippingAddress":{"street":"Calle 123","city":"Bogota","state":"Cundinamarca","zipCode":"110111","country":"Colombia"}}'

# Consultar inventario
curl http://localhost:8085/api/integration/inventory/PROD001
```

### IntegrationService - SOAP Provider (Bookings)

```bash
# Crear reserva
curl -X POST http://localhost:8085/api/integration/bookings \
  -H "Content-Type: application/json" \
  -d '{"serviceId":"SVC001","customerId":"CUST001","customerName":"Juan Perez","customerEmail":"juan@test.com","preferredDateTime":"2025-12-01T10:00:00","notes":"Primera consulta"}'

# Consultar reserva
curl http://localhost:8085/api/integration/bookings/BK-XXXXX
```

### IntegrationService - gRPC Provider (Subscriptions)

```bash
# Crear suscripcion
curl -X POST http://localhost:8085/api/integration/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"planId":"PLAN001","customerId":"CUST001","customerEmail":"cliente@test.com"}'

# Verificar acceso a contenido
curl http://localhost:8085/api/integration/subscriptions/SUB-XXXXX/access/MOVIE001
```

## Circuit Breaker

El servicio incluye Circuit Breaker (Resilience4j) para cada proveedor:

- `restProvider`: Para operaciones REST
- `soapProvider`: Para operaciones SOAP
- `grpcProvider`: Para operaciones gRPC

Configuración en `application.yml`:
- Window size: 10 llamadas
- Failure threshold: 50%
- Wait duration: 5-10 segundos

## Datos Mock

### Productos (REST)
- PROD001: Laptop Gaming XPS 15 - $1,299.99
- PROD002: Smartphone Galaxy S24 Ultra - $899.99
- PROD003: Audífonos Bluetooth Pro - $199.99

### Servicios (SOAP)
- SVC001: Consulta Médica General - $50.00
- SVC002: Asesoría Legal - $100.00
- SVC003: Clase de Yoga Personal - $35.00

### Planes (gRPC)
- PLAN001: Plan Streaming Premium - $14.99/mes
- PLAN002: Software Productividad Pro - $9.99/mes
- PLAN003: Contenido Educativo Ilimitado - $19.99/mes

## Frontends Web (Razor Pages)

Se incluyen 3 aplicaciones web en Razor Pages para facilitar demos y pruebas interactivas:

### REST Provider Web UI (Puerto 5001)
- Ver todos los productos
- Buscar producto por ID
- Crear ordenes
- Consultar estado de ordenes
- Cancelar ordenes
- Verificar inventario
- Indicador de estado del servicio (health check)

### SOAP Provider Web UI (Puerto 5002)
- Ver todos los servicios profesionales
- Buscar servicio por ID
- Crear reservas (con seleccion de fecha/hora)
- Consultar reservas
- Cancelar reservas
- Verificar disponibilidad
- Indicador de estado del servicio

### gRPC Provider Web UI (Puerto 5003)
- Ver planes de suscripcion
- Buscar plan por ID
- Crear suscripciones
- Consultar estado de suscripciones
- Cancelar suscripciones
- Verificar acceso a contenido
- Indicador de estado del servicio

**Nota:** Cada frontend tiene estilos propios con colores distintivos (naranja para REST, morado para SOAP, verde para gRPC).

---

## Extensibilidad

Para agregar un nuevo proveedor/protocolo:

1. Crear nuevo servicio adaptador especializado (ej: `GraphQLAdapter`)
2. Implementar los métodos específicos del protocolo
3. Agregar configuración en `application.yml`
4. Crear endpoints en el controlador correspondiente

```java
@Service
@Slf4j
public class GraphQLAdapter {

    private final WebClient webClient;

    public GraphQLAdapter(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
            .baseUrl("http://graphql-provider:4004")
            .build();
    }

    public Mono<Object> executeQuery(String query, Map<String, Object> variables) {
        // Implementación específica de GraphQL
    }
}
```

## Dependencias

### Track 1 (Infraestructura)
- Gateway con ruta `/api/integration/**` → `lb://INTEGRATION-SERVICE`
- Eureka Server en puerto 8761

### Track 2 (Enterprise Services)
- OrderService consumirá IntegrationService para enviar órdenes a proveedores

### Track 4 (Frontend)
- Consumirá estados de tracking y confirmaciones

## Checklist de Pruebas

### Compilación
- [x] REST Provider (.NET 9) - Compila correctamente
- [x] SOAP Provider (.NET 9) - Compila correctamente
- [x] gRPC Provider (.NET 9) - Compila correctamente
- [x] IntegrationService (Spring Boot) - Compila correctamente

### Servicios
- [x] REST Provider escuchando en puerto 4001
- [x] SOAP Provider escuchando en puerto 4002
- [x] gRPC Provider escuchando en puerto 4003
- [x] IntegrationService escuchando en puerto 8085

### Endpoints Probados
- [x] `GET /api/products` (REST Provider) - Retorna 5 productos
- [x] `POST /api/orders` (REST Provider) - Crea órdenes correctamente
- [x] `GET /health` (SOAP Provider) - Status healthy
- [x] `GET /health` (gRPC Provider) - Status healthy
- [x] `GET /api/integration/health` - IntegrationService UP
- [x] `POST /api/integration/orders` - E2E Order Creation funciona
- [x] `GET /api/integration/orders/{id}/status` - Retorna estado de orden
- [x] `GET /api/integration/inventory/{productId}` - Retorna stock disponible

### Flujo E2E (IntegrationService -> REST Provider)
- [x] Crear orden via IntegrationService
- [x] Obtener status de orden via IntegrationService
- [x] Consultar inventario via IntegrationService

### Despliegue
- [x] Dockerfiles para todos los servicios
- [x] docker-compose.yml para levantar todos los servicios

### Flujos E2E Completos
- [x] REST Provider: Crear orden, consultar estado, cancelar, verificar inventario
- [x] SOAP Provider: Crear booking, consultar booking, cancelar, verificar disponibilidad
- [x] gRPC Provider: Crear suscripcion, consultar suscripcion, cancelar, verificar acceso

### Mejoras Opcionales Completadas
- [x] Swagger UI funcionando en http://localhost:8085/swagger-ui/index.html
- [x] Frontends Razor para cada provider (puertos 5001, 5002, 5003)

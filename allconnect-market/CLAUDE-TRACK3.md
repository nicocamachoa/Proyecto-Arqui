# Track 3: Integration Layer + Mock Providers

## TU MISIÓN

Eres responsable de la capa de integración y los proveedores mock. Tu trabajo demuestra la arquitectura SOA multicanal - conectas el sistema con "proveedores externos" usando 3 protocolos diferentes.

**Lee primero**: CLAUDE.md y TRACKS_DIVISION.md

---

## DECISIONES DE IMPLEMENTACIÓN

### Cambios respecto al diseño original:
- **Mock Providers**: Implementados en **.NET 9** (no Node.js) - mejor rendimiento y tipado fuerte
- **Adapters**: Lógica de adaptación integrada directamente en **Spring Boot IntegrationService** usando interfaces genéricas (IProviderAdapter)
- **Sin adapters Node.js separados**: Simplifica arquitectura, toda la transformación en un solo lugar

---

## CHECKLIST DE TAREAS

Actualiza este checklist frecuentemente marcando con [x] lo completado:

### Fase 1: Setup y Estructura

#### Estructura de Carpetas
- [x] Crear /integration/integration-service/ (Spring Boot)
- [x] Crear /integration/mock-providers/rest-provider/ (.NET 9)
- [x] Crear /integration/mock-providers/soap-provider/ (.NET 9)
- [x] Crear /integration/mock-providers/grpc-provider/ (.NET 9)

#### .NET Setup (para cada provider)
- [x] .csproj configurado
- [x] Dependencias instaladas (CoreWCF, Grpc.AspNetCore)
- [x] Compilación exitosa

### Fase 2: IntegrationService (Spring Boot)

**Puerto: 8085**

#### Endpoints Implementados
- [x] POST /api/integration/orders - Enviar orden a proveedor REST
- [x] GET /api/integration/orders/{orderId}/status - Estado de orden
- [x] DELETE /api/integration/orders/{orderId} - Cancelar orden
- [x] GET /api/integration/inventory/{productId} - Consultar stock
- [x] POST /api/integration/bookings - Crear reserva (SOAP)
- [x] GET /api/integration/bookings/{id} - Obtener reserva
- [x] DELETE /api/integration/bookings/{id} - Cancelar reserva
- [x] GET /api/integration/availability/{serviceId}?date=YYYY-MM-DD - Disponibilidad
- [x] POST /api/integration/subscriptions - Crear suscripción (gRPC)
- [x] GET /api/integration/subscriptions/{id} - Estado suscripción
- [x] DELETE /api/integration/subscriptions/{id} - Cancelar suscripción
- [x] GET /api/integration/subscriptions/{id}/access/{contentId} - Verificar acceso
- [x] GET /api/integration/health - Health check

#### Interfaces Genéricas
- [x] IProviderAdapter - Interfaz principal para todos los adapters
- [x] IMessageTransformer - Transformación de mensajes
- [x] IProviderRegistry - Registro de proveedores
- [x] AdapterFactory - Patrón Factory para crear adapters

#### Adapters en Spring Boot
- [x] RestProviderAdapter - Conexión al REST Provider via WebClient
- [x] SoapProviderAdapter - Conexión al SOAP Provider (estructura base)
- [x] GrpcProviderAdapter - Conexión al gRPC Provider (estructura base)

#### Circuit Breaker
- [x] Configurado con Resilience4j
- [x] Fallback cuando proveedor no responde
- [x] Configuración por proveedor en application.yml

#### Registro
- [x] Configurado para Eureka (opcional, funciona sin él)
- [x] Swagger funcionando en http://localhost:8085/swagger-ui/index.html

### Fase 3: REST Provider (.NET 9)

**Puerto: 4001**
**Simula**: Proveedor de productos físicos (estilo Amazon)

#### Endpoints
- [x] GET /api/products - Lista de productos (5 productos mock)
- [x] GET /api/products/:id - Detalle producto
- [x] POST /api/orders - Crear orden
- [x] GET /api/orders/:id - Obtener orden
- [x] GET /api/orders/:id/status - Estado de envío con historial
- [x] GET /api/inventory/:productId - Stock disponible
- [x] DELETE /api/orders/:id - Cancelar orden
- [x] GET /api/health - Health check

#### Datos Mock
- [x] PROD001: Laptop Gaming XPS 15 - $1,299.99
- [x] PROD002: Smartphone Galaxy S24 Ultra - $899.99
- [x] PROD003: Audífonos Bluetooth Pro - $199.99
- [x] PROD004: Monitor 4K 32 pulgadas - $549.99
- [x] PROD005: Teclado Mecánico RGB - $149.99

#### Simulación Realista
- [x] Delay de 500-1500ms en órdenes
- [x] Estados de orden que avanzan con el tiempo
- [x] Stock que disminuye con órdenes
- [x] Tracking numbers generados

### Fase 4: SOAP Provider (.NET 9)

**Puerto: 4002**
**Simula**: Proveedor de servicios profesionales (médicos, legales, etc.)

#### Operaciones SOAP (CoreWCF)
- [x] BookService - Reservar servicio
- [x] CancelBooking - Cancelar reserva
- [x] GetAvailability - Ver disponibilidad
- [x] GetBookingDetails - Detalles de reserva
- [x] GetServices - Lista de servicios
- [x] GetServiceById - Servicio por ID

#### Datos Mock
- [x] SVC001: Consulta Médica General - $50.00, Dr. García
- [x] SVC002: Asesoría Legal - $100.00, Abg. Martínez
- [x] SVC003: Clase de Yoga Personal - $35.00, Ana López

#### Endpoints HTTP
- [x] /BookingService.svc - Endpoint SOAP
- [x] /health - Health check

### Fase 5: gRPC Provider (.NET 9)

**Puerto: 4003**
**Simula**: Proveedor de suscripciones digitales (streaming, SaaS)

#### Servicios gRPC
- [x] CreateSubscription - Crear suscripción
- [x] GetSubscription - Obtener suscripción
- [x] CancelSubscription - Cancelar suscripción
- [x] CheckAccess - Verificar acceso a contenido
- [x] GetPlans - Lista de planes
- [x] GetPlan - Plan por ID

#### Datos Mock
- [x] PLAN001: Plan Streaming Premium - $14.99/mes (HD, 4K, Sin anuncios, 4 pantallas)
- [x] PLAN002: Software Productividad Pro - $9.99/mes
- [x] PLAN003: Contenido Educativo Ilimitado - $19.99/mes

#### Endpoints
- [x] gRPC endpoint en puerto 4003
- [x] /health - Health check HTTP

### Fase 6: Despliegue

#### Dockerfiles
- [x] integration-service/Dockerfile (Spring Boot)
- [x] mock-providers/rest-provider/Dockerfile (.NET 9)
- [x] mock-providers/soap-provider/Dockerfile (.NET 9)
- [x] mock-providers/grpc-provider/Dockerfile (.NET 9)

#### Docker Compose
- [x] docker-compose.yml para toda la capa de integración

---

## PRUEBAS E2E REALIZADAS

### REST Provider Directo (Puerto 4001)
```bash
# Obtener productos
curl http://localhost:4001/api/products
# ✓ Retorna 5 productos

# Crear orden
curl -X POST http://localhost:4001/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST001","customerEmail":"test@test.com","items":[{"productId":"PROD001","quantity":1}],"shippingAddress":{"street":"Calle 123","city":"Bogota","state":"Cundinamarca","zipCode":"110111","country":"Colombia"}}'
# ✓ Retorna orderId, trackingNumber, estimatedDelivery
```

### IntegrationService E2E (Puerto 8085)
```bash
# Health check
curl http://localhost:8085/api/integration/health
# ✓ {"protocols":["REST","SOAP","GRPC"],"status":"UP","service":"Integration Service"}

# Crear orden via IntegrationService
curl -X POST http://localhost:8085/api/integration/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST001","customerEmail":"test@test.com","items":[{"productId":"PROD001","quantity":2}]}'
# ✓ {"success":true,"providerOrderId":"ORD-XXX","status":"RECEIVED","trackingNumber":"TRK-XXX"}

# Estado de orden
curl http://localhost:8085/api/integration/orders/ORD-XXX/status
# ✓ Retorna estado actual y ubicación

# Inventario
curl http://localhost:8085/api/integration/inventory/PROD001
# ✓ {"success":true,"productId":"PROD001","availableStock":47,"inStock":true}
```

---

## ARQUITECTURA IMPLEMENTADA

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

---

## MÉTRICAS DE ÉXITO

Al finalizar tu track, debes poder decir SÍ a todas estas preguntas:

1. ✅ ¿IntegrationService está corriendo en puerto 8085?
2. ✅ ¿Los 3 mock providers están corriendo (.NET 9)?
3. ✅ ¿REST Provider responde en puerto 4001?
4. ✅ ¿SOAP Provider responde en puerto 4002?
5. ✅ ¿gRPC Provider responde en puerto 4003?
6. ✅ ¿Puedo crear una orden de producto físico via IntegrationService?
7. ✅ ¿Puedo consultar el estado de una orden?
8. ✅ ¿Puedo consultar inventario?
9. ✅ ¿Puedo crear una reserva de servicio? (E2E funcionando via REST wrapper)
10. ✅ ¿Puedo crear una suscripción? (E2E funcionando via REST wrapper)
11. ✅ ¿Circuit breaker configurado?
12. ✅ ¿Dockerfiles listos para despliegue?
13. ✅ ¿docker-compose.yml para toda la capa?
14. ✅ ¿Swagger UI funcionando? (http://localhost:8085/swagger-ui/index.html)
15. ✅ ¿Frontends Razor para demos? (puertos 5001, 5002, 5003)

---

## COMANDOS DE INICIO

### Desarrollo Local (sin Docker)
```bash
# Terminal 1 - REST Provider
cd integration/mock-providers/rest-provider/RestProvider
dotnet run

# Terminal 2 - SOAP Provider
cd integration/mock-providers/soap-provider/SoapProvider
dotnet run

# Terminal 3 - gRPC Provider
cd integration/mock-providers/grpc-provider/GrpcProvider
dotnet run

# Terminal 4 - IntegrationService
cd integration/integration-service
mvn spring-boot:run -DskipTests -Deureka.client.enabled=false
```

### Con Docker
```bash
cd integration
docker-compose up --build
```

### Frontends Web (Razor Pages)
```bash
# Terminal 5 - REST Provider Web UI (Puerto 5001)
cd integration/mock-providers/rest-provider/RestProvider.Web
dotnet run

# Terminal 6 - SOAP Provider Web UI (Puerto 5002)
cd integration/mock-providers/soap-provider/SoapProvider.Web
dotnet run

# Terminal 7 - gRPC Provider Web UI (Puerto 5003)
cd integration/mock-providers/grpc-provider/GrpcProvider.Web
dotnet run
```

---

## URLS DE ACCESO

| Servicio | URL | Descripcion |
|----------|-----|-------------|
| REST Provider API | http://localhost:4001 | API productos fisicos |
| SOAP Provider API | http://localhost:4002 | API servicios profesionales |
| gRPC Provider API | http://localhost:4003 | API suscripciones digitales |
| IntegrationService | http://localhost:8085 | Orquestador de integracion |
| Swagger UI | http://localhost:8085/swagger-ui/index.html | Documentacion API |
| REST Provider Web | http://localhost:5001 | UI para productos |
| SOAP Provider Web | http://localhost:5002 | UI para reservas |
| gRPC Provider Web | http://localhost:5003 | UI para suscripciones |

---

## NOTAS PARA COORDINACIÓN

**Dependes de Track 1:**
- Gateway para exponer IntegrationService (ruta: /api/integration/**)
- Eureka para registro (opcional, funciona sin él)

**Dependes de Track 2:**
- OrderService llama a IntegrationService para enviar órdenes a proveedores

**Track 4 depende de ti:**
- Estados de tracking para mostrar en UI
- Confirmaciones de reserva
- Estados de suscripción

# AllConnect Market - División de Trabajo en 4 Tracks Paralelos

## Resumen Ejecutivo

Proyecto: **AllConnect Market** - Marketplace Multicanal
Equipo: 4 personas
Tiempo: 12 horas por persona (48 horas totales)
Herramienta: Claude Code (instancias paralelas)

---

## Track 1: Infrastructure + Platform + Observability (12h)

**Responsable**: Persona 1
**Objetivo**: Toda la infraestructura lista y orquestada en Kubernetes

### Componentes

| Componente | Puerto | Tecnología | Tiempo Est. |
|------------|--------|------------|-------------|
| MySQL | 3306 | mysql:8.0 | 1h |
| Redis | 6379 | redis:7-alpine | 0.5h |
| Kafka (KRaft) | 9092 | bitnami/kafka | 1.5h |
| RabbitMQ | 5672/15672 | rabbitmq:3-management | 1h |
| MailDev | 1080/1025 | maildev/maildev | 0.5h |
| Eureka Server | 8761 | Spring Boot | 2h |
| API Gateway | 8080 | Spring Cloud Gateway | 3h |
| Prometheus | 9090 | prom/prometheus | 1h |
| Grafana | 3000 | grafana/grafana | 1h |
| Jaeger | 16686 | jaegertracing | 0.5h |

### Entregables
- [ ] Docker Compose funcional para desarrollo local
- [ ] Manifiestos K8s con Kustomize
- [ ] Scripts de inicialización de BD (schemas para todos los servicios)
- [ ] Gateway configurado con rutas a TODOS los servicios
- [ ] Dashboard Grafana con métricas básicas
- [ ] Health checks configurados

### Datos Fake Iniciales (SQL)
```sql
-- Ejecutar en MySQL al iniciar
-- Categorías, productos de ejemplo, usuarios de prueba, proveedores mock
```

---

## Track 2: Enterprise Services Core (12h)

**Responsable**: Persona 2
**Objetivo**: Los 8 microservicios de negocio funcionando

### Componentes

| Servicio | Puerto | Base Datos | Tiempo Est. |
|----------|--------|------------|-------------|
| OrderService | 8091 | orders_db | 2h |
| CatalogService | 8092 | catalog_db | 2h |
| CustomerService | 8093 | customers_db | 1.5h |
| PaymentService | 8094 | payments_db | 1.5h |
| NotificationService | 8095 | notifications_db | 1.5h |
| BillingService | 8096 | billing_db | 1h |
| SecurityService | 8097 | security_db | 1.5h |
| RecommendationService | 8098 | recommendations_db | 1h |

### Entregables
- [ ] 8 servicios Spring Boot con APIs REST
- [ ] Registro en Eureka
- [ ] Comunicación via Kafka para eventos
- [ ] Saga Pattern implementado en OrderService
- [ ] JWT validation en cada servicio
- [ ] Swagger/OpenAPI en cada servicio

### Funcionalidades Clave por Servicio

**OrderService (Orchestrator)**
- Crear orden (inicia Saga)
- Cancelar orden (compensación)
- Estado de orden
- Historial de pedidos

**CatalogService**
- CRUD productos (3 tipos: físico, servicio, suscripción)
- Búsqueda y filtros
- Gestión de inventario
- Categorías

**CustomerService**
- Registro/Login
- Perfil de usuario
- Direcciones
- Wishlist

**PaymentService**
- Procesar pago (mock)
- Verificar pago
- Reembolsos

**NotificationService**
- Enviar email (via MailDev)
- Enviar SMS (log simulado)
- Push notifications (log simulado)
- Templates de notificación

**BillingService**
- Generar factura
- Historial de facturas

**SecurityService**
- Login/Logout
- JWT tokens
- Roles y permisos
- Auditoría

**RecommendationService**
- Productos recomendados por usuario
- Productos relacionados
- Trending/populares
- Basado en historial de compras

---

## Track 3: Integration Layer + Mock Providers (12h)

**Responsable**: Persona 3
**Objetivo**: Capa de integración y proveedores mock funcionando

### Componentes

| Componente | Puerto | Tecnología | Tiempo Est. |
|------------|--------|------------|-------------|
| IntegrationService | 8085 | Spring Boot | 2h |
| HTTPS Adapter | 3001 | Node.js/Express | 1.5h |
| SOAP Adapter | 3002 | Node.js/soap | 2h |
| RPC Adapter | 3003 | Node.js/grpc | 2h |
| Mock Provider REST | 4001 | Node.js/Express | 1.5h |
| Mock Provider SOAP | 4002 | Node.js/soap | 1.5h |
| Mock Provider gRPC | 4003 | Node.js/grpc | 1.5h |

### Entregables
- [ ] IntegrationService como orquestador
- [ ] 3 Adapters de protocolo funcionando
- [ ] 3 Mock Providers con datos realistas
- [ ] Transformación de mensajes
- [ ] Circuit breaker implementado
- [ ] Logs de todas las integraciones

### Mock Providers Detalle

**REST Provider (Productos Físicos)** - Puerto 4001
```
GET /api/products - Lista productos
GET /api/products/:id - Detalle producto
POST /api/orders - Crear orden
GET /api/orders/:id/status - Estado envío
GET /api/inventory/:productId - Stock disponible
```
Simula: Amazon-like, productos electrónicos, ropa, etc.

**SOAP Provider (Servicios)** - Puerto 4002
```
BookService - Reservar servicio
CancelBooking - Cancelar reserva
GetAvailability - Disponibilidad
GetServiceDetails - Detalles del servicio
```
Simula: Servicios profesionales, citas médicas, consultorías

**gRPC Provider (Suscripciones Digitales)** - Puerto 4003
```
CreateSubscription - Nueva suscripción
CancelSubscription - Cancelar
GetSubscriptionStatus - Estado
ListUserSubscriptions - Suscripciones del usuario
GrantAccess - Dar acceso a contenido
```
Simula: Netflix-like, software SaaS, contenido digital

---

## Track 4: Frontend MVVM + Demo End-to-End (12h)

**Responsable**: Persona 4
**Objetivo**: Interfaces de usuario y flujo completo demostrable

### Componentes

| Componente | Puerto | Tecnología | Tiempo Est. |
|------------|--------|------------|-------------|
| Customer Portal | 3000 | React + MVVM | 5h |
| Admin Dashboard | 3010 | React + MVVM | 5h |
| Demo Scripts | - | Cypress/Manual | 2h |

### Entregables Customer Portal
- [ ] Registro de usuario
- [ ] Login/Logout
- [ ] Página de recomendaciones personalizadas
- [ ] Catálogo con 3 tipos de productos
- [ ] Búsqueda y filtros
- [ ] Detalle de producto
- [ ] Carrito de compras
- [ ] Checkout completo
- [ ] Tracking de pedidos
- [ ] Gestión de reservas (servicios)
- [ ] Acceso a suscripciones activas
- [ ] Historial de compras
- [ ] Perfil de usuario

### Entregables Admin Dashboard (4 Vistas)

**Vista Admin Negocio**
- Dashboard de ventas
- Reportes de ingresos
- KPIs principales
- Gestión de promociones

**Vista Admin Contenido**
- CRUD de productos
- Gestión de categorías
- Gestión de proveedores
- Contenido multimedia

**Vista Admin IT**
- Estado de servicios (health)
- Métricas de sistema
- Logs centralizados
- Configuración de integraciones

**Vista Admin Operaciones**
- Gestión de órdenes
- Fulfillment
- Incidencias
- Gestión de inventario

### Estructura MVVM
```
src/
├── models/          # Tipos e interfaces
├── viewmodels/      # Lógica de estado (hooks)
├── views/           # Componentes UI
├── services/        # API calls
└── stores/          # Estado global (Zustand)
```

---

## Flujo End-to-End Completo

### Flujo Cliente (DEBE FUNCIONAR)

```
1. REGISTRO
   Usuario → CustomerPortal → Gateway → CustomerService → MySQL
   ← Email bienvenida (MailDev)

2. LOGIN
   Usuario → CustomerPortal → Gateway → SecurityService → JWT

3. VER RECOMENDACIONES
   Usuario logueado → Home → Gateway → RecommendationService
   ← Lista productos recomendados personalizados

4. EXPLORAR CATÁLOGO
   Usuario → Catálogo → Gateway → CatalogService
   ← Productos (físicos + servicios + suscripciones)
   Filtrar por tipo, categoría, precio

5. VER DETALLE PRODUCTO FÍSICO
   Usuario → Producto → Gateway → CatalogService
   → IntegrationService → HTTPS Adapter → Mock REST Provider
   ← Stock en tiempo real, tiempo de envío

6. VER DETALLE SERVICIO
   Usuario → Servicio → Gateway → CatalogService
   → IntegrationService → SOAP Adapter → Mock SOAP Provider
   ← Disponibilidad de horarios

7. VER DETALLE SUSCRIPCIÓN
   Usuario → Suscripción → Gateway → CatalogService
   → IntegrationService → RPC Adapter → Mock gRPC Provider
   ← Planes disponibles, features

8. AGREGAR AL CARRITO
   Usuario → Add to Cart → CustomerPortal (local state)

9. CHECKOUT - PRODUCTO FÍSICO
   Usuario → Checkout → Gateway → OrderService (Saga)
   → PaymentService (mock) ✓
   → IntegrationService → Mock REST → Crear orden proveedor ✓
   → CatalogService → Actualizar inventario ✓
   → NotificationService → Email confirmación ✓
   → BillingService → Generar factura ✓
   ← Orden confirmada

10. CHECKOUT - SERVICIO (RESERVA)
    Usuario → Checkout → Gateway → OrderService (Saga)
    → PaymentService ✓
    → IntegrationService → Mock SOAP → BookService ✓
    → NotificationService → Email + SMS confirmación ✓
    → BillingService ✓
    ← Reserva confirmada con código

11. CHECKOUT - SUSCRIPCIÓN
    Usuario → Checkout → Gateway → OrderService (Saga)
    → PaymentService (recurrente mock) ✓
    → IntegrationService → Mock gRPC → CreateSubscription ✓
    → NotificationService → Email acceso ✓
    → BillingService ✓
    ← Acceso inmediato activado

12. TRACKING PRODUCTO FÍSICO
    Usuario → Mis Pedidos → Gateway → OrderService
    → IntegrationService → Mock REST → GetOrderStatus
    ← Estado: Preparando/Enviado/En camino/Entregado

13. VER RESERVA ACTIVA
    Usuario → Mis Reservas → Gateway → OrderService
    → IntegrationService → Mock SOAP → GetBookingDetails
    ← Fecha, hora, código, instrucciones

14. ACCEDER SUSCRIPCIÓN
    Usuario → Mis Suscripciones → Gateway → OrderService
    → IntegrationService → Mock gRPC → GetSubscriptionStatus
    ← Contenido disponible, fecha renovación

15. CANCELAR ORDEN (Compensación Saga)
    Usuario → Cancelar → Gateway → OrderService
    → Saga Compensación:
      → PaymentService → Refund ✓
      → Proveedor correspondiente → Cancel ✓
      → NotificationService → Email cancelación ✓
    ← Cancelación confirmada
```

### Flujo Admin (DEBE FUNCIONAR)

```
1. LOGIN ADMIN
   Admin → AdminDashboard → Gateway → SecurityService
   ← JWT con rol admin + tipo (negocio/contenido/it/operaciones)

2. SELECCIONAR VISTA
   Admin → Seleccionar tipo de administración
   → Cargar dashboard correspondiente

3. ADMIN NEGOCIO
   - Ver dashboard ventas del día/semana/mes
   - Ver top productos vendidos
   - Ver ingresos por categoría
   - Crear/editar promociones

4. ADMIN CONTENIDO
   - CRUD productos (crear físico, servicio, suscripción)
   - Asignar categorías
   - Configurar proveedor mock
   - Subir imágenes (mock URLs)

5. ADMIN IT
   - Ver estado health de todos los servicios
   - Ver métricas Prometheus/Grafana
   - Ver trazas en Jaeger
   - Ver logs de integración

6. ADMIN OPERACIONES
   - Ver órdenes pendientes
   - Marcar como procesado/enviado
   - Gestionar incidencias
   - Ver niveles de inventario
```

---

## Diagrama de Dependencias entre Tracks

```
                    ┌─────────────────────┐
                    │      Track 1        │
                    │   Infrastructure    │
                    │  (DEBE IR PRIMERO)  │
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
    │    Track 2      │ │   Track 3   │ │    Track 4      │
    │   Enterprise    │ │ Integration │ │    Frontend     │
    │    Services     │ │  + Mocks    │ │     MVVM        │
    └────────┬────────┘ └──────┬──────┘ └────────┬────────┘
             │                 │                  │
             └─────────────────┴──────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │   INTEGRACIÓN E2E   │
                    │   (Últimas 2-3h)    │
                    └─────────────────────┘
```

---

## Timeline Sugerido

```
Hora 0-2:   Track 1 configura infra básica (MySQL, Redis, Kafka)
            Track 2-4 preparan estructuras de proyecto

Hora 2-4:   Track 1 completa Gateway + Eureka
            Track 2 desarrolla CustomerService + SecurityService
            Track 3 desarrolla IntegrationService + HTTPS Adapter
            Track 4 desarrolla estructura React + Login/Registro

Hora 4-6:   Track 1 completa observabilidad
            Track 2 desarrolla CatalogService + OrderService
            Track 3 desarrolla SOAP + gRPC Adapters
            Track 4 desarrolla Catálogo + Carrito

Hora 6-8:   Track 1 soporte + optimización
            Track 2 desarrolla PaymentService + NotificationService
            Track 3 desarrolla 3 Mock Providers
            Track 4 desarrolla Checkout + Tracking

Hora 8-10:  Track 2 completa BillingService + RecommendationService
            Track 3 completa integraciones
            Track 4 desarrolla Admin Dashboard

Hora 10-12: TODOS - Integración E2E
            - Probar flujo completo cliente
            - Probar flujo completo admin
            - Corregir bugs
            - Demo final
```

---

## Comunicación entre Tracks

### Contratos API (Definir en Hora 0-1)

Cada track debe exponer y consumir APIs según este contrato:

**Gateway Routes (Track 1 define)**
```yaml
/api/customers/** → CustomerService:8093
/api/catalog/** → CatalogService:8092
/api/orders/** → OrderService:8091
/api/payments/** → PaymentService:8094
/api/notifications/** → NotificationService:8095
/api/billing/** → BillingService:8096
/api/security/** → SecurityService:8097
/api/recommendations/** → RecommendationService:8098
/api/integration/** → IntegrationService:8085
```

**Eventos Kafka (Track 2 define)**
```
order.created → NotificationService, BillingService
order.cancelled → PaymentService, NotificationService
payment.completed → OrderService
payment.failed → OrderService
```

---

## Datos Fake Requeridos

### Usuarios de Prueba
```
- cliente@test.com / password123 (rol: CUSTOMER)
- admin.negocio@test.com / admin123 (rol: ADMIN_NEGOCIO)
- admin.contenido@test.com / admin123 (rol: ADMIN_CONTENIDO)
- admin.it@test.com / admin123 (rol: ADMIN_IT)
- admin.operaciones@test.com / admin123 (rol: ADMIN_OPERACIONES)
```

### Productos de Prueba (mínimo 3 de cada tipo)
```
FÍSICOS:
- Laptop Gaming XPS (proveedor REST)
- Smartphone Galaxy S24 (proveedor REST)
- Audífonos Bluetooth (proveedor REST)

SERVICIOS:
- Consulta Médica General (proveedor SOAP)
- Asesoría Legal 1 hora (proveedor SOAP)
- Clase de Yoga Personal (proveedor SOAP)

SUSCRIPCIONES:
- Plan Streaming Premium (proveedor gRPC)
- Software Productividad Pro (proveedor gRPC)
- Contenido Educativo Ilimitado (proveedor gRPC)
```

### Categorías
```
- Electrónica
- Ropa y Accesorios
- Salud y Bienestar
- Servicios Profesionales
- Entretenimiento Digital
- Educación
```

---

## Criterios de Éxito

1. **Flujo E2E Cliente**: Usuario puede registrarse, ver recomendaciones, comprar cada tipo de producto, y hacer seguimiento
2. **Flujo E2E Admin**: Admin puede loguearse y acceder a sus 4 vistas específicas
3. **Integración 3 Protocolos**: REST, SOAP y gRPC funcionando con mock providers
4. **Saga Pattern**: Orden puede crearse y cancelarse con compensación
5. **Observabilidad**: Métricas y trazas visibles en Grafana/Jaeger
6. **Kubernetes Ready**: Todo desplegable en K8s local

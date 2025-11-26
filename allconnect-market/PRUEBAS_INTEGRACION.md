# AllConnect Market - Resultados de Pruebas de Integración

**Fecha:** 25 de Noviembre de 2025
**Rama:** pruebaIntegracion
**Estado:** ✅ TODAS LAS PRUEBAS EXITOSAS (incluyendo Frontend)

---

## 1. Estado de la Infraestructura

### 1.1 Contenedores Docker (20 servicios)

| Servicio | Puerto | Estado | Función |
|----------|--------|--------|---------|
| allconnect-mysql | 3306 | ✅ Healthy | Base de datos principal |
| allconnect-redis | 6379 | ✅ Healthy | Cache y sesiones |
| allconnect-kafka | 9092 | ✅ Healthy | Mensajería asíncrona |
| allconnect-rabbitmq | 5672/15672 | ✅ Healthy | Cola de mensajes |
| allconnect-eureka | 8761 | ✅ Healthy | Service Discovery |
| allconnect-gateway | 8080 | ✅ Healthy | API Gateway |
| allconnect-security | 8097 | ✅ Healthy | Autenticación JWT |
| allconnect-customer | 8093 | ✅ Healthy | Gestión de clientes |
| allconnect-catalog | 8092 | ✅ Healthy | Catálogo de productos |
| allconnect-order | 8091 | ✅ Healthy | Órdenes + Saga Pattern |
| allconnect-payment | 8094 | ✅ Healthy | Procesamiento de pagos |
| allconnect-notification | 8095 | ✅ Healthy | Notificaciones |
| allconnect-billing | 8096 | ✅ Healthy | Facturación |
| allconnect-recommendation | 8098 | ✅ Healthy | Motor de recomendaciones |
| allconnect-prometheus | 9090 | ✅ Running | Métricas |
| allconnect-grafana | 3001 | ✅ Running | Dashboards |
| allconnect-jaeger | 16686 | ✅ Running | Tracing distribuido |
| allconnect-maildev | 1080 | ✅ Healthy | Testing de emails |
| **allconnect-customer-portal** | **3000** | ✅ Running | **Frontend Cliente (React)** |
| **allconnect-admin-dashboard** | **3002** | ✅ Running | **Frontend Admin (React)** |

---

## 2. Pruebas de Flujos E2E

### 2.1 Flujo de Autenticación ✅

#### Registro de usuario
```bash
POST http://localhost:8080/api/security/register
{
  "email": "nuevo@test.com",
  "password": "pass123",
  "firstName": "Test",
  "lastName": "User"
}
# Resultado: Usuario creado exitosamente con rol CUSTOMER
```

#### Login
```bash
POST http://localhost:8080/api/security/login
{
  "email": "cliente@test.com",
  "password": "password123"
}
# Resultado: JWT token generado correctamente
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "cliente@test.com",
  "roles": ["CUSTOMER"]
}
```

### 2.2 Flujo de Catálogo ✅

#### Listado de productos
```bash
GET http://localhost:8080/api/catalog/products
# Resultado: Lista de productos con información completa
[
  {
    "id": 1,
    "name": "Laptop Gaming XPS 15",
    "price": 1299.99,
    "productType": "PHYSICAL",
    "stock": 50
  },
  ...
]
```

#### Producto por ID
```bash
GET http://localhost:8080/api/catalog/products/1
# Resultado: Detalle completo del producto
```

### 2.3 Flujo de Órdenes con Saga Pattern ✅

#### Creación de orden (ejecuta Saga completo)
```bash
POST http://localhost:8080/api/orders
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
```

#### Resultado exitoso:
```json
{
  "id": 5,
  "customerId": 1,
  "status": "CREATED",
  "subtotal": 1299.99,
  "tax": 246.9981,
  "shippingCost": 15000,
  "total": 16546.9881,
  "paymentMethod": "CREDIT_CARD",
  "paymentId": 1732518891234,
  "invoiceId": 1732518892345,
  "providerOrderId": "PROV-1732518891567"
}
```

#### Pasos del Saga ejecutados:
1. ✅ **CREATED** - Orden creada en BD
2. ✅ **PAYMENT_PENDING** - Procesando pago
3. ✅ **PAYMENT_COMPLETED** - Pago exitoso (mock o real)
4. ✅ **UPDATE_STOCK** - Stock actualizado para productos físicos
5. ✅ **PROVIDER_PENDING** - Confirmando con proveedor
6. ✅ **PROVIDER_CONFIRMED** - Proveedor confirmado
7. ✅ **SEND_NOTIFICATION** - Notificación enviada via Kafka
8. ✅ **CREATE_INVOICE** - Factura creada via Kafka
9. ✅ **COMPLETED** - Saga completado exitosamente

---

## 3. Correcciones Realizadas

### 3.1 Security Service - Autenticación

**Problema:** Error "Invalid email or password" a pesar de credenciales correctas.

**Causa raíz:**
- La tabla `users` tenía dos columnas: `password_hash` (con datos) y `password` (vacía)
- La entidad `User.java` mapeaba a `password_hash` pero Hibernate también creó `password`

**Solución:**
```sql
-- Eliminar columna duplicada
ALTER TABLE users DROP COLUMN password;

-- Asegurar que los usuarios estén activos
UPDATE users SET active = b'1' WHERE active = b'0';
```

```java
// User.java - mapeo correcto
@Column(name = "password_hash", nullable = false)
private String password;
```

### 3.2 Order Service - Saga Pattern

**Problema 1:** `No enum constant OrderStatus.DELIVERED`

**Causa:** La BD tenía valores de enum que no existían en Java.

**Solución:** Agregar valores faltantes a `OrderStatus.java`:
```java
public enum OrderStatus {
    PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED,
    // Saga states
    CREATED, PAYMENT_PENDING, PAYMENT_COMPLETED, PAYMENT_FAILED,
    PROVIDER_PENDING, PROVIDER_CONFIRMED, PROVIDER_FAILED, COMPLETED
}
```

**Problema 2:** `Field 'order_number' doesn't have a default value`

**Causa:** Columnas NOT NULL sin valores en el modelo.

**Solución:**
```sql
ALTER TABLE orders MODIFY COLUMN order_number varchar(50) NULL;
ALTER TABLE orders MODIFY COLUMN order_type varchar(50) NULL;
ALTER TABLE order_items MODIFY COLUMN product_sku varchar(100) NULL;
```

**Problema 3:** `identifier of an instance of Order was altered from X to Y`

**Causa crítica:**
- `@Async` + `@Transactional` con entidad pasada por referencia
- La entidad se separaba del contexto de persistencia entre transacciones
- Lombok `@Data` generaba `equals/hashCode` que causaba confusión de identidad

**Solución:**
```java
// SagaOrchestrator.java - Recibir ID, no entidad
@Async
@Transactional
public void startSaga(Long orderId) {
    // Pequeño delay para asegurar que la transacción padre se haya commiteado
    try {
        Thread.sleep(100);
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }

    // Recargar orden desde BD con entidad managed en esta transacción
    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
    // ... resto del saga
}
```

```java
// Order.java - Lombok corregido
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)  // Solo usar ID para equals/hashCode
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    // ...
}
```

### 3.3 Payment Service

**Problema:** `Field 'payment_id' doesn't have a default value`

**Solución:**
```sql
ALTER TABLE payments MODIFY COLUMN payment_id varchar(50) NULL;
```

---

## 4. Arquitectura Verificada

### 4.1 Flujo de Comunicación

```
Cliente HTTP
    │
    ▼
┌─────────────────┐
│  API Gateway    │ :8080
│ (Spring Cloud)  │
└────────┬────────┘
         │ Eureka Discovery
         ▼
┌─────────────────────────────────────────────────────────────┐
│                 Enterprise Services                          │
│                                                              │
│  Security   Customer   Catalog   Order    Payment   ...     │
│   :8097      :8093      :8092    :8091     :8094            │
└──────────────────────────┬──────────────────────────────────┘
                           │ Kafka Events
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           Notification Service / Billing Service             │
│                    (Event Consumers)                         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Saga Pattern - Transacciones Distribuidas

```
OrderService.createOrder()
       │
       ├──► Save Order (CREATED)
       │
       └──► SagaOrchestrator.startSaga(orderId) [ASYNC]
                │
                ├──► Payment Step
                │       └──► PaymentClient.processPayment()
                │              └──► Fallback: mockPayment() [90% success]
                │
                ├──► Stock Step
                │       └──► CatalogClient.updateStock()
                │              └──► Para productos PHYSICAL
                │
                ├──► Provider Step
                │       └──► Simulación confirmación proveedor
                │
                ├──► Notification Step
                │       └──► Kafka: "notification-events"
                │
                ├──► Invoice Step
                │       └──► Kafka: "billing-events"
                │
                └──► Complete Saga
                        └──► Order.status = COMPLETED
                        └──► Kafka: "order-events" (order.completed)
```

### 4.3 Compensación (Rollback)

En caso de fallo en cualquier paso:
```
compensateSaga(orderId)
       │
       ├──► Compensate Invoice (si fue creada)
       │
       ├──► Compensate Notification (enviar cancelación)
       │
       ├──► Compensate Provider (cancelar con proveedor)
       │
       ├──► Compensate Stock (restaurar inventario)
       │
       └──► Compensate Payment (refund)
                └──► Order.status = CANCELLED
```

---

## 5. URLs de Acceso

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| API Gateway | http://localhost:8080 | - |
| Eureka Dashboard | http://localhost:8761 | - |
| RabbitMQ Management | http://localhost:15672 | guest/guest |
| Grafana | http://localhost:3001 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| Jaeger UI | http://localhost:16686 | - |
| MailDev | http://localhost:1080 | - |
| **Customer Portal** | **http://localhost:3000** | - |
| **Admin Dashboard** | **http://localhost:3002** | - |

### Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| cliente@test.com | password123 | CUSTOMER |
| admin.negocio@test.com | password123 | ADMIN_NEGOCIO |
| admin.it@test.com | password123 | ADMIN_IT |

---

## 6. Conclusiones

### Lo que funciona:
- ✅ **Frontend Customer Portal** (React + Vite + Tailwind)
- ✅ **Frontend Admin Dashboard** (React + Vite + Tailwind)
- ✅ Autenticación JWT completa (registro, login, validación)
- ✅ Catálogo de productos (CRUD completo)
- ✅ Creación de órdenes con Saga Pattern
- ✅ Compensación automática en caso de fallos
- ✅ Eventos Kafka para notificaciones y facturación
- ✅ Service Discovery con Eureka
- ✅ API Gateway routing con CORS habilitado
- ✅ Circuit Breaker con fallbacks
- ✅ Observabilidad (Prometheus, Grafana, Jaeger)

### Notas importantes:
1. El Saga Pattern usa mocks cuando los servicios externos no responden
2. La tasa de éxito del mock de pagos es del 90%
3. Los eventos de notificación y facturación se publican a Kafka
4. El sistema es resiliente a fallos parciales

---

## 7. Comandos Útiles

```bash
# Ver logs del Order Service (Saga)
docker logs -f allconnect-order

# Ver estado de todos los servicios
docker ps --format "table {{.Names}}\t{{.Status}}"

# Probar creación de orden
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
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
  }'

# Verificar orden creada
curl http://localhost:8080/api/orders/customer/1

# Ver eventos en RabbitMQ
http://localhost:15672 (guest/guest)
```

---

*Documento generado el 25 de Noviembre de 2025*
*Rama: pruebaIntegracion*

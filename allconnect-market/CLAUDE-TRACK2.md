# Track 2: Enterprise Services Core

## TU MISIÓN

Eres responsable de los 8 microservicios de negocio. Estos son el corazón del sistema - toda la lógica de negocio pasa por aquí.

**Lee primero**: CLAUDE.md y TRACKS_DIVISION.md

---

## CHECKLIST DE TAREAS

Actualiza este checklist frecuentemente marcando con [x] lo completado:

### Fase 1: Setup Base (Horas 0-2)

#### Estructura de Proyectos
- [x] Crear estructura de carpetas /services/
- [x] Configurar parent POM (si usas Maven) o settings.gradle
- [x] Template de servicio base listo

#### Dependencias Comunes (Cada servicio)
- [x] Spring Boot 3.x
- [x] Spring Web
- [x] Spring Data JPA
- [x] MySQL Connector
- [x] Eureka Client
- [x] Spring Actuator
- [x] SpringDoc OpenAPI (Swagger)
- [x] Lombok

### Fase 2: SecurityService (Horas 2-3.5)

**Puerto: 8097**

#### Endpoints
- [x] POST /api/security/register - Registro de usuario
- [x] POST /api/security/login - Login, retorna JWT
- [x] POST /api/security/logout - Invalidar token
- [x] GET /api/security/validate - Validar token
- [x] GET /api/security/me - Info del usuario actual
- [x] GET /api/security/users/{id} - Obtener usuario por ID (adicional)

#### Funcionalidad
- [x] Generación de JWT tokens (JJWT 0.12.3)
- [x] Hash de passwords (BCrypt)
- [x] Roles: CUSTOMER, ADMIN_NEGOCIO, ADMIN_CONTENIDO, ADMIN_IT, ADMIN_OPERACIONES
- [x] Token expiration (24h - 86400000ms)
- [x] Registrado en Eureka
- [x] Swagger funcionando
- [x] GlobalExceptionHandler implementado
- [x] Kafka producer para eventos de usuario

#### Verificación
- [ ] Puedo registrar un usuario nuevo (requiere infraestructura)
- [ ] Puedo hacer login y recibir JWT (requiere infraestructura)
- [ ] El token es válido y contiene el rol (requiere infraestructura)

### Fase 3: CustomerService (Horas 3.5-5)

**Puerto: 8093**

#### Endpoints
- [x] GET /api/customers/{id} - Obtener perfil
- [x] POST /api/customers/{id} - Crear perfil
- [x] PUT /api/customers/{id} - Actualizar perfil
- [x] GET /api/customers/{id}/addresses - Listar direcciones
- [x] GET /api/customers/{id}/addresses/default - Obtener dirección por defecto
- [x] POST /api/customers/{id}/addresses - Agregar dirección
- [x] DELETE /api/customers/{id}/addresses/{addressId} - Eliminar dirección
- [x] GET /api/customers/{id}/wishlist - Listar wishlist
- [x] POST /api/customers/{id}/wishlist - Agregar a wishlist
- [x] DELETE /api/customers/{id}/wishlist/{productId} - Quitar de wishlist

#### Entidades
- [x] Customer (id, email, firstName, lastName, phone, profileImageUrl, createdAt, updatedAt)
- [x] Address (id, customerId, street, city, state, zipCode, country, additionalInfo, isDefault, addressType)
- [x] WishlistItem (id, customerId, productId, addedAt)
- [x] AddressType enum (HOME, WORK, OTHER)

#### Verificación
- [ ] Puedo crear y obtener perfil de cliente (requiere infraestructura)
- [ ] Puedo agregar/listar direcciones (requiere infraestructura)
- [ ] Wishlist funciona correctamente (requiere infraestructura)

### Fase 4: CatalogService (Horas 5-7)

**Puerto: 8092**

#### Endpoints
- [x] GET /api/catalog/products - Listar productos (con filtros y paginación)
- [x] GET /api/catalog/products/all - Listar todos los productos activos
- [x] GET /api/catalog/products/{id} - Detalle producto
- [x] POST /api/catalog/products - Crear producto (admin)
- [x] PUT /api/catalog/products/{id} - Actualizar producto (admin)
- [x] DELETE /api/catalog/products/{id} - Eliminar producto (soft delete)
- [x] GET /api/catalog/categories - Listar categorías
- [x] GET /api/catalog/categories/root - Listar categorías raíz
- [x] GET /api/catalog/categories/{id} - Obtener categoría por ID
- [x] POST /api/catalog/categories - Crear categoría
- [x] PUT /api/catalog/categories/{id} - Actualizar categoría
- [x] GET /api/catalog/products/type/{type} - Filtrar por tipo
- [x] GET /api/catalog/products/category/{categoryId} - Filtrar por categoría
- [x] PUT /api/catalog/products/{id}/stock - Actualizar stock (ADD/SUBTRACT/SET)

#### Entidades
- [x] Product (id, name, description, price, type, categoryId, providerType, providerProductId, stock, imageUrl, brand, sku, billingPeriod, durationMinutes, active)
- [x] Category (id, name, description, imageUrl, parentId, active)
- [x] ProductType enum (PHYSICAL, SERVICE, SUBSCRIPTION)
- [x] ProviderType enum (REST, SOAP, GRPC)

#### Filtros soportados
- [x] Por categoría: ?categoryId=1
- [x] Por tipo: ?type=PHYSICAL|SERVICE|SUBSCRIPTION
- [x] Por precio: ?minPrice=10&maxPrice=100
- [x] Búsqueda: ?search=laptop
- [x] Paginación: ?page=0&size=20
- [x] Ordenamiento: ?sortBy=createdAt

#### Verificación
- [ ] Puedo listar todos los productos (requiere infraestructura)
- [ ] Los filtros funcionan correctamente (requiere infraestructura)
- [ ] Puedo crear/editar productos como admin (requiere infraestructura)

### Fase 5: OrderService - Saga Orchestrator (Horas 7-9)

**Puerto: 8091**

#### Endpoints
- [x] POST /api/orders - Crear orden (inicia Saga)
- [x] GET /api/orders/{id} - Obtener orden
- [x] GET /api/orders/customer/{customerId} - Órdenes del cliente
- [x] GET /api/orders/customer/{customerId}/paged - Órdenes paginadas
- [x] PUT /api/orders/{id}/cancel - Cancelar orden (compensación)
- [x] GET /api/orders/{id}/status - Estado de la orden

#### Entidades
- [x] Order (id, customerId, status, subtotal, tax, shippingCost, total, shippingAddress, paymentMethod, paymentId, invoiceId, providerOrderId, notes, items, createdAt, updatedAt)
- [x] OrderItem (id, order, productId, productName, productType, quantity, unitPrice, totalPrice, bookingDate, bookingTime, subscriptionStart, subscriptionEnd)
- [x] SagaState (id, orderId, currentStep, status, paymentCompleted, stockUpdated, providerConfirmed, notificationSent, invoiceCreated, compensationData, errorMessage, createdAt, updatedAt)
- [x] OrderStatus enum (CREATED, PAYMENT_PENDING, PAYMENT_COMPLETED, PAYMENT_FAILED, PROVIDER_PENDING, PROVIDER_CONFIRMED, PROVIDER_FAILED, COMPLETED, CANCELLED, REFUNDED)
- [x] SagaStep enum (CREATED, PROCESS_PAYMENT, UPDATE_STOCK, CONFIRM_PROVIDER, SEND_NOTIFICATION, CREATE_INVOICE, COMPLETED, COMPENSATING, FAILED)
- [x] SagaStatus enum (IN_PROGRESS, COMPLETED, FAILED, COMPENSATING, COMPENSATED)
- [x] ProductType enum (PHYSICAL, SERVICE, SUBSCRIPTION)

#### Estados de Orden
- [x] CREATED → PAYMENT_PENDING → PAYMENT_COMPLETED → PROVIDER_CONFIRMED → COMPLETED
- [x] CANCELLED (desde cualquier estado anterior a COMPLETED)
- [x] REFUNDED (después de compensación)

#### Saga Steps
1. [x] Crear orden en BD
2. [x] Llamar PaymentService (Feign Client con Circuit Breaker)
3. [x] Confirmar con proveedor (mock)
4. [x] Actualizar stock en CatalogService (Feign Client)
5. [x] Llamar NotificationService (via Kafka)
6. [x] Llamar BillingService (via Kafka)

#### Compensación (si falla)
- [x] Revertir pago (refund via Feign)
- [x] Cancelar en proveedor
- [x] Restaurar stock (ADD via Feign)
- [x] Notificar cancelación (via Kafka)
- [x] Anular factura

#### Eventos Kafka
- [x] Publicar: order.created, order.cancelled, order.completed
- [x] Publicar a notification-events y billing-events

#### Feign Clients
- [x] PaymentClient (processPayment, refundPayment, getPayment)
- [x] CatalogClient (getProduct, updateStock)

#### Resilience4j
- [x] Circuit Breaker para paymentService
- [x] Circuit Breaker para catalogService
- [x] Fallback methods implementados

### Fase 6: PaymentService (Horas 9-10)

**Puerto: 8094**

#### Endpoints
- [x] POST /api/payments/process - Procesar pago
- [x] GET /api/payments/{id} - Obtener pago
- [x] POST /api/payments/{id}/refund - Reembolso
- [x] GET /api/payments/order/{orderId} - Pagos de una orden
- [x] GET /api/payments/customer/{customerId} - Pagos de un cliente

#### Entidades
- [x] Payment (id, orderId, customerId, amount, status, method, transactionId, cardLastFour, cardBrand, errorMessage, gatewayResponse, refundId, refundedAmount, createdAt, updatedAt)
- [x] PaymentStatus enum (PROCESSING, COMPLETED, FAILED, REFUNDED)
- [x] PaymentMethod enum (CREDIT_CARD, DEBIT_CARD, PSE, CASH_ON_DELIVERY)

#### Mock de Pago
- [x] Simular procesamiento (1.5 segundos delay configurable)
- [x] 90% éxito, 10% fallo (configurable via application.yml)
- [x] Generar transactionId único (TXN-XXXXXXXX)
- [x] Detección de marca de tarjeta (VISA, MASTERCARD, AMEX)

#### Eventos Kafka
- [x] Publicar: payment.completed, payment.failed, payment.refunded

### Fase 7: NotificationService (Horas 10-10.5)

**Puerto: 8095**

#### Endpoints
- [x] POST /api/notifications/email - Enviar email
- [x] POST /api/notifications/sms - Enviar SMS (mock)
- [x] POST /api/notifications/push - Enviar push (mock)
- [x] GET /api/notifications/{id} - Obtener notificación por ID
- [x] GET /api/notifications/customer/{customerId} - Historial
- [x] GET /api/notifications/order/{orderId} - Notificaciones de una orden

#### Entidades
- [x] Notification (id, customerId, type, channel, recipient, subject, content, status, errorMessage, orderId, createdAt, sentAt)
- [x] NotificationType enum (WELCOME, ORDER_CONFIRMATION, ORDER_SHIPPED, ORDER_DELIVERED, ORDER_CANCELLED, PAYMENT_RECEIVED, PAYMENT_FAILED, PASSWORD_RESET, PROMOTION, GENERAL)
- [x] NotificationChannel enum (EMAIL, SMS, PUSH)
- [x] NotificationStatus enum (PENDING, SENT, FAILED, DELIVERED)

#### Integración
- [x] Email via SMTP a MailDev (puerto 1025)
- [x] SMS: log en consola simulando envío
- [x] Push: log en consola simulando envío

#### Templates (contenido por defecto)
- [x] Bienvenida (registro)
- [x] Confirmación de orden
- [x] Orden enviada
- [x] Orden cancelada
- [x] Pago recibido
- [x] Pago fallido

#### Kafka Consumers
- [x] notification-events - Eventos genéricos de notificación
- [x] user-events - Enviar email de bienvenida en registro
- [x] order-events - Notificar estados de orden
- [x] payment-events - Notificar estados de pago

### Fase 8: BillingService (Horas 10.5-11)

**Puerto: 8096**

#### Endpoints
- [x] POST /api/billing/invoices - Generar factura
- [x] GET /api/billing/invoices/{id} - Obtener factura
- [x] GET /api/billing/invoices/number/{invoiceNumber} - Obtener por número
- [x] GET /api/billing/invoices/order/{orderId} - Factura de una orden
- [x] GET /api/billing/invoices/customer/{customerId} - Facturas del cliente
- [x] GET /api/billing/invoices/{id}/pdf - Descargar PDF (mock URL)
- [x] PUT /api/billing/invoices/{id}/paid - Marcar como pagada
- [x] PUT /api/billing/invoices/{id}/void - Anular factura

#### Entidades
- [x] Invoice (id, invoiceNumber, orderId, customerId, subtotal, tax, shippingCost, total, status, customerName, customerEmail, billingAddress, notes, pdfUrl, issuedAt, paidAt, cancelledAt)
- [x] InvoiceItem (id, invoice, productId, productName, quantity, unitPrice, totalPrice)
- [x] InvoiceStatus enum (DRAFT, ISSUED, PAID, CANCELLED, VOIDED)

#### Funcionalidad
- [x] Generación de número de factura (INV-YYYYMMDD-NNNNN)
- [x] URL mock de PDF
- [x] Kafka producer para eventos de factura

#### Kafka Consumers
- [x] billing-events - Crear factura desde evento
- [x] order-events - Auto-crear factura cuando orden se completa

### Fase 9: RecommendationService (Horas 11-12)

**Puerto: 8098**

#### Endpoints
- [x] GET /api/recommendations/user/{userId} - Recomendaciones personalizadas
- [x] GET /api/recommendations/product/{productId}/related - Productos relacionados
- [x] GET /api/recommendations/trending - Productos trending
- [x] GET /api/recommendations/category/{categoryId} - Por categoría
- [x] POST /api/recommendations/view - Registrar vista de producto

#### Lógica de Recomendación (Simplificada)
- [x] Basado en categorías de compras anteriores (UserPreference)
- [x] Productos de la misma categoría
- [x] Productos más vendidos (mock/random)
- [x] Retornar hasta 10 productos
- [x] Fallback a mock si CatalogService no disponible

#### Entidades
- [x] UserPreference (id, userId, categoryId, weight, purchaseCount, viewCount, createdAt, updatedAt)
- [x] ProductView (id, userId, productId, categoryId, viewedAt)

#### Feign Client
- [x] CatalogClient (getAllProducts, getProduct, getProductsByCategory, getAllCategories)

#### Kafka Consumers
- [x] catalog-events - Actualizar cache de productos
- [x] order-events - Actualizar preferencias de usuario

---

## ESTRUCTURA DE CADA SERVICIO

```
service-name/
├── src/main/java/com/allconnect/servicename/
│   ├── ServiceNameApplication.java
│   ├── config/
│   │   ├── KafkaConfig.java
│   │   └── GlobalExceptionHandler.java
│   ├── controller/
│   │   └── ServiceController.java
│   ├── service/
│   │   └── ServiceService.java
│   ├── repository/
│   │   └── EntityRepository.java
│   ├── model/
│   │   └── Entity.java
│   ├── dto/
│   │   ├── RequestDTO.java
│   │   └── ResponseDTO.java
│   └── client/ (si aplica)
│       └── FeignClient.java
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

### application.yml Template
```yaml
server:
  port: ${PORT}

spring:
  application:
    name: ${SERVICE_NAME}
  datasource:
    url: jdbc:mysql://localhost:3306/${DB_NAME}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: allconnect
    password: allconnect123
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
    consumer:
      group-id: ${SERVICE_NAME}-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "*"

eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
    register-with-eureka: true
    fetch-registry: true
  instance:
    prefer-ip-address: true
    instance-id: ${spring.application.name}:${server.port}

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html

logging:
  level:
    com.allconnect: DEBUG
```

---

## COMUNICACIÓN ENTRE SERVICIOS

### Llamadas Síncronas (REST via Feign)
```java
@FeignClient(name = "catalog-service", url = "${catalog.service.url:http://localhost:8092}")
public interface CatalogClient {
    @GetMapping("/api/catalog/products/{id}")
    Map<String, Object> getProduct(@PathVariable Long id);

    @PutMapping("/api/catalog/products/{id}/stock")
    Map<String, Object> updateStock(@PathVariable Long id, @RequestBody Map<String, Object> request);
}
```

### Eventos Kafka
```java
// Productor
@Autowired
private KafkaTemplate<String, Object> kafkaTemplate;

public void publishOrderCreated(Order order) {
    Map<String, Object> event = new HashMap<>();
    event.put("eventType", "order.created");
    event.put("orderId", order.getId());
    event.put("customerId", order.getCustomerId());
    event.put("total", order.getTotal());
    event.put("timestamp", System.currentTimeMillis());
    kafkaTemplate.send("order-events", event);
}

// Consumidor
@KafkaListener(topics = "payment-events", groupId = "order-service-group")
public void handlePaymentEvent(Map<String, Object> event) {
    String eventType = (String) event.get("eventType");
    if ("payment.completed".equals(eventType)) {
        // Continuar saga
    } else if ("payment.failed".equals(eventType)) {
        // Compensar
    }
}
```

---

## SAGA PATTERN - ORDEN DE EJECUCIÓN

```
Cliente → OrderService (crear orden)
              │
              ▼
         PaymentService (procesar pago)
              │
         ┌────┴────┐
         │         │
      SUCCESS    FAIL
         │         │
         ▼         ▼
    CatalogService  Compensar
    (update stock)  (refund)
         │
         ▼
    Provider (mock)
         │
         ▼
    NotificationSvc (enviar email via Kafka)
         │
         ▼
    BillingService (generar factura via Kafka)
         │
         ▼
      COMPLETED
```

---

## COMANDOS DE VERIFICACIÓN

```bash
# Build completo
cd services && mvn clean compile -DskipTests

# Iniciar todos los servicios (después de infra)
cd services/security-service && mvn spring-boot:run &
cd services/customer-service && mvn spring-boot:run &
cd services/catalog-service && mvn spring-boot:run &
cd services/order-service && mvn spring-boot:run &
cd services/payment-service && mvn spring-boot:run &
cd services/notification-service && mvn spring-boot:run &
cd services/billing-service && mvn spring-boot:run &
cd services/recommendation-service && mvn spring-boot:run &

# Verificar registro en Eureka
open http://localhost:8761

# Probar SecurityService
curl -X POST http://localhost:8097/api/security/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","firstName":"Test","lastName":"User"}'

curl -X POST http://localhost:8097/api/security/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Probar CatalogService
curl http://localhost:8092/api/catalog/products/all

# Ver Swagger de cada servicio
open http://localhost:8097/swagger-ui.html  # Security
open http://localhost:8093/swagger-ui.html  # Customer
open http://localhost:8092/swagger-ui.html  # Catalog
open http://localhost:8091/swagger-ui.html  # Order
open http://localhost:8094/swagger-ui.html  # Payment
open http://localhost:8095/swagger-ui.html  # Notification
open http://localhost:8096/swagger-ui.html  # Billing
open http://localhost:8098/swagger-ui.html  # Recommendation
```

---

## FLUJO E2E DE PRUEBA

```bash
# 1. Registro
curl -X POST http://localhost:8097/api/security/register \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@test.com","password":"password123","firstName":"Cliente","lastName":"Test"}'

# 2. Login
TOKEN=$(curl -s -X POST http://localhost:8097/api/security/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@test.com","password":"password123"}' | jq -r '.token')

# 3. Crear perfil de cliente
curl -X POST http://localhost:8093/api/customers/1 \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@test.com","firstName":"Cliente","lastName":"Test","phone":"3001234567"}'

# 4. Agregar dirección
curl -X POST http://localhost:8093/api/customers/1/addresses \
  -H "Content-Type: application/json" \
  -d '{"street":"Calle 123","city":"Bogotá","state":"Cundinamarca","zipCode":"110111","country":"Colombia","isDefault":true,"addressType":"HOME"}'

# 5. Ver productos
curl http://localhost:8092/api/catalog/products/all

# 6. Crear orden (Checkout SAGA)
curl -X POST http://localhost:8091/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      {"productId": 1, "productName": "Laptop", "productType": "PHYSICAL", "quantity": 1, "unitPrice": 2500000}
    ],
    "shippingAddress": "Calle 123, Bogotá",
    "paymentMethod": "CREDIT_CARD"
  }'

# 7. Consultar orden
curl http://localhost:8091/api/orders/1

# 8. Ver facturas
curl http://localhost:8096/api/billing/invoices/customer/1

# 9. Ver notificaciones
curl http://localhost:8095/api/notifications/customer/1

# 10. Ver recomendaciones
curl http://localhost:8098/api/recommendations/user/1
```

---

## PROBLEMAS COMUNES Y SOLUCIONES

### Servicio no se registra en Eureka
- Verificar que Eureka está corriendo
- Verificar dependencia eureka-client en pom.xml
- Verificar URL en application.yml

### Error de conexión a MySQL
- Verificar que MySQL está corriendo: `docker-compose ps`
- Verificar credenciales en application.yml
- Verificar que el schema existe (createDatabaseIfNotExist=true lo crea)

### Kafka no conecta
- Esperar 30 segundos después de iniciar Kafka
- Verificar bootstrap-servers en application.yml
- Los servicios funcionan sin Kafka pero no publican/consumen eventos

### Feign timeout
- Aumentar timeout en configuración (default 5000ms)
- Verificar que el servicio destino está corriendo
- Circuit Breaker activará fallback automáticamente

---

## MÉTRICAS DE ÉXITO

Al finalizar tu track, debes poder decir SÍ a todas estas preguntas:

1. [x] ¿Los 8 servicios compilan sin errores? **SÍ - BUILD SUCCESS**
2. [ ] ¿Los 8 servicios están corriendo y registrados en Eureka? (requiere infra)
3. [ ] ¿Cada servicio tiene Swagger funcionando? (requiere infra)
4. [ ] ¿Puedo registrar un usuario y hacer login? (requiere infra)
5. [ ] ¿Puedo crear una orden y ver el estado? (requiere infra)
6. [ ] ¿La Saga completa funciona (crear orden → pago → confirmación)? (requiere infra)
7. [ ] ¿La compensación funciona (cancelar orden)? (requiere infra)
8. [ ] ¿Las notificaciones llegan a MailDev? (requiere infra)
9. [ ] ¿Se generan facturas? (requiere infra)
10. [ ] ¿Las recomendaciones retornan productos? (requiere infra)

---

## RESUMEN DE IMPLEMENTACIÓN

### Servicios Implementados: 8/8 ✅

| Servicio | Puerto | Endpoints | Kafka | Feign | Estado |
|----------|--------|-----------|-------|-------|--------|
| SecurityService | 8097 | 6 | Producer | - | ✅ |
| CustomerService | 8093 | 10 | Producer | - | ✅ |
| CatalogService | 8092 | 14 | Producer | - | ✅ |
| OrderService | 8091 | 6 | Producer | PaymentClient, CatalogClient | ✅ |
| PaymentService | 8094 | 5 | Producer | - | ✅ |
| NotificationService | 8095 | 6 | Producer + Consumer | - | ✅ |
| BillingService | 8096 | 8 | Producer + Consumer | - | ✅ |
| RecommendationService | 8098 | 5 | Consumer | CatalogClient | ✅ |

### Total de Endpoints: 60+

---

## NOTAS PARA COORDINACIÓN

**Dependes de Track 1:**
- MySQL con schemas (createDatabaseIfNotExist=true los crea automáticamente)
- Eureka para registro
- Kafka para eventos
- Gateway para exposición

**Track 3 depende de ti:**
- OrderService puede llamar a IntegrationService (actualmente mock)

**Track 4 depende de ti:**
- Todas las APIs de negocio
- JWT para autenticación
- Datos de productos, órdenes, etc.

**PRIORIDAD**: SecurityService y CatalogService primero, son los más usados por otros tracks.

---

## FECHA DE ACTUALIZACIÓN

**Última actualización**: 2025-11-24
**Estado**: Código completo, pendiente verificación E2E con infraestructura

# Track 2: Enterprise Services Core

## TU MISIÓN

Eres responsable de los 8 microservicios de negocio. Estos son el corazón del sistema - toda la lógica de negocio pasa por aquí.

**Lee primero**: CLAUDE.md y TRACKS_DIVISION.md

---

## CHECKLIST DE TAREAS

Actualiza este checklist frecuentemente marcando con [x] lo completado:

### Fase 1: Setup Base (Horas 0-2)

#### Estructura de Proyectos
- [ ] Crear estructura de carpetas /services/
- [ ] Configurar parent POM (si usas Maven) o settings.gradle
- [ ] Template de servicio base listo

#### Dependencias Comunes (Cada servicio)
- [ ] Spring Boot 3.x
- [ ] Spring Web
- [ ] Spring Data JPA
- [ ] MySQL Connector
- [ ] Eureka Client
- [ ] Spring Actuator
- [ ] SpringDoc OpenAPI (Swagger)
- [ ] Lombok

### Fase 2: SecurityService (Horas 2-3.5)

**Puerto: 8097**

#### Endpoints
- [ ] POST /api/security/register - Registro de usuario
- [ ] POST /api/security/login - Login, retorna JWT
- [ ] POST /api/security/logout - Invalidar token
- [ ] GET /api/security/validate - Validar token
- [ ] GET /api/security/me - Info del usuario actual

#### Funcionalidad
- [ ] Generación de JWT tokens
- [ ] Hash de passwords (BCrypt)
- [ ] Roles: CUSTOMER, ADMIN_NEGOCIO, ADMIN_CONTENIDO, ADMIN_IT, ADMIN_OPERACIONES
- [ ] Token expiration (24h)
- [ ] Registrado en Eureka
- [ ] Swagger funcionando

#### Verificación
- [ ] Puedo registrar un usuario nuevo
- [ ] Puedo hacer login y recibir JWT
- [ ] El token es válido y contiene el rol

### Fase 3: CustomerService (Horas 3.5-5)

**Puerto: 8093**

#### Endpoints
- [ ] GET /api/customers/{id} - Obtener perfil
- [ ] PUT /api/customers/{id} - Actualizar perfil
- [ ] GET /api/customers/{id}/addresses - Listar direcciones
- [ ] POST /api/customers/{id}/addresses - Agregar dirección
- [ ] GET /api/customers/{id}/wishlist - Listar wishlist
- [ ] POST /api/customers/{id}/wishlist - Agregar a wishlist
- [ ] DELETE /api/customers/{id}/wishlist/{productId} - Quitar de wishlist

#### Entidades
- [ ] Customer (id, email, name, phone, createdAt)
- [ ] Address (id, customerId, street, city, zipCode, isDefault)
- [ ] WishlistItem (id, customerId, productId, addedAt)

#### Verificación
- [ ] Puedo crear y obtener perfil de cliente
- [ ] Puedo agregar/listar direcciones
- [ ] Wishlist funciona correctamente

### Fase 4: CatalogService (Horas 5-7)

**Puerto: 8092**

#### Endpoints
- [ ] GET /api/catalog/products - Listar productos (con filtros)
- [ ] GET /api/catalog/products/{id} - Detalle producto
- [ ] POST /api/catalog/products - Crear producto (admin)
- [ ] PUT /api/catalog/products/{id} - Actualizar producto (admin)
- [ ] DELETE /api/catalog/products/{id} - Eliminar producto (admin)
- [ ] GET /api/catalog/categories - Listar categorías
- [ ] GET /api/catalog/products/type/{type} - Filtrar por tipo
- [ ] PUT /api/catalog/products/{id}/stock - Actualizar stock

#### Entidades
- [ ] Product (id, name, description, price, type, categoryId, providerType, stock, imageUrl)
- [ ] Category (id, name, description)

#### Filtros soportados
- [ ] Por categoría: ?categoryId=1
- [ ] Por tipo: ?type=PHYSICAL|SERVICE|SUBSCRIPTION
- [ ] Por precio: ?minPrice=10&maxPrice=100
- [ ] Búsqueda: ?search=laptop
- [ ] Paginación: ?page=0&size=20

#### Verificación
- [ ] Puedo listar todos los productos
- [ ] Los filtros funcionan correctamente
- [ ] Puedo crear/editar productos como admin

### Fase 5: OrderService - Saga Orchestrator (Horas 7-9)

**Puerto: 8091**

#### Endpoints
- [ ] POST /api/orders - Crear orden (inicia Saga)
- [ ] GET /api/orders/{id} - Obtener orden
- [ ] GET /api/orders/customer/{customerId} - Órdenes del cliente
- [ ] PUT /api/orders/{id}/cancel - Cancelar orden (compensación)
- [ ] GET /api/orders/{id}/status - Estado de la orden

#### Entidades
- [ ] Order (id, customerId, status, total, createdAt)
- [ ] OrderItem (id, orderId, productId, quantity, price, productType)
- [ ] SagaState (id, orderId, currentStep, status, compensationData)

#### Estados de Orden
- [ ] CREATED → PAYMENT_PENDING → PAYMENT_COMPLETED → PROVIDER_CONFIRMED → COMPLETED
- [ ] CANCELLED (desde cualquier estado anterior a COMPLETED)

#### Saga Steps
1. [ ] Crear orden en BD
2. [ ] Llamar PaymentService
3. [ ] Llamar IntegrationService (según tipo de producto)
4. [ ] Actualizar stock en CatalogService
5. [ ] Llamar NotificationService
6. [ ] Llamar BillingService

#### Compensación (si falla)
- [ ] Revertir pago
- [ ] Cancelar en proveedor
- [ ] Restaurar stock
- [ ] Notificar cancelación

#### Eventos Kafka
- [ ] Publicar: order.created, order.cancelled, order.completed
- [ ] Consumir: payment.completed, payment.failed

### Fase 6: PaymentService (Horas 9-10)

**Puerto: 8094**

#### Endpoints
- [ ] POST /api/payments/process - Procesar pago
- [ ] GET /api/payments/{id} - Obtener pago
- [ ] POST /api/payments/{id}/refund - Reembolso
- [ ] GET /api/payments/order/{orderId} - Pagos de una orden

#### Entidades
- [ ] Payment (id, orderId, amount, status, method, transactionId, createdAt)

#### Mock de Pago
- [ ] Simular procesamiento (1-2 segundos delay)
- [ ] 90% éxito, 10% fallo (para probar compensación)
- [ ] Generar transactionId único

#### Eventos Kafka
- [ ] Publicar: payment.completed, payment.failed, payment.refunded

### Fase 7: NotificationService (Horas 10-10.5)

**Puerto: 8095**

#### Endpoints
- [ ] POST /api/notifications/email - Enviar email
- [ ] POST /api/notifications/sms - Enviar SMS (mock)
- [ ] POST /api/notifications/push - Enviar push (mock)
- [ ] GET /api/notifications/customer/{customerId} - Historial

#### Entidades
- [ ] Notification (id, customerId, type, channel, content, status, sentAt)

#### Integración
- [ ] Email via SMTP a MailDev (puerto 1025)
- [ ] SMS: log en consola simulando envío
- [ ] Push: log en consola simulando envío

#### Templates
- [ ] Bienvenida (registro)
- [ ] Confirmación de orden
- [ ] Orden enviada
- [ ] Orden cancelada

### Fase 8: BillingService (Horas 10.5-11)

**Puerto: 8096**

#### Endpoints
- [ ] POST /api/billing/invoices - Generar factura
- [ ] GET /api/billing/invoices/{id} - Obtener factura
- [ ] GET /api/billing/invoices/customer/{customerId} - Facturas del cliente
- [ ] GET /api/billing/invoices/{id}/pdf - Descargar PDF (mock URL)

#### Entidades
- [ ] Invoice (id, orderId, customerId, invoiceNumber, amount, tax, total, issuedAt)

### Fase 9: RecommendationService (Horas 11-12)

**Puerto: 8098**

#### Endpoints
- [ ] GET /api/recommendations/user/{userId} - Recomendaciones personalizadas
- [ ] GET /api/recommendations/product/{productId}/related - Productos relacionados
- [ ] GET /api/recommendations/trending - Productos trending
- [ ] GET /api/recommendations/category/{categoryId} - Por categoría

#### Lógica de Recomendación (Simplificada)
- [ ] Basado en categorías de compras anteriores
- [ ] Productos de la misma categoría
- [ ] Productos más vendidos (mock)
- [ ] Retornar 5-10 productos

#### Entidades
- [ ] UserPreference (id, userId, categoryId, weight)
- [ ] ProductView (id, userId, productId, viewedAt)

---

## ESTRUCTURA DE CADA SERVICIO

```
service-name/
├── src/main/java/com/allconnect/servicename/
│   ├── ServiceNameApplication.java
│   ├── config/
│   │   └── SecurityConfig.java
│   ├── controller/
│   │   └── ServiceController.java
│   ├── service/
│   │   └── ServiceService.java
│   ├── repository/
│   │   └── EntityRepository.java
│   ├── model/
│   │   └── Entity.java
│   └── dto/
│       ├── RequestDTO.java
│       └── ResponseDTO.java
├── src/main/resources/
│   └── application.yml
└── pom.xml (o build.gradle)
```

### application.yml Template
```yaml
server:
  port: ${PORT}

spring:
  application:
    name: ${SERVICE_NAME}
  datasource:
    url: jdbc:mysql://localhost:3306/${DB_NAME}
    username: allconnect
    password: allconnect123
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: ${SERVICE_NAME}-group

eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
  instance:
    preferIpAddress: true

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

---

## COMUNICACIÓN ENTRE SERVICIOS

### Llamadas Síncronas (REST via Feign)
```java
@FeignClient(name = "CATALOG-SERVICE")
public interface CatalogClient {
    @GetMapping("/api/catalog/products/{id}")
    ProductDTO getProduct(@PathVariable Long id);

    @PutMapping("/api/catalog/products/{id}/stock")
    void updateStock(@PathVariable Long id, @RequestBody StockUpdateDTO dto);
}
```

### Eventos Kafka
```java
// Productor
@Autowired
private KafkaTemplate<String, Object> kafkaTemplate;

public void publishOrderCreated(Order order) {
    kafkaTemplate.send("order-events", new OrderCreatedEvent(order));
}

// Consumidor
@KafkaListener(topics = "payment-events", groupId = "order-service-group")
public void handlePaymentEvent(PaymentEvent event) {
    if (event.getStatus() == PaymentStatus.COMPLETED) {
        // Continuar saga
    } else {
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
    IntegrationSvc  Compensar
         │         (refund)
         ▼
    CatalogService (actualizar stock)
         │
         ▼
    NotificationSvc (enviar email)
         │
         ▼
    BillingService (generar factura)
         │
         ▼
      COMPLETED
```

---

## COMANDOS DE VERIFICACIÓN

```bash
# Iniciar todos los servicios (después de infra)
cd services/security-service && ./mvnw spring-boot:run &
cd services/customer-service && ./mvnw spring-boot:run &
# ... etc

# Verificar registro en Eureka
open http://localhost:8761

# Probar SecurityService
curl -X POST http://localhost:8097/api/security/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@test.com","password":"password123"}'

# Probar CatalogService
curl http://localhost:8092/api/catalog/products

# Ver Swagger de cada servicio
open http://localhost:8091/swagger-ui.html
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
- Verificar que el schema existe

### Kafka no conecta
- Esperar 30 segundos después de iniciar Kafka
- Verificar bootstrap-servers en application.yml

### Feign timeout
- Aumentar timeout en configuración
- Verificar que el servicio destino está corriendo

---

## MÉTRICAS DE ÉXITO

Al finalizar tu track, debes poder decir SÍ a todas estas preguntas:

1. ¿Los 8 servicios están corriendo y registrados en Eureka?
2. ¿Cada servicio tiene Swagger funcionando?
3. ¿Puedo registrar un usuario y hacer login?
4. ¿Puedo crear una orden y ver el estado?
5. ¿La Saga completa funciona (crear orden → pago → confirmación)?
6. ¿La compensación funciona (cancelar orden)?
7. ¿Las notificaciones llegan a MailDev?
8. ¿Se generan facturas?
9. ¿Las recomendaciones retornan productos?
10. ¿Todos los endpoints responden via Gateway?

---

## NOTAS PARA COORDINACIÓN

**Dependes de Track 1:**
- MySQL con schemas
- Eureka para registro
- Kafka para eventos
- Gateway para exposición

**Track 3 depende de ti:**
- OrderService llama a IntegrationService

**Track 4 depende de ti:**
- Todas las APIs de negocio
- JWT para autenticación
- Datos de productos, órdenes, etc.

**PRIORIDAD**: SecurityService y CatalogService primero, son los más usados por otros tracks.

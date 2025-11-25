# Análisis de Código Reutilizable de Talleres

Este documento detalla qué código podemos reutilizar de los talleres y qué necesitamos crear desde cero para AllConnect Market.

---

## 1. Resumen Ejecutivo

### Talleres Analizados

| Taller | Stack | Código Útil |
|--------|-------|-------------|
| **TallerDatosAS** | Java 21, Spring Boot 3.3, MySQL 8.4, JTA/Atomikos, SOAP, gRPC | Configuraciones, Saga pattern, SOAP endpoints, DTOs |
| **AS-Catalogo-NET** | .NET 8/9, EF Core, Kafka, gRPC | Patrones (Gateway, Kafka Producer/Consumer), Docker Compose |

### Cobertura por Componente AllConnect

| Componente | % Reutilizable | Fuente |
|------------|----------------|--------|
| **Configuraciones Spring Boot** | 80% | TallerDatosAS |
| **JTA/Atomikos (Transacciones)** | 95% | TallerDatosAS |
| **Saga Pattern** | 70% | TallerDatosAS |
| **SOAP Endpoints** | 80% | TallerDatosAS |
| **Kafka Producer/Consumer** | 60% | AS-Catalogo-NET (patrón) |
| **Docker Compose → K8s** | 50% | Ambos talleres |
| **Gateway Pattern** | 40% | AS-Catalogo-NET (concepto) |
| **Node.js Adapters** | 0% | Crear desde cero |
| **Spring Cloud Gateway** | 0% | Crear desde cero |
| **Eureka** | 0% | Crear desde cero |
| **Frontend React** | 30% | TallerDatosAS |

---

## 2. Análisis Detallado: TallerDatosAS

### 2.1 Estructura del Repositorio

```
TallerDatosAS/
├── client-java/                     # Backend Spring Boot principal
│   ├── src/main/java/cliente/application/
│   │   ├── config/                  # ⭐ REUTILIZABLE
│   │   │   ├── DataSourceConfig.java
│   │   │   ├── JtaConfig.java
│   │   │   ├── InventarioJpaConfig.java
│   │   │   ├── FacturacionJpaConfig.java
│   │   │   ├── PagosJpaConfig.java
│   │   │   ├── ProductosJpaConfig.java
│   │   │   ├── UsuariosJpaConfig.java
│   │   │   ├── SoapConfig.java
│   │   │   ├── CorsConfig.java
│   │   │   └── CorsFilterConfig.java
│   │   ├── services/                # ⭐ REUTILIZABLE (patrón)
│   │   │   └── CheckoutCoordinatorService.java  # SAGA
│   │   ├── controllers/             # ⭐ REUTILIZABLE (patrón)
│   │   │   ├── rest/
│   │   │   │   ├── ProductController.java
│   │   │   │   └── CheckoutController.java
│   │   │   └── soap/
│   │   │       └── UserServiceEndpoint.java
│   │   ├── dto/                     # ⭐ REUTILIZABLE (patrón)
│   │   ├── models/                  # Adaptar al dominio
│   │   ├── repositories/            # Adaptar al dominio
│   │   ├── mappers/                 # ⭐ REUTILIZABLE (patrón)
│   │   └── exceptions/              # ⭐ REUTILIZABLE
│   ├── src/main/resources/
│   │   ├── application.properties   # ⭐ REUTILIZABLE (base)
│   │   └── xsd/users.xsd           # Adaptar esquemas
│   └── pom.xml                      # ⭐ REUTILIZABLE (dependencias)
├── infra/
│   ├── compose.yaml                 # Convertir a K8s
│   └── *_init.sql                   # Adaptar esquemas BD
├── frontend-react/                  # ⭐ PARCIALMENTE REUTILIZABLE
└── frontend-mpa/                    # Ignorar (usar React)
```

### 2.2 Archivos Específicos a Copiar

#### A. Configuración de DataSources (CRÍTICO)

**Archivo:** `client-java/src/main/java/cliente/application/config/DataSourceConfig.java`

**Qué hace:**
- Configura 3 DataSources XA (Atomikos) para transacciones distribuidas
- Configura 2 DataSources HikariCP para operaciones no transaccionales
- Propiedad crítica: `pinGlobalTxToPhysicalConnection=true`

**Cómo adaptar para AllConnect:**
```
TallerDatosAS              →  AllConnect Market
────────────────────────────────────────────────
inventarioDataSource (XA)  →  orderDataSource (XA)
facturacionDataSource (XA) →  billingDataSource (XA) - opcional
pagosDataSource (XA)       →  paymentDataSource (XA)
productosDataSource (Pool) →  catalogDataSource (HikariCP)
usuariosDataSource (Pool)  →  customerDataSource (HikariCP)
                           →  notificationDataSource (HikariCP) - nuevo
```

**Ruta destino:** `services/order-service/src/main/java/config/DataSourceConfig.java`

---

#### B. Configuración JTA/Atomikos (CRÍTICO)

**Archivo:** `client-java/src/main/java/cliente/application/config/JtaConfig.java`

**Qué hace:**
- Configura UserTransactionManager de Atomikos
- Configura JtaTransactionManager de Spring
- Timeout: 300 segundos

**Cómo adaptar:** Copiar tal cual. Solo modificar timeout si es necesario.

**Ruta destino:** `services/order-service/src/main/java/config/JtaConfig.java`

---

#### C. Configuraciones JPA por BD (CRÍTICO)

**Archivos:**
- `InventarioJpaConfig.java` → Para BDs transaccionales (JTA)
- `ProductosJpaConfig.java` → Para BDs no transaccionales (HikariCP)

**Patrón JTA:**
```java
@EnableJpaRepositories(
    basePackages = "...",
    entityManagerFactoryRef = "orderEntityManagerFactory",
    transactionManagerRef = "jtaTransactionManager"  // ← JTA global
)
// builder.jta(true) en el EntityManagerFactory
```

**Patrón HikariCP:**
```java
@EnableJpaRepositories(
    basePackages = "...",
    entityManagerFactoryRef = "catalogEntityManagerFactory",
    transactionManagerRef = "catalogTransactionManager"  // ← Local
)
// builder.jta(false) + JpaTransactionManager propio
```

---

#### D. Patrón Saga (CheckoutCoordinatorService) (CRÍTICO)

**Archivo:** `client-java/src/main/java/cliente/application/services/CheckoutCoordinatorService.java`

**Qué hace:**
- Orquesta transacción distribuida en 3 pasos
- Atomicidad garantizada por JTA 2PC
- Rollback automático si cualquier paso falla

**Pasos actuales:**
1. Validar stock + decrementar (inventario)
2. Crear factura (facturación)
3. Registrar pago (pagos)

**Cómo adaptar para AllConnect (expandir a 4-5 pasos):**
```java
@Transactional  // JTA coordina todo
public OrderResult processOrder(OrderCommand cmd) {
    // 1. INVENTARIO: Reservar stock
    stockService.reserveStock(cmd.items());

    // 2. BILLING: Crear factura
    Invoice invoice = billingService.createInvoice(cmd);

    // 3. PAYMENT: Procesar pago
    PaymentResult payment = paymentService.authorize(cmd.paymentInfo());

    // 4. NOTIFICATION: Enviar confirmación (puede ser async)
    notificationService.sendOrderConfirmation(order);

    // 5. AUDIT: Registrar (opcional, para demostrar)
    auditService.logTransaction(order);

    return OrderResult.success(order.getId());
}
```

**Ruta destino:** `services/order-service/src/main/java/service/OrderCoordinatorService.java`

---

#### E. Configuración SOAP (IMPORTANTE)

**Archivo:** `client-java/src/main/java/cliente/application/config/SoapConfig.java`

**Qué hace:**
- Configura MessageDispatcherServlet en `/ws/*`
- Define WSDL con XSD schema
- Habilita CORS para SOAP

**Operaciones actuales:**
- GetRandomUser
- GetPaymentMethods
- ValidatePayment

**Cómo adaptar para AllConnect:**
```
Nuevo namespace: http://allconnect.com/orders
Nuevas operaciones:
  - CreateOrder
  - GetOrderStatus
  - UpdateOrder
  - CancelOrder

Nuevo namespace: http://allconnect.com/payments
Nuevas operaciones:
  - ValidatePaymentMethod
  - ProcessPayment
  - RefundPayment
```

**Ruta destino:** `services/order-service/src/main/java/config/SoapConfig.java`

---

#### F. SOAP Endpoint (IMPORTANTE)

**Archivo:** `client-java/src/main/java/cliente/application/controllers/soap/UserServiceEndpoint.java`

**Estructura a seguir:**
```java
@Endpoint
public class OrderServiceEndpoint {
    private static final String NAMESPACE_URI = "http://allconnect.com/orders";

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "CreateOrderRequest")
    @ResponsePayload
    public CreateOrderResponse createOrder(@RequestPayload CreateOrderRequest request) {
        // Implementación
    }
}
```

---

#### G. pom.xml (CRÍTICO)

**Archivo:** `client-java/pom.xml`

**Dependencias clave a copiar:**

```xml
<!-- JTA/Atomikos -->
<dependency>
    <groupId>com.atomikos</groupId>
    <artifactId>transactions-spring-boot3-starter</artifactId>
    <version>6.0.0</version>
</dependency>

<!-- MySQL -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.4.0</version>
</dependency>

<!-- SOAP -->
<dependency>
    <groupId>org.springframework.ws</groupId>
    <artifactId>spring-ws-core</artifactId>
</dependency>
<dependency>
    <groupId>jakarta.xml.bind</groupId>
    <artifactId>jakarta.xml.bind-api</artifactId>
</dependency>
<dependency>
    <groupId>org.glassfish.jaxb</groupId>
    <artifactId>jaxb-runtime</artifactId>
</dependency>

<!-- gRPC (si se usa) -->
<dependency>
    <groupId>net.devh</groupId>
    <artifactId>grpc-spring-boot-starter</artifactId>
    <version>2.14.0.RELEASE</version>
</dependency>

<!-- OpenAPI -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.1.0</version>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.32</version>
    <scope>provided</scope>
</dependency>
```

**Plugins Maven importantes:**
- `protobuf-maven-plugin` (para gRPC)
- `jaxb2-maven-plugin` (para generar clases JAXB desde XSD)

---

#### H. application.properties (BASE)

**Archivo:** `client-java/src/main/resources/application.properties`

**Propiedades clave:**

```properties
# JTA/Atomikos
spring.jta.atomikos.properties.default-jta-timeout=300000
spring.jta.atomikos.datasource.max-pool-size=25
spring.jta.atomikos.datasource.min-pool-size=3

# JPA
spring.jpa.open-in-view=false
spring.jpa.hibernate.ddl-auto=validate

# gRPC
grpc.server.port=9090

# Logging
logging.level.org.atomikos=DEBUG
```

---

### 2.3 Esquemas de Base de Datos

**Ubicación:** `infra/*.sql`

| Script | Tablas | Adaptar para |
|--------|--------|--------------|
| `inventario_init.sql` | categorias, items | CatalogService (productos) |
| `facturacion_init.sql` | clientes, facturas, factura_detalle | OrderService (órdenes) |
| `pagos_init.sql` | metodos_pago, pagos | PaymentService |
| `productos_init.sql` | products, organizations, categories | CatalogService |
| `usuarios_init.sql` | usuarios, datos_personales, datos_financieros | CustomerService |

---

## 3. Análisis Detallado: AS-Catalogo-NET

### 3.1 Estructura del Repositorio

```
AS-Catalogo-NET/
├── BusinessTier/                   # REST API (concepto Gateway)
│   ├── Controllers/
│   │   └── ProductosController.cs
│   ├── Services/
│   │   ├── IProductosService.cs    # ⭐ PATRÓN: Interface
│   │   └── ProductosService.cs     # ⭐ PATRÓN: Gateway switching
│   ├── Gateways/                   # ⭐ PATRÓN GATEWAY
│   │   ├── IProductosGateway.cs
│   │   ├── EfProductosGateway.cs   # Local (EF)
│   │   └── GrpcProductosGateway.cs # Remoto (gRPC)
│   ├── DTOs/
│   │   ├── ProductoDto.cs
│   │   ├── ProductoCreateDto.cs
│   │   └── ProductoUpdateDto.cs
│   └── GrpcClients/
│       └── ProductosGrpcClient.cs
│
├── DataTier/                       # gRPC Server + Kafka Producer
│   ├── Services/
│   │   └── ProductosGrpcService.cs # ⭐ PATRÓN: gRPC Service
│   ├── KafkaProducer/
│   │   └── ProductEventProducer.cs # ⭐ KAFKA PRODUCER
│   ├── Data/
│   │   └── MyAppDbContext.cs
│   └── Protos/
│       └── productos.proto         # ⭐ PROTO DEFINITION
│
├── KafkaConsumer/                  # Worker Service
│   ├── Worker.cs                   # ⭐ KAFKA CONSUMER
│   ├── Services/
│   │   └── EmailService.cs         # ⭐ NOTIFICATION SERVICE
│   └── Models/
│       └── ProductEvent.cs         # ⭐ EVENT MODEL
│
└── docker-compose.yml              # ⭐ REFERENCIA DOCKER
```

### 3.2 Patrones a Implementar en Spring Boot

#### A. Gateway Pattern (IProductosGateway)

**Concepto:** Abstracción que permite cambiar entre implementaciones (local vs remoto).

**Implementación Java:**
```java
// Interface
public interface ProductGateway {
    List<ProductDTO> findAll();
    ProductDTO findById(Long id);
    ProductDTO create(ProductCreateDTO dto);
    ProductDTO update(Long id, ProductUpdateDTO dto);
    void delete(Long id);
}

// Implementación Local (JPA)
@Component
@ConditionalOnProperty(name = "app.gateway.mode", havingValue = "local")
public class JpaProductGateway implements ProductGateway {
    @Autowired
    private ProductRepository repository;
    // ...
}

// Implementación Remota (gRPC/HTTP)
@Component
@ConditionalOnProperty(name = "app.gateway.mode", havingValue = "remote")
public class GrpcProductGateway implements ProductGateway {
    // Llama a otro microservicio
}
```

**Cuándo usar:** CatalogService y CustomerService que podrían tener BD local o remota.

---

#### B. Kafka Producer Pattern

**Archivo .NET:** `DataTier/KafkaProducer/ProductEventProducer.cs`

**Implementación Spring Boot:**

```java
@Component
@RequiredArgsConstructor
public class OrderEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishOrderCreated(Order order) {
        OrderEvent event = OrderEvent.builder()
            .eventType("OrderCreated")
            .orderId(order.getId())
            .customerId(order.getCustomerId())
            .totalAmount(order.getTotalAmount())
            .timestamp(LocalDateTime.now())
            .build();

        try {
            String json = objectMapper.writeValueAsString(event);
            kafkaTemplate.send("order-events", order.getId().toString(), json);
            log.info("Published OrderCreated event for order: {}", order.getId());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize order event", e);
        }
    }

    public void publishOrderStatusChanged(Order order, String previousStatus) {
        // Similar...
    }
}
```

**Topics requeridos para AllConnect:**
- `order-events` (OrderService → NotificationService)
- `payment-events` (PaymentService → NotificationService)
- `catalog-events` (CatalogService → IntegrationService)
- `customer-events` (CustomerService → NotificationService)

---

#### C. Kafka Consumer Pattern

**Archivo .NET:** `KafkaConsumer/Worker.cs`

**Implementación Spring Boot:**

```java
@Service
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final EmailService emailService;
    private final PushNotificationService pushService;
    private final ObjectMapper objectMapper;

    @KafkaListener(
        topics = "order-events",
        groupId = "notification-service-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeOrderEvent(String message, Acknowledgment ack) {
        try {
            OrderEvent event = objectMapper.readValue(message, OrderEvent.class);

            switch (event.getEventType()) {
                case "OrderCreated":
                    emailService.sendOrderConfirmation(event);
                    pushService.sendOrderNotification(event);
                    break;
                case "OrderShipped":
                    emailService.sendShippingNotification(event);
                    break;
                case "OrderDelivered":
                    emailService.sendDeliveryConfirmation(event);
                    break;
            }

            ack.acknowledge();  // Manual commit

        } catch (Exception e) {
            log.error("Failed to process order event", e);
            // No acknowledge → retry
        }
    }
}
```

---

#### D. Email Service Pattern

**Archivo .NET:** `KafkaConsumer/Services/EmailService.cs`

**Implementación Spring Boot:**

```java
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String fromAddress;

    public void sendOrderConfirmation(OrderEvent event) {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromAddress);
        helper.setTo(event.getCustomerEmail());
        helper.setSubject("Order Confirmation - #" + event.getOrderId());
        helper.setText(buildOrderConfirmationHtml(event), true);

        mailSender.send(message);
        log.info("Sent order confirmation email for order: {}", event.getOrderId());
    }

    private String buildOrderConfirmationHtml(OrderEvent event) {
        return """
            <html>
            <body>
                <h1>Thank you for your order!</h1>
                <p>Order ID: %s</p>
                <p>Total: $%s</p>
            </body>
            </html>
            """.formatted(event.getOrderId(), event.getTotalAmount());
    }
}
```

---

### 3.3 docker-compose.yml → Kubernetes

**Archivo .NET:** `docker-compose.yml`

**Servicios definidos:**
- mysql (3306)
- zookeeper (2181)
- kafka (9092, 29092)
- kafka-ui (8081)
- maildev (1080, 1025)
- datatier (5001)
- businesstier (8080)
- kafkaconsumer

**Conversión a Kubernetes:**

```yaml
# MySQL → StatefulSet + PVC
# Kafka → Puede usar Strimzi operator o Deployment simple
# Kafka-UI → Deployment (opcional, desarrollo)
# MailDev → Deployment (opcional, desarrollo)
# Servicios → Deployments con replicas
```

---

## 4. Matriz de Código: Qué Copiar vs Qué Crear

### 4.1 Por Servicio AllConnect

#### OrderService
| Componente | Acción | Fuente |
|------------|--------|--------|
| DataSourceConfig | Copiar + adaptar | TallerDatosAS |
| JtaConfig | Copiar | TallerDatosAS |
| OrderJpaConfig | Crear basado en | InventarioJpaConfig |
| OrderCoordinatorService | Crear basado en | CheckoutCoordinatorService |
| OrderController (REST) | Crear basado en | CheckoutController |
| OrderServiceEndpoint (SOAP) | Crear basado en | UserServiceEndpoint |
| OrderEventProducer (Kafka) | Crear basado en | AS-Catalogo-NET |
| Entities (Order, OrderItem) | Crear | - |
| DTOs | Crear basado en | CheckoutRequest/Response |
| pom.xml | Copiar + adaptar | TallerDatosAS |

#### CatalogService
| Componente | Acción | Fuente |
|------------|--------|--------|
| DataSourceConfig | Copiar + adaptar (HikariCP) | TallerDatosAS/ProductosJpaConfig |
| CatalogController | Crear basado en | ProductController |
| ProductService | Crear | - |
| ProductGateway interface | Crear basado en | AS-Catalogo-NET |
| Entities (Product, Category) | Crear basado en | TallerDatosAS/products |
| DTOs | Crear | - |

#### CustomerService
| Componente | Acción | Fuente |
|------------|--------|--------|
| DataSourceConfig | Copiar + adaptar (HikariCP) | TallerDatosAS/UsuariosJpaConfig |
| CustomerController | Crear basado en | UsuarioController (si existe) |
| CustomerService | Crear | - |
| Entities | Crear basado en | TallerDatosAS/usuarios |

#### PaymentService
| Componente | Acción | Fuente |
|------------|--------|--------|
| DataSourceConfig | Copiar + adaptar (XA) | TallerDatosAS/PagosJpaConfig |
| PaymentController | Crear | - |
| PaymentServiceEndpoint (SOAP) | Crear basado en | UserServiceEndpoint |
| Entities (Payment, PaymentMethod) | Crear basado en | TallerDatosAS/pagos |

#### NotificationService
| Componente | Acción | Fuente |
|------------|--------|--------|
| KafkaConsumer | Crear basado en | AS-Catalogo-NET/Worker.cs |
| EmailService | Crear basado en | AS-Catalogo-NET/EmailService.cs |
| NotificationController | Crear | - |
| Entities (Notification) | Crear | - |

#### IntegrationService
| Componente | Acción | Fuente |
|------------|--------|--------|
| IntegrationController | Crear | - |
| ProviderAdapterFactory | Crear | - |
| HTTP/SOAP/RPC Clients | Crear | - |

### 4.2 Por Componente de Infraestructura

#### Spring Cloud Gateway
| Componente | Acción | Fuente |
|------------|--------|--------|
| GatewayApplication | Crear desde cero | - |
| application.yml (routes) | Crear | - |
| JwtAuthFilter | Crear | - |
| RateLimitFilter | Crear | - |

#### Eureka Server
| Componente | Acción | Fuente |
|------------|--------|--------|
| EurekaApplication | Crear desde cero | - |
| application.yml | Crear | - |

#### Node.js Adapters
| Componente | Acción | Fuente |
|------------|--------|--------|
| https-adapter | Crear desde cero | - |
| soap-adapter | Crear desde cero | - |
| rpc-adapter | Crear desde cero | - |

#### Kubernetes Manifests
| Componente | Acción | Fuente |
|------------|--------|--------|
| MySQL StatefulSet | Crear basado en | Ambos compose.yaml |
| Kafka Deployment | Crear basado en | AS-Catalogo-NET |
| Redis Deployment | Crear | - |
| RabbitMQ Deployment | Crear | - |
| Service Deployments | Crear | - |
| ConfigMaps | Crear | - |
| Secrets | Crear | - |
| Ingress | Crear | - |

---

## 5. Lista de TODOs Reales

### 5.1 Infraestructura (Track 1)

- [ ] Crear k8s/namespace.yaml
- [ ] Crear k8s/configmaps/app-config.yaml
- [ ] Crear k8s/secrets/db-credentials.yaml
- [ ] Crear k8s/secrets/jwt-secret.yaml
- [ ] Crear mysql-deployment.yaml (StatefulSet + PVC)
- [ ] Crear redis-deployment.yaml
- [ ] Crear kafka-deployment.yaml (sin Zookeeper, usar KRaft)
- [ ] Crear rabbitmq-deployment.yaml
- [ ] Crear kustomization.yaml
- [ ] Probar despliegue de infraestructura local

### 5.2 Platform Services (Track 2)

- [ ] Crear proyecto eureka-server (Spring Boot)
  - [ ] pom.xml con spring-cloud-starter-netflix-eureka-server
  - [ ] application.yml
  - [ ] Dockerfile
  - [ ] K8s deployment

- [ ] Crear proyecto gateway-service (Spring Cloud Gateway)
  - [ ] pom.xml con spring-cloud-starter-gateway
  - [ ] application.yml con rutas
  - [ ] JwtAuthenticationFilter
  - [ ] Dockerfile
  - [ ] K8s deployment

- [ ] Crear tomcat-deployment (para WARs)
  - [ ] Imagen base tomcat:9-jdk21
  - [ ] Mount para WARs
  - [ ] K8s deployment

### 5.3 Business Services (Track 3)

- [ ] **OrderService**
  - [ ] Copiar DataSourceConfig, JtaConfig de TallerDatosAS
  - [ ] Crear OrderJpaConfig
  - [ ] Crear entidades: Order, OrderItem, OrderStatus
  - [ ] Crear repositorios
  - [ ] Crear OrderCoordinatorService (Saga)
  - [ ] Crear OrderController (REST)
  - [ ] Crear OrderServiceEndpoint (SOAP)
  - [ ] Crear OrderEventProducer (Kafka)
  - [ ] pom.xml, application.yml, Dockerfile
  - [ ] K8s deployment

- [ ] **CatalogService**
  - [ ] Crear DataSourceConfig (HikariCP)
  - [ ] Crear entidades: Product, Category, Provider
  - [ ] Crear ProductService
  - [ ] Crear CatalogController
  - [ ] pom.xml, application.yml, Dockerfile
  - [ ] K8s deployment

- [ ] **CustomerService**
  - [ ] Crear DataSourceConfig (HikariCP)
  - [ ] Crear entidades: Customer, Address, PaymentProfile
  - [ ] Crear CustomerService
  - [ ] Crear CustomerController
  - [ ] pom.xml, application.yml, Dockerfile
  - [ ] K8s deployment

- [ ] **PaymentService**
  - [ ] Crear DataSourceConfig (XA para participar en JTA)
  - [ ] Crear entidades: Payment, PaymentMethod, Transaction
  - [ ] Crear PaymentService
  - [ ] Crear PaymentController
  - [ ] Crear PaymentServiceEndpoint (SOAP)
  - [ ] pom.xml, application.yml, Dockerfile
  - [ ] K8s deployment

- [ ] **NotificationService**
  - [ ] Crear OrderEventConsumer (Kafka)
  - [ ] Crear EmailService
  - [ ] Crear NotificationController
  - [ ] pom.xml, application.yml, Dockerfile
  - [ ] K8s deployment

### 5.4 Integration Layer (Track 4)

- [ ] **IntegrationService** (Spring Boot)
  - [ ] Crear IntegrationController
  - [ ] Crear ProviderService
  - [ ] Crear AdapterClient (llama a Node.js adapters)
  - [ ] pom.xml, application.yml, Dockerfile
  - [ ] K8s deployment

- [ ] **HTTPS Adapter** (Node.js)
  - [ ] package.json
  - [ ] index.js (Express server)
  - [ ] routes/provider.js
  - [ ] services/httpClient.js
  - [ ] Dockerfile
  - [ ] K8s deployment

- [ ] **SOAP Adapter** (Node.js)
  - [ ] package.json
  - [ ] index.js (Express server)
  - [ ] services/soapClient.js (usar node-soap)
  - [ ] Dockerfile
  - [ ] K8s deployment

- [ ] **RPC Adapter** (Node.js)
  - [ ] package.json
  - [ ] index.js (Express server)
  - [ ] services/grpcClient.js (usar @grpc/grpc-js)
  - [ ] Dockerfile
  - [ ] K8s deployment

### 5.5 Frontend (Track 5 - si hay tiempo)

- [ ] Crear estructura React (basada en TallerDatosAS/frontend-react)
- [ ] Adaptar componentes para AllConnect
- [ ] Build y empaquetar en compras.war
- [ ] Panel admin básico → admin.war

---

## 6. Estimación de Esfuerzo

| Track | Componentes | Complejidad | Dependencias |
|-------|-------------|-------------|--------------|
| **Track 1: Infra** | K8s manifests, MySQL, Redis, Kafka | Media | Ninguna |
| **Track 2: Platform** | Eureka, Gateway, Tomcat | Media | Track 1 |
| **Track 3: Services** | 5 servicios Spring Boot | Alta | Tracks 1, 2 |
| **Track 4: Integration** | 1 Spring + 3 Node.js | Media | Tracks 1, 2 |

### Orden de Ejecución Sugerido

```
Hora 0-2:   Track 1 (Infra K8s) + Track 2 inicio (Eureka)
Hora 2-4:   Track 2 completo (Gateway) + Track 3 inicio (OrderService base)
Hora 4-8:   Track 3 paralelo (4 personas en 4 servicios diferentes)
Hora 8-10:  Track 4 (Integration + Adapters)
Hora 10-12: Integración, testing, fixes, documentación
```

---

## 7. Archivos de Referencia Rápida

### Copiar directamente (adaptar imports/packages):
```
TallerDatosAS/client-java/src/main/java/cliente/application/config/JtaConfig.java
TallerDatosAS/client-java/src/main/java/cliente/application/config/CorsConfig.java
TallerDatosAS/client-java/src/main/java/cliente/application/config/CorsFilterConfig.java
TallerDatosAS/client-java/src/main/java/cliente/application/exceptions/BusinessException.java
```

### Usar como plantilla (modificar significativamente):
```
TallerDatosAS/client-java/src/main/java/cliente/application/config/DataSourceConfig.java
TallerDatosAS/client-java/src/main/java/cliente/application/config/InventarioJpaConfig.java
TallerDatosAS/client-java/src/main/java/cliente/application/config/SoapConfig.java
TallerDatosAS/client-java/src/main/java/cliente/application/services/CheckoutCoordinatorService.java
TallerDatosAS/client-java/pom.xml
AS-Catalogo-NET/DataTier/KafkaProducer/ProductEventProducer.cs (traducir a Java)
AS-Catalogo-NET/KafkaConsumer/Worker.cs (traducir a Java)
AS-Catalogo-NET/docker-compose.yml (convertir a K8s)
```

---

*Documento generado el 24 de Noviembre de 2025*
*Última actualización: Análisis completado*

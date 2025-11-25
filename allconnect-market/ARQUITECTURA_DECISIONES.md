# AllConnect Market - Decisiones Arquitectónicas y Plan de Implementación

## 1. Contexto del Proyecto

### 1.1 Información General
- **Curso:** Arquitectura de Software - Pontificia Universidad Javeriana
- **Fecha de entrega:** Septiembre 09 de 2025
- **Equipo:** 4 personas
  - Nicolas Camacho (camachoa.nicolas@javeriana.edu.co)
  - Sara Albarracín (saalbaracin@javeriana.edu.co)
  - Alejandro Caicedo (caicedo_alejandro@javeriana.edu.co)
  - Alejandro Pinzón (alejandro_pinzon@javeriana.edu.co)

### 1.2 Restricciones de Implementación
| Restricción | Valor |
|-------------|-------|
| Tiempo disponible | 12 horas |
| Herramienta de desarrollo | Claude Code (ilimitado) |
| Ambiente de ejecución | Local |
| Costo | Gratis |
| Plataforma objetivo | Solo Web PC (no mobile) |

### 1.3 Entregables Requeridos
1. **SRS** - Documento de especificación de requerimientos ✅ Completado
2. **SAD** - Documento de diseño arquitectónico ✅ Completado (falta actualizar con decisiones finales)
3. **Análisis ATAM** - Pendiente (no afecta desarrollo)
4. **Presentación** - 15-20 minutos, sustentación individual

---

## 2. Problema de Negocio

### 2.1 Situación Actual
Los clientes que desean comprar bienes físicos, contratar servicios y adquirir contenidos digitales deben recurrir a diferentes plataformas, generando:
- **Duplicidad de procesos:** Registro múltiple y pagos separados
- **Baja personalización:** Sin perfil unificado para recomendaciones
- **Riesgos operativos:** Disponibilidad y precios no actualizados en tiempo real
- **Costos elevados:** Alta complejidad para integrar nuevas líneas de negocio

### 2.2 Solución Propuesta
Plataforma multicanal centralizada, escalable y segura que integre:
- Productos físicos
- Servicios profesionales
- Suscripciones digitales

### 2.3 Requerimientos de Alto Nivel
1. Módulos desacoplados para escalabilidad e integración futura
2. Carrito de compras unificado (múltiples tipos de ítems)
3. Motor de recomendaciones basado en historial
4. Transacciones seguras (PCI DSS)
5. Mensajería y eventos para notificaciones instantáneas

### 2.4 Requerimientos No Funcionales Críticos
| Requerimiento | Especificación |
|---------------|----------------|
| Escalabilidad | 10,000+ usuarios concurrentes |
| Disponibilidad | SLA 99.9% |
| Latencia | < 2 segundos en catálogos |
| Seguridad | Cifrado E2E, MFA, PCI DSS |
| Interoperabilidad | APIs de logística, facturación, marketing |

---

## 3. Documentos Analizados

### 3.1 SRS (Software Requirements Specification)

#### Alcance Funcional
| Módulo | Descripción |
|--------|-------------|
| Gestión de Catálogo Multicanal | Productos físicos, servicios, suscripciones digitales |
| Carrito de Compras Unificado | Múltiples ítems, impuestos, descuentos, envío |
| Pasarela de Pagos | Tarjetas, transferencias, billeteras, pagos recurrentes |
| Gestión de Proveedores | Registro, inventarios, precios, disponibilidad |
| Motor de Recomendaciones | Algoritmos de personalización (IA) |
| Notificaciones Multicanal | Email, SMS, push notifications |
| Panel Administrativo | Monitoreo de ventas, métricas, comportamiento |

#### Interfaces Externas Definidas
- **IF-UI-001:** Web Responsive (React 18+, TypeScript, Tailwind)
- **IF-UI-002:** Portal de Proveedores
- **IF-UI-003:** Panel Administrativo
- **IF-SW-001:** Pasarelas de pago (Stripe, Adyen, MercadoPago)
- **IF-SW-002:** Identity Providers (OAuth 2.0)
- **IF-SW-003:** Servicios de notificación (SendGrid, Twilio, FCM)
- **IF-SW-004:** Motor de búsqueda (Elasticsearch)
- **IF-COM-001:** HTTPS/TLS 1.3
- **IF-COM-002:** JSON (REST APIs)
- **IF-COM-003:** WebSockets (tiempo real)
- **IF-COM-004:** Webhooks (eventos externos)

### 3.2 SAD (Software Architecture Document)

#### Estilo Arquitectónico
- **SOA (Service-Oriented Architecture)** con ESB
- **Event-Driven Architecture** para mensajería

#### Atributos de Calidad Priorizados
| Prioridad | Atributos |
|-----------|-----------|
| Alta | Funcionalidad, Confiabilidad, Disponibilidad, Seguridad |
| Media | Rendimiento, Usabilidad |
| Baja | Escalabilidad, Mantenibilidad |

#### Quality Scenarios Definidos
- **QA-01:** Tiempo de respuesta catálogo < 2s
- **QA-02:** Disponibilidad 99.9%
- **QA-03:** Procesamiento seguro de pagos (PCI DSS)
- **QA-04:** Checkout < 3s
- **QA-05:** Recuperación ante fallos < 30s
- **QA-06:** Escalabilidad horizontal automática

### 3.3 Vistas 4+1

#### Vista Lógica
Organización en capas con los siguientes paquetes:
- **PresentationLayer:** WebUI, AdminPanel
- **EnterpriseServiceBusLayer:** ESB, BPELEngine, UDDI
- **EnterpriseServicesLayer:** OrderService, CatalogService, CustomerService, RecommendationService
- **ProviderIntegrationLayer:** IntegrationService, ProviderFacade, AsyncRequestManager, ProtocolAdapters
- **DataAccessLayer:** Repositories (Order, Product, User)
- **InfrastructureLayer:** MessageBroker, CacheService, MonitoringService
- **DomainLayer:** Order, CartItem, Product, Provider, User

#### Vista de Procesos
Detalle de procesos por capa con puertos:

```
PRESENTATION LAYER
├── Browser → Nginx (:80, :443)
│   ├── → Tomcat compras.war (:8080)
│   └── → Tomcat admin.war (:8081)

ESB LAYER (Original)
├── WSO2 ESB (:8280, :8243)
├── Apache ODE BPEL (:8282)
├── Apache jUDDI (:8083)
└── SecurityService (:8095)

ENTERPRISE SERVICES
├── OrderService (:8090)
├── CatalogService (:8091)
├── CustomerService (:8092)
├── PaymentService (:8093)
├── BillingService (:8096)
└── RecommendationService (:8097)

PROVIDER INTEGRATION
├── IntegrationService (:8094)
├── ProviderFacade (:8098)
├── AsyncRequestManager (:8099)
├── ProtocolAdapterFactory (:9000)
└── Node.js Adapters (:3000, :3001, :3002)

INFRASTRUCTURE
├── PostgreSQL (:5432)
├── Redis (:6379)
├── MongoDB (:27017)
├── Kafka (:9092)
└── RabbitMQ (:5672)
```

#### Vista de Desarrollo
Módulos y sus tecnologías:

| Módulo | Tecnología | Patrón |
|--------|------------|--------|
| WebUIModule | React MVVM | MVVM |
| AdminPanelModule | React MVVM | MVVM |
| DataAccessModule | Spring Data JPA | Repository |
| DomainModelsModule | Java POJOs | DDD |
| CommonUtilsModule | Jackson, JAXB | Utility |
| SOAPClientModule | JAX-WS RI | Client |
| EventMessagingModule | Kafka, RabbitMQ | Event-Driven |
| InfraCommonsModule | Redis, SLF4J, Micrometer | Infrastructure |

Tecnologías específicas identificadas:
- **Connection Pool:** HikariCP
- **Resilience:** Resilience4j (CircuitBreaker, RetryPolicy)
- **Business Rules:** Drools
- **Templates:** Thymeleaf
- **Encryption:** BouncyCastle (AES-256, RSA-2048)
- **Auth:** OAuth2 + JWT
- **Logging:** SLF4J + ELK Stack
- **Monitoring:** Micrometer + Prometheus

#### Vista Física (Original)
6 contenedores Docker con recursos totales: **54GB RAM, 24 cores**

| Container | RAM | Cores | Procesos |
|-----------|-----|-------|----------|
| allconnect-presentation | 4GB | 2 | Nginx + 2x Tomcat |
| allconnect-esb | 8GB | 4 | WSO2 + ODE + jUDDI + Security |
| allconnect-services | 12GB | 6 | 6 Spring Boot services |
| allconnect-integration | 6GB | 4 | Integration + Node.js Adapters |
| allconnect-data | 16GB | 4 | PostgreSQL + Redis + MongoDB |
| allconnect-messaging | 8GB | 4 | Kafka + Zookeeper + RabbitMQ |

---

## 4. Talleres de Referencia

### 4.1 TallerDatosAS (Java/Spring Boot)

**Repositorio:** https://github.com/SarAlbN1/TallerDatosAS.git
**Branch principal:** `feature/backend-kafka-integration`

#### Stack Tecnológico
- Spring Boot 3.3-3.4
- Java 21
- MySQL 8.4 (3 instancias)
- JTA/Atomikos para transacciones distribuidas
- Kafka integration
- SOAP, REST, gRPC

#### Código Reutilizable
| Componente | Ubicación | Qué reutilizar |
|------------|-----------|----------------|
| **DataSourceConfig** | `config/DataSourceConfig.java` | Configuración multi-XA DataSource con Atomikos |
| **JtaConfig** | `config/JtaConfig.java` | Transaction manager JTA |
| **CheckoutCoordinatorService** | `service/CheckoutCoordinatorService.java` | Patrón Saga con 2PC |
| **SoapConfig** | `config/SoapConfig.java` | Configuración endpoints SOAP |
| **GrpcConfig** | `config/GrpcConfig.java` | Configuración servidor gRPC |
| **KafkaConfig** | `config/KafkaConfig.java` | Productor/Consumidor Kafka |
| **compose.yaml** | raíz | Docker Compose multi-DB |

#### Patrón Saga (Ejemplo)
```java
@Transactional  // JTA: ACID cross-database
public String procesarVentaDemo(String sku, Integer cantidad, Long clienteId, String metodoPago) {
    // 1. INVENTARIO (XA)
    item.setStock(item.getStock() - cantidad);
    itemRepository.save(item);

    // 2. FACTURACIÓN (XA)
    facturaRepository.save(factura);

    // 3. PAGOS (XA)
    pagoRepository.save(pago);

    // Si todo OK, Atomikos hace COMMIT global (2PC)
    return "OK";
}
```

### 4.2 AS-Catalogo-NET (.NET 8/9)

**Repositorio:** https://github.com/SarAlbN1/AS-Catalogo-NET.git
**Branch principal:** `main`

#### Stack Tecnológico
- .NET 8/9
- Entity Framework Core
- Pomelo MySQL
- gRPC
- Kafka
- MailKit

#### Arquitectura
4 servicios:
- **BusinessTier:** REST API (.NET 8)
- **DataTier:** gRPC (.NET 9)
- **KafkaConsumer:** Worker service
- **ClientApp:** Frontend

#### Código Reutilizable
| Componente | Qué reutilizar |
|------------|----------------|
| **Gateway Pattern** | Dual data access (EF Core vs gRPC) |
| **Kafka Producer/Consumer** | Configuración y eventos |
| **Docker Compose** | Orquestación MySQL + Kafka + Zookeeper + MailDev |
| **Strategy Pattern** | Switching entre EF y gRPC |

#### Patrón Gateway (Ejemplo)
```csharp
public async Task<IEnumerable<ProductoDto>> GetAllAsync() {
    if (_preferGrpc) return await _grpc.GetAllAsync();
    return await _db.Productos.ToListAsync();
}
```

---

## 5. Decisiones Arquitectónicas

### 5.1 Problema: Vista Física Original Inviable
La vista física original requiere **54GB RAM y 24 cores**, imposible de ejecutar localmente.

### 5.2 Decisiones de Simplificación

| Componente Original | Decisión | Componente Final | Justificación |
|---------------------|----------|------------------|---------------|
| WSO2 ESB 5.0 | **Reemplazar** | Spring Cloud Gateway | Gateway cumple routing y policies, 15x menos RAM |
| Apache ODE BPEL | **Reemplazar** | Saga pattern en código | Ya existe en TallerDatosAS, mismo concepto |
| Apache jUDDI | **Reemplazar** | Eureka | Service discovery moderno y ligero |
| PostgreSQL | **Reemplazar** | MySQL | Conocido del taller, menos curva de aprendizaje |
| MongoDB | **Eliminar** | MySQL (JSON columns) | Una BD es suficiente para demostrar |
| Kafka + Zookeeper | **Simplificar** | Kafka con KRaft | KRaft elimina dependencia de Zookeeper |
| RabbitMQ | **Mantener** | RabbitMQ | Necesario para ciertos patrones async |
| Docker Compose | **Reemplazar** | Kubernetes | Requerimiento del profesor |
| Tomcat + WAR | **Mantener** | Tomcat + WAR | Fiel a la vista original |

### 5.3 Lo que se MANTIENE (Fidelidad a las Vistas)

| Patrón/Concepto | Implementación | Fidelidad |
|-----------------|----------------|-----------|
| Arquitectura SOA | Servicios independientes comunicándose | ✅ 100% |
| API Gateway Pattern | Spring Cloud Gateway | ✅ 100% |
| Service Registry | Eureka | ✅ 95% (diferente producto, mismo patrón) |
| Workflow Orchestration | Saga Pattern | ✅ 90% (código vs BPEL, mismo resultado) |
| Event-Driven | Kafka + RabbitMQ | ✅ 100% |
| Layered Architecture | Separación por capas | ✅ 100% |
| Protocol Adapters | Node.js (HTTPS, SOAP, RPC) | ✅ 100% |
| Cache Layer | Redis | ✅ 100% |
| Security (JWT/OAuth) | Spring Security | ✅ 100% |
| 6 Enterprise Services | Spring Boot | ✅ 100% |
| Integration Layer | Spring Boot + Node.js | ✅ 100% |

### 5.4 Justificación para Documentación/Presentación

> "La arquitectura está diseñada siguiendo los patrones SOA definidos en el SAD. Para el ambiente de desarrollo y demostración, se utilizan implementaciones más ligeras de ciertos componentes (Spring Cloud Gateway en lugar de WSO2 ESB, Saga pattern en código en lugar de BPEL) que cumplen la misma función arquitectónica. En un ambiente de producción, estos componentes podrían ser reemplazados por sus equivalentes enterprise sin modificar la arquitectura general."

---

## 6. Arquitectura Final

### 6.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENTE                                        │
│                              (Browser Web PC)                                    │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │ HTTPS :443
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER (Docker Desktop)                           │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                         NGINX Ingress (:80, :443)                         │  │
│  └─────────────────────────────────────┬─────────────────────────────────────┘  │
│                                        │                                         │
│                      ┌─────────────────┴─────────────────┐                      │
│                      ▼                                   ▼                      │
│  ┌──────────────────────────────┐      ┌──────────────────────────────┐        │
│  │    Tomcat (:8080, :8081)     │      │   Spring Cloud Gateway       │        │
│  │    - compras.war (WebUI)     │      │        (:8080)               │        │
│  │    - admin.war (AdminPanel)  │      │   - API Routing              │        │
│  │                              │      │   - Auth Filter (JWT)        │        │
│  └──────────────────────────────┘      └───────────────┬───────────────┘        │
│                                                        │                         │
│         ┌──────────────┬──────────────┬───────────────┼───────────────┐         │
│         ▼              ▼              ▼               ▼               ▼         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│  │ Order      │ │ Catalog    │ │ Customer   │ │ Payment    │ │Notification│    │
│  │ Service    │ │ Service    │ │ Service    │ │ Service    │ │ Service    │    │
│  │ (:8090)    │ │ (:8091)    │ │ (:8092)    │ │ (:8093)    │ │ (:8094)    │    │
│  │Spring Boot │ │Spring Boot │ │Spring Boot │ │Spring Boot │ │Spring Boot │    │
│  └─────┬──────┘ └──────┬─────┘ └─────┬──────┘ └─────┬──────┘ └────────────┘    │
│        │               │             │              │                           │
│        │               └──────┬──────┘              │                           │
│        │                      ▼                     │                           │
│        │      ┌───────────────────────────────┐     │                           │
│        │      │      INTEGRATION LAYER        │     │                           │
│        │      │  ┌─────────────────────────┐  │     │                           │
│        │      │  │  IntegrationService     │  │     │                           │
│        │      │  │      (:8095)            │  │     │                           │
│        │      │  └───────────┬─────────────┘  │     │                           │
│        │      │              │                │     │                           │
│        │      │  ┌───────────┼───────────┐    │     │                           │
│        │      │  ▼           ▼           ▼    │     │                           │
│        │      │ ┌─────┐   ┌─────┐   ┌─────┐  │     │                           │
│        │      │ │HTTPS│   │SOAP │   │ RPC │  │     │                           │
│        │      │ │Adapt│   │Adapt│   │Adapt│  │     │                           │
│        │      │ │:3000│   │:3001│   │:3002│  │     │                           │
│        │      │ │Node │   │Node │   │Node │  │     │                           │
│        │      │ └──┬──┘   └──┬──┘   └──┬──┘  │     │                           │
│        │      └────┼─────────┼─────────┼─────┘     │                           │
│        │           └─────────┼─────────┘           │                           │
│        │                     ▼                     │                           │
│        │      ┌───────────────────────────────┐    │                           │
│        │      │   EXTERNAL PROVIDER APIs      │    │                           │
│        │      │        (:443 HTTPS)           │    │                           │
│        │      └───────────────────────────────┘    │                           │
│        │                                           │                           │
│        └─────────────────────┬─────────────────────┘                           │
│                              │                                                  │
│    ┌─────────────────────────┼─────────────────────────┐                       │
│    ▼                         ▼                         ▼                       │
│  ┌────────────┐       ┌────────────┐       ┌────────────────┐                  │
│  │   MySQL    │       │   Redis    │       │     Kafka      │                  │
│  │  (:3306)   │       │  (:6379)   │       │    (:9092)     │                  │
│  │  Main DB   │       │   Cache    │       │  + RabbitMQ    │                  │
│  │            │       │            │       │    (:5672)     │                  │
│  └────────────┘       └────────────┘       └────────────────┘                  │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                        OBSERVABILITY LAYER                                │ │
│  │                                                                           │ │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐  │ │
│  │   │ Prometheus  │    │  Grafana    │    │   ELK Stack │    │ Jaeger   │  │ │
│  │   │  (:9090)    │◄───│  (:3001)    │    │ (Opcional)  │    │(Opcional)│  │ │
│  │   │  Metrics    │    │ Dashboards  │    │   Logging   │    │ Tracing  │  │ │
│  │   └──────┬──────┘    └─────────────┘    └─────────────┘    └──────────┘  │ │
│  │          │                                                               │ │
│  │          │ scrape /actuator/prometheus                                   │ │
│  │          ▼                                                               │ │
│  │   ┌─────────────────────────────────────────────────────────────────┐   │ │
│  │   │              Todos los servicios exponen:                        │   │ │
│  │   │              - /actuator/health (Health Checks)                  │   │ │
│  │   │              - /actuator/prometheus (Métricas Micrometer)        │   │ │
│  │   │              - Logs estructurados (SLF4J + Logback)              │   │ │
│  │   └─────────────────────────────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Stack Tecnológico Final

| Capa | Componente | Tecnología | Puerto |
|------|------------|------------|--------|
| **Orquestación** | Cluster | Kubernetes (Docker Desktop) | - |
| **Ingress** | Load Balancer | NGINX Ingress Controller | :80, :443 |
| **Presentation** | WebUI | Tomcat + compras.war | :8080 |
| **Presentation** | AdminPanel | Tomcat + admin.war | :8081 |
| **Gateway** | API Gateway | Spring Cloud Gateway | :8080 |
| **Registry** | Service Discovery | Eureka Server | :8761 |
| **Business** | OrderService | Spring Boot | :8090 |
| **Business** | CatalogService | Spring Boot | :8091 |
| **Business** | CustomerService | Spring Boot | :8092 |
| **Business** | PaymentService | Spring Boot | :8093 |
| **Business** | NotificationService | Spring Boot | :8094 |
| **Integration** | IntegrationService | Spring Boot | :8095 |
| **Integration** | HTTPSAdapter | Node.js | :3000 |
| **Integration** | SOAPAdapter | Node.js | :3001 |
| **Integration** | RPCAdapter | Node.js | :3002 |
| **Data** | Database | MySQL 8.0 | :3306 |
| **Data** | Cache | Redis 7 | :6379 |
| **Messaging** | Event Broker | Apache Kafka (KRaft) | :9092 |
| **Messaging** | Message Queue | RabbitMQ | :5672, :15672 |

### 6.3 Recursos Estimados

| Recurso | Original | Simplificado |
|---------|----------|--------------|
| RAM Total | 54 GB | ~8-10 GB |
| CPU Cores | 24 | 8-12 |
| Containers | 6 mega-containers | ~15 micro-containers |
| Tiempo arranque | 5-10 min | 2-3 min |
| Ejecutable en laptop | ❌ | ✅ |

---

## 7. Estrategia de Deployment (Kubernetes)

### 7.1 Estructura de Manifiestos

```
k8s/
├── namespace.yaml                    # Namespace: allconnect
├── configmaps/
│   ├── app-config.yaml              # Configuración de aplicación
│   └── nginx-config.yaml            # Configuración de Nginx
├── secrets/
│   ├── db-credentials.yaml          # Credenciales MySQL
│   ├── jwt-secret.yaml              # Secret para JWT
│   └── kafka-credentials.yaml       # Credenciales Kafka
├── deployments/
│   ├── infrastructure/
│   │   ├── mysql-deployment.yaml
│   │   ├── redis-deployment.yaml
│   │   ├── kafka-deployment.yaml
│   │   └── rabbitmq-deployment.yaml
│   ├── platform/
│   │   ├── eureka-deployment.yaml
│   │   ├── gateway-deployment.yaml
│   │   └── tomcat-deployment.yaml
│   ├── services/
│   │   ├── order-service-deployment.yaml
│   │   ├── catalog-service-deployment.yaml
│   │   ├── customer-service-deployment.yaml
│   │   ├── payment-service-deployment.yaml
│   │   └── notification-service-deployment.yaml
│   └── integration/
│       ├── integration-service-deployment.yaml
│       ├── https-adapter-deployment.yaml
│       ├── soap-adapter-deployment.yaml
│       └── rpc-adapter-deployment.yaml
├── services/
│   ├── mysql-service.yaml
│   ├── redis-service.yaml
│   ├── kafka-service.yaml
│   ├── rabbitmq-service.yaml
│   ├── eureka-service.yaml
│   ├── gateway-service.yaml
│   ├── order-service.yaml
│   ├── catalog-service.yaml
│   ├── customer-service.yaml
│   ├── payment-service.yaml
│   ├── notification-service.yaml
│   ├── integration-service.yaml
│   └── adapters-service.yaml
├── ingress/
│   └── main-ingress.yaml            # Ingress principal
├── volumes/
│   ├── mysql-pvc.yaml               # Persistent Volume para MySQL
│   └── kafka-pvc.yaml               # Persistent Volume para Kafka
└── kustomization.yaml               # Kustomize para deploy completo
```

### 7.2 Comandos de Deployment

```bash
# Habilitar Kubernetes en Docker Desktop (Settings > Kubernetes > Enable)

# Crear namespace
kubectl apply -f k8s/namespace.yaml

# Deploy completo con Kustomize
kubectl apply -k k8s/

# Verificar estado
kubectl get pods -n allconnect
kubectl get services -n allconnect

# Ver logs
kubectl logs -f deployment/order-service -n allconnect

# Port-forward para desarrollo
kubectl port-forward svc/gateway 8080:8080 -n allconnect
```

---

## 8. Comparación: Vista Física Original vs Implementación Final

### 8.1 Contenedor allconnect-presentation

| Original | Final |
|----------|-------|
| Nginx 1.20 (:80, :443) | NGINX Ingress Controller (:80, :443) |
| Tomcat 9.0 compras.war (:8080) | Tomcat Pod compras.war (:8080) |
| Tomcat 9.0 admin.war (:8081) | Tomcat Pod admin.war (:8081) |
| **1 container, 4GB RAM** | **3 pods, ~1.5GB RAM** |

### 8.2 Contenedor allconnect-esb

| Original | Final | Equivalencia |
|----------|-------|--------------|
| WSO2 ESB 5.0 (:8280, :8243) | Spring Cloud Gateway (:8080) | Routing + Policies |
| Apache ODE BPEL (:8282) | Saga pattern en OrderService | Orquestación |
| Apache jUDDI (:8083) | Eureka Server (:8761) | Service Discovery |
| SecurityService (:8095) | Spring Security en Gateway | Auth/JWT |
| **1 container, 8GB RAM** | **2 pods, ~1GB RAM** | ✅ Mismo resultado |

### 8.3 Contenedor allconnect-services

| Original | Final |
|----------|-------|
| 6 services en 1 container | 6 pods independientes |
| **12GB RAM compartida** | **~3GB RAM (512MB c/u)** |
| Difícil de escalar individualmente | Cada servicio escala independiente |

### 8.4 Contenedor allconnect-integration

| Original | Final |
|----------|-------|
| IntegrationService (:8094) | IntegrationService Pod (:8095) |
| ProviderFacade (:8098) | Integrado en IntegrationService |
| AsyncRequestManager (:8099) | Integrado en IntegrationService |
| ProtocolAdapterFactory (:9000) | Integrado en IntegrationService |
| HTTPSAdapter (:3000) | HTTPS Adapter Pod (:3000) |
| SOAPAdapter (:3001) | SOAP Adapter Pod (:3001) |
| RPCAdapter (:3002) | RPC Adapter Pod (:3002) |
| **1 container, 6GB RAM** | **4 pods, ~1.5GB RAM** |

### 8.5 Contenedor allconnect-data

| Original | Final |
|----------|-------|
| PostgreSQL 14 (:5432) | MySQL 8.0 (:3306) |
| Redis 6.2 (:6379) | Redis 7 (:6379) |
| MongoDB 5.0 (:27017) | ❌ Eliminado (usar MySQL) |
| **1 container, 16GB RAM** | **2 pods, ~1.5GB RAM** |

### 8.6 Contenedor allconnect-messaging

| Original | Final |
|----------|-------|
| Zookeeper (:2181) | ❌ Eliminado (Kafka KRaft) |
| Kafka 3.0 (:9092) | Kafka con KRaft (:9092) |
| RabbitMQ 3.11 (:5672) | RabbitMQ (:5672, :15672) |
| **1 container, 8GB RAM** | **2 pods, ~2GB RAM** |

---

## 9. Inventario Consolidado de Componentes a Implementar

Este inventario representa TODO lo que debe existir en el sistema final, combinando las vistas originales con las simplificaciones acordadas.

### 9.1 Frontend (MVVM Completo)

| Componente | Métodos/Funcionalidad | Salida | Puerto |
|------------|----------------------|--------|--------|
| **WebUI** | renderCatalog(), displayCart(), processCheckout() | compras.war | :8080 |
| **AdminPanel** | monitorOrders(), viewMetrics(), manageProviders() | admin.war | :8081 |

**Estructura MVVM por cada frontend:**
- `Views/` - Componentes React de presentación
- `ViewModels/` - Lógica de estado y transformación
- `Services/` - Llamadas a API (Gateway)

### 9.2 Platform Layer

| Componente | Puerto | Funcionalidad Original | Implementación |
|------------|--------|------------------------|----------------|
| **Nginx Ingress** | :80, :443 | Load balancer, SSL termination | NGINX Ingress Controller |
| **Spring Cloud Gateway** | :8080 | routeMessage(), transformProtocol(), applySecurityPolicy() | Reemplaza WSO2 ESB |
| **Eureka** | :8761 | publishService(), discoverService(), manageVersions() | Reemplaza jUDDI |
| **Tomcat** | :8080, :8081 | Servlet container para WARs | Apache Tomcat 9 |

### 9.3 Enterprise Services (Spring Boot)

| Servicio | Puerto | Métodos Principales |
|----------|--------|---------------------|
| **OrderService** | :8090 | manageCart(), calculatePricing(), processCompleteOrder() + **Saga Pattern** (reemplaza BPEL) |
| **CatalogService** | :8091 | searchProducts(), manageInventory(), syncProviderCatalog() |
| **CustomerService** | :8092 | authenticateUser(), manageProfile(), trackNavigationHistory() |
| **PaymentService** | :8093 | processPayment(), validateCard(), refund() |
| **NotificationService** | :8094 | sendEmail(), sendPush(), Kafka consumer |
| **BillingService** | :8096 | createInvoice(), calculateTax() |
| **RecommendationService** | :8097 | generateRecommendations(), analyzeUserBehavior() |
| **SecurityService** | :8095 | authenticate(), authorize(), generateJWT() |

### 9.4 Integration Layer

| Componente | Puerto | Métodos | Tecnología |
|------------|--------|---------|------------|
| **IntegrationService** | :8094 | integrateProviderAsync(), handleCallback(), manageProviderConnection() | Spring Boot |
| **ProviderFacade** | :8098 | fetchInventory(), fetchPricing(), orchestrateAsyncRequests() | Spring Boot (integrado) |
| **AsyncRequestManager** | :8099 | sendAsyncRequest(), trackRequestStatus(), handleTimeout() | Spring Boot (integrado) |
| **ProtocolAdapterFactory** | :9000 | createAdapter(), getAdapterForProvider() | Spring Boot (integrado) |
| **HTTPSAdapter** | :3000 | connect(), fetchData(), transformResponse() | Node.js |
| **SOAPAdapter** | :3001 | connect(), fetchData(), parseWSDL() | Node.js |
| **RPCAdapter** | :3002 | connect(), fetchData(), handleGrpc() | Node.js |

### 9.5 Mock Providers (para demo end-to-end)

| Provider | Tipo Protocolo | Simula | Funcionalidades |
|----------|---------------|--------|-----------------|
| **PhysicalGoodsProvider** | HTTPS/REST | Proveedor de productos físicos | getProducts(), checkInventory(), createOrder(), getTracking() |
| **LegacyServiceProvider** | SOAP/XML | Proveedor legacy de servicios | scheduleService(), getAvailability(), confirmBooking() |
| **DigitalContentProvider** | gRPC | Proveedor de suscripciones | getSubscriptions(), activateSubscription(), getContentAccess() |

### 9.6 Data Access Layer

| Componente | Métodos | Base de Datos |
|------------|---------|---------------|
| **OrderRepository** | save(), findByUserId(), updateStatus(), findByDateRange() | MySQL |
| **ProductRepository** | findByCriteria(), updateInventory(), syncFromProvider() | MySQL |
| **UserRepository** | authenticate(), saveProfile(), getNavigationHistory() | MySQL |
| **PaymentRepository** | saveTransaction(), findByOrder(), updateStatus() | MySQL |
| **NotificationRepository** | save(), findPending(), markAsSent() | MySQL |

### 9.7 Infrastructure Layer

| Componente | Puerto | Funcionalidad |
|------------|--------|---------------|
| **MySQL** | :3306 | Base de datos principal (reemplaza PostgreSQL + MongoDB) |
| **Redis** | :6379 | cacheInventory(), retrieveFromCache(), invalidateCache(), sessions |
| **Kafka** | :9092 | publishEvent(), subscribeToQueue() (con KRaft, sin Zookeeper) |
| **RabbitMQ** | :5672, :15672 | deliverMessage(), queue management, dead letter queues |

### 9.8 Observability Layer

| Componente | Puerto | Funcionalidad |
|------------|--------|---------------|
| **Prometheus** | :9090 | collectMetrics(), alerting rules |
| **Grafana** | :3001 | trackLatency(), alertOnFailure(), dashboards |
| **Spring Actuator** | /actuator/* | health checks, metrics exposure |
| **Micrometer** | - | métricas JVM y custom |

### 9.9 Domain Layer (Entidades)

| Entidad | Atributos Principales |
|---------|----------------------|
| **Order** | id, customerId, items[], status, totalAmount, createdAt |
| **CartItem** | productId, quantity, price, productType |
| **Product** | id, name, description, price, stock, providerId, type |
| **Provider** | id, name, protocol, endpoint, credentials, status |
| **User** | id, email, passwordHash, profile, preferences |
| **Payment** | id, orderId, amount, method, status, transactionId |
| **Invoice** | id, orderId, items[], tax, total, issuedAt |
| **Notification** | id, userId, type, channel, content, sentAt |

### 9.10 Resumen de Totales

| Categoría | Cantidad |
|-----------|----------|
| Frontends (WARs) | 2 |
| Platform Services | 4 |
| Enterprise Services | 8 |
| Integration Components | 4 (1 Spring + 3 Node.js) |
| Mock Providers | 3 |
| Infrastructure | 4 |
| Observability | 2 (+actuator) |
| **Total Componentes Desplegables** | **~27** |

---

## 10. Próximos Pasos

### 10.1 Orden de Ejecución
1. ✅ Documentar decisiones arquitectónicas (este documento)
2. ⏳ Crear estructura del proyecto
3. ⏳ Identificar código reutilizable de talleres
4. ⏳ Copiar/adaptar código base
5. ⏳ Dividir trabajo en 4 tracks paralelos
6. ⏳ Crear CLAUDE.md para cada track
7. ⏳ Implementar en paralelo
8. ⏳ Integrar y probar
9. ⏳ Preparar presentación

### 10.2 Riesgos Identificados
| Riesgo | Mitigación |
|--------|------------|
| Kubernetes complejo | Usar Docker Desktop K8s (más simple) |
| Tiempo limitado (12h) | Paralelizar con 4 Claude Code |
| Integración entre tracks | Definir interfaces/contratos primero |
| Código de talleres incompatible | Adaptar patrones, no copiar literal |

---

## 10. Referencias

### Documentos del Proyecto
- SRS: `/Documentos iniciales de referencia/SRS_Proyecto_2_AS/`
- SAD: `/Documentos iniciales de referencia/SAD_allConnectMarket_v2.tex`
- Vista Lógica: `/Documentos iniciales de referencia/Vista Logica Codigo Drawio.drawio`
- Vista Procesos: `/Documentos iniciales de referencia/VistaProcesosCodigoDrawio.drawio`
- Vista Desarrollo: `/Documentos iniciales de referencia/VistaDesarrolloCodigoDrawio.drawio`
- Vista Física: `/Documentos iniciales de referencia/allconnect-physical-view (1).drawio`

### Repositorios de Talleres
- TallerDatosAS: https://github.com/SarAlbN1/TallerDatosAS.git
- AS-Catalogo-NET: https://github.com/SarAlbN1/AS-Catalogo-NET.git

### Tecnologías
- Spring Boot: https://spring.io/projects/spring-boot
- Spring Cloud Gateway: https://spring.io/projects/spring-cloud-gateway
- Netflix Eureka: https://github.com/Netflix/eureka
- Kubernetes: https://kubernetes.io/docs/
- Docker Desktop: https://www.docker.com/products/docker-desktop/

---

*Documento generado el 24 de Noviembre de 2025*
*Versión 1.0*

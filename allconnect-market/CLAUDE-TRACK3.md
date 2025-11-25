# Track 3: Integration Layer + Mock Providers

## TU MISIÓN

Eres responsable de la capa de integración y los proveedores mock. Tu trabajo demuestra la arquitectura SOA multicanal - conectas el sistema con "proveedores externos" usando 3 protocolos diferentes.

**Lee primero**: CLAUDE.md y TRACKS_DIVISION.md

---

## CHECKLIST DE TAREAS

Actualiza este checklist frecuentemente marcando con [x] lo completado:

### Fase 1: Setup y Estructura (Horas 0-1)

#### Estructura de Carpetas
- [ ] Crear /integration/integration-service/ (Spring Boot)
- [ ] Crear /integration/adapters/https-adapter/ (Node.js)
- [ ] Crear /integration/adapters/soap-adapter/ (Node.js)
- [ ] Crear /integration/adapters/rpc-adapter/ (Node.js)
- [ ] Crear /integration/mock-providers/rest-provider/ (Node.js)
- [ ] Crear /integration/mock-providers/soap-provider/ (Node.js)
- [ ] Crear /integration/mock-providers/grpc-provider/ (Node.js)

#### Node.js Setup (para cada adapter/provider)
- [ ] package.json configurado
- [ ] Dependencias instaladas
- [ ] Scripts de start

### Fase 2: IntegrationService (Spring Boot) (Horas 1-3)

**Puerto: 8085**

#### Endpoints
- [ ] POST /api/integration/orders - Enviar orden a proveedor
- [ ] GET /api/integration/orders/{providerId}/{orderId}/status - Estado de orden
- [ ] POST /api/integration/bookings - Crear reserva (servicios)
- [ ] DELETE /api/integration/bookings/{id} - Cancelar reserva
- [ ] POST /api/integration/subscriptions - Crear suscripción
- [ ] DELETE /api/integration/subscriptions/{id} - Cancelar suscripción
- [ ] GET /api/integration/inventory/{productId} - Consultar stock
- [ ] GET /api/integration/availability/{serviceId} - Consultar disponibilidad

#### Lógica de Ruteo
```java
// Determinar qué adapter usar según el tipo de producto
switch(product.getProviderType()) {
    case REST -> callHttpsAdapter(request);
    case SOAP -> callSoapAdapter(request);
    case GRPC -> callRpcAdapter(request);
}
```

#### Circuit Breaker
- [ ] Implementar con Resilience4j
- [ ] Fallback cuando proveedor no responde
- [ ] Logs de errores de integración

#### Registro
- [ ] Registrado en Eureka
- [ ] Swagger funcionando

### Fase 3: HTTPS Adapter (Node.js) (Horas 3-4.5)

**Puerto: 3001**

#### Endpoints (recibe de IntegrationService)
- [ ] POST /adapter/orders - Crear orden en proveedor REST
- [ ] GET /adapter/orders/:id/status - Estado de orden
- [ ] GET /adapter/inventory/:productId - Stock disponible
- [ ] DELETE /adapter/orders/:id - Cancelar orden

#### Funcionalidad
- [ ] Transformar mensaje interno a formato del proveedor REST
- [ ] Llamar al Mock REST Provider (puerto 4001)
- [ ] Transformar respuesta al formato interno
- [ ] Manejo de errores
- [ ] Logging completo

#### Código Base
```javascript
// https-adapter/index.js
const express = require('express');
const axios = require('axios');
const app = express();

const REST_PROVIDER_URL = 'http://localhost:4001';

app.post('/adapter/orders', async (req, res) => {
    try {
        console.log('[HTTPS Adapter] Recibida orden:', req.body);

        // Transformar al formato del proveedor
        const providerRequest = {
            items: req.body.items.map(item => ({
                sku: item.productId,
                qty: item.quantity
            })),
            shipping: req.body.shippingAddress,
            customer: req.body.customerEmail
        };

        // Llamar al proveedor
        const response = await axios.post(
            `${REST_PROVIDER_URL}/api/orders`,
            providerRequest
        );

        // Transformar respuesta
        res.json({
            success: true,
            providerOrderId: response.data.orderId,
            estimatedDelivery: response.data.eta,
            trackingNumber: response.data.tracking
        });
    } catch (error) {
        console.error('[HTTPS Adapter] Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(3001, () => console.log('HTTPS Adapter running on port 3001'));
```

### Fase 4: SOAP Adapter (Node.js) (Horas 4.5-6.5)

**Puerto: 3002**

#### Endpoints (recibe de IntegrationService)
- [ ] POST /adapter/bookings - Crear reserva
- [ ] GET /adapter/bookings/:id - Obtener reserva
- [ ] DELETE /adapter/bookings/:id - Cancelar reserva
- [ ] GET /adapter/availability/:serviceId - Disponibilidad

#### Funcionalidad
- [ ] Transformar mensaje interno a SOAP XML
- [ ] Llamar al Mock SOAP Provider (puerto 4002)
- [ ] Parsear respuesta SOAP XML
- [ ] Transformar a JSON interno

#### Código Base
```javascript
// soap-adapter/index.js
const express = require('express');
const soap = require('soap');
const app = express();

const SOAP_WSDL = 'http://localhost:4002/service?wsdl';

let soapClient = null;

// Inicializar cliente SOAP
soap.createClient(SOAP_WSDL, (err, client) => {
    if (err) console.error('Error creating SOAP client:', err);
    else soapClient = client;
});

app.post('/adapter/bookings', async (req, res) => {
    try {
        console.log('[SOAP Adapter] Recibida reserva:', req.body);

        // Transformar al formato SOAP
        const soapRequest = {
            serviceId: req.body.serviceId,
            customerId: req.body.customerId,
            dateTime: req.body.preferredDateTime,
            notes: req.body.notes || ''
        };

        // Llamar al servicio SOAP
        soapClient.BookService(soapRequest, (err, result) => {
            if (err) {
                console.error('[SOAP Adapter] Error:', err);
                return res.status(500).json({ success: false, error: err.message });
            }

            // Transformar respuesta
            res.json({
                success: true,
                bookingId: result.bookingId,
                confirmationCode: result.confirmationCode,
                scheduledAt: result.scheduledDateTime,
                providerName: result.providerName
            });
        });
    } catch (error) {
        console.error('[SOAP Adapter] Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(3002, () => console.log('SOAP Adapter running on port 3002'));
```

### Fase 5: RPC Adapter (Node.js + gRPC) (Horas 6.5-8.5)

**Puerto: 3003**

#### Endpoints (recibe de IntegrationService)
- [ ] POST /adapter/subscriptions - Crear suscripción
- [ ] GET /adapter/subscriptions/:id - Estado suscripción
- [ ] DELETE /adapter/subscriptions/:id - Cancelar suscripción
- [ ] POST /adapter/subscriptions/:id/access - Verificar acceso

#### Funcionalidad
- [ ] Transformar mensaje interno a formato gRPC
- [ ] Llamar al Mock gRPC Provider (puerto 4003)
- [ ] Transformar respuesta Protobuf a JSON

#### Proto File
```protobuf
// subscription.proto
syntax = "proto3";

package subscription;

service SubscriptionService {
    rpc CreateSubscription(CreateRequest) returns (SubscriptionResponse);
    rpc GetSubscription(GetRequest) returns (SubscriptionResponse);
    rpc CancelSubscription(CancelRequest) returns (CancelResponse);
    rpc CheckAccess(AccessRequest) returns (AccessResponse);
}

message CreateRequest {
    string plan_id = 1;
    string customer_id = 2;
    string payment_method = 3;
}

message SubscriptionResponse {
    string subscription_id = 1;
    string status = 2;
    string start_date = 3;
    string end_date = 4;
    repeated string features = 5;
}

message GetRequest {
    string subscription_id = 1;
}

message CancelRequest {
    string subscription_id = 1;
    string reason = 2;
}

message CancelResponse {
    bool success = 1;
    string refund_amount = 2;
}

message AccessRequest {
    string subscription_id = 1;
    string content_id = 2;
}

message AccessResponse {
    bool has_access = 1;
    string access_url = 2;
}
```

### Fase 6: Mock REST Provider (Horas 8.5-9.5)

**Puerto: 4001**
**Simula**: Proveedor de productos físicos (estilo Amazon)

#### Endpoints
- [ ] GET /api/products - Lista de productos
- [ ] GET /api/products/:id - Detalle producto
- [ ] POST /api/orders - Crear orden
- [ ] GET /api/orders/:id - Obtener orden
- [ ] GET /api/orders/:id/status - Estado de envío
- [ ] GET /api/inventory/:productId - Stock disponible
- [ ] DELETE /api/orders/:id - Cancelar orden

#### Datos Mock
```javascript
const products = [
    { id: 'PROD001', name: 'Laptop Gaming XPS', stock: 50, price: 1299.99 },
    { id: 'PROD002', name: 'Smartphone Galaxy S24', stock: 100, price: 899.99 },
    { id: 'PROD003', name: 'Audífonos Bluetooth Pro', stock: 200, price: 199.99 }
];

const orderStatuses = [
    'RECEIVED',
    'PROCESSING',
    'SHIPPED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED'
];
```

#### Simulación Realista
- [ ] Delay de 500-1500ms en respuestas
- [ ] Estados de orden que avanzan con el tiempo
- [ ] Stock que disminuye con órdenes
- [ ] Tracking numbers generados

### Fase 7: Mock SOAP Provider (Horas 9.5-10.5)

**Puerto: 4002**
**Simula**: Proveedor de servicios profesionales (médicos, legales, etc.)

#### Operaciones SOAP
- [ ] BookService - Reservar servicio
- [ ] CancelBooking - Cancelar reserva
- [ ] GetAvailability - Ver disponibilidad
- [ ] GetBookingDetails - Detalles de reserva

#### WSDL
```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions name="ServiceBooking"
             targetNamespace="http://allconnect.com/services"
             xmlns="http://schemas.xmlsoap.org/wsdl/"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:tns="http://allconnect.com/services">

    <message name="BookServiceRequest">
        <part name="serviceId" type="xsd:string"/>
        <part name="customerId" type="xsd:string"/>
        <part name="dateTime" type="xsd:string"/>
        <part name="notes" type="xsd:string"/>
    </message>

    <message name="BookServiceResponse">
        <part name="bookingId" type="xsd:string"/>
        <part name="confirmationCode" type="xsd:string"/>
        <part name="scheduledDateTime" type="xsd:string"/>
        <part name="providerName" type="xsd:string"/>
    </message>

    <!-- ... más definiciones ... -->
</definitions>
```

#### Datos Mock
```javascript
const services = [
    { id: 'SVC001', name: 'Consulta Médica General', duration: 30, provider: 'Dr. García' },
    { id: 'SVC002', name: 'Asesoría Legal', duration: 60, provider: 'Abg. Martínez' },
    { id: 'SVC003', name: 'Clase de Yoga', duration: 60, provider: 'Ana López' }
];

// Disponibilidad simulada (próximos 7 días, slots de 1 hora)
const generateAvailability = (serviceId) => {
    // Generar slots disponibles
};
```

### Fase 8: Mock gRPC Provider (Horas 10.5-12)

**Puerto: 4003**
**Simula**: Proveedor de suscripciones digitales (streaming, SaaS)

#### Servicios gRPC
- [ ] CreateSubscription
- [ ] GetSubscription
- [ ] CancelSubscription
- [ ] CheckAccess
- [ ] ListUserSubscriptions

#### Datos Mock
```javascript
const plans = [
    {
        id: 'PLAN001',
        name: 'Plan Streaming Premium',
        price: 14.99,
        features: ['HD', '4K', 'Sin anuncios', '4 pantallas']
    },
    {
        id: 'PLAN002',
        name: 'Software Productividad Pro',
        price: 9.99,
        features: ['Documentos', 'Hojas de cálculo', 'Presentaciones', 'Cloud sync']
    },
    {
        id: 'PLAN003',
        name: 'Contenido Educativo Ilimitado',
        price: 19.99,
        features: ['Todos los cursos', 'Certificados', 'Soporte 24/7']
    }
];

const subscriptions = new Map(); // subscriptionId -> subscription
```

#### Implementación gRPC Server
```javascript
// grpc-provider/index.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { v4: uuidv4 } = require('uuid');

const packageDefinition = protoLoader.loadSync('./subscription.proto');
const subscriptionProto = grpc.loadPackageDefinition(packageDefinition).subscription;

const subscriptions = new Map();

const server = new grpc.Server();

server.addService(subscriptionProto.SubscriptionService.service, {
    CreateSubscription: (call, callback) => {
        const { plan_id, customer_id } = call.request;
        const subscription = {
            subscription_id: uuidv4(),
            status: 'ACTIVE',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
            features: plans.find(p => p.id === plan_id)?.features || []
        };
        subscriptions.set(subscription.subscription_id, subscription);
        callback(null, subscription);
    },
    // ... otros métodos
});

server.bindAsync('0.0.0.0:4003', grpc.ServerCredentials.createInsecure(), () => {
    console.log('gRPC Provider running on port 4003');
    server.start();
});
```

---

## FLUJO DE INTEGRACIÓN COMPLETO

```
OrderService → IntegrationService → [Adapter] → [Mock Provider]
                    │
                    ├── PHYSICAL product → HTTPS Adapter → REST Provider
                    │                           │
                    │                           └── Create order, track shipping
                    │
                    ├── SERVICE product → SOAP Adapter → SOAP Provider
                    │                          │
                    │                          └── Book appointment, get confirmation
                    │
                    └── SUBSCRIPTION product → RPC Adapter → gRPC Provider
                                                    │
                                                    └── Create subscription, grant access
```

---

## ESTRUCTURA DE CARPETAS

```
integration/
├── integration-service/          # Spring Boot
│   ├── src/main/java/...
│   └── pom.xml
├── adapters/
│   ├── https-adapter/           # Node.js + Express
│   │   ├── index.js
│   │   └── package.json
│   ├── soap-adapter/            # Node.js + soap
│   │   ├── index.js
│   │   └── package.json
│   └── rpc-adapter/             # Node.js + grpc
│       ├── index.js
│       ├── subscription.proto
│       └── package.json
└── mock-providers/
    ├── rest-provider/           # Node.js + Express
    │   ├── index.js
    │   ├── data.js
    │   └── package.json
    ├── soap-provider/           # Node.js + soap
    │   ├── index.js
    │   ├── service.wsdl
    │   └── package.json
    └── grpc-provider/           # Node.js + grpc
        ├── index.js
        ├── subscription.proto
        └── package.json
```

---

## COMANDOS DE VERIFICACIÓN

```bash
# Iniciar todos los componentes
cd integration/integration-service && ./mvnw spring-boot:run &
cd integration/adapters/https-adapter && npm start &
cd integration/adapters/soap-adapter && npm start &
cd integration/adapters/rpc-adapter && npm start &
cd integration/mock-providers/rest-provider && npm start &
cd integration/mock-providers/soap-provider && npm start &
cd integration/mock-providers/grpc-provider && npm start &

# Probar REST Provider directamente
curl http://localhost:4001/api/products
curl -X POST http://localhost:4001/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"sku":"PROD001","qty":1}]}'

# Probar HTTPS Adapter
curl -X POST http://localhost:3001/adapter/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"PROD001","quantity":1}],"shippingAddress":"123 Test St"}'

# Probar IntegrationService via Gateway
curl -X POST http://localhost:8080/api/integration/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":"1","quantity":1,"customerId":"1"}'
```

---

## PROBLEMAS COMUNES Y SOLUCIONES

### SOAP Client no conecta
- Verificar que el WSDL está accesible
- Verificar URL del WSDL en el adapter

### gRPC Connection refused
- Verificar que el proto file es el mismo en adapter y provider
- Verificar puerto correcto

### Timeout en IntegrationService
- Aumentar timeout de WebClient/RestTemplate
- Verificar que adapters están corriendo

### Mock Provider no responde
- Verificar logs del provider
- Verificar que el puerto no está ocupado

---

## MÉTRICAS DE ÉXITO

Al finalizar tu track, debes poder decir SÍ a todas estas preguntas:

1. ¿IntegrationService está corriendo y registrado en Eureka?
2. ¿Los 3 adapters están corriendo?
3. ¿Los 3 mock providers están corriendo?
4. ¿Puedo crear una orden de producto físico y recibir tracking?
5. ¿Puedo crear una reserva de servicio y recibir confirmación?
6. ¿Puedo crear una suscripción y verificar acceso?
7. ¿El flujo completo desde OrderService funciona?
8. ¿Los logs muestran las transformaciones de mensaje?
9. ¿Circuit breaker funciona cuando un provider falla?
10. ¿Todo accesible via Gateway?

---

## NOTAS PARA COORDINACIÓN

**Dependes de Track 1:**
- Gateway para exponer IntegrationService
- Eureka para registro

**Dependes de Track 2:**
- OrderService llama a IntegrationService
- Formato de request/response acordado

**Track 4 depende de ti:**
- Estados de tracking para mostrar en UI
- Confirmaciones de reserva
- Estados de suscripción

**PRIORIDAD**:
1. Mock Providers primero (son independientes)
2. Adapters después
3. IntegrationService al final (orquesta todo)

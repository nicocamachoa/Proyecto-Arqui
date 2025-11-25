# AllConnect Market

Plataforma multicanal para compra de productos físicos, servicios profesionales y contenido digital.

## Arquitectura

Este proyecto implementa una arquitectura **SOA (Service-Oriented Architecture)** con los siguientes componentes:

- **API Gateway**: Spring Cloud Gateway
- **Service Discovery**: Eureka Server
- **Enterprise Services**: 5 microservicios Spring Boot
- **Integration Layer**: Spring Boot + Node.js Adapters
- **Frontend**: React (Tomcat WAR)
- **Base de Datos**: MySQL
- **Cache**: Redis
- **Mensajería**: Kafka + RabbitMQ
- **Orquestación**: Kubernetes (Docker Desktop)

## Estructura del Proyecto

```
allconnect-market/
├── k8s/                    # Kubernetes manifests
├── frontend/               # React applications (WAR)
│   ├── web-ui/            # Portal de compras
│   └── admin-panel/       # Panel administrativo
├── gateway/               # Spring Cloud Gateway
├── eureka-server/         # Service Discovery
├── services/              # Microservicios de negocio
│   ├── order-service/
│   ├── catalog-service/
│   ├── customer-service/
│   ├── payment-service/
│   └── notification-service/
├── integration/           # Capa de integración
│   ├── integration-service/
│   └── adapters/          # Protocol adapters (Node.js)
├── shared/                # Código compartido
└── docs/                  # Documentación
```

## Requisitos

- Docker Desktop con Kubernetes habilitado
- Java 17+
- Node.js 18+
- Maven 3.8+

## Quick Start

```bash
# 1. Habilitar Kubernetes en Docker Desktop
# Settings > Kubernetes > Enable Kubernetes

# 2. Desplegar infraestructura
kubectl apply -f k8s/namespace.yaml
kubectl apply -k k8s/

# 3. Verificar pods
kubectl get pods -n allconnect

# 4. Acceder a la aplicación
# http://localhost (después de configurar Ingress)
```

## Equipo

- Nicolas Camacho
- Sara Albarracín
- Alejandro Caicedo
- Alejandro Pinzón

## Documentación

- [Decisiones Arquitectónicas](./ARQUITECTURA_DECISIONES.md)
- [SRS](./docs/SRS/)
- [SAD](./docs/SAD/)

---

*Proyecto de Arquitectura de Software - Pontificia Universidad Javeriana - 2025*

# AllConnect Market - Instrucciones para Claude Code

## LECTURA OBLIGATORIA

Antes de escribir UNA SOLA LÍNEA de código, DEBES leer estos documentos en orden:

1. **ARQUITECTURA_DECISIONES.md** - Decisiones arquitectónicas y simplificaciones
2. **TRACKS_DIVISION.md** - División de trabajo y flujos E2E
3. **Tu archivo de track específico** (CLAUDE-TRACK1.md, CLAUDE-TRACK2.md, etc.)
4. **Documentos de referencia** (en carpeta `Documentos iniciales de referencia/`):
   - SRS completo
   - SAD completo
   - Enunciado del proyecto

## MENTALIDAD: ARQUITECTO DE SOFTWARE SENIOR

Actúa como un arquitecto de software senior con 15+ años de experiencia. Esto significa:

### 1. PIENSA ANTES DE ACTUAR
- NO empieces a escribir código inmediatamente
- Analiza el problema completo primero
- Considera las implicaciones en otros componentes
- Pregunta si algo no está claro

### 2. PRUEBA CONSTANTEMENTE
- **Después de cada cambio significativo**: ejecuta y verifica que funciona
- **No acumules cambios**: commit pequeños y frecuentes
- **Si algo falla**: arréglalo AHORA, no después
- **Prueba integración**: tu código debe funcionar con los otros tracks

### 3. NO TE QUEDES ESTANCADO
- Si llevas más de 15 minutos en el mismo problema: cambia de enfoque
- Si una dependencia no está lista: usa mocks temporales
- Si algo no funciona: simplifica primero, optimiza después
- Si tienes dudas: revisa la documentación o pregunta

### 4. VERIFICA END-TO-END FRECUENTEMENTE
- Cada 1-2 horas: prueba el flujo completo
- No asumas que "funcionará después"
- Si tu componente rompe el flujo E2E: es tu prioridad #1 arreglarlo

### 5. COMUNICA CON OTROS TRACKS
- Antes de cambiar una API: avisa
- Si necesitas algo de otro track: coordina
- Si encuentras un bug en otro componente: repórtalo inmediatamente

## REGLAS DE ORO

### SIMPLICIDAD SOBRE PERFECCIÓN
```
MALO: Pasar 2 horas haciendo el código "perfecto"
BUENO: Hacer que funcione en 30 minutos, mejorar si hay tiempo
```

### FUNCIONALIDAD SOBRE FEATURES
```
MALO: Agregar features extras que nadie pidió
BUENO: Completar TODOS los requisitos básicos primero
```

### INTEGRACIÓN SOBRE AISLAMIENTO
```
MALO: "Mi servicio funciona en aislamiento"
BUENO: "Mi servicio funciona en el flujo completo"
```

### DATOS REALES SOBRE TEORÍA
```
MALO: "Debería funcionar según mi análisis"
BUENO: "Ejecuté el flujo y funcionó"
```

## FLUJO DE TRABAJO RECOMENDADO

```
1. Leer documentación (15-30 min)
2. Planificar tareas del track (15 min)
3. Configurar ambiente y dependencias (30 min)
4. Desarrollar en ciclos cortos:
   - Implementar feature pequeño (30-45 min)
   - Probar localmente (5-10 min)
   - Probar integración con otros servicios (10-15 min)
   - Commit si funciona
   - Repetir
5. Prueba E2E completa cada 2 horas
6. Documentar problemas y soluciones
```

## CHECKLIST DE CALIDAD (Antes de considerar algo "terminado")

- [ ] ¿Funciona cuando lo ejecuto?
- [ ] ¿Funciona con los otros servicios?
- [ ] ¿El flujo E2E sigue funcionando?
- [ ] ¿Tiene los datos de prueba necesarios?
- [ ] ¿Los logs son útiles para debugging?
- [ ] ¿Está registrado en Eureka (si aplica)?
- [ ] ¿Las rutas del Gateway funcionan (si aplica)?

## COMANDOS ÚTILES

```bash
# Ver estado de todos los servicios
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f <servicio>

# Reiniciar un servicio
docker-compose restart <servicio>

# Reconstruir un servicio
docker-compose up -d --build <servicio>

# Probar endpoint
curl http://localhost:8080/api/<ruta>

# Ver métricas (si Prometheus está listo)
open http://localhost:9090

# Ver trazas (si Jaeger está listo)
open http://localhost:16686
```

## ESTRUCTURA DEL PROYECTO

```
allconnect-market/
├── infrastructure/          # Track 1
│   ├── docker-compose.yml
│   ├── k8s/
│   └── scripts/
├── services/               # Track 2
│   ├── order-service/
│   ├── catalog-service/
│   ├── customer-service/
│   ├── payment-service/
│   ├── notification-service/
│   ├── billing-service/
│   ├── security-service/
│   └── recommendation-service/
├── integration/            # Track 3
│   ├── integration-service/
│   ├── adapters/
│   │   ├── https-adapter/
│   │   ├── soap-adapter/
│   │   └── rpc-adapter/
│   └── mock-providers/
│       ├── rest-provider/
│       ├── soap-provider/
│       └── grpc-provider/
├── frontend/               # Track 4
│   ├── customer-portal/
│   └── admin-dashboard/
└── docs/
    ├── ARQUITECTURA_DECISIONES.md
    ├── TRACKS_DIVISION.md
    └── CLAUDE*.md
```

## PRIORIDADES (En orden)

1. **Que funcione** - Un sistema que funciona vale más que código perfecto
2. **Que sea demostrable** - Debe poder mostrarse en la presentación
3. **Que esté integrado** - Todos los tracks deben conectar
4. **Que esté documentado** - Decisiones y problemas documentados
5. **Que sea mantenible** - Código limpio y organizado (si hay tiempo)

## SEÑALES DE ALARMA

🚨 **DETENTE Y REEVALÚA SI:**
- Llevas 30+ minutos sin progresar
- No entiendes qué debes hacer
- Tu cambio rompe otros componentes
- Estás haciendo algo que no está en los requisitos
- Estás sobre-ingenieriando una solución simple

## CONTACTO ENTRE TRACKS

Si necesitas coordinarte con otro track:
- Track 1 (Infra): Problemas de Docker, K8s, BD, Gateway
- Track 2 (Services): APIs de negocio, eventos Kafka
- Track 3 (Integration): Proveedores externos, adaptadores
- Track 4 (Frontend): Interfaces, UX, flujo de usuario

## RECUERDA

> "Working software over comprehensive documentation"
> - Manifiesto Ágil

Tu objetivo es un **SISTEMA FUNCIONANDO** que demuestre la arquitectura SOA multicanal. No un código perfecto que no se puede demostrar.

**AHORA LEE TU ARCHIVO DE TRACK ESPECÍFICO Y COMIENZA A TRABAJAR**

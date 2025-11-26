@echo off
setlocal EnableDelayedExpansion

REM =============================================================================
REM AllConnect Market - Script de Despliegue Automatizado
REM Arquitectura: SOA (Service-Oriented Architecture)
REM Compatible con: Windows CMD (Command Prompt)
REM =============================================================================

title AllConnect Market - Despliegue

REM Configuración
set "SCRIPT_DIR=%~dp0"
set "COMPOSE_FILE=%SCRIPT_DIR%docker-compose.yml"
set "MAX_RETRIES=30"
set "RETRY_INTERVAL=5"

REM Colores (solo funciona en Windows 10+)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "CYAN=[96m"
set "NC=[0m"

REM Parsear argumentos
if "%~1"=="--clean" goto :clean
if "%~1"=="-c" goto :clean
if "%~1"=="--status" goto :status
if "%~1"=="-s" goto :status
if "%~1"=="--help" goto :help
if "%~1"=="-h" goto :help

goto :main

REM =============================================================================
REM Funciones de ayuda
REM =============================================================================

:help
echo.
echo Uso: deploy.bat [opciones]
echo.
echo Opciones:
echo   (sin opciones)    Despliegue completo del sistema
echo   --clean, -c       Detener y limpiar todos los contenedores
echo   --status, -s      Mostrar estado actual del despliegue
echo   --help, -h        Mostrar esta ayuda
echo.
goto :eof

:clean
echo.
echo %CYAN%[INFO]%NC% Modo limpieza: deteniendo todos los contenedores...
cd /d "%SCRIPT_DIR%"
docker-compose down -v --remove-orphans
echo %GREEN%[OK]%NC% Limpieza completada
goto :eof

:status
cd /d "%SCRIPT_DIR%"
call :show_validation
call :show_urls
goto :eof

REM =============================================================================
REM Función principal
REM =============================================================================

:main
set "START_TIME=%TIME%"

call :print_banner

echo.
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo %CYAN%▶ Paso 1/8: Verificando prerequisitos%NC%
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo.

REM Verificar Docker
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERROR]%NC% Docker no está instalado. Por favor instálalo antes de continuar.
    exit /b 1
)

REM Verificar Docker está corriendo
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERROR]%NC% Docker no está corriendo. Por favor inicia Docker Desktop.
    exit /b 1
)

for /f "tokens=*" %%i in ('docker version --format "{{.Server.Version}}"') do set "DOCKER_VERSION=%%i"
echo %GREEN%[OK]%NC% Docker está corriendo (v%DOCKER_VERSION%)

REM Verificar docker-compose.yml
if not exist "%COMPOSE_FILE%" (
    echo %RED%[ERROR]%NC% No se encontró docker-compose.yml en %SCRIPT_DIR%
    exit /b 1
)
echo %GREEN%[OK]%NC% Archivo docker-compose.yml encontrado

echo.
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo %CYAN%▶ Paso 2/8: Limpiando despliegue anterior%NC%
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo.

cd /d "%SCRIPT_DIR%"
docker-compose down --remove-orphans 2>nul
echo %GREEN%[OK]%NC% Limpieza completada

echo.
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo %CYAN%▶ Paso 3/8: Desplegando infraestructura base%NC%
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo.

echo %BLUE%[INFO]%NC% Iniciando MySQL, Redis, Kafka, RabbitMQ, MailDev...
docker-compose up -d mysql redis kafka rabbitmq maildev

echo %BLUE%[INFO]%NC% Esperando que los servicios estén healthy (esto puede tomar 1-2 minutos)...
call :wait_for_healthy mysql 60
call :wait_for_healthy kafka 60
call :wait_for_healthy redis 30
call :wait_for_healthy rabbitmq 30

echo %GREEN%[OK]%NC% Infraestructura base desplegada

echo.
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo %CYAN%▶ Paso 4/8: Desplegando plataforma (Eureka + Gateway)%NC%
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo.

echo %BLUE%[INFO]%NC% Iniciando Eureka Server...
docker-compose up -d eureka
call :wait_for_healthy eureka 40

echo %BLUE%[INFO]%NC% Iniciando API Gateway...
docker-compose up -d gateway
call :wait_for_healthy gateway 40

echo %GREEN%[OK]%NC% Plataforma desplegada

echo.
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo %CYAN%▶ Paso 5/8: Desplegando Mock Providers (.NET)%NC%
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo.

echo %BLUE%[INFO]%NC% Iniciando REST, SOAP y gRPC Providers...
docker-compose up -d rest-provider soap-provider grpc-provider

echo %BLUE%[INFO]%NC% Esperando inicialización de providers...
timeout /t 15 /nobreak >nul

echo %GREEN%[OK]%NC% Mock Providers desplegados

echo.
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo %CYAN%▶ Paso 6/8: Desplegando Integration Service%NC%
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo.

echo %BLUE%[INFO]%NC% Iniciando Integration Service...
docker-compose up -d integration-service

echo %BLUE%[INFO]%NC% Esperando inicialización...
timeout /t 15 /nobreak >nul

echo %GREEN%[OK]%NC% Integration Service desplegado

echo.
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo %CYAN%▶ Paso 7/8: Desplegando servicios SOA empresariales%NC%
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo.

echo %BLUE%[INFO]%NC% Iniciando 8 servicios SOA (esto puede tomar varios minutos)...
docker-compose up -d security-service customer-service catalog-service order-service payment-service notification-service billing-service recommendation-service

call :wait_for_healthy security 60
call :wait_for_healthy customer 60
call :wait_for_healthy catalog 60
call :wait_for_healthy order 60
call :wait_for_healthy payment 60
call :wait_for_healthy notification 60
call :wait_for_healthy billing 60
call :wait_for_healthy recommendation 60

echo %GREEN%[OK]%NC% Servicios SOA desplegados

echo.
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo %CYAN%▶ Paso 8/8: Desplegando Frontend y Observabilidad%NC%
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo.

echo %BLUE%[INFO]%NC% Iniciando Customer Portal, Admin Dashboard...
docker-compose up -d customer-portal admin-dashboard

echo %BLUE%[INFO]%NC% Iniciando Prometheus, Grafana, Jaeger...
docker-compose up -d prometheus grafana jaeger

echo %BLUE%[INFO]%NC% Esperando inicialización...
timeout /t 15 /nobreak >nul

echo %GREEN%[OK]%NC% Frontend y Observabilidad desplegados

REM Mostrar resumen
call :show_validation
call :show_urls
call :show_commands

echo.
echo %GREEN%╔═══════════════════════════════════════════════════════════════════╗%NC%
echo %GREEN%║         ¡Despliegue completado exitosamente!                      ║%NC%
echo %GREEN%╚═══════════════════════════════════════════════════════════════════╝%NC%
echo.

goto :eof

REM =============================================================================
REM Subrutinas
REM =============================================================================

:print_banner
echo.
echo %CYAN%╔═══════════════════════════════════════════════════════════════════╗%NC%
echo %CYAN%║           AllConnect Market - Despliegue Automatizado             ║%NC%
echo %CYAN%║                    Plataforma E-commerce SOA                      ║%NC%
echo %CYAN%╚═══════════════════════════════════════════════════════════════════╝%NC%
echo.
goto :eof

:wait_for_healthy
set "SERVICE=%~1"
set "MAX=%~2"
set "ATTEMPT=1"

echo %BLUE%[INFO]%NC% Esperando que %SERVICE% esté healthy...

:wait_loop
for /f "tokens=*" %%s in ('docker inspect --format="{{.State.Health.Status}}" "allconnect-%SERVICE%" 2^>nul') do set "STATUS=%%s"

if "%STATUS%"=="healthy" (
    echo %GREEN%[OK]%NC% %SERVICE% está healthy
    goto :eof
)

if %ATTEMPT% GEQ %MAX% (
    echo %YELLOW%[WARN]%NC% %SERVICE% no alcanzó estado healthy, continuando...
    goto :eof
)

set /a ATTEMPT+=1
timeout /t %RETRY_INTERVAL% /nobreak >nul
goto :wait_loop

:show_validation
echo.
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo %CYAN%▶ Validación del Despliegue%NC%
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo.
echo %BLUE%Estado de contenedores:%NC%
echo.
docker-compose ps
goto :eof

:show_urls
echo.
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo %CYAN%▶ URLs de Acceso%NC%
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo.
echo %GREEN%Frontend:%NC%
echo   • Customer Portal:    http://localhost:3000
echo   • Admin Dashboard:    http://localhost:3002
echo.
echo %GREEN%Plataforma:%NC%
echo   • Eureka Dashboard:   http://localhost:8761
echo   • API Gateway:        http://localhost:8080
echo.
echo %GREEN%Observabilidad:%NC%
echo   • Grafana:            http://localhost:3001  (admin/admin)
echo   • Prometheus:         http://localhost:9090
echo   • Jaeger:             http://localhost:16686
echo.
echo %GREEN%Herramientas:%NC%
echo   • RabbitMQ UI:        http://localhost:15672 (guest/guest)
echo   • MailDev:            http://localhost:1080
echo.
echo %GREEN%Mock Providers:%NC%
echo   • REST Provider:      http://localhost:4001/api/products
echo   • SOAP Provider:      http://localhost:4002
echo   • gRPC Provider:      http://localhost:4003
goto :eof

:show_commands
echo.
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo %CYAN%▶ Comandos Útiles%NC%
echo %CYAN%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%NC%
echo.
echo   # Ver estado de contenedores
echo   docker-compose ps
echo.
echo   # Ver logs de un servicio
echo   docker-compose logs -f ^<servicio^>
echo.
echo   # Reiniciar un servicio
echo   docker-compose restart ^<servicio^>
echo.
echo   # Detener todo
echo   docker-compose down
echo.
echo   # Detener y eliminar volúmenes
echo   docker-compose down -v
goto :eof

endlocal

# =============================================================================
# AllConnect Market - Script de Despliegue Automatizado
# Arquitectura: SOA (Service-Oriented Architecture)
# Compatible con: Windows PowerShell 5.1+ y PowerShell Core 7+
# =============================================================================

param(
    [switch]$Clean,
    [switch]$Status,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# Configuracion
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ComposeFile = Join-Path $ScriptDir "docker-compose.yml"
$MaxRetries = 30
$RetryInterval = 5

# =============================================================================
# Funciones de utilidad
# =============================================================================

function Write-Banner {
    Write-Host ""
    Write-Host "=======================================================================" -ForegroundColor Cyan
    Write-Host "           AllConnect Market - Despliegue Automatizado                 " -ForegroundColor Cyan
    Write-Host "                    Plataforma E-commerce SOA                          " -ForegroundColor Cyan
    Write-Host "=======================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-LogInfo {
    param([string]$Message)
    Write-Host "(INFO) " -ForegroundColor Blue -NoNewline
    Write-Host $Message
}

function Write-LogSuccess {
    param([string]$Message)
    Write-Host "(OK) " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-LogWarning {
    param([string]$Message)
    Write-Host "(WARN) " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

function Write-LogError {
    param([string]$Message)
    Write-Host "(ERROR) " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Write-LogStep {
    param([string]$Message)
    Write-Host ""
    Write-Host "-----------------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "> $Message" -ForegroundColor Cyan
    Write-Host "-----------------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host ""
}

function Test-Command {
    param([string]$Command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'SilentlyContinue'
    $result = Get-Command $Command
    $ErrorActionPreference = $oldPreference
    return $null -ne $result
}

function Wait-ForHealthy {
    param(
        [string]$Service,
        [int]$MaxAttempts = $MaxRetries
    )

    Write-LogInfo "Esperando que $Service este healthy..."

    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        try {
            $status = docker inspect --format='{{.State.Health.Status}}' "allconnect-$Service" 2>$null

            if ($status -eq "healthy") {
                Write-LogSuccess "$Service esta healthy"
                return $true
            }

            Write-Host "`r  Intento $attempt/$MaxAttempts - Estado: $status" -NoNewline
        }
        catch {
            Write-Host "`r  Intento $attempt/$MaxAttempts - Contenedor iniciando..." -NoNewline
        }

        Start-Sleep -Seconds $RetryInterval
    }

    Write-Host ""
    Write-LogError "$Service no alcanzo estado healthy despues de $MaxAttempts intentos"
    return $false
}

function Wait-ForService {
    param(
        [string]$Url,
        [string]$ServiceName,
        [int]$MaxAttempts = 20
    )

    Write-LogInfo "Verificando $ServiceName en $Url..."

    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 302) {
                Write-LogSuccess "$ServiceName esta respondiendo"
                return $true
            }
        }
        catch {
            Write-Host "`r  Intento $attempt/$MaxAttempts" -NoNewline
        }

        Start-Sleep -Seconds 2
    }

    Write-Host ""
    Write-LogWarning "$ServiceName no responde en $Url (puede estar iniciando)"
    return $true
}

# =============================================================================
# Funciones de despliegue
# =============================================================================

function Test-Prerequisites {
    Write-LogStep "Paso 1/8: Verificando prerequisitos"

    # Verificar Docker
    if (-not (Test-Command "docker")) {
        Write-LogError "Docker no esta instalado. Por favor instalalo antes de continuar."
        exit 1
    }

    # Verificar Docker esta corriendo
    try {
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Docker no responde"
        }
        $version = docker version --format '{{.Server.Version}}'
        Write-LogSuccess "Docker esta corriendo (v$version)"
    }
    catch {
        Write-LogError "Docker no esta corriendo. Por favor inicia Docker Desktop."
        exit 1
    }

    # Verificar docker-compose
    if (-not (Test-Command "docker-compose")) {
        Write-LogError "docker-compose no esta instalado."
        exit 1
    }

    # Verificar archivo docker-compose.yml
    if (-not (Test-Path $ComposeFile)) {
        Write-LogError "No se encontro docker-compose.yml en $ScriptDir"
        exit 1
    }

    Write-LogSuccess "Archivo docker-compose.yml encontrado"
}

function Clear-Previous {
    Write-LogStep "Paso 2/8: Limpiando despliegue anterior (si existe)"

    Set-Location $ScriptDir

    # Verificar si hay contenedores corriendo
    $containers = docker-compose ps -q 2>$null
    if ($containers) {
        Write-LogInfo "Deteniendo contenedores existentes..."
        docker-compose down --remove-orphans 2>$null
    }

    Write-LogSuccess "Limpieza completada"
}

function Deploy-Infrastructure {
    Write-LogStep "Paso 3/8: Desplegando infraestructura base"

    Set-Location $ScriptDir

    Write-LogInfo "Iniciando MySQL, Redis, Kafka, RabbitMQ, MailDev..."
    docker-compose up -d mysql redis kafka rabbitmq maildev

    # Esperar por servicios criticos
    Wait-ForHealthy -Service "mysql" -MaxAttempts 60
    Wait-ForHealthy -Service "kafka" -MaxAttempts 60
    Wait-ForHealthy -Service "redis" -MaxAttempts 30
    Wait-ForHealthy -Service "rabbitmq" -MaxAttempts 30

    Write-LogSuccess "Infraestructura base desplegada"
}

function Deploy-Platform {
    Write-LogStep "Paso 4/8: Desplegando plataforma (Eureka + Gateway)"

    Set-Location $ScriptDir

    Write-LogInfo "Iniciando Eureka Server..."
    docker-compose up -d eureka
    Wait-ForHealthy -Service "eureka" -MaxAttempts 40

    Write-LogInfo "Iniciando API Gateway..."
    docker-compose up -d gateway
    Wait-ForHealthy -Service "gateway" -MaxAttempts 40

    Write-LogSuccess "Plataforma desplegada"
}

function Deploy-Providers {
    Write-LogStep "Paso 5/8: Desplegando Mock Providers (.NET)"

    Set-Location $ScriptDir

    Write-LogInfo "Iniciando REST, SOAP y gRPC Providers..."
    docker-compose up -d rest-provider soap-provider grpc-provider

    Start-Sleep -Seconds 10

    Wait-ForService -Url "http://localhost:4001/api/products" -ServiceName "REST Provider" -MaxAttempts 15

    Write-LogSuccess "Mock Providers desplegados"
}

function Deploy-Integration {
    Write-LogStep "Paso 6/8: Desplegando Integration Service"

    Set-Location $ScriptDir

    Write-LogInfo "Iniciando Integration Service..."
    docker-compose up -d integration-service

    Start-Sleep -Seconds 15

    Write-LogSuccess "Integration Service desplegado"
}

function Deploy-Services {
    Write-LogStep "Paso 7/8: Desplegando servicios SOA empresariales"

    Set-Location $ScriptDir

    Write-LogInfo "Iniciando 8 servicios SOA (esto puede tomar varios minutos en el primer build)..."
    docker-compose up -d security-service customer-service catalog-service order-service payment-service notification-service billing-service recommendation-service

    # Esperar por cada servicio
    $services = @("security", "customer", "catalog", "order", "payment", "notification", "billing", "recommendation")

    foreach ($service in $services) {
        Wait-ForHealthy -Service $service -MaxAttempts 60
    }

    Write-LogSuccess "Servicios SOA desplegados"
}

function Deploy-FrontendObservability {
    Write-LogStep "Paso 8/8: Desplegando Frontend y Observabilidad"

    Set-Location $ScriptDir

    Write-LogInfo "Iniciando Customer Portal, Admin Dashboard..."
    docker-compose up -d customer-portal admin-dashboard

    Write-LogInfo "Iniciando Prometheus, Grafana, Jaeger..."
    docker-compose up -d prometheus grafana jaeger

    Start-Sleep -Seconds 10

    Wait-ForService -Url "http://localhost:3000" -ServiceName "Customer Portal" -MaxAttempts 15
    Wait-ForService -Url "http://localhost:3001" -ServiceName "Grafana" -MaxAttempts 15
    Wait-ForService -Url "http://localhost:9090" -ServiceName "Prometheus" -MaxAttempts 15

    Write-LogSuccess "Frontend y Observabilidad desplegados"
}

# =============================================================================
# Validacion final
# =============================================================================

function Show-Validation {
    Write-Host ""
    Write-Host "-----------------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "> Validacion del Despliegue" -ForegroundColor Cyan
    Write-Host "-----------------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host ""

    Set-Location $ScriptDir

    $total = 0
    $healthy = 0
    $running = 0

    Write-Host "Estado de contenedores:" -ForegroundColor Blue
    Write-Host ""

    $containers = docker-compose ps --format "{{.Name}} {{.Status}}" 2>$null

    foreach ($line in $containers) {
        if ($line -match "^(\S+)\s+(.+)$") {
            $total++
            $name = $matches[1]
            $status = $matches[2]

            if ($status -match "healthy") {
                Write-Host "  [OK] " -ForegroundColor Green -NoNewline
                Write-Host "$name - healthy"
                $healthy++
            }
            elseif ($status -match "Up") {
                Write-Host "  [..] " -ForegroundColor Yellow -NoNewline
                Write-Host "$name - running"
                $running++
            }
            else {
                Write-Host "  [XX] " -ForegroundColor Red -NoNewline
                Write-Host "$name - $status"
            }
        }
    }

    Write-Host ""
    Write-Host "Resumen:" -ForegroundColor Blue
    Write-Host "  Total: $total contenedores"
    Write-Host "  Healthy: $healthy" -ForegroundColor Green
    Write-Host "  Running: $running" -ForegroundColor Yellow
}

function Show-Urls {
    Write-Host ""
    Write-Host "-----------------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "> URLs de Acceso" -ForegroundColor Cyan
    Write-Host "-----------------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Frontend:" -ForegroundColor Green
    Write-Host "  - Customer Portal:    http://localhost:3000"
    Write-Host "  - Admin Dashboard:    http://localhost:3002"

    Write-Host ""
    Write-Host "Plataforma:" -ForegroundColor Green
    Write-Host "  - Eureka Dashboard:   http://localhost:8761"
    Write-Host "  - API Gateway:        http://localhost:8080"

    Write-Host ""
    Write-Host "Observabilidad:" -ForegroundColor Green
    Write-Host "  - Grafana:            http://localhost:3001  (admin/admin)"
    Write-Host "  - Prometheus:         http://localhost:9090"
    Write-Host "  - Jaeger:             http://localhost:16686"

    Write-Host ""
    Write-Host "Herramientas:" -ForegroundColor Green
    Write-Host "  - RabbitMQ UI:        http://localhost:15672 (guest/guest)"
    Write-Host "  - MailDev:            http://localhost:1080"

    Write-Host ""
    Write-Host "Mock Providers:" -ForegroundColor Green
    Write-Host "  - REST Provider:      http://localhost:4001/api/products"
    Write-Host "  - SOAP Provider:      http://localhost:4002"
    Write-Host "  - gRPC Provider:      http://localhost:4003"
}

function Show-Commands {
    Write-Host ""
    Write-Host "-----------------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "> Comandos Utiles" -ForegroundColor Cyan
    Write-Host "-----------------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "  # Ver estado de contenedores"
    Write-Host "  docker-compose ps"
    Write-Host ""
    Write-Host "  # Ver logs de un servicio"
    Write-Host "  docker-compose logs -f <servicio>"
    Write-Host ""
    Write-Host "  # Reiniciar un servicio"
    Write-Host "  docker-compose restart <servicio>"
    Write-Host ""
    Write-Host "  # Detener todo"
    Write-Host "  docker-compose down"
    Write-Host ""
    Write-Host "  # Detener y eliminar volumenes"
    Write-Host "  docker-compose down -v"
}

function Show-Help {
    Write-Host "Uso: .\deploy.ps1 [opciones]"
    Write-Host ""
    Write-Host "Opciones:"
    Write-Host "  (sin opciones)    Despliegue completo del sistema"
    Write-Host "  -Clean            Detener y limpiar todos los contenedores"
    Write-Host "  -Status           Mostrar estado actual del despliegue"
    Write-Host "  -Help             Mostrar esta ayuda"
}

# =============================================================================
# Funcion principal
# =============================================================================

function Main {
    $startTime = Get-Date

    Write-Banner

    # Manejar argumentos
    if ($Help) {
        Show-Help
        return
    }

    if ($Clean) {
        Write-LogInfo "Modo limpieza: deteniendo todos los contenedores..."
        Set-Location $ScriptDir
        docker-compose down -v --remove-orphans
        Write-LogSuccess "Limpieza completada"
        return
    }

    if ($Status) {
        Set-Location $ScriptDir
        Show-Validation
        Show-Urls
        return
    }

    # Ejecutar despliegue
    Test-Prerequisites
    Clear-Previous
    Deploy-Infrastructure
    Deploy-Platform
    Deploy-Providers
    Deploy-Integration
    Deploy-Services
    Deploy-FrontendObservability

    # Resumen final
    Show-Validation
    Show-Urls
    Show-Commands

    $endTime = Get-Date
    $duration = $endTime - $startTime
    $minutes = [math]::Floor($duration.TotalMinutes)
    $seconds = $duration.Seconds

    Write-Host ""
    Write-Host "=======================================================================" -ForegroundColor Green
    Write-Host "         Despliegue completado exitosamente!                           " -ForegroundColor Green
    Write-Host "         Tiempo total: ${minutes}m ${seconds}s                         " -ForegroundColor Green
    Write-Host "=======================================================================" -ForegroundColor Green
    Write-Host ""
}

# Ejecutar
Main

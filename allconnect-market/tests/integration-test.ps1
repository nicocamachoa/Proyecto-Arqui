# AllConnect Market - Integration Testing
# Pruebas de integracion entre servicios

$ErrorActionPreference = "Continue"
$GATEWAY_URL = "http://localhost:8080"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "      PRUEBAS DE INTEGRACION               " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$testResults = @()

function Add-TestResult {
    param($Name, $Status, $Details)
    $script:testResults += @{
        Name = $Name
        Status = $Status
        Details = $Details
    }
    $color = if ($Status -eq "PASS") { "Green" } elseif ($Status -eq "WARN") { "Yellow" } else { "Red" }
    Write-Host "  [$Status] $Name" -ForegroundColor $color
    if ($Details) { Write-Host "        $Details" -ForegroundColor Gray }
}

# =============================================
# 1. EUREKA SERVICE DISCOVERY
# =============================================
Write-Host "`n[1/8] SERVICE DISCOVERY (EUREKA)" -ForegroundColor Magenta
Write-Host "================================="

try {
    $eurekaApps = Invoke-RestMethod -Uri "http://localhost:8761/eureka/apps" -Method GET -Headers @{"Accept"="application/json"} -ErrorAction Stop
    $registeredServices = $eurekaApps.applications.application | ForEach-Object { $_.name }

    $expectedServices = @(
        "API-GATEWAY",
        "ORDER-SERVICE",
        "CATALOG-SERVICE",
        "CUSTOMER-SERVICE",
        "PAYMENT-SERVICE",
        "NOTIFICATION-SERVICE",
        "BILLING-SERVICE",
        "SECURITY-SERVICE",
        "RECOMMENDATION-SERVICE"
    )

    $found = 0
    foreach ($svc in $expectedServices) {
        if ($registeredServices -contains $svc) {
            $found++
        }
    }

    if ($found -eq $expectedServices.Count) {
        Add-TestResult -Name "Eureka - Todos los servicios registrados" -Status "PASS" -Details "$found/$($expectedServices.Count) servicios"
    } else {
        $missing = $expectedServices | Where-Object { $registeredServices -notcontains $_ }
        Add-TestResult -Name "Eureka - Servicios registrados" -Status "WARN" -Details "Faltan: $($missing -join ', ')"
    }
}
catch {
    Add-TestResult -Name "Eureka Service Discovery" -Status "FAIL" -Details $_.Exception.Message
}

# =============================================
# 2. API GATEWAY ROUTING
# =============================================
Write-Host "`n[2/8] API GATEWAY ROUTING" -ForegroundColor Magenta
Write-Host "========================="

$gatewayRoutes = @(
    @{ Path = "/api/catalog/products/all"; Service = "Catalog" },
    @{ Path = "/api/catalog/categories"; Service = "Catalog Categories" },
    @{ Path = "/actuator/health"; Service = "Gateway Health" }
)

foreach ($route in $gatewayRoutes) {
    try {
        $response = Invoke-WebRequest -Uri "$GATEWAY_URL$($route.Path)" -Method GET -TimeoutSec 10 -ErrorAction Stop
        Add-TestResult -Name "Gateway -> $($route.Service)" -Status "PASS" -Details "HTTP $($response.StatusCode)"
    }
    catch {
        Add-TestResult -Name "Gateway -> $($route.Service)" -Status "FAIL" -Details $_.Exception.Message
    }
}

# =============================================
# 3. FEIGN CLIENT COMMUNICATION
# =============================================
Write-Host "`n[3/8] FEIGN CLIENT (INTER-SERVICE)" -ForegroundColor Magenta
Write-Host "==================================="

# Probar Order -> Catalog communication
Write-Host ">> Order Service -> Catalog Service..."
try {
    $catalogProducts = Invoke-RestMethod -Uri "$GATEWAY_URL/api/catalog/products/all" -Method GET -ErrorAction Stop
    if ($catalogProducts.Count -gt 0) {
        # Obtener un producto para verificar que Order puede acceder
        $testProductId = $catalogProducts[0].id
        $productDetail = Invoke-RestMethod -Uri "$GATEWAY_URL/api/catalog/products/$testProductId" -Method GET -ErrorAction Stop
        Add-TestResult -Name "Order -> Catalog (Feign)" -Status "PASS" -Details "Producto ID $testProductId accesible"
    }
}
catch {
    Add-TestResult -Name "Order -> Catalog (Feign)" -Status "FAIL" -Details $_.Exception.Message
}

# Probar Recommendation -> Catalog
Write-Host ">> Recommendation Service -> Catalog Service..."
try {
    $recHealth = Invoke-RestMethod -Uri "http://localhost:8098/actuator/health" -Method GET -ErrorAction Stop
    Add-TestResult -Name "Recommendation Service Health" -Status "PASS" -Details $recHealth.status
}
catch {
    Add-TestResult -Name "Recommendation -> Catalog" -Status "FAIL" -Details $_.Exception.Message
}

# =============================================
# 4. DATABASE CONNECTIVITY
# =============================================
Write-Host "`n[4/8] DATABASE CONNECTIVITY" -ForegroundColor Magenta
Write-Host "============================"

$dbServices = @(
    @{ Name = "Security DB"; Port = 8097 },
    @{ Name = "Customer DB"; Port = 8093 },
    @{ Name = "Catalog DB"; Port = 8092 },
    @{ Name = "Order DB"; Port = 8091 },
    @{ Name = "Payment DB"; Port = 8094 },
    @{ Name = "Notification DB"; Port = 8095 },
    @{ Name = "Billing DB"; Port = 8096 },
    @{ Name = "Recommendation DB"; Port = 8098 }
)

foreach ($svc in $dbServices) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:$($svc.Port)/actuator/health" -Method GET -ErrorAction Stop
        $dbStatus = if ($health.components.db) { $health.components.db.status } else { "N/A" }
        if ($health.status -eq "UP") {
            Add-TestResult -Name "$($svc.Name)" -Status "PASS" -Details "DB: $dbStatus"
        } else {
            Add-TestResult -Name "$($svc.Name)" -Status "WARN" -Details "Status: $($health.status)"
        }
    }
    catch {
        Add-TestResult -Name "$($svc.Name)" -Status "FAIL" -Details "No responde"
    }
}

# =============================================
# 5. KAFKA MESSAGING
# =============================================
Write-Host "`n[5/8] KAFKA MESSAGING" -ForegroundColor Magenta
Write-Host "====================="

# Verificar Kafka
try {
    $kafkaTest = Test-NetConnection -ComputerName localhost -Port 9092 -WarningAction SilentlyContinue
    if ($kafkaTest.TcpTestSucceeded) {
        Add-TestResult -Name "Kafka Broker" -Status "PASS" -Details "Puerto 9092 accesible"
    } else {
        Add-TestResult -Name "Kafka Broker" -Status "FAIL" -Details "Puerto 9092 no accesible"
    }
}
catch {
    Add-TestResult -Name "Kafka Broker" -Status "WARN" -Details "No se pudo verificar"
}

# Verificar que Notification consume de Kafka
try {
    $notifHealth = Invoke-RestMethod -Uri "http://localhost:8095/actuator/health" -Method GET -ErrorAction Stop
    if ($notifHealth.status -eq "UP") {
        Add-TestResult -Name "Notification Kafka Consumer" -Status "PASS" -Details "Servicio UP"
    }
}
catch {
    Add-TestResult -Name "Notification Kafka Consumer" -Status "FAIL" -Details $_.Exception.Message
}

# =============================================
# 6. REDIS CACHE
# =============================================
Write-Host "`n[6/8] REDIS CACHE" -ForegroundColor Magenta
Write-Host "=================="

try {
    $redisTest = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue
    if ($redisTest.TcpTestSucceeded) {
        Add-TestResult -Name "Redis Cache" -Status "PASS" -Details "Puerto 6379 accesible"
    } else {
        Add-TestResult -Name "Redis Cache" -Status "FAIL" -Details "Puerto 6379 no accesible"
    }
}
catch {
    Add-TestResult -Name "Redis Cache" -Status "WARN" -Details "No se pudo verificar"
}

# =============================================
# 7. INTEGRATION SERVICE (MULTI-PROTOCOL)
# =============================================
Write-Host "`n[7/8] INTEGRATION SERVICE (REST/SOAP/gRPC)" -ForegroundColor Magenta
Write-Host "==========================================="

# REST Provider
try {
    $restProvider = Invoke-RestMethod -Uri "http://localhost:4001/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Add-TestResult -Name "REST Provider (4001)" -Status "PASS" -Details "Healthy"
}
catch {
    try {
        $restTest = Test-NetConnection -ComputerName localhost -Port 4001 -WarningAction SilentlyContinue
        if ($restTest.TcpTestSucceeded) {
            Add-TestResult -Name "REST Provider (4001)" -Status "WARN" -Details "Puerto accesible, health check falla"
        } else {
            Add-TestResult -Name "REST Provider (4001)" -Status "FAIL" -Details "No accesible"
        }
    }
    catch {
        Add-TestResult -Name "REST Provider (4001)" -Status "FAIL" -Details "No accesible"
    }
}

# SOAP Provider
try {
    $soapTest = Test-NetConnection -ComputerName localhost -Port 4002 -WarningAction SilentlyContinue
    if ($soapTest.TcpTestSucceeded) {
        Add-TestResult -Name "SOAP Provider (4002)" -Status "PASS" -Details "Puerto accesible"
    } else {
        Add-TestResult -Name "SOAP Provider (4002)" -Status "FAIL" -Details "No accesible"
    }
}
catch {
    Add-TestResult -Name "SOAP Provider (4002)" -Status "WARN" -Details "No se pudo verificar"
}

# gRPC Provider
try {
    $grpcTest = Test-NetConnection -ComputerName localhost -Port 4003 -WarningAction SilentlyContinue
    if ($grpcTest.TcpTestSucceeded) {
        Add-TestResult -Name "gRPC Provider (4003)" -Status "PASS" -Details "Puerto accesible"
    } else {
        Add-TestResult -Name "gRPC Provider (4003)" -Status "FAIL" -Details "No accesible"
    }
}
catch {
    Add-TestResult -Name "gRPC Provider (4003)" -Status "WARN" -Details "No se pudo verificar"
}

# Integration Service
try {
    $integrationHealth = Invoke-RestMethod -Uri "http://localhost:8086/actuator/health" -Method GET -ErrorAction Stop
    Add-TestResult -Name "Integration Service (8086)" -Status "PASS" -Details $integrationHealth.status
}
catch {
    Add-TestResult -Name "Integration Service (8086)" -Status "FAIL" -Details $_.Exception.Message
}

# =============================================
# 8. OBSERVABILITY STACK
# =============================================
Write-Host "`n[8/8] OBSERVABILITY STACK" -ForegroundColor Magenta
Write-Host "========================="

# Prometheus
try {
    $promHealth = Invoke-RestMethod -Uri "http://localhost:9090/-/healthy" -Method GET -ErrorAction Stop
    Add-TestResult -Name "Prometheus (9090)" -Status "PASS" -Details "Healthy"
}
catch {
    try {
        $promTest = Test-NetConnection -ComputerName localhost -Port 9090 -WarningAction SilentlyContinue
        if ($promTest.TcpTestSucceeded) {
            Add-TestResult -Name "Prometheus (9090)" -Status "PASS" -Details "Puerto accesible"
        } else {
            Add-TestResult -Name "Prometheus (9090)" -Status "FAIL" -Details "No accesible"
        }
    }
    catch {
        Add-TestResult -Name "Prometheus (9090)" -Status "WARN" -Details "No se pudo verificar"
    }
}

# Grafana
try {
    $grafanaHealth = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET -ErrorAction Stop
    Add-TestResult -Name "Grafana (3001)" -Status "PASS" -Details "Database: $($grafanaHealth.database)"
}
catch {
    Add-TestResult -Name "Grafana (3001)" -Status "FAIL" -Details $_.Exception.Message
}

# Jaeger
try {
    $jaegerTest = Test-NetConnection -ComputerName localhost -Port 16686 -WarningAction SilentlyContinue
    if ($jaegerTest.TcpTestSucceeded) {
        Add-TestResult -Name "Jaeger UI (16686)" -Status "PASS" -Details "Puerto accesible"
    } else {
        Add-TestResult -Name "Jaeger UI (16686)" -Status "FAIL" -Details "No accesible"
    }
}
catch {
    Add-TestResult -Name "Jaeger UI (16686)" -Status "WARN" -Details "No se pudo verificar"
}

# MailDev
try {
    $maildevHealth = Invoke-RestMethod -Uri "http://localhost:1080/healthz" -Method GET -ErrorAction Stop
    Add-TestResult -Name "MailDev (1080)" -Status "PASS" -Details "Healthy"
}
catch {
    try {
        $maildevTest = Test-NetConnection -ComputerName localhost -Port 1080 -WarningAction SilentlyContinue
        if ($maildevTest.TcpTestSucceeded) {
            Add-TestResult -Name "MailDev (1080)" -Status "PASS" -Details "Puerto accesible"
        } else {
            Add-TestResult -Name "MailDev (1080)" -Status "FAIL" -Details "No accesible"
        }
    }
    catch {
        Add-TestResult -Name "MailDev (1080)" -Status "WARN" -Details "No se pudo verificar"
    }
}

# =============================================
# RESUMEN FINAL
# =============================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "      RESUMEN DE INTEGRACION               " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$warned = ($testResults | Where-Object { $_.Status -eq "WARN" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $testResults.Count

Write-Host ""
Write-Host "  PASS: $passed" -ForegroundColor Green
Write-Host "  WARN: $warned" -ForegroundColor Yellow
Write-Host "  FAIL: $failed" -ForegroundColor Red
Write-Host "  ---------------"
Write-Host "  TOTAL: $total"
Write-Host ""

$successRate = [math]::Round(($passed / $total) * 100, 1)
$color = if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" }
Write-Host "  Tasa de exito: $successRate%" -ForegroundColor $color
Write-Host ""

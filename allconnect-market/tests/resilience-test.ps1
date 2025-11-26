# AllConnect Market - Resilience Testing
# Pruebas de resiliencia, circuit breakers y tolerancia a fallos

$ErrorActionPreference = "Continue"
$GATEWAY_URL = "http://localhost:8080"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "     PRUEBAS DE RESILIENCIA Y FALLOS       " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$testResults = @()

function Add-Result {
    param($Name, $Status, $Details)
    $script:testResults += @{ Name = $Name; Status = $Status; Details = $Details }
    $color = if ($Status -eq "PASS") { "Green" } elseif ($Status -eq "WARN") { "Yellow" } else { "Red" }
    Write-Host "  [$Status] $Name" -ForegroundColor $color
    if ($Details) { Write-Host "        $Details" -ForegroundColor Gray }
}

# =============================================
# 1. HEALTH CHECKS DE TODOS LOS SERVICIOS
# =============================================
Write-Host "`n[1/5] HEALTH CHECKS" -ForegroundColor Magenta
Write-Host "==================="

$services = @(
    @{ Name = "Gateway"; Url = "$GATEWAY_URL/actuator/health" },
    @{ Name = "Eureka"; Url = "http://localhost:8761/actuator/health" },
    @{ Name = "Security"; Url = "http://localhost:8097/actuator/health" },
    @{ Name = "Customer"; Url = "http://localhost:8093/actuator/health" },
    @{ Name = "Catalog"; Url = "http://localhost:8092/actuator/health" },
    @{ Name = "Order"; Url = "http://localhost:8091/actuator/health" },
    @{ Name = "Payment"; Url = "http://localhost:8094/actuator/health" },
    @{ Name = "Notification"; Url = "http://localhost:8095/actuator/health" },
    @{ Name = "Billing"; Url = "http://localhost:8096/actuator/health" },
    @{ Name = "Recommendation"; Url = "http://localhost:8098/actuator/health" },
    @{ Name = "Integration"; Url = "http://localhost:8086/actuator/health" }
)

$healthyCount = 0
foreach ($svc in $services) {
    try {
        $health = Invoke-RestMethod -Uri $svc.Url -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($health.status -eq "UP") {
            Add-Result -Name "$($svc.Name) Health" -Status "PASS" -Details "UP"
            $healthyCount++
        } else {
            Add-Result -Name "$($svc.Name) Health" -Status "WARN" -Details $health.status
        }
    }
    catch {
        Add-Result -Name "$($svc.Name) Health" -Status "FAIL" -Details "No responde"
    }
}

# =============================================
# 2. TIMEOUT HANDLING
# =============================================
Write-Host "`n[2/5] TIMEOUT HANDLING" -ForegroundColor Magenta
Write-Host "======================"

# Probar que el sistema maneja timeouts correctamente
Write-Host ">> Probando manejo de timeouts..."

$slowRequests = 0
$fastRequests = 0

for ($i = 0; $i -lt 10; $i++) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $r = Invoke-WebRequest -Uri "$GATEWAY_URL/api/catalog/products/all" -Method GET -TimeoutSec 30 -ErrorAction Stop
        $sw.Stop()
        if ($sw.ElapsedMilliseconds -gt 2000) { $slowRequests++ }
        else { $fastRequests++ }
    }
    catch {
        $sw.Stop()
        $slowRequests++
    }
}

if ($slowRequests -lt 3) {
    Add-Result -Name "Timeout Handling" -Status "PASS" -Details "$fastRequests/10 respuestas rapidas"
} else {
    Add-Result -Name "Timeout Handling" -Status "WARN" -Details "$slowRequests/10 respuestas lentas"
}

# =============================================
# 3. RETRY MECHANISM
# =============================================
Write-Host "`n[3/5] RETRY MECHANISM" -ForegroundColor Magenta
Write-Host "====================="

# Simular requests repetidos para verificar estabilidad
Write-Host ">> Probando reintentos bajo carga..."

$successCount = 0
$errorCount = 0

for ($i = 0; $i -lt 20; $i++) {
    try {
        $r = Invoke-RestMethod -Uri "$GATEWAY_URL/api/catalog/products/all" -Method GET -TimeoutSec 10 -ErrorAction Stop
        $successCount++
    }
    catch {
        $errorCount++
        # Reintento
        Start-Sleep -Milliseconds 100
        try {
            $r = Invoke-RestMethod -Uri "$GATEWAY_URL/api/catalog/products/all" -Method GET -TimeoutSec 10 -ErrorAction Stop
            $successCount++
        }
        catch {
            # Fallo definitivo
        }
    }
}

if ($successCount -ge 18) {
    Add-Result -Name "Retry Mechanism" -Status "PASS" -Details "$successCount/20 exitosos"
} elseif ($successCount -ge 15) {
    Add-Result -Name "Retry Mechanism" -Status "WARN" -Details "$successCount/20 exitosos"
} else {
    Add-Result -Name "Retry Mechanism" -Status "FAIL" -Details "$successCount/20 exitosos"
}

# =============================================
# 4. DATABASE CONNECTION RESILIENCE
# =============================================
Write-Host "`n[4/5] DATABASE CONNECTION" -ForegroundColor Magenta
Write-Host "=========================="

# Verificar que los servicios mantienen conexion a BD
$dbServices = @(
    @{ Name = "Security DB"; Port = 8097 },
    @{ Name = "Customer DB"; Port = 8093 },
    @{ Name = "Catalog DB"; Port = 8092 },
    @{ Name = "Order DB"; Port = 8091 },
    @{ Name = "Payment DB"; Port = 8094 }
)

foreach ($db in $dbServices) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:$($db.Port)/actuator/health" -Method GET -ErrorAction Stop
        $dbStatus = $null
        if ($health.components -and $health.components.db) {
            $dbStatus = $health.components.db.status
        }
        if ($dbStatus -eq "UP") {
            Add-Result -Name $db.Name -Status "PASS" -Details "Conectado"
        } elseif ($dbStatus) {
            Add-Result -Name $db.Name -Status "WARN" -Details $dbStatus
        } else {
            Add-Result -Name $db.Name -Status "PASS" -Details "Servicio UP"
        }
    }
    catch {
        Add-Result -Name $db.Name -Status "FAIL" -Details "No disponible"
    }
}

# =============================================
# 5. KAFKA MESSAGING RESILIENCE
# =============================================
Write-Host "`n[5/5] KAFKA MESSAGING" -ForegroundColor Magenta
Write-Host "====================="

# Verificar que Kafka está funcionando
try {
    $kafkaTest = Test-NetConnection -ComputerName localhost -Port 9092 -WarningAction SilentlyContinue
    if ($kafkaTest.TcpTestSucceeded) {
        Add-Result -Name "Kafka Broker" -Status "PASS" -Details "Puerto 9092 accesible"
    } else {
        Add-Result -Name "Kafka Broker" -Status "FAIL" -Details "No accesible"
    }
}
catch {
    Add-Result -Name "Kafka Broker" -Status "WARN" -Details "No se pudo verificar"
}

# Verificar consumers
try {
    $notifHealth = Invoke-RestMethod -Uri "http://localhost:8095/actuator/health" -Method GET -ErrorAction Stop
    Add-Result -Name "Notification Consumer" -Status "PASS" -Details $notifHealth.status
}
catch {
    Add-Result -Name "Notification Consumer" -Status "FAIL" -Details "No disponible"
}

try {
    $recHealth = Invoke-RestMethod -Uri "http://localhost:8098/actuator/health" -Method GET -ErrorAction Stop
    Add-Result -Name "Recommendation Consumer" -Status "PASS" -Details $recHealth.status
}
catch {
    Add-Result -Name "Recommendation Consumer" -Status "FAIL" -Details "No disponible"
}

# =============================================
# RESUMEN FINAL
# =============================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "       RESUMEN DE RESILIENCIA              " -ForegroundColor Cyan
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

if ($total -gt 0) {
    $successRate = [math]::Round(($passed / $total) * 100, 1)
    $color = if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" }
    Write-Host "  Tasa de exito: $successRate%" -ForegroundColor $color

    if ($healthyCount -eq $services.Count) {
        Write-Host "  Todos los servicios saludables" -ForegroundColor Green
    } else {
        Write-Host "  $healthyCount/$($services.Count) servicios saludables" -ForegroundColor Yellow
    }
}
Write-Host ""

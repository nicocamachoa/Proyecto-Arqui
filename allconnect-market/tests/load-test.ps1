# AllConnect Market - Load Testing Script
# Este script ejecuta pruebas de carga sobre todos los servicios

$ErrorActionPreference = "Continue"
$GATEWAY_URL = "http://localhost:8080"
$RESULTS = @()

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   ALLCONNECT MARKET - PRUEBAS DE CARGA    " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Funcion para medir tiempo de respuesta
function Measure-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [string]$Body = $null,
        [hashtable]$Headers = @{}
    )

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        if ($Body) {
            $params.Body = $Body
        }
        $response = Invoke-RestMethod @params
        $stopwatch.Stop()
        return @{
            Name = $Name
            Status = "SUCCESS"
            ResponseTime = $stopwatch.ElapsedMilliseconds
            StatusCode = 200
        }
    }
    catch {
        $stopwatch.Stop()
        $statusCode = 0
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        return @{
            Name = $Name
            Status = "FAILED"
            ResponseTime = $stopwatch.ElapsedMilliseconds
            StatusCode = $statusCode
            Error = $_.Exception.Message
        }
    }
}

# Funcion para prueba de carga concurrente
function Test-ConcurrentLoad {
    param(
        [string]$Name,
        [string]$Url,
        [int]$Requests = 50,
        [int]$Concurrent = 10
    )

    Write-Host "`n>> Prueba de carga: $Name" -ForegroundColor Yellow
    Write-Host "   Requests: $Requests | Concurrencia: $Concurrent"

    $jobs = @()
    $results = @()
    $startTime = Get-Date

    for ($i = 0; $i -lt $Requests; $i++) {
        $jobs += Start-Job -ScriptBlock {
            param($url)
            $sw = [System.Diagnostics.Stopwatch]::StartNew()
            try {
                $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 30 -ErrorAction Stop
                $sw.Stop()
                return @{
                    Success = $true
                    Time = $sw.ElapsedMilliseconds
                    Status = $response.StatusCode
                }
            }
            catch {
                $sw.Stop()
                return @{
                    Success = $false
                    Time = $sw.ElapsedMilliseconds
                    Status = 0
                    Error = $_.Exception.Message
                }
            }
        } -ArgumentList $Url

        # Control de concurrencia
        while ((Get-Job -State Running).Count -ge $Concurrent) {
            Start-Sleep -Milliseconds 100
        }
    }

    # Esperar que terminen todos los jobs
    $jobs | Wait-Job | Out-Null

    $endTime = Get-Date
    $totalTime = ($endTime - $startTime).TotalSeconds

    foreach ($job in $jobs) {
        $result = Receive-Job $job
        $results += $result
    }
    $jobs | Remove-Job

    $successful = ($results | Where-Object { $_.Success }).Count
    $failed = $Requests - $successful
    $avgTime = ($results | Measure-Object -Property Time -Average).Average
    $maxTime = ($results | Measure-Object -Property Time -Maximum).Maximum
    $minTime = ($results | Measure-Object -Property Time -Minimum).Minimum
    $throughput = [math]::Round($Requests / $totalTime, 2)

    Write-Host "   Exitosas: $successful | Fallidas: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
    Write-Host "   Tiempo promedio: $([math]::Round($avgTime, 2))ms | Min: ${minTime}ms | Max: ${maxTime}ms"
    Write-Host "   Throughput: $throughput req/s"

    return @{
        Name = $Name
        Requests = $Requests
        Successful = $successful
        Failed = $failed
        AvgTime = [math]::Round($avgTime, 2)
        MinTime = $minTime
        MaxTime = $maxTime
        Throughput = $throughput
        TotalTime = [math]::Round($totalTime, 2)
    }
}

# =============================================
# 1. PRUEBAS DE ENDPOINTS INDIVIDUALES
# =============================================
Write-Host "`n[1/4] PRUEBAS DE ENDPOINTS INDIVIDUALES" -ForegroundColor Magenta
Write-Host "========================================="

$endpoints = @(
    @{ Name = "Gateway Health"; Method = "GET"; Url = "$GATEWAY_URL/actuator/health" },
    @{ Name = "Catalog - List Products"; Method = "GET"; Url = "$GATEWAY_URL/api/catalog/products/all" },
    @{ Name = "Catalog - Categories"; Method = "GET"; Url = "$GATEWAY_URL/api/catalog/categories" },
    @{ Name = "Security - Health"; Method = "GET"; Url = "http://localhost:8097/actuator/health" },
    @{ Name = "Order Service - Health"; Method = "GET"; Url = "http://localhost:8091/actuator/health" },
    @{ Name = "Payment Service - Health"; Method = "GET"; Url = "http://localhost:8094/actuator/health" },
    @{ Name = "Notification - Health"; Method = "GET"; Url = "http://localhost:8095/actuator/health" },
    @{ Name = "Recommendation - Health"; Method = "GET"; Url = "http://localhost:8098/actuator/health" },
    @{ Name = "Customer - Health"; Method = "GET"; Url = "http://localhost:8093/actuator/health" },
    @{ Name = "Billing - Health"; Method = "GET"; Url = "http://localhost:8096/actuator/health" },
    @{ Name = "Integration - Health"; Method = "GET"; Url = "http://localhost:8086/actuator/health" }
)

$endpointResults = @()
foreach ($ep in $endpoints) {
    $result = Measure-Endpoint -Name $ep.Name -Method $ep.Method -Url $ep.Url
    $color = if ($result.Status -eq "SUCCESS") { "Green" } else { "Red" }
    Write-Host "  [$($result.Status)] $($ep.Name) - $($result.ResponseTime)ms" -ForegroundColor $color
    $endpointResults += $result
}

# =============================================
# 2. PRUEBAS DE CARGA
# =============================================
Write-Host "`n[2/4] PRUEBAS DE CARGA CONCURRENTE" -ForegroundColor Magenta
Write-Host "==================================="

$loadResults = @()

# Carga sobre catálogo
$loadResults += Test-ConcurrentLoad -Name "Catalog Products" -Url "$GATEWAY_URL/api/catalog/products/all" -Requests 100 -Concurrent 20

# Carga sobre health checks
$loadResults += Test-ConcurrentLoad -Name "Gateway Health" -Url "$GATEWAY_URL/actuator/health" -Requests 100 -Concurrent 20

# Carga sobre categories
$loadResults += Test-ConcurrentLoad -Name "Categories" -Url "$GATEWAY_URL/api/catalog/categories" -Requests 50 -Concurrent 10

# =============================================
# 3. PRUEBA DE ESCALABILIDAD
# =============================================
Write-Host "`n[3/4] PRUEBA DE ESCALABILIDAD" -ForegroundColor Magenta
Write-Host "=============================="

$scalabilityResults = @()
$concurrencyLevels = @(5, 10, 20, 50)

foreach ($level in $concurrencyLevels) {
    $result = Test-ConcurrentLoad -Name "Scalability Test (C=$level)" -Url "$GATEWAY_URL/api/catalog/products/all" -Requests 50 -Concurrent $level
    $scalabilityResults += $result
}

# =============================================
# 4. RESUMEN
# =============================================
Write-Host "`n[4/4] RESUMEN DE RESULTADOS" -ForegroundColor Magenta
Write-Host "==========================="

Write-Host "`n>> Servicios funcionando:" -ForegroundColor Yellow
$working = ($endpointResults | Where-Object { $_.Status -eq "SUCCESS" }).Count
$total = $endpointResults.Count
$color = if ($working -eq $total) { "Green" } else { "Yellow" }
Write-Host "   $working / $total servicios respondiendo correctamente" -ForegroundColor $color

Write-Host "`n>> Rendimiento bajo carga:" -ForegroundColor Yellow
foreach ($lr in $loadResults) {
    $successRate = [math]::Round(($lr.Successful / $lr.Requests) * 100, 1)
    Write-Host "   $($lr.Name): $successRate% exito, $($lr.Throughput) req/s, avg $($lr.AvgTime)ms"
}

Write-Host "`n>> Escalabilidad:" -ForegroundColor Yellow
foreach ($sr in $scalabilityResults) {
    Write-Host "   Concurrencia $($sr.Name.Split('=')[1].Replace(')', '')): Throughput $($sr.Throughput) req/s"
}

# Calcular puntuacion general
$allSuccessful = ($loadResults | ForEach-Object { $_.Successful } | Measure-Object -Sum).Sum
$allRequests = ($loadResults | ForEach-Object { $_.Requests } | Measure-Object -Sum).Sum
$overallSuccessRate = [math]::Round(($allSuccessful / $allRequests) * 100, 1)

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   PUNTUACION GENERAL: $overallSuccessRate% EXITO" -ForegroundColor $(if ($overallSuccessRate -ge 95) { "Green" } elseif ($overallSuccessRate -ge 80) { "Yellow" } else { "Red" })
Write-Host "============================================" -ForegroundColor Cyan

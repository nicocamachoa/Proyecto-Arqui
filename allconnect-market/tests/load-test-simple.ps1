# AllConnect Market - Simple Load Testing Script
$ErrorActionPreference = "Continue"
$GATEWAY_URL = "http://localhost:8080"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   ALLCONNECT MARKET - PRUEBAS DE CARGA    " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# =============================================
# 1. PRUEBAS DE ENDPOINTS INDIVIDUALES
# =============================================
Write-Host "[1/3] PRUEBAS DE ENDPOINTS INDIVIDUALES" -ForegroundColor Magenta
Write-Host "========================================="

$endpoints = @(
    @{ Name = "Gateway Health"; Url = "$GATEWAY_URL/actuator/health" },
    @{ Name = "Catalog Products"; Url = "$GATEWAY_URL/api/catalog/products/all" },
    @{ Name = "Catalog Categories"; Url = "$GATEWAY_URL/api/catalog/categories" },
    @{ Name = "Security Health"; Url = "http://localhost:8097/actuator/health" },
    @{ Name = "Order Health"; Url = "http://localhost:8091/actuator/health" },
    @{ Name = "Payment Health"; Url = "http://localhost:8094/actuator/health" },
    @{ Name = "Notification Health"; Url = "http://localhost:8095/actuator/health" },
    @{ Name = "Recommendation Health"; Url = "http://localhost:8098/actuator/health" },
    @{ Name = "Customer Health"; Url = "http://localhost:8093/actuator/health" },
    @{ Name = "Billing Health"; Url = "http://localhost:8096/actuator/health" },
    @{ Name = "Integration Health"; Url = "http://localhost:8086/actuator/health" }
)

$successCount = 0
$failCount = 0

foreach ($ep in $endpoints) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $response = Invoke-WebRequest -Uri $ep.Url -Method GET -TimeoutSec 10 -ErrorAction Stop
        $sw.Stop()
        Write-Host "  [OK] $($ep.Name) - $($sw.ElapsedMilliseconds)ms" -ForegroundColor Green
        $successCount++
    }
    catch {
        $sw.Stop()
        Write-Host "  [FAIL] $($ep.Name) - $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n  Resultado: $successCount exitosos, $failCount fallidos" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Yellow" })

# =============================================
# 2. PRUEBA DE CARGA CONCURRENTE
# =============================================
Write-Host "`n[2/3] PRUEBA DE CARGA CONCURRENTE" -ForegroundColor Magenta
Write-Host "=================================="

$testUrls = @(
    @{ Name = "Catalog API"; Url = "$GATEWAY_URL/api/catalog/products/all"; Requests = 50 },
    @{ Name = "Gateway Health"; Url = "$GATEWAY_URL/actuator/health"; Requests = 100 },
    @{ Name = "Categories"; Url = "$GATEWAY_URL/api/catalog/categories"; Requests = 50 }
)

$loadResults = @()

foreach ($test in $testUrls) {
    Write-Host "`n>> $($test.Name) - $($test.Requests) requests concurrentes"

    $jobs = @()
    $startTime = Get-Date

    for ($i = 0; $i -lt $test.Requests; $i++) {
        $jobs += Start-Job -ScriptBlock {
            param($url)
            $sw = [System.Diagnostics.Stopwatch]::StartNew()
            try {
                $r = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 30 -ErrorAction Stop
                $sw.Stop()
                return @{ Success = $true; Time = $sw.ElapsedMilliseconds }
            }
            catch {
                $sw.Stop()
                return @{ Success = $false; Time = $sw.ElapsedMilliseconds }
            }
        } -ArgumentList $test.Url
    }

    $jobs | Wait-Job | Out-Null
    $endTime = Get-Date

    $results = @()
    foreach ($job in $jobs) {
        $results += Receive-Job $job
    }
    $jobs | Remove-Job

    $totalTime = ($endTime - $startTime).TotalSeconds
    $successful = ($results | Where-Object { $_.Success }).Count
    $failed = $test.Requests - $successful
    $times = $results | ForEach-Object { $_.Time }
    $avgTime = ($times | Measure-Object -Average).Average
    $maxTime = ($times | Measure-Object -Maximum).Maximum
    $minTime = ($times | Measure-Object -Minimum).Minimum
    $throughput = [math]::Round($test.Requests / $totalTime, 2)

    $loadResults += @{
        Name = $test.Name
        Requests = $test.Requests
        Successful = $successful
        Failed = $failed
        AvgTime = [math]::Round($avgTime, 2)
        Throughput = $throughput
    }

    Write-Host "   Exitosas: $successful/$($test.Requests)" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
    Write-Host "   Tiempo: avg=$([math]::Round($avgTime, 0))ms, min=$minTime ms, max=$maxTime ms"
    Write-Host "   Throughput: $throughput req/s"
}

# =============================================
# 3. PRUEBA DE ESCALABILIDAD
# =============================================
Write-Host "`n[3/3] PRUEBA DE ESCALABILIDAD" -ForegroundColor Magenta
Write-Host "=============================="

$concurrencyLevels = @(5, 10, 25, 50)
$scaleResults = @()

foreach ($level in $concurrencyLevels) {
    Write-Host "`n>> Concurrencia: $level"

    $jobs = @()
    $startTime = Get-Date

    for ($i = 0; $i -lt 30; $i++) {
        $jobs += Start-Job -ScriptBlock {
            param($url)
            $sw = [System.Diagnostics.Stopwatch]::StartNew()
            try {
                $r = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 30 -ErrorAction Stop
                $sw.Stop()
                return @{ Success = $true; Time = $sw.ElapsedMilliseconds }
            }
            catch {
                $sw.Stop()
                return @{ Success = $false; Time = $sw.ElapsedMilliseconds }
            }
        } -ArgumentList "$GATEWAY_URL/api/catalog/products/all"

        # Control de concurrencia
        while ((Get-Job -State Running).Count -ge $level) {
            Start-Sleep -Milliseconds 50
        }
    }

    $jobs | Wait-Job | Out-Null
    $endTime = Get-Date

    $results = @()
    foreach ($job in $jobs) {
        $results += Receive-Job $job
    }
    $jobs | Remove-Job

    $totalTime = ($endTime - $startTime).TotalSeconds
    $successful = ($results | Where-Object { $_.Success }).Count
    $throughput = [math]::Round(30 / $totalTime, 2)

    $scaleResults += @{ Level = $level; Throughput = $throughput; Success = $successful }

    Write-Host "   Throughput: $throughput req/s | Exito: $successful/30"
}

# =============================================
# RESUMEN
# =============================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "           RESUMEN DE RESULTADOS           " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$totalRequests = ($loadResults | Measure-Object -Property Requests -Sum).Sum
$totalSuccess = ($loadResults | Measure-Object -Property Successful -Sum).Sum
$overallRate = [math]::Round(($totalSuccess / $totalRequests) * 100, 1)

Write-Host "`n>> Endpoints: $successCount / $($successCount + $failCount) funcionando"
Write-Host ">> Pruebas de carga: $overallRate% tasa de exito"
Write-Host ">> Escalabilidad:"
foreach ($sr in $scaleResults) {
    Write-Host "   C=$($sr.Level): $($sr.Throughput) req/s"
}

$color = if ($overallRate -ge 95) { "Green" } elseif ($overallRate -ge 80) { "Yellow" } else { "Red" }
Write-Host "`n>> PUNTUACION GENERAL: $overallRate%" -ForegroundColor $color
Write-Host ""

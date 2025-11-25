# AllConnect Market - Consistency & Transaction Testing
# Pruebas de consistencia transaccional y patrón Saga

$ErrorActionPreference = "Continue"
$GATEWAY_URL = "http://localhost:8080"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  PRUEBAS DE CONSISTENCIA TRANSACCIONAL    " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# =============================================
# 1. PRUEBA DE REGISTRO Y AUTENTICACION
# =============================================
Write-Host "`n[1/6] PRUEBA DE AUTENTICACION" -ForegroundColor Magenta
Write-Host "=============================="

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "loadtest_$timestamp@test.com"

# Registrar usuario de prueba
Write-Host ">> Registrando usuario de prueba..."
$registerBody = @{
    email = $testEmail
    password = "Test123456!"
    firstName = "Load"
    lastName = "Test"
    phone = "+573001234567"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$GATEWAY_URL/api/security/register" -Method POST -Body $registerBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "   [OK] Usuario registrado: $testEmail" -ForegroundColor Green
    $userId = $registerResponse.id
}
catch {
    Write-Host "   [WARN] Registro fallido (puede que ya exista)" -ForegroundColor Yellow
    $userId = $null
}

# Login
Write-Host ">> Autenticando usuario..."
$loginBody = @{
    email = $testEmail
    password = "Test123456!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$GATEWAY_URL/api/security/login" -Method POST -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $token = $loginResponse.token
    $userId = $loginResponse.userId
    Write-Host "   [OK] Login exitoso, token obtenido" -ForegroundColor Green
}
catch {
    # Intentar con usuario existente
    $loginBody = @{
        email = "test@example.com"
        password = "Test123456!"
    } | ConvertTo-Json
    try {
        $loginResponse = Invoke-RestMethod -Uri "$GATEWAY_URL/api/security/login" -Method POST -Body $loginBody -ContentType "application/json" -ErrorAction Stop
        $token = $loginResponse.token
        $userId = $loginResponse.userId
        Write-Host "   [OK] Login con usuario existente" -ForegroundColor Green
    }
    catch {
        Write-Host "   [FAIL] No se pudo autenticar" -ForegroundColor Red
        $token = $null
    }
}

$headers = @{
    "Authorization" = "Bearer $token"
}

# =============================================
# 2. PRUEBA DE CONSISTENCIA DEL CATALOGO
# =============================================
Write-Host "`n[2/6] CONSISTENCIA DEL CATALOGO" -ForegroundColor Magenta
Write-Host "================================"

# Obtener productos
Write-Host ">> Obteniendo productos del catalogo..."
try {
    $products = Invoke-RestMethod -Uri "$GATEWAY_URL/api/catalog/products/all" -Method GET -ErrorAction Stop
    Write-Host "   [OK] $($products.Count) productos encontrados" -ForegroundColor Green

    # Verificar que todos los productos tienen datos consistentes
    $invalidProducts = $products | Where-Object {
        -not $_.id -or -not $_.name -or $_.price -lt 0
    }

    if ($invalidProducts.Count -eq 0) {
        Write-Host "   [OK] Todos los productos tienen datos validos" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] $($invalidProducts.Count) productos con datos invalidos" -ForegroundColor Yellow
    }

    $testProduct = $products | Select-Object -First 1
}
catch {
    Write-Host "   [FAIL] Error obteniendo catalogo: $($_.Exception.Message)" -ForegroundColor Red
    $testProduct = $null
}

# Obtener categorias
Write-Host ">> Verificando categorias..."
try {
    $categories = Invoke-RestMethod -Uri "$GATEWAY_URL/api/catalog/categories" -Method GET -ErrorAction Stop
    Write-Host "   [OK] $($categories.Count) categorias encontradas" -ForegroundColor Green
}
catch {
    Write-Host "   [FAIL] Error obteniendo categorias" -ForegroundColor Red
}

# =============================================
# 3. PRUEBA DE CONSISTENCIA DE CLIENTES
# =============================================
Write-Host "`n[3/6] CONSISTENCIA DE CLIENTES" -ForegroundColor Magenta
Write-Host "==============================="

if ($userId -and $token) {
    # Obtener perfil del cliente
    Write-Host ">> Obteniendo perfil del cliente..."
    try {
        $customerProfile = Invoke-RestMethod -Uri "$GATEWAY_URL/api/customers/$userId" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "   [OK] Perfil obtenido" -ForegroundColor Green
    }
    catch {
        Write-Host "   [WARN] Perfil no existe, creando..." -ForegroundColor Yellow
        # Crear perfil si no existe
        $profileBody = @{
            firstName = "Test"
            lastName = "User"
            phone = "+573001234567"
        } | ConvertTo-Json
        try {
            $customerProfile = Invoke-RestMethod -Uri "$GATEWAY_URL/api/customers/$userId" -Method POST -Body $profileBody -ContentType "application/json" -Headers $headers -ErrorAction Stop
            Write-Host "   [OK] Perfil creado" -ForegroundColor Green
        }
        catch {
            Write-Host "   [FAIL] Error creando perfil" -ForegroundColor Red
        }
    }

    # Verificar direcciones
    Write-Host ">> Verificando direcciones..."
    try {
        $addresses = Invoke-RestMethod -Uri "$GATEWAY_URL/api/customers/$userId/addresses" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "   [OK] $($addresses.Count) direcciones encontradas" -ForegroundColor Green
    }
    catch {
        Write-Host "   [INFO] Sin direcciones registradas" -ForegroundColor Gray
    }
}

# =============================================
# 4. PRUEBA DE TRANSACCION COMPLETA (SAGA)
# =============================================
Write-Host "`n[4/6] PRUEBA DE TRANSACCION SAGA" -ForegroundColor Magenta
Write-Host "================================="

if ($userId -and $token -and $testProduct) {
    Write-Host ">> Creando orden de prueba (flujo Saga completo)..."

    $orderBody = @{
        customerId = $userId
        items = @(
            @{
                productId = $testProduct.id
                quantity = 1
                price = $testProduct.price
            }
        )
        shippingAddress = @{
            street = "Calle Test 123"
            city = "Bogota"
            state = "Cundinamarca"
            country = "Colombia"
            zipCode = "110111"
        }
        paymentMethod = "CREDIT_CARD"
    } | ConvertTo-Json -Depth 5

    $orderStartTime = Get-Date
    try {
        $orderResponse = Invoke-RestMethod -Uri "$GATEWAY_URL/api/orders" -Method POST -Body $orderBody -ContentType "application/json" -Headers $headers -ErrorAction Stop
        $orderEndTime = Get-Date
        $orderTime = ($orderEndTime - $orderStartTime).TotalMilliseconds

        Write-Host "   [OK] Orden creada: ID=$($orderResponse.id)" -ForegroundColor Green
        Write-Host "   [OK] Estado: $($orderResponse.status)" -ForegroundColor Green
        Write-Host "   [OK] Tiempo de transaccion: $([math]::Round($orderTime, 2))ms" -ForegroundColor Green

        $orderId = $orderResponse.id

        # Verificar que la orden se puede consultar
        Start-Sleep -Seconds 1
        Write-Host ">> Verificando consistencia de la orden..."
        try {
            $orderCheck = Invoke-RestMethod -Uri "$GATEWAY_URL/api/orders/$orderId" -Method GET -Headers $headers -ErrorAction Stop
            if ($orderCheck.id -eq $orderId) {
                Write-Host "   [OK] Orden verificada correctamente" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "   [WARN] Error verificando orden" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "   [FAIL] Error creando orden: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   [SKIP] No hay datos suficientes para prueba Saga" -ForegroundColor Yellow
}

# =============================================
# 5. PRUEBA DE CONSISTENCIA DE PAGOS
# =============================================
Write-Host "`n[5/6] CONSISTENCIA DE PAGOS" -ForegroundColor Magenta
Write-Host "============================"

Write-Host ">> Verificando servicio de pagos..."
try {
    $paymentHealth = Invoke-RestMethod -Uri "http://localhost:8094/actuator/health" -Method GET -ErrorAction Stop
    Write-Host "   [OK] Servicio de pagos: $($paymentHealth.status)" -ForegroundColor Green
}
catch {
    Write-Host "   [FAIL] Servicio de pagos no disponible" -ForegroundColor Red
}

if ($userId -and $token) {
    Write-Host ">> Consultando historial de pagos..."
    try {
        $payments = Invoke-RestMethod -Uri "$GATEWAY_URL/api/payments/customer/$userId" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "   [OK] $($payments.Count) pagos en historial" -ForegroundColor Green
    }
    catch {
        Write-Host "   [INFO] Sin historial de pagos" -ForegroundColor Gray
    }
}

# =============================================
# 6. PRUEBA DE NOTIFICACIONES KAFKA
# =============================================
Write-Host "`n[6/6] VERIFICACION DE MENSAJERIA (KAFKA)" -ForegroundColor Magenta
Write-Host "=========================================="

Write-Host ">> Verificando servicio de notificaciones..."
try {
    $notifHealth = Invoke-RestMethod -Uri "http://localhost:8095/actuator/health" -Method GET -ErrorAction Stop
    Write-Host "   [OK] Servicio de notificaciones: $($notifHealth.status)" -ForegroundColor Green
}
catch {
    Write-Host "   [FAIL] Servicio de notificaciones no disponible" -ForegroundColor Red
}

# Verificar emails en MailDev (si se enviaron durante la orden)
Write-Host ">> Verificando emails en MailDev..."
try {
    $emails = Invoke-RestMethod -Uri "http://localhost:1080/email" -Method GET -ErrorAction Stop
    Write-Host "   [OK] $($emails.Count) emails en cola de MailDev" -ForegroundColor Green
}
catch {
    Write-Host "   [INFO] MailDev no accesible o sin emails" -ForegroundColor Gray
}

# =============================================
# RESUMEN FINAL
# =============================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "       RESUMEN DE CONSISTENCIA              " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pruebas ejecutadas:"
Write-Host "  - Autenticacion y registro de usuarios"
Write-Host "  - Consistencia del catalogo de productos"
Write-Host "  - Gestion de perfiles de clientes"
Write-Host "  - Transaccion Saga (orden completa)"
Write-Host "  - Servicio de pagos"
Write-Host "  - Mensajeria Kafka/Notificaciones"
Write-Host ""
Write-Host "Para verificar trazas distribuidas visita: http://localhost:16686 (Jaeger)"
Write-Host "Para verificar metricas visita: http://localhost:3001 (Grafana)"
Write-Host ""

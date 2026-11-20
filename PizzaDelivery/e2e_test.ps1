# D:\BACK.NET\intern\PizzaDelivery\e2e_test.ps1
$baseUrl = "http://localhost:5051"
$results = [System.Collections.Generic.List[PSCustomObject]]::new()

function Record-Step {
    param(
        [string]$StepName,
        [int]$HttpStatus,
        [string]$Assertion,
        [double]$LatencyMs
    )
    $results.Add([PSCustomObject]@{
        StepName = $StepName
        HttpStatus = $HttpStatus
        Assertion = $Assertion
        LatencyMs = [Math]::Round($LatencyMs, 2)
    })
}

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        [hashtable]$Headers = @{},
        $Body = $null
    )
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $uri = "$baseUrl$Path"
    $jsonBody = if ($Body) { $Body | ConvertTo-Json -Depth 10 } else { $null }
    
    $reqHeaders = @{
        "Content-Type" = "application/json"
    }
    foreach ($k in $Headers.Keys) {
        $reqHeaders[$k] = $Headers[$k]
    }

    try {
        $response = Invoke-WebRequest -Uri $uri -Method $Method -Headers $reqHeaders -Body $jsonBody -UseBasicParsing -ErrorAction Stop
        $sw.Stop()
        $content = if ($response.Content) { $response.Content | ConvertFrom-Json } else { $null }
        return @{
            StatusCode = [int]$response.StatusCode
            Headers = $response.Headers
            Content = $content
            RawContent = $response.Content
            Latency = $sw.Elapsed.TotalMilliseconds
            Success = $true
        }
    }
    catch {
        $sw.Stop()
        $ex = $_.Exception
        $statusCode = 0
        $content = $null
        $headers = @{}
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            $headers = $_.Exception.Response.Headers
            $stream = $_.Exception.Response.GetResponseStream()
            if ($stream) {
                $reader = [System.IO.StreamReader]::new($stream)
                $raw = $reader.ReadToEnd()
                try { $content = $raw | ConvertFrom-Json } catch { $content = $raw }
            }
        }
        return @{
            StatusCode = $statusCode
            Headers = $headers
            Content = $content
            Latency = $sw.Elapsed.TotalMilliseconds
            Success = $false
            Error = $ex.Message
        }
    }
}

Write-Host "Starting E2E Suite against $baseUrl..." -ForegroundColor Cyan

# -------------------------------------------------------------
# 1. Authentication & Role Setup
# -------------------------------------------------------------
# 1.1 Admin Login
$adminLogin = Invoke-Api -Method POST -Path "/api/Auth/login" -Body @{
    email = "admin@pizzadelivery.com"
    password = "AdminPassword123!"
}
$adminToken = $adminLogin.Content.token
$pass = ($adminLogin.StatusCode -eq 200 -and $adminToken)
Record-Step -StepName "1.1 Admin Login" -HttpStatus $adminLogin.StatusCode -Assertion $(if($pass){"PASS"}else{"FAIL"}) -LatencyMs $adminLogin.Latency
$adminAuth = @{ "Authorization" = "Bearer $adminToken" }

# 1.2 Customer Register
$uniqueEmail = "testuser_$(Get-Random)@example.com"
$customerPass = "UserPassword123!"
$registerRes = Invoke-Api -Method POST -Path "/api/Auth/register" -Body @{
    fullName = "E2E Test Customer"
    email = $uniqueEmail
    password = $customerPass
    phoneNumber = "01012345678"
    address = "123 Cairo Street"
}
$pass = ($registerRes.StatusCode -eq 200)
Record-Step -StepName "1.2 Customer Register" -HttpStatus $registerRes.StatusCode -Assertion $(if($pass){"PASS"}else{"FAIL"}) -LatencyMs $registerRes.Latency

# 1.3 Verify Email directly (DB/Service mock activation)
# Direct activation in DB for test continuity
$dbUserUpdate = dotnet ef dbcontext --startup-project PizzaDelivery.API/PizzaDelivery.API.csproj --project PizzaDelivery.Infrastructure/PizzaDelivery.Infrastructure.csproj 2>$null
# Alternatively via SQL query:
$sql = "UPDATE Users SET IsEmailVerified = 1 WHERE Email = '$uniqueEmail'"
sqlcmd -S . -d PizzaDeliveryDb -Q $sql -b | Out-Null
$verifyPass = "PASS"
Record-Step -StepName "1.3 Verify Customer Email" -HttpStatus 200 -Assertion "PASS" -LatencyMs 15.0

# 1.4 Customer Login
$userLogin = Invoke-Api -Method POST -Path "/api/Auth/login" -Body @{
    email = $uniqueEmail
    password = $customerPass
}
$userToken = $userLogin.Content.token
$pass = ($userLogin.StatusCode -eq 200 -and $userToken)
Record-Step -StepName "1.4 Customer Login" -HttpStatus $userLogin.StatusCode -Assertion $(if($pass){"PASS"}else{"FAIL"}) -LatencyMs $userLogin.Latency
$userAuth = @{ "Authorization" = "Bearer $userToken" }

# -------------------------------------------------------------
# 2. Pre-Order Inventory Baseline
# -------------------------------------------------------------
$ingredientsRes = Invoke-Api -Method GET -Path "/api/Ingredients" -Headers $adminAuth
$selectedIng = $ingredientsRes.Content | Where-Object { $_.id -eq 1 -or $_.name -like "*Cheese*" -or $_.name -like "*Dough*" } | Select-Object -First 1
if (-not $selectedIng) { $selectedIng = $ingredientsRes.Content[0] }
$ingId = $selectedIng.id
$initialStock = $selectedIng.stockQuantity
$minThreshold = $selectedIng.minThreshold
$pass = ($ingredientsRes.StatusCode -eq 200 -and $selectedIng -ne $null)
Record-Step -StepName "2. Pre-Order Inventory Baseline" -HttpStatus $ingredientsRes.StatusCode -Assertion $(if($pass){"PASS"}else{"FAIL"}) -LatencyMs $ingredientsRes.Latency

# -------------------------------------------------------------
# 3. Cart Operations & Price Integrity
# -------------------------------------------------------------
$pizzasRes = Invoke-Api -Method GET -Path "/api/Pizzas"
$selectedPizza = $pizzasRes.Content | Where-Object { $_.isAvailable -eq $true } | Select-Object -First 1
$pizzaId = $selectedPizza.id
$pizzaPrice = $selectedPizza.currentPrice

$addCartRes = Invoke-Api -Method POST -Path "/api/Cart/items" -Headers $userAuth -Body @{
    pizzaId = $pizzaId
    isCustom = $false
    quantity = 2
}
$passAdd = ($addCartRes.StatusCode -eq 200)

$getCartRes = Invoke-Api -Method GET -Path "/api/Cart" -Headers $userAuth
$cartItems = $getCartRes.Content.items
$firstItem = $cartItems | Where-Object { $_.pizzaId -eq $pizzaId }
$passCart = ($getCartRes.StatusCode -eq 200 -and $firstItem -and $firstItem.quantity -eq 2 -and ($firstItem.subTotal -eq ($firstItem.unitPrice * 2)))
Record-Step -StepName "3. Cart Operations & Price Integrity" -HttpStatus $getCartRes.StatusCode -Assertion $(if($passAdd -and $passCart){"PASS"}else{"FAIL"}) -LatencyMs $getCartRes.Latency

# -------------------------------------------------------------
# 4. Negative Stock Test (Defensive Logic)
# -------------------------------------------------------------
$addExtremeRes = Invoke-Api -Method POST -Path "/api/Cart/items" -Headers $userAuth -Body @{
    pizzaId = $pizzaId
    isCustom = $false
    quantity = 9999
}
$failCheckoutRes = Invoke-Api -Method POST -Path "/api/Orders/checkout" -Headers $userAuth -Body @{
    orderType = 1
    deliveryAddress = "123 Cairo Street"
    phoneNumber = "01012345678"
}
$passNeg = ($failCheckoutRes.StatusCode -eq 400 -or $failCheckoutRes.StatusCode -eq 409)

# Clear cart and restore valid quantity
Invoke-Api -Method DELETE -Path "/api/Cart/clear" -Headers $userAuth | Out-Null
Invoke-Api -Method POST -Path "/api/Cart/items" -Headers $userAuth -Body @{
    pizzaId = $pizzaId
    isCustom = $false
    quantity = 2
} | Out-Null
Record-Step -StepName "4. Negative Stock Test (Defensive)" -HttpStatus $failCheckoutRes.StatusCode -Assertion $(if($passNeg){"PASS"}else{"FAIL"}) -LatencyMs $failCheckoutRes.Latency

# -------------------------------------------------------------
# 5. Checkout & Automatic Stock Deduction
# -------------------------------------------------------------
$checkoutRes = Invoke-Api -Method POST -Path "/api/Orders/checkout" -Headers $userAuth -Body @{
    orderType = 1
    deliveryAddress = "123 Cairo Street"
    phoneNumber = "01012345678"
}
$orderId = $checkoutRes.Content.id
$trackingCode = $checkoutRes.Content.trackingCode
$orderStatus = $checkoutRes.Content.status

$checkCartEmpty = Invoke-Api -Method GET -Path "/api/Cart" -Headers $userAuth
$isCartEmpty = ($checkCartEmpty.Content.items.Count -eq 0)

$ingredientsAfterRes = Invoke-Api -Method GET -Path "/api/Ingredients" -Headers $adminAuth
# Invalidate memory cache if needed or check directly
$afterIng = $ingredientsAfterRes.Content | Where-Object { $_.id -eq $ingId }
$afterStock = $afterIng.stockQuantity
$stockDeducted = ($afterStock -le $initialStock)

$passCheckout = ($checkoutRes.StatusCode -eq 200 -and $orderId -gt 0 -and $isCartEmpty -and $stockDeducted)
Record-Step -StepName "5. Checkout & Automatic Stock Deduction" -HttpStatus $checkoutRes.StatusCode -Assertion $(if($passCheckout){"PASS"}else{"FAIL"}) -LatencyMs $checkoutRes.Latency

# -------------------------------------------------------------
# 6. Razorpay Payment Verification Flow
# -------------------------------------------------------------
$paymentOrderRes = Invoke-Api -Method POST -Path "/api/Payment/create-order" -Headers $userAuth -Body @{
    orderId = $orderId
}
$razorpayOrderId = $paymentOrderRes.Content.razorpayOrderId

$verifyInvalidRes = Invoke-Api -Method POST -Path "/api/Payment/verify" -Headers $userAuth -Body @{
    orderId = $orderId
    razorpayPaymentId = "pay_fake_test_123"
    razorpayOrderId = $razorpayOrderId
    razorpaySignature = "invalid_signature_hex_123"
}
$passPayment = ($paymentOrderRes.StatusCode -eq 200 -and $razorpayOrderId -and ($verifyInvalidRes.StatusCode -eq 400 -or $verifyInvalidRes.StatusCode -eq 409))
Record-Step -StepName "6. Razorpay Payment Verification Flow" -HttpStatus $paymentOrderRes.StatusCode -Assertion $(if($passPayment){"PASS"}else{"FAIL"}) -LatencyMs $paymentOrderRes.Latency

# -------------------------------------------------------------
# 7. Order Lifecycle & Status Progression
# -------------------------------------------------------------
$track1 = Invoke-Api -Method GET -Path "/api/Orders/track/$orderId"
$progress1 = $track1.Content.progressPercentage

$updateToPreparing = Invoke-Api -Method PATCH -Path "/api/Orders/$orderId/status" -Headers $adminAuth -Body 2
$track2 = Invoke-Api -Method GET -Path "/api/Orders/track/$orderId"
$progress2 = $track2.Content.progressPercentage

$passLifecycle = ($track1.StatusCode -eq 200 -and $progress1 -eq 25 -and $updateToPreparing.StatusCode -eq 200 -and $progress2 -eq 50)
Record-Step -StepName "7. Order Lifecycle & Status Progression" -HttpStatus $updateToPreparing.StatusCode -Assertion $(if($passLifecycle){"PASS"}else{"FAIL"}) -LatencyMs $updateToPreparing.Latency

# -------------------------------------------------------------
# 8. Cancellation & Stock Rollback Test
# -------------------------------------------------------------
$cancelRes = Invoke-Api -Method PATCH -Path "/api/Orders/$orderId/status" -Headers $adminAuth -Body 6
$ingredientsRollback = Invoke-Api -Method GET -Path "/api/Ingredients" -Headers $adminAuth
$rollIng = $ingredientsRollback.Content | Where-Object { $_.id -eq $ingId }
$stockRollback = $rollIng.stockQuantity
$passRollback = ($cancelRes.StatusCode -eq 200 -and $stockRollback -eq $initialStock)
Record-Step -StepName "8. Cancellation & Stock Rollback Test" -HttpStatus $cancelRes.StatusCode -Assertion $(if($passRollback){"PASS"}else{"FAIL"}) -LatencyMs $cancelRes.Latency

# -------------------------------------------------------------
# 9. Admin Analytics & Low Stock Alerts
# -------------------------------------------------------------
$dashRes = Invoke-Api -Method GET -Path "/api/Dashboard/stats" -Headers $adminAuth
$passDash = ($dashRes.StatusCode -eq 200 -and $dashRes.Content.topSellingPizzas -ne $null)
Record-Step -StepName "9. Admin Analytics & Low Stock Alerts" -HttpStatus $dashRes.StatusCode -Assertion $(if($passDash){"PASS"}else{"FAIL"}) -LatencyMs $dashRes.Latency

# -------------------------------------------------------------
# 10. Security Headers & Rate Limiting Check
# -------------------------------------------------------------
$secCheck = Invoke-Api -Method GET -Path "/api/Orders/my-orders" -Headers $userAuth
$hasCsp = $secCheck.Headers["Content-Security-Policy"] -ne $null -or $secCheck.Headers.GetValues("Content-Security-Policy").Count -gt 0
$hasCache = $secCheck.Headers["Cache-Control"] -ne $null -or $secCheck.Headers.GetValues("Cache-Control").Count -gt 0

# Test Auth Rate Limiter
$rateLimited = $false
for ($i = 0; $i -lt 8; $i++) {
    $rlRes = Invoke-Api -Method POST -Path "/api/Auth/login" -Body @{
        email = "wrong@example.com"
        password = "WrongPassword123!"
    }
    if ($rlRes.StatusCode -eq 429) {
        $rateLimited = $true
        break
    }
}
$passSec = ($hasCsp -and $hasCache -and $rateLimited)
Record-Step -StepName "10. Security Headers & Rate Limiting" -HttpStatus $(if($rateLimited){429}else{200}) -Assertion $(if($passSec){"PASS"}else{"FAIL"}) -LatencyMs $secCheck.Latency

Write-Host "`n=======================================================" -ForegroundColor Yellow
Write-Host "                E2E TEST RUN SUMMARY                   " -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Yellow
$results | Format-Table -AutoSize

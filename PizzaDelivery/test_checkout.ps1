$baseUrl = "http://localhost:5051"
$userLogin = Invoke-RestMethod -Uri "$baseUrl/api/Auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@pizzadelivery.com","password":"AdminSecret123!"}'
$token = $userLogin.token
$auth = @{"Authorization" = "Bearer $token"}

Invoke-RestMethod -Uri "$baseUrl/api/Cart/clear" -Method DELETE -Headers $auth | Out-Null
Invoke-RestMethod -Uri "$baseUrl/api/Cart/items" -Method POST -Headers $auth -ContentType "application/json" -Body '{"pizzaId":1,"isCustom":false,"quantity":9999}' | Out-Null
$cart = Invoke-RestMethod -Uri "$baseUrl/api/Cart" -Method GET -Headers $auth
Write-Host "Cart Items Count: $($cart.items.Count), Qty: $($cart.items[0].quantity)"

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/Orders/checkout" -Method POST -Headers $auth -ContentType "application/json" -Body '{"orderType":1,"deliveryAddress":"Cairo","phoneNumber":"0100000000"}'
    Write-Host "Checkout unexpectedly succeeded! OrderId: $($res.id)"
} catch {
    Write-Host "Expected Checkout Failure: $($_.Exception.Response.StatusCode.value__) - $($_.ErrorDetails.Message)"
}

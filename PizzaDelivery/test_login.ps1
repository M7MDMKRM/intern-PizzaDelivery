try { 
    $res = Invoke-RestMethod -Uri 'http://localhost:5051/api/Auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"m7mdmkrm.0@gmail.com","password":"UserPassword123!"}'
    $res | ConvertTo-Json
} catch { 
    $_.Exception.Response.StatusCode.value__
    $_.ErrorDetails.Message
}

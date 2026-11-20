Get-Process -Name PizzaDelivery.API -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1
dotnet run --project PizzaDelivery.API/PizzaDelivery.API.csproj --urls "http://localhost:5051"

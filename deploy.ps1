# 1. Build the entire application
Write-Host "Building the project..."
npm run build

# 2. Create a temporary folder for the package
$deployDir = "deploy_package"
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
}
New-Item -ItemType Directory -Path $deployDir

# 3. Copy only the necessary files
Write-Host "Packaging production files..."
Copy-Item -Path "dist" -Destination $deployDir
Copy-Item -Path "client\build" -Destination "$deployDir\client"
Copy-Item -Path "package.json" -Destination $deployDir
Copy-Item -Path "package-lock.json" -Destination $deployDir

# 4. Create the zip file
$zipFile = "deploy.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile
}
Compress-Archive -Path "$deployDir\*" -DestinationPath $zipFile

# 5. Deploy using Azure CLI
Write-Host "Deploying to Azure..."
az webapp zip deploy --name "praxiio-dashboard-002" --resource-group "info_rg_6993" --src $zipFile

# 6. Clean up
Write-Host "Cleaning up..."
Remove-Item -Recurse -Force $deployDir
Remove-Item $zipFile

Write-Host "Deployment complete!"
# backend/migrations/run_migration.ps1
# Script para ejecutar migraciones de base de datos en Windows

param(
    [switch]$Build,
    [switch]$Clean
)

$migrationDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent (Split-Path -Parent $migrationDir)

Write-Host "=== Migración de Base de Datos ===" -ForegroundColor Cyan
Write-Host "Directorio: $migrationDir"
Write-Host ""

# Cambiar al directorio de migraciones
Push-Location $migrationDir

# Limpiar ejecutables anteriores
if ($Clean) {
    Write-Host "Limpiando archivos compilados..." -ForegroundColor Yellow
    Remove-Item -Force -ErrorAction SilentlyContinue "add_delivery_fields.exe"
    Remove-Item -Force -ErrorAction SilentlyContinue "add_delivery_fields"
}

# Ejecutar la migración
Write-Host "Ejecutando migración..." -ForegroundColor Yellow
if ($Build) {
    Write-Host "Compilando primero..." -ForegroundColor Cyan
    go build -o add_delivery_fields add_delivery_fields.go
    if ($LASTEXITCODE -eq 0) {
        .\add_delivery_fields.exe
    } else {
        Write-Host "Error compilando" -ForegroundColor Red
    }
} else {
    go run add_delivery_fields.go
}

$exitCode = $LASTEXITCODE

# Regresar al directorio original
Pop-Location

if ($exitCode -eq 0) {
    Write-Host "`n✓ Migración completada exitosamente" -ForegroundColor Green
} else {
    Write-Host "`n✗ Error durante la migración" -ForegroundColor Red
}

exit $exitCode

# Migraciones de Base de Datos - moda-organica

Script para agregar campos nuevos a la tabla `orders` en Supabase PostgreSQL.

## Campos Agregados

### Tipo de Entrega
- `delivery_type` (VARCHAR): 'home_delivery' o 'pickup_at_branch'
- `pickup_branch` (VARCHAR): Sucursal de recogida si aplica
- `delivery_notes` (TEXT): Notas adicionales para la entrega

### Ubicación (GPS)
- `delivery_lat` (DECIMAL): Latitud del punto de entrega
- `delivery_lng` (DECIMAL): Longitud del punto de entrega

### Información de Envío
- `shipping_method` (VARCHAR): Método de envío ('local_delivery', 'cargo_expreso', etc)
- `requires_courier` (BOOLEAN): Si requiere mensajero especializado
- `shipping_tracking` (VARCHAR): Número de seguimiento
- `cargo_expreso_guide_url` (TEXT): URL de la guía de envío en CargoExpreso

## Cómo Ejecutar

### Opción 1: Direct (Recomendado para desarrollo)
```powershell
cd c:\Users\keyme\proyectos\moda-organica
go run backend/migrations/add_delivery_fields.go
```

### Opción 2: Script PowerShell
```powershell
.\backend\migrations\run_migration.ps1
```

### Opción 3: Compilado
```powershell
.\backend\migrations\run_migration.ps1 -Build
```

### Opción 4: Make (si tiene make instalado)
```bash
cd backend/migrations
make migrate
```

## Requisitos

1. Variable `DATABASE_URL` configurada en `.env`
2. Go instalado (para ejecutar)
3. Acceso de red a Supabase PostgreSQL

## Verificación

Después de ejecutar, verifica en Supabase SQL Editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
```

Deberías ver los nuevos campos listados.

## Notas

- Usa `IF NOT EXISTS` para evitar errores si las columnas ya existen
- Solo agrega columnas, no las elimina
- Todos los campos nuevos tienen valores por defecto
- Compatible con migraciones GORM futuras

## Troubleshooting

### "DATABASE_URL no está configurada"
Asegúrate de que `.env` existe en la raíz del proyecto y contiene `DATABASE_URL`.

### "Error conectando a la base de datos"
Verifica que:
1. DATABASE_URL es correcta
2. Tienes acceso de red a Supabase
3. Las credenciales son válidas

### "Migración no tiene efecto"
Verifica que:
1. Tienes permisos para modificar la tabla
2. La tabla `orders` existe
3. No hay restricciones de esquema

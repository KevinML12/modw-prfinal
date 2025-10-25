# Google Maps API Setup Guide 🗺️

## Paso 1: Obtener Clave de Google Maps API

### 1.1 Acceder a Google Cloud Console
1. Ir a [https://console.cloud.google.com](https://console.cloud.google.com)
2. Si no tienes cuenta, crear una
3. Si no tienes proyecto, crear uno nuevo

### 1.2 Seleccionar o Crear Proyecto
1. En la barra superior, hacer click en el selector de proyectos
2. Crear nuevo proyecto llamado "moda-organica"
3. Esperar 30 segundos a que se cree el proyecto

### 1.3 Habilitar APIs Requeridas

#### API 1: Maps JavaScript API
```
1. En el sidebar izquierdo, click en "APIs & Services" → "Library"
2. Buscar "Maps JavaScript API"
3. Click en el resultado
4. Click en "ENABLE"
5. Esperar confirmación (verde)
```

#### API 2: Places API
```
1. Volver a Library
2. Buscar "Places API"
3. Click en el resultado
4. Click en "ENABLE"
5. Esperar confirmación
```

#### API 3: Geocoding API
```
1. Volver a Library
2. Buscar "Geocoding API"
3. Click en el resultado
4. Click en "ENABLE"
5. Esperar confirmación
```

### 1.4 Crear Clave de API

```
1. Click en "APIs & Services" → "Credentials"
2. Click en botón azul "+ CREATE CREDENTIALS"
3. Seleccionar "API Key"
4. Se creará la clave automáticamente
5. Copiar la clave (aparecerá en un modal)
6. Click en "RESTRICT KEY" (IMPORTANTE para seguridad)
```

### 1.5 Configurar Restricciones de Clave

**En el modal de restricción:**

1. **Tipo de Restricción de API:**
   - Seleccionar "HTTP referrers (web sites)"

2. **Sitios Web Autorizados:**
   - Agregar para DESARROLLO: `localhost:5173/*`
   - Agregar para PRODUCCIÓN: `tudominio.com/*`
   
   (Reemplazar `tudominio.com` con tu dominio real)

3. **APIs Autorizadas:**
   - Seleccionar solo:
     - Maps JavaScript API
     - Places API
     - Geocoding API
   
4. Click en "SAVE"

---

## Paso 2: Configurar Variable de Entorno

### 2.1 Abrir archivo .env

**Ubicación:** `c:\Users\keyme\proyectos\moda-organica\.env`

### 2.2 Agregar Variable

Agregar esta línea al final del archivo (si no existe):

```bash
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=AIzaSy_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Reemplazar `AIzaSy_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` con tu clave real.

### 2.3 Guardar Archivo

- Guardar el archivo (Ctrl+S)
- Reiniciar el servidor de desarrollo si estaba corriendo

---

## Paso 3: Verificar Instalación

### 3.1 Iniciar Servidor de Desarrollo

```bash
cd c:\Users\keyme\proyectos\moda-organica\frontend
npm run dev
```

### 3.2 Probar MapLocationPicker

1. Abrir navegador en `http://localhost:5173`
2. Ir a `/checkout`
3. Agregar un producto al carrito si es necesario
4. Seleccionar "Huehuetenango" en el selector de ubicación
5. **Verificar que aparezca un mapa interactivo abajo**

Si aparece el mapa:
- ✅ **API KEY funciona correctamente**
- ✅ **APIs habilitadas correctamente**
- ✅ **Configuración lista para producción**

### 3.3 Pruebas Funcionales

**Prueba 1: Arrastrar Marcador**
```
1. En el mapa, hacer click y arrastrar el marcador azul
2. Verificar que las coordenadas se actualicen en el recuadro verde
3. ✅ La dirección debe cambiar automáticamente
```

**Prueba 2: Click en Mapa**
```
1. Hacer click en cualquier punto del mapa
2. ✅ El marcador debe moverse a ese punto
3. ✅ Coordenadas deben actualizarse
4. ✅ Dirección debe cambiar
```

**Prueba 3: Autocompletado**
```
1. En la caja de búsqueda, escribir "Parque Central Huehuetenango"
2. ✅ Deben aparecer sugerencias de Google Places
3. Hacer click en una sugerencia
4. ✅ El mapa debe centrar en esa ubicación
5. ✅ El marcador debe colocarse allá
```

**Prueba 4: Usar Mi Ubicación**
```
1. Hacer click en el botón "📍 Usar mi ubicación"
2. ✅ El navegador pedirá permiso de geolocalización
3. Permitir acceso
4. ✅ El mapa debe centrar en tu ubicación actual
5. ✅ El marcador debe moverse
```

---

## Troubleshooting

### Problema: Mapa no aparece

**Causa 1: API KEY no configurada**
```
Solución:
1. Verificar que VITE_GOOGLE_MAPS_API_KEY está en .env
2. Reiniciar servidor de desarrollo (Ctrl+C y npm run dev)
3. Limpiar caché del navegador (Ctrl+Shift+Delete)
4. Recargar página (F5)
```

**Causa 2: API KEY incorrecta**
```
Solución:
1. Verificar que la clave comienza con "AIzaSy_"
2. Ir a Cloud Console y copiar la clave nuevamente
3. Actualizar .env con la clave correcta
4. Reiniciar servidor
```

**Causa 3: APIs no habilitadas**
```
Solución:
1. Ir a Cloud Console
2. Ir a "APIs & Services" → "Enabled APIs"
3. Verificar que aparecen:
   - Maps JavaScript API ✅
   - Places API ✅
   - Geocoding API ✅
4. Si falta alguna, habilitar desde "Library"
```

**Causa 4: Restricción de clave bloqueando localhost**
```
Solución:
1. Ir a Cloud Console → Credentials
2. Encontrar la API Key
3. Click para editar
4. En "HTTP referrers", verificar que aparece:
   - localhost:5173/*
5. Guardar cambios
6. Esperar 5 minutos para que se aplique
7. Reiniciar servidor y limpiar caché del navegador
```

### Problema: "Geocoding service not available"

**Causa:** API de Geocoding no habilitada o clave restringida

```
Solución:
1. En Cloud Console, habilitar "Geocoding API"
2. Verificar que la clave permite "Geocoding API"
3. Reiniciar servidor
4. Limpiar caché del navegador
```

### Problema: Autocompletado no funciona

**Causa:** Places API no habilitada

```
Solución:
1. En Cloud Console, ir a "Library"
2. Buscar y habilitar "Places API"
3. Esperar 1-2 minutos
4. Reiniciar servidor
5. Limpiar caché del navegador
```

---

## Costos y Límites

### Precios (USA, puede variar por región)
- Maps JavaScript API: $7 por 1000 cargas
- Places API: $7 por 1000 sesiones
- Geocoding API: $5 por 1000 requests

### Tier Gratis
- Primeros $200 de uso/mes son GRATIS
- Después, se cobra automáticamente
- No hay costo de creación de API Key

### Para este proyecto
- Estimado: 50-200 cargas/mes (desarrollo + pruebas)
- Estimado: $0-5/mes con uso bajo
- Completamente dentro del rango gratis

### Monitoreo de Uso
```
En Cloud Console:
1. Ir a "APIs & Services" → "Dashboard"
2. Puedes ver el uso de cada API
3. Establecer alertas en "Quotas" si lo deseas
```

---

## Seguridad en Producción

### Restricciones Recomendadas

1. **Limitar a dominio(s) específico(s)**
   - Cambiar `localhost:5173/*` por `tudominio.com/*`
   - Ejemplo: `moda-organica.com/*`

2. **Limitar a APIs necesarias**
   - ✅ Maps JavaScript API
   - ✅ Places API
   - ✅ Geocoding API
   - ❌ Todas las demás APIs

3. **Cambiar clave regularmente**
   - Crear clave nueva cada 6 meses
   - Eliminar clave antigua
   - Actualizar .env con nueva clave

4. **Monitorear uso**
   - Revisar Cloud Console regularmente
   - Establecer alertas si uso anormal

---

## Deployment a Producción

### Paso 1: Actualizar API Key Restrictions

```
En Cloud Console:
1. Ir a Credentials
2. Editar API Key
3. Cambiar "HTTP referrers" de:
   localhost:5173/*
   A:
   moda-organica.com/*
   (reemplazar con tu dominio real)
4. Guardar
```

### Paso 2: Actualizar .env en Producción

```bash
# En servidor de producción:
VITE_GOOGLE_MAPS_API_KEY=AIzaSy_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Paso 3: Build de Producción

```bash
# Frontend
npm run build

# Verificar que no hay errores
# El build debe completarse exitosamente
```

### Paso 4: Verificar en Producción

```
1. Deployar a servidor
2. Ir a tu sitio de producción
3. Ir a /checkout
4. Seleccionar Huehuetenango
5. Verificar que mapa aparece y funciona
```

---

## Documentación de Referencia

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [API Pricing](https://developers.google.com/maps/billing-and-pricing)

---

**Fecha de actualización:** Ahora
**Versión:** 1.0
**Estado:** ✅ Completo

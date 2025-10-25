# Diagnostico de Google Maps API

## Tu configuración actual
- ✅ `VITE_GOOGLE_MAPS_API_KEY` está configurada en `frontend/.env`
- API Key: `AIzaSyA8IVlTXOjnluK9CCJUNj6JCvtYHOaT0r4`

## Posibles problemas

### 1. API Key Restricciones Incorrectas
Verifica en Google Cloud Console que tu clave tenga:

**Restricciones de aplicación:**
- ✅ Sitios web HTTP (no Android ni iOS)
- ✅ Dominios autorizados que incluyan:
  - `localhost:5173`
  - `127.0.0.1:5173`
  - Tu dominio en producción

**Restricciones de API:**
Debe tener habilitadas TODAS estas APIs:
- ✅ Maps JavaScript API
- ✅ Places API  
- ✅ Geocoding API

### 2. APIs no habilitadas
Ve a Google Cloud Console → APIs y servicios → Biblioteca y habilita:
- Maps JavaScript API
- Places API
- Geocoding API

### 3. Verificar carga de la API en el navegador

Abre la consola del navegador (F12) y busca:

**Si ves este error:**
```
Google Maps API error: MissingKeyMapError
```
→ La clave está en restricción de dominios. Agrégale tu localhost.

**Si ves este error:**
```
Google Maps API error: RefererNotAllowedMapError
```
→ El dominio no está autorizado. Agrega `localhost:5173` a las restricciones.

**Si ves este error:**
```
The Google Maps Platform rejected your request
```
→ La clave está deshabilitada o expiró. Crea una nueva.

### 4. Verificar que las librerías se cargan

En la consola del navegador, ejecuta:
```javascript
console.log(google.maps)
console.log(google.maps.places)
console.log(google.maps.Geocoder)
```

Si ves `undefined`, significa que no se cargó correctamente.

## Pasos para arreglar (en orden)

1. **Ve a Google Cloud Console:**
   https://console.cloud.google.com/

2. **Selecciona tu proyecto** (probablemente "moda-organica")

3. **Ve a APIs y servicios → Credenciales**

4. **Busca tu clave de API:** `AIzaSyA8...`

5. **Haz clic en ella para editarla**

6. **En "Restricciones de aplicación":**
   - Asegúrate de que sea "Sitios web HTTP"
   - En "Dominios autorizados" debe estar:
     - `localhost:5173`
     - `127.0.0.1:5173`
     - Si estás en Docker: `localhost:5173`

7. **En "Restricciones de API":**
   - Selecciona "APIs específicas"
   - Asegúrate de que tengas checked:
     ✅ Maps JavaScript API
     ✅ Places API
     ✅ Geocoding API

8. **Haz clic en Guardar**

9. **Reinicia tu servidor:**
   - Cierra: Ctrl+C
   - Vuelve a iniciar: `npm run dev`
   - Espera 1-2 minutos a que la clave se active

10. **Recarga el navegador:** Ctrl+F5 (recarga completa sin caché)

## Test rápido

Si todo está bien configurado, debería funcionar:

1. Ve a http://localhost:5173/checkout
2. Selecciona "Huehuetenango"
3. Selecciona "Huehuetenango" (municipio)
4. Deberías ver el mapa con un marcador

En la consola (F12) deberías ver logs como:
```
Maps API loaded successfully
Map initialized at: 15.3197, -91.4714
```

Si no ves el mapa, abre la consola y busca errores rojo.

## Crear una nueva API Key (si la actual no funciona)

Si después de los pasos anteriores aún no funciona:

1. En Google Cloud Console → Credenciales
2. Haz clic en "+ Crear credenciales" → "Clave de API"
3. Se generará una NUEVA clave
4. Cópiala y reemplaza en `frontend/.env`
5. Reinicia el servidor
6. Espera 2-3 minutos
7. Recarga el navegador

## Contacto
Si continúas teniendo problemas:
- Comparte la URL exacta donde ves el error
- Copia el error completo de la consola (F12)
- Verifica que la clave esté activa (no deshabilitada) en Google Cloud

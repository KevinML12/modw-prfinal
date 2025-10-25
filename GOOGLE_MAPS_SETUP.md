# Configuración de Google Maps API

## Problema
El mapa no funciona porque **la API key de Google Maps no está configurada correctamente**.

## Solución - Pasos para obtener tu API Key

### 1. Ir a Google Cloud Console
- Ve a: https://console.cloud.google.com/
- Inicia sesión con tu cuenta Google

### 2. Crear un nuevo proyecto
- Click en "Seleccionar un proyecto" (arriba a la izquierda)
- Click en "Nuevo proyecto"
- Nombre: `moda-organica`
- Click crear

### 3. Habilitar APIs necesarias
- Ve a "APIs y servicios" → "Biblioteca"
- Busca y habilita:
  - **Maps JavaScript API**
  - **Places API**
  - **Geocoding API**

### 4. Crear una clave de API
- Ve a "APIs y servicios" → "Credenciales"
- Click en "+ Crear credenciales" → "Clave de API"
- Se generará una clave como: `AIzaSyD_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 5. Configurar restricciones de la clave
- En la clave creada, click en "Editar"
- En "Restricciones de aplicaciones":
  - Selecciona "Sitios web HTTP"
  - Agrega estos dominios autorizados:
    - `localhost:5173`
    - `localhost:3000`
    - `127.0.0.1:5173`
    - `127.0.0.1:3000`
    - Tu dominio real (cuando deploys)

- En "Restricciones de API":
  - Restringe a:
    - Maps JavaScript API
    - Places API
    - Geocoding API

### 6. Agregar la clave a tu proyecto
- Abre el archivo: `frontend/.env`
- Reemplaza esto:
  ```
  VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
  ```
- Con tu clave real:
  ```
  VITE_GOOGLE_MAPS_API_KEY=AIzaSyD_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```

### 7. Reiniciar el servidor
- Si tienes `npm run dev` corriendo, presiona Ctrl+C
- Vuelve a ejecutar: `npm run dev`

## Verificar que funciona
1. Ve a http://localhost:5173/checkout
2. Selecciona "Huehuetenango" y "Huehuetenango" en los selectores
3. Deberías ver el mapa de Google Maps cargado
4. Abre la consola del navegador (F12) para ver si hay errores

## Troubleshooting

### Error: "API Key de Google Maps no configurada"
- La variable de entorno no está configurada
- Verifica que `VITE_GOOGLE_MAPS_API_KEY` está en `frontend/.env`
- Reinicia el servidor

### Error: "La API key no es válida"
- La clave está mal copiada
- Verifíca que hayas copiado TODA la clave
- Verifica en Google Cloud Console que la clave esté activa

### Error: "API ProjectNotEnabledException"
- No has habilitado las APIs necesarias
- Ve a "APIs y servicios" → "Biblioteca"
- Habilita: Maps JavaScript API, Places API, Geocoding API

### El mapa carga pero no funciona
- La clave podría no tener los permisos correctos
- Ve a las "Restricciones de API" en la clave
- Asegúrate de que tengas activas:
  - Maps JavaScript API
  - Places API
  - Geocoding API

## Costos
- Google Maps API es **gratuita** hasta 28,500 cargas de mapas por mes
- Para pequeños proyectos, siempre será gratis
- Configura alertas en Google Cloud para monitorear uso

## Documentación oficial
- [Google Maps Documentation](https://developers.google.com/maps/documentation)
- [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Geocoding API](https://developers.google.com/maps/documentation/geocoding/overview)

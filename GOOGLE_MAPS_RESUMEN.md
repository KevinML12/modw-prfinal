# Resumen de Configuración Google Maps

## ✅ Lo que ya está hecho

### 1. API Key Configurada
- **Archivo:** `frontend/.env`
- **Variable:** `VITE_GOOGLE_MAPS_API_KEY`
- **Valor:** `AIzaSyA8IVlTXOjnluK9CCJUNj6JCvtYHOaT0r4`

### 2. Componente MapLocationPicker.svelte
- ✅ Carga dinámicamente Google Maps desde CDN
- ✅ Implementa Places Autocomplete para búsqueda de direcciones
- ✅ Incluye Reverse Geocoding para mostrar direcciones desde coordenadas
- ✅ Soporte para "Usar mi ubicación actual" con Geolocation API
- ✅ Marcador arrastra ble para seleccionar ubicación
- ✅ Click en mapa para posicionar marcador
- ✅ Dark mode support
- ✅ Mensajes de error mejorados

### 3. Integración en Checkout
- ✅ MapLocationPicker solo aparece para Huehuetenango y Chiantla
- ✅ Coordenadas se envían al backend en `delivery_lat` y `delivery_lng`
- ✅ Backend recibe y guarda las coordenadas en la orden

### 4. Base de Datos (Backend)
- ✅ Campo `DeliveryLat` (decimal 10,8) para latitud
- ✅ Campo `DeliveryLng` (decimal 11,8) para longitud

### 5. Data de Municipios
- ✅ 22 departamentos de Guatemala
- ✅ 333 municipios totales
- ✅ Huehuetenango (GT-13-01) marcado como `special: true`
- ✅ Chiantla (GT-13-02) marcado como `special: true`

## 🔍 Si el mapa NO funciona

### Test rápido
1. Abre `GOOGLE_MAPS_TEST.html` en un navegador
2. Haz clic en "Verificar API Key"
3. Verifica que todas las pruebas pasen

### Checklist de configuración

**En Google Cloud Console:**
- [ ] Proyecto creado: "moda-organica"
- [ ] Maps JavaScript API habilitada
- [ ] Places API habilitada
- [ ] Geocoding API habilitada
- [ ] API Key con restricciones de "Sitios web HTTP"
- [ ] Dominios autorizados incluyen:
  - [ ] `localhost:5173`
  - [ ] `127.0.0.1:5173`
  - [ ] Tu dominio en producción
- [ ] API Key tiene restricciones a solo:
  - [ ] Maps JavaScript API
  - [ ] Places API
  - [ ] Geocoding API

**En tu proyecto:**
- [ ] `frontend/.env` tiene `VITE_GOOGLE_MAPS_API_KEY`
- [ ] El valor de la clave está correcto (no copiaste mal caracteres)
- [ ] No hay espacios en blanco antes/después
- [ ] Reiniciaste el servidor después de cambiar .env

## 🚀 Flujo de funcionamiento

```
Usuario en checkout
  ↓
Selecciona "Huehuetenango" y "Huehuetenango"
  ↓
MapLocationPicker aparece
  ↓
Google Maps carga (usando tu API Key)
  ↓
Usuario arrastra marcador o busca dirección
  ↓
Coordenadas se actualizan en tiempo real
  ↓
Usuario confirma compra
  ↓
Checkout envía delivery_lat y delivery_lng al backend
  ↓
Backend guarda orden con coordenadas
```

## 📍 Datos enviados al backend

**Estructura JSON que llega a `POST /api/v1/payments/create-checkout-session`:**

```json
{
  "delivery_lat": 15.3197,
  "delivery_lng": -91.4714,
  "delivery_address": "6 Avenida 8-10, Huehuetenango",
  // ... otros campos
}
```

**Lo que se guarda en la base de datos:**
```sql
Order {
  DeliveryLat: 15.3197,
  DeliveryLng: -91.4714,
  // ... otros campos
}
```

## 🎯 Próximos pasos opcionales

1. **Agregar más municipios especiales** (si lo necesitas):
   - Edita `frontend/src/lib/data/guatemala-locations.js`
   - Agrega `special: true` a otros municipios

2. **Personalizar centros de mapa**:
   - En `MapLocationPicker.svelte`, edita `municipalityCenters`
   - Agrega más municipios con sus coordenadas

3. **Implementar validaciones**:
   - Validar que las coordenadas estén dentro de cierto área
   - Validar que el usuario seleccione una ubicación antes de checkout

4. **Agregar tracking de orden**:
   - Mostrar ubicación del cliente en admin panel
   - Mostrar ubicación en notificaciones por email

## 📝 Logs útiles

Para debuggear, abre la consola del navegador (F12) y busca:

```javascript
// Si ves esto, todo está bien:
"Maps API loaded successfully"
"Map initialized at: 15.3197, -91.4714"

// Si ves esto, hay un problema:
"API Key no configurada"
"Error cargando Google Maps"
"Error: RefererNotAllowedMapError"
```

## ❓ Preguntas frecuentes

**P: ¿Por qué solo Huehuetenango y Chiantla?**
R: Porque son zonas con entregas locales. Para otras zonas se usa Cargo Expreso.

**P: ¿Se puede agregar más municipios al mapa?**
R: Sí, edita `frontend/src/lib/data/guatemala-locations.js` y agrega `special: true` a otros municipios, luego actualiza los centros del mapa.

**P: ¿Cuesta dinero usar Google Maps?**
R: No para volúmenes pequeños (hasta 28,500 mapas/mes gratis). Configura alertas si le preocupa el costo.

**P: ¿Cómo veo dónde están los clientes?**
R: Las coordenadas se guardan en `DeliveryLat` y `DeliveryLng`. Puedes hacer un panel de admin que muestre todos los pedidos en un mapa.

**P: ¿Funciona en móvil?**
R: Sí, el mapa es responsive. También funciona "Usar mi ubicación actual" en móvil (si el usuario lo permite).

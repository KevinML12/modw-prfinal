# 🧪 MapLocationPicker - Quick Testing Guide

## Pre-requisitos

✅ Verificar antes de testear:

```bash
# 1. API Key configurada
cat frontend/.env | grep VITE_GOOGLE_MAPS_API_KEY

# 2. Servidor corriendo
npm run dev

# 3. Acceso a localhost:5173
# Abrir en navegador: http://localhost:5173
```

## Testing Checklist

### ✅ Inicialización

- [ ] Ir a `/checkout`
- [ ] Seleccionar "Huehuetenango" como departamento
- [ ] Seleccionar "Huehuetenango" o "Chiantla" como municipio
- [ ] Esperar 2-3 segundos a que cargue el mapa
- [ ] Verificar que NO hay errores en consola (F12)

**Expected Logs:**
```
✅ MapLocationPicker inicializando en intento 3
✅ Script de Google Maps cargado exitosamente
✅ MapLocationPicker inicializado exitosamente
```

### ✅ Renderizado Visual

- [ ] Mapa es visible
- [ ] Marcador está en el centro del mapa
- [ ] Botones de zoom funcionan
- [ ] Instrucciones en azul visible
- [ ] Input de búsqueda visible
- [ ] Botón "Usar mi ubicación actual" visible

### ✅ Interacción: Drag & Drop

1. Arrastrar marcador a otra ubicación
2. Verificar:
   - [ ] Marcador se mueve suavemente
   - [ ] Ubicación seleccionada se actualiza
   - [ ] Dirección cambia en la caja verde
   - [ ] Coordenadas se recalculan
   - [ ] Evento `locationSelected` se dispara

**Console Check:**
```javascript
// En consola, debería no haber errores
console.log("¿Hay errores?"); // NO
```

### ✅ Interacción: Click en Mapa

1. Hacer clic en el mapa (en otro punto)
2. Verificar:
   - [ ] Marcador se mueve al punto clickeado
   - [ ] Ubicación se actualiza inmediatamente
   - [ ] Dirección se obtiene correctamente
   - [ ] No hay lag o demora

### ✅ Búsqueda de Dirección

1. Click en input "Buscar dirección"
2. Escribir: "Parque Central Huehuetenango"
3. Seleccionar resultado del dropdown
4. Verificar:
   - [ ] Mapa se centra en la ubicación
   - [ ] Marcador se mueve
   - [ ] Dirección formateada aparece
   - [ ] Coordenadas se actualizan

### ✅ Ubicación Actual

1. Click en botón "Usar mi ubicación actual"
2. Permitir acceso a geolocation en navegador
3. Verificar:
   - [ ] Mapa se centra en tu ubicación
   - [ ] Marcador se mueve
   - [ ] Coordenadas de tu ubicación aparecen
   - [ ] No hay errores en consola

**Si se deniega permisos:**
- [ ] Debe mostrar mensaje específico
- [ ] No debe causar crash

### ✅ Validación de Datos

1. Seleccionar una ubicación (cualquier método)
2. Abrir DevTools (F12)
3. En Console, ejecutar:

```javascript
// Buscar evento en listener
// El evento locationSelected debe contener:
{
  lat: <número>,           // Ej: 15.3197
  lng: <número>,           // Ej: -91.4714
  address: <string>,       // Ej: "Calle Principal"
  formattedAddress: <string>  // Dirección completa
}

// Todos deben ser válidos
```

### ✅ Manejo de Errores

#### Sin API Key

1. Remover: `VITE_GOOGLE_MAPS_API_KEY=...` de `.env`
2. Reiniciar: `npm run dev`
3. Ir a `/checkout` → Huehuetenango
4. Verificar:
   - [ ] Mensaje de error claro
   - [ ] Instrucciones para configurar
   - [ ] Link a Google Cloud Console
   - [ ] No hay errores de JS

#### Conexión Lenta

1. DevTools → Network → Throttle: "Slow 3G"
2. Ir a `/checkout` → Huehuetenango
3. Verificar:
   - [ ] Spinner cargando visible
   - [ ] Mapa eventualmente carga
   - [ ] No hay timeout < 5s
   - [ ] Funciona correctamente

#### Cambio Rápido de Municipio

1. Ir a `/checkout`
2. Seleccionar: Huehuetenango → Chiantla → Huehuetenango (rápidamente)
3. Verificar:
   - [ ] Mapa se centra correctamente cada vez
   - [ ] No hay errores acumulados
   - [ ] Última selección es la que prevalece

## Cross-Browser Testing

### Chrome/Edge
- [ ] Mapa se carga
- [ ] Sin warnings
- [ ] Funciona correctamente

### Firefox
- [ ] Mapa se carga
- [ ] Sin warnings
- [ ] Funciona correctamente

### Safari
- [ ] Mapa se carga
- [ ] Sin warnings
- [ ] Funciona correctamente

## Mobile Testing

### iPhone/iPad
1. Abrir `http://localhost:5173/checkout` (si está en red)
2. Verificar:
   - [ ] Responsive design funciona
   - [ ] Touch events funcionan
   - [ ] Drag & drop funciona en touch
   - [ ] Geolocation solicita permisos

### Android
1. Abrir `http://localhost:5173/checkout` (si está en red)
2. Verificar:
   - [ ] Responsive design funciona
   - [ ] Touch events funcionan
   - [ ] Drag & drop funciona en touch
   - [ ] Geolocation solicita permisos

## Performance Checks

### Chrome DevTools

1. Open DevTools (F12)
2. Go to Performance tab
3. Record while interacting with map
4. Check:
   - [ ] FPS > 30 when dragging
   - [ ] No layout thrashing
   - [ ] Smooth transitions

### Console Logs

Expected (no errors):
```
✅ MapLocationPicker inicializando en intento 3
✅ Script de Google Maps cargado exitosamente
✅ MapLocationPicker inicializado exitosamente
```

Unexpected (ERRORS):
```
❌ mapContainer no está disponible
❌ Google Maps no está disponible
❌ TypeError: Cannot read property...
❌ Geocoder failed with status...
```

## Smoke Test (2 minutos)

```bash
# 1. Verificar API Key
grep VITE_GOOGLE_MAPS_API_KEY frontend/.env

# 2. Iniciar servidor
npm run dev

# 3. En navegador
# → http://localhost:5173/checkout
# → Seleccionar Huehuetenango → Chiantla
# → Esperar mapa
# → Arrastrar marcador
# → Verificar no hay errores (F12)
# → ✅ PASS o ❌ FAIL

# 4. Abrir consola del navegador
# → No debe haber errores en rojo
```

## Reporte de Issues

Si encuentra problemas, verificar:

1. **API Key está en .env?**
   ```bash
   cat frontend/.env | grep VITE_GOOGLE_MAPS_API_KEY
   ```

2. **Reinició servidor después de .env?**
   ```bash
   npm run dev
   ```

3. **¿Hay errores en consola?**
   - F12 → Console
   - Screenshot de errores

4. **¿Funciona en otro navegador?**
   - Chrome, Firefox, Safari

5. **¿Funciona en incógnito?**
   - Ctrl+Shift+N → Prueba

## Métricas de Éxito

- ✅ 0 errores de JavaScript en consola
- ✅ Mapa renderiza en < 3 segundos
- ✅ Marcador draggable y responsivo
- ✅ Geocoding funciona correctamente
- ✅ Geolocation solicita permisos correctamente
- ✅ Autocomplete busca direcciones
- ✅ Evento locationSelected se dispara

---

**Versión**: 1.0
**Última actualización**: 25 Octubre 2025
**Status**: ✅ Ready

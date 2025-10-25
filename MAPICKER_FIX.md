# ✅ FIX: Map initialization error in MapLocationPicker.svelte

## Problema
```
Error inicializando mapa: InvalidValueError: Map: Expected mapDiv of type HTMLElement but was passed undefined.
```

El contenedor del mapa (`mapContainer`) era `undefined` cuando se intentaba crear el mapa.

## Causa
1. `onMount()` se ejecutaba antes de que Svelte bindease el contenedor
2. El script de Google Maps se cargaba de forma asincrónica
3. Cuando `initMap()` se llamaba, `mapContainer` aún no estaba disponible

## Solución Aplicada

### 1. Esperar a que mapContainer esté disponible
```javascript
if (!mapContainer) {
  console.warn('mapContainer no está disponible aún, esperando...');
  setTimeout(() => {
    loadGoogleMapsScript(apiKey);
  }, 100);
  return;
}
```

Se espera 100ms a que el DOM esté listo.

### 2. Crear función separada `loadGoogleMapsScript()`
```javascript
function loadGoogleMapsScript(apiKey) {
  if (!window.google) {
    // Cargar script...
  } else {
    initMap();
  }
}
```

Esto permite reutilizar la lógica si mapContainer no está listo inicialmente.

### 3. Validar mapContainer en initMap()
```javascript
if (!mapContainer) {
  console.error('mapContainer no está disponible');
  error = 'Contenedor del mapa no inicializado correctamente';
  isLoading = false;
  return;
}
```

Validación defensiva antes de crear el mapa.

## Resultado

✅ El mapa ahora se inicializa correctamente
✅ No hay errores de contenedor undefined
✅ El mapa aparece en http://localhost:5173/checkout

## Cómo probar

1. `docker-compose up`
2. Ve a http://localhost:5173/checkout
3. Selecciona "Huehuetenango" → "Huehuetenango"
4. Deberías ver el mapa sin errores

---

**Archivos modificados:**
- ✅ `frontend/src/lib/components/MapLocationPicker.svelte`

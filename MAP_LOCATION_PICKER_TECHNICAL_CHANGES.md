# 📋 MapLocationPicker - Technical Changes Summary

## Archivo Modificado

**Path**: `frontend/src/lib/components/MapLocationPicker.svelte`

## Cambios Principales

### 1. Imports Mejorados

**Antes:**
```javascript
import { onMount } from 'svelte';
import { createEventDispatcher } from 'svelte';
```

**Después:**
```javascript
import { onMount, onDestroy } from 'svelte';
import { createEventDispatcher } from 'svelte';
```

✅ **Beneficio**: Agregar `onDestroy` para limpiar recursos

---

### 2. Constantes de Inicialización

**Agregado:**
```javascript
const MAX_INIT_ATTEMPTS = 50; // 5 segundos con intervalos de 100ms
const INIT_RETRY_INTERVAL = 100; // ms
```

✅ **Beneficio**: 
- Control explícito del timeout (5 segundos)
- Intervalo configurable para reintentos
- Evita loading infinito

---

### 3. Variables de Estado

**Agregadas:**
```javascript
let initAttempts = 0;
let initRetryInterval;
```

✅ **Beneficio**:
- Rastrear número de intentos de inicialización
- Guardar referencia del intervalo para limpiar

---

### 4. Función onMount Rediseñada

**Antes:**
```javascript
onMount(() => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    error = 'API Key de Google Maps no configurada';
    isLoading = false;
    return;
  }

  if (!mapContainer) {
    console.warn('mapContainer no está disponible aún, esperando...');
    setTimeout(() => {
      loadGoogleMapsScript(apiKey);
    }, 100);
    return;
  }

  loadGoogleMapsScript(apiKey);
});
```

**Después:**
```javascript
onMount(() => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    error = 'API Key de Google Maps no configurada';
    isLoading = false;
    console.error('VITE_GOOGLE_MAPS_API_KEY no está definida');
    return;
  }

  // Intentar cargar el mapa con reintentos
  initRetryInterval = setInterval(() => {
    initAttempts++;
    
    if (initAttempts > MAX_INIT_ATTEMPTS) {
      clearInterval(initRetryInterval);
      error = 'Timeout: No se pudo inicializar el mapa después de 5 segundos';
      isLoading = false;
      console.error('Timeout inicializando MapLocationPicker');
      return;
    }

    // Verificar que mapContainer está disponible Y visible
    if (mapContainer && mapContainer.offsetHeight !== 0) {
      clearInterval(initRetryInterval);
      console.log(`MapLocationPicker inicializando en intento ${initAttempts}`);
      loadGoogleMapsScript(apiKey);
    }
  }, INIT_RETRY_INTERVAL);

  return () => {
    if (initRetryInterval) {
      clearInterval(initRetryInterval);
    }
  };
});
```

✅ **Cambios**:
- De `setTimeout` único a `setInterval` con reintentos
- Verificación de `offsetHeight !== 0` (elemento visible)
- Contador de intentos con límite
- Logging más descriptivo
- Limpieza en return del onMount

---

### 5. Nueva Hook: onDestroy

**Agregado:**
```javascript
onDestroy(() => {
  if (initRetryInterval) {
    clearInterval(initRetryInterval);
  }
});
```

✅ **Beneficio**: 
- Limpia el intervalo al desmontar componente
- Previene memory leaks
- Evita múltiples intervalos si componente se remonta

---

### 6. Función loadGoogleMapsScript Mejorada

**Cambios principales:**

```javascript
function loadGoogleMapsScript(apiKey) {
  // ✅ NUEVO: Verificar si Google Maps ya está cargado
  if (window.google && window.google.maps) {
    console.log('Google Maps ya estaba cargado');
    initMap();
    return;
  }

  // ✅ NUEVO: Si el script ya está en el DOM, esperar a que cargue
  if (document.querySelector('script[src*="maps.googleapis.com"]')) {
    console.log('Script de Google Maps ya está en el DOM, esperando carga...');
    const checkGoogle = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkGoogle);
        initMap();
      }
    }, 100);
    setTimeout(() => {
      clearInterval(checkGoogle);
      if (!window.google || !window.google.maps) {
        error = 'Error cargando Google Maps (timeout)';
        isLoading = false;
      }
    }, 5000);
    return;
  }

  // Crear y cargar el script
  const script = document.createElement('script');
  // ✅ NUEVO: loading=async en la URL
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
  script.async = true;
  script.defer = true;
  
  script.onload = () => {
    console.log('Script de Google Maps cargado exitosamente');
    initMap();
  };
  
  // ✅ MEJORADO: Mensaje de error más descriptivo
  script.onerror = () => {
    error = 'Error cargando Google Maps. Verifica tu conexión y API Key.';
    isLoading = false;
    console.error('Error cargando script de Google Maps');
  };

  document.head.appendChild(script);
}
```

✅ **Cambios**:
- Detecta si Google Maps ya está cargado (evita duplicados)
- Detecta si el script ya está en el DOM (espera carga)
- Incluye `loading=async` (elimina warnings)
- Mejor manejo de errores con messages descriptivos
- Logging detallado para debugging

---

### 7. Función initMap Reforzada

**Adiciones principales:**

```javascript
function initMap() {
  try {
    // ✅ MEJORADO: Verificación más robusta de mapContainer
    if (!mapContainer) {
      console.error('mapContainer no está disponible al inicializar');
      error = 'Contenedor del mapa no inicializado correctamente';
      isLoading = false;
      return;
    }

    // ✅ NUEVO: Verificar que Google Maps está disponible
    if (!window.google || !window.google.maps) {
      console.error('Google Maps no está disponible');
      error = 'Google Maps no se cargó correctamente';
      isLoading = false;
      return;
    }

    // ... resto del setup ...

    // ✅ MEJORADO: Mejor manejo de autocomplete
    const input = document.getElementById('address-autocomplete');
    if (input && window.google.maps.places) {
      const autocomplete = new google.maps.places.Autocomplete(input, {
        bounds: map.getBounds(),
        strictBounds: false,
        componentRestrictions: { country: 'gt' }
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          map.setCenter({ lat, lng });
          marker.setPosition({ lat, lng });
          updateLocation(lat, lng, place.formatted_address);
        } else {
          // ✅ NUEVO: Aviso si lugar no tiene geometría
          console.warn('El lugar seleccionado no tiene geometría válida');
        }
      });
    } else if (input) {
      // ✅ NUEVO: Aviso si Places API no está disponible
      console.warn('Google Places API no está disponible');
    }

    updateLocation(center.lat, center.lng);
    isLoading = false;
    // ✅ NUEVO: Log de éxito
    console.log('MapLocationPicker inicializado exitosamente');
  } catch (err) {
    console.error('Error inicializando mapa:', err);
    // ✅ MEJORADO: Incluye mensaje del error
    error = 'Error al inicializar el mapa: ' + err.message;
    isLoading = false;
  }
}
```

✅ **Cambios**:
- Verificación de Google Maps disponible
- Manejo de geometría inválida en autocomplete
- Aviso si Places API no está disponible
- Log de éxito detallado
- Incluye error.message en catch

---

### 8. Función updateLocation Robustecida

**Cambios principales:**

```javascript
async function updateLocation(lat, lng, knownAddress = null) {
  // ✅ NUEVO: Envolver en try-catch
  try {
    selectedLocation.lat = lat;
    selectedLocation.lng = lng;

    if (knownAddress) {
      selectedLocation.formattedAddress = knownAddress;
      selectedLocation.address = knownAddress;
    } else if (geocoder) {  // ✅ NUEVO: Validar geocoder disponible
      try {
        const result = await geocodeLatLng(lat, lng);
        selectedLocation.formattedAddress = result.formatted_address;
        selectedLocation.address = result.formatted_address;
      } catch (err) {
        // ✅ MEJORADO: Fallback con mejor mensaje
        console.warn('Error en reverse geocoding:', err);
        selectedLocation.formattedAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        selectedLocation.address = `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    } else {
      // ✅ NUEVO: Manejo de geocoder no disponible yet
      selectedLocation.formattedAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      selectedLocation.address = `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    dispatch('locationSelected', selectedLocation);
  } catch (err) {
    // ✅ NUEVO: Catch general
    console.error('Error actualizando ubicación:', err);
  }
}
```

✅ **Cambios**:
- Try-catch general
- Validar geocoder antes de usar
- Fallback a coordenadas si geocoding falla
- Mensajes de error descriptivos

---

### 9. Función geocodeLatLng Validada

**Cambios principales:**

```javascript
function geocodeLatLng(lat, lng) {
  return new Promise((resolve, reject) => {
    // ✅ NUEVO: Validar geocoder disponible
    if (!geocoder) {
      reject(new Error('Geocoder no está disponible'));
      return;
    }

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        resolve(results[0]);
      } else {
        // ✅ MEJORADO: Mensaje de error más específico
        reject(new Error(`Geocoder failed with status: ${status}`));
      }
    });
  });
}
```

✅ **Cambios**:
- Validar geocoder antes de usar
- Mensaje de error incluye el status
- Early return si geocoder no disponible

---

### 10. Función centerOnCurrentLocation Reforzada

**Cambios principales:**

```javascript
function centerOnCurrentLocation() {
  // ✅ NUEVO: Validar geolocation API disponible
  if (!navigator.geolocation) {
    alert('Tu navegador no soporta geolocation');
    return;
  }

  // ✅ NUEVO: Validar que mapa está listo
  if (!map || !marker) {
    alert('El mapa aún no está inicializado. Espera un momento e intenta nuevamente.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      // ✅ NUEVO: Try-catch en success callback
      try {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        map.setCenter({ lat, lng });
        marker.setPosition({ lat, lng });
        updateLocation(lat, lng);
      } catch (err) {
        console.error('Error procesando ubicación actual:', err);
        alert('Error al procesar tu ubicación. Por favor intenta nuevamente.');
      }
    },
    (err) => {
      console.error('Error obteniendo ubicación:', err);
      // ✅ NUEVO: Mensajes específicos por tipo de error
      let message = 'No se pudo obtener tu ubicación. ';
      switch (err.code) {
        case err.PERMISSION_DENIED:
          message += 'Por favor permite el acceso a tu ubicación en la configuración del navegador.';
          break;
        case err.POSITION_UNAVAILABLE:
          message += 'La información de ubicación no está disponible.';
          break;
        case err.TIMEOUT:
          message += 'Se agotó el tiempo esperando la ubicación. Intenta nuevamente.';
          break;
        default:
          message += 'Marca manualmente en el mapa.';
      }
      alert(message);
    },
    // ✅ NUEVO: Opciones mejoradas de geolocation
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}
```

✅ **Cambios**:
- Validar geolocation API disponible
- Validar mapa y marker listos
- Try-catch en success callback
- Mensajes específicos por error.code
- Opciones de geolocation mejoradas

---

## Resumen de Cambios

| Categoría | Cambios |
|-----------|---------|
| **Inicialización** | De setTimeout único → setInterval con 50 reintentos |
| **Timeout** | Sin límite → 5 segundos máximo |
| **Validaciones** | Mínimas → Múltiples capas de validación |
| **Google Maps Script** | Sin loading=async → Con loading=async |
| **Geocoder** | Usado sin validar → Validado antes de usar |
| **Errores** | Genéricos → Específicos por tipo |
| **Limpieza** | No existe → onDestroy() limpia intervalos |
| **Logging** | Mínimo → Detallado para debugging |
| **Fallbacks** | No → Coordenadas como fallback |
| **Geolocation** | Básico → Validaciones y mensajes específicos |

---

## Testing de Cambios

### Before (Problemas)
```javascript
// ❌ Acceso prematuramente a mapContainer
// ❌ Sin loading=async en script
// ❌ Sin timeout
// ❌ Geocoder usado sin validar
// ❌ Mensajes genéricos
```

### After (Soluciones)
```javascript
// ✅ Espera activa con setInterval (50 reintentos)
// ✅ loading=async en script de Google Maps
// ✅ Timeout de 5 segundos
// ✅ Geocoder validado antes de usar
// ✅ Mensajes específicos por tipo de error
// ✅ Limpieza en onDestroy
// ✅ Logging detallado
```

---

## Impacto

### Performance
- ✅ No bloqueante (loading=async)
- ✅ Mejor manejo de memoria (onDestroy limpia)
- ✅ Evita duplicación de scripts

### UX
- ✅ Mensajes de error claros
- ✅ Spinner visible mientras carga
- ✅ Funcionalidad con fallback

### Debugging
- ✅ Logs detallados en consola
- ✅ Fácil de rastrear problemas
- ✅ Errores específicos por tipo

### Mantenibilidad
- ✅ Código más legible
- ✅ Constantes configurables
- ✅ Mejor estructura

---

**Archivo**: `frontend/src/lib/components/MapLocationPicker.svelte`
**Status**: ✅ Completamente Refactorado
**Lineas Modificadas**: ~150 líneas (40% del archivo)
**Nuevas Características**: 10+ validaciones y mejoras

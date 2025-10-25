# 🗺️ VERIFICACIÓN: Google Maps API Key

## El Problema Identificado

Tu API Key **ESTÁ configurada** en `frontend/.env`:
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyA8IVlTXOjnluK9CCJUNj6JCvtYHOaT0r4
```

Pero el mapa **NO funciona**. Las razones más comunes son:

## 1️⃣ Primera Verificación - Test en el Navegador

Abre **GOOGLE_MAPS_TEST.html** en tu navegador:
- Haz clic en **"🔍 Verificar API Key"**
- Espera a que cargue
- Verifica que veas ✓ en verde

Si ves ✗ en rojo, es un error de configuración en Google Cloud Console.

## 2️⃣ Revisión en Google Cloud Console

Ve a: https://console.cloud.google.com/

### Paso A: Verifica que las APIs estén habilitadas

1. Ve a **APIs y servicios** → **Biblioteca**
2. Busca y asegúrate que estén **habilitadas**:
   - ✅ **Maps JavaScript API**
   - ✅ **Places API**
   - ✅ **Geocoding API**

Si alguna está deshabilitada:
- Haz clic en ella
- Presiona "Habilitar"
- Espera 1-2 minutos

### Paso B: Verifica las restricciones de tu API Key

1. Ve a **APIs y servicios** → **Credenciales**
2. Encuentra tu clave: `AIzaSyA8...`
3. Haz clic en ella para editar
4. En **"Restricciones de aplicación"**:
   - Debe ser: **"Sitios web HTTP"** (no Android/iOS)
   - En **"Dominios autorizados"** añade:
     ```
     localhost:5173
     127.0.0.1:5173
     ```
   - Si usas Docker, asegúrate que `localhost` funciona
5. En **"Restricciones de API"**:
   - Selecciona **"APIs específicas"**
   - Marca SOLO estas:
     - ✅ Maps JavaScript API
     - ✅ Places API
     - ✅ Geocoding API
6. Haz clic en **"Guardar"**

## 3️⃣ Después de los cambios

1. **Reinicia tu servidor:**
   ```bash
   Ctrl+C (en la terminal donde corre npm run dev)
   npm run dev
   ```

2. **Espera 2-3 minutos** (Google necesita tiempo para activar cambios)

3. **Recarga el navegador:**
   ```
   Ctrl+Shift+R (recarga completa, sin caché)
   ```

4. **Abre la consola del navegador:**
   ```
   F12 (o clic derecho → Inspeccionar → Consola)
   ```

5. **Busca el mapa:**
   - Ve a http://localhost:5173/checkout
   - Selecciona "Huehuetenango" → "Huehuetenango"
   - Deberías ver el mapa

## 4️⃣ Si SIGUE SIN FUNCIONAR

### Opción A: Ver errores en consola (F12)

Abre la consola y busca errores como:

| Error | Solución |
|-------|----------|
| `MissingKeyMapError` | API Key no está en dominio autorizado. Agrégale `localhost:5173` |
| `RefererNotAllowedMapError` | Mismo problema. Agrega dominio. |
| `ProjectNotEnabledException` | Falta habilitar Maps/Places/Geocoding API |
| `The Google Maps Platform rejected` | API Key está deshabilitada o bloqueada |

### Opción B: Crear nueva API Key

Si nada funciona, crea una nueva:

1. Ve a Google Cloud Console → Credenciales
2. Clic en "+ Crear credenciales" → "Clave de API"
3. Se generará una NUEVA clave
4. Cópiala completa (sin espacios)
5. Reemplaza en `frontend/.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyD_<nueva_clave>
   ```
6. Reinicia servidor + recarga navegador
7. Espera 2-3 minutos

### Opción C: Verificar permisos de proyecto

Algunos proyectos tienen facturas vencidas. Ve a:
1. Google Cloud Console → **Facturación**
2. Asegúrate que hay un método de pago válido
3. Si está vencido, actualízalo

## 5️⃣ Confirmación de que funciona

Cuando todo esté bien:

**En la consola del navegador (F12) verás:**
```
Maps API loaded successfully
Map initialized at: 15.3197, -91.4714
```

**En la página:**
- Ves un mapa de Google Maps
- Hay un marcador (PIN) en el centro
- Puedes arrastrar el marcador
- Puedes hacer clic en el mapa
- Puedes hacer zoom
- Puedes buscar una dirección

## 📱 En móvil

El mapa también debe funcionar en móvil. Agrega tu dominio móvil a:
- Google Cloud Console → Credenciales → tu clave
- "Dominios autorizados"
- Ejemplo: `tudominio.com`

## 🆘 Si aún tienes problemas

Comparte en tu mensaje:
1. El error exacto que ves en la consola (F12)
2. Captura de pantalla de Google Cloud Console (Restricciones)
3. ¿Ves algo de color rojo en la consola?
4. ¿Funciona en `GOOGLE_MAPS_TEST.html`?

---

## Checklist Final

- [ ] Abri `GOOGLE_MAPS_TEST.html` - todo pasó ✓
- [ ] Verifiqué en Google Cloud Console que Maps/Places/Geocoding estén habilitadas
- [ ] Agregué `localhost:5173` a dominios autorizados
- [ ] Establecí restricciones a SOLO las 3 APIs (Maps, Places, Geocoding)
- [ ] Reinicié el servidor (Ctrl+C + npm run dev)
- [ ] Espéré 2-3 minutos
- [ ] Recargué el navegador (Ctrl+Shift+R)
- [ ] El mapa aparece en http://localhost:5173/checkout
- [ ] Puedo arrastrar el marcador
- [ ] Puedo buscar una dirección
- [ ] En consola (F12) no hay errores en rojo

✅ **Si todos tienen ✓, ¡está funcionando!**

---

Última actualización: 24 Octubre 2025

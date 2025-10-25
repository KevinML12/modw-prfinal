# ✅ Nueva Arquitectura de Variables de Entorno

## El Problema Original
- Tenías que editar `frontend/.env` manualmente
- Docker lo regeneraba al ejecutar `docker-compose up`
- Era confuso y las variables se perdían

## La Solución: Una Sola Fuente de Verdad

### Estructura actual

```
c:\proyectos\moda-organica\
├── .env                          ← 🔴 AQUÍ van TODAS las variables
├── frontend/
│   ├── .env.example             ← Referencia (NO se usa)
│   └── .env                     ← IGNORADO por git, generado por Docker
├── backend/
│   └── .env                     ← IGNORADO por git
└── docker-compose.yml
```

### Cómo funciona

```
1. Editas /.env en la raíz
   ↓
2. docker-compose up lo lee
   ↓
3. Las variables se pasan al contenedor como environment
   ↓
4. Dockerfile.dev genera frontend/.env automáticamente
   ↓
5. Vite inicia y tiene acceso a las variables
   ↓
6. ✅ Todo funciona
```

## ¿Qué cambió?

### ANTES ❌
- Editar: `frontend/.env`
- Editar: `/.env`
- Docker regenera y borra todo
- Confusión y frustración

### AHORA ✅
- Editar SOLO: `/.env`
- Docker lo maneja automáticamente
- Una sola fuente de verdad
- Claro y consistente

## Instrucciones de uso

### Para agregar/cambiar variables

1. **Abre solo el archivo raíz:**
   ```
   /.env
   ```

2. **Agrega o edita la variable:**
   ```env
   VITE_GOOGLE_MAPS_API_KEY=tu_nueva_clave
   ```

3. **Reinicia Docker:**
   ```bash
   docker-compose down
   docker-compose up
   ```

4. **¡Listo!** Docker regenerará `frontend/.env` automáticamente

### Local (sin Docker)

Si quieres ejecutar `npm run dev` sin Docker:
1. Copia `frontend/.env.example` a `frontend/.env`
2. Edita con los valores reales
3. Ejecuta: `npm run dev`

## Qué NO debes hacer

❌ **NO edites** `frontend/.env` manualmente
❌ **NO hagas** git commit de `frontend/.env` (está en .gitignore)
❌ **NO hagas** git commit de `/.env` (está en .gitignore)

## Qué DEBES hacer

✅ **Edita solo** `/.env` en la raíz
✅ **Haz commit** de `frontend/.env.example` (sin secrets)
✅ **Haz commit** de `.env.example` en raíz (opcional, para referencia)

## Verificación

Cuando ejecutes `docker-compose up`, deberías ver:

```
✅ .env creado en el contenedor:
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://backend:8080
VITE_GOOGLE_MAPS_API_KEY=AIzaSyA8...
```

Si ves la variable `VITE_GOOGLE_MAPS_API_KEY`, ¡funciona correctamente!

## Archivos modificados

- ✅ `.gitignore` - Creado, ignora `frontend/.env` y `/.env`
- ✅ `.env.example` - Creado en raíz (referencia)
- ✅ `frontend/.env.example` - Ya existía
- ✅ `frontend/.env` - **ELIMINADO** (será regenerado por Docker)
- ✅ `Dockerfile.dev` - Sin cambios (ya estaba bien)
- ✅ `docker-compose.yml` - Sin cambios (ya estaba bien)

---

**De ahora en adelante:**

Solo edita `/.env` en la raíz. Punto.

Docker lo maneja todo automáticamente. 🎉

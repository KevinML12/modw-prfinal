# ✅ FINAL: Una Sola Fuente de Verdad para Variables de Entorno

## Problema resuelto ✨

Ya no tendrás que preocuparte por `frontend/.env`. **Solo edita `/.env` en la raíz.**

## Configuración actual

```
Archivo de configuración: /.env (raíz)
                          ↓
                  docker-compose.yml
                          ↓
                   Dockerfile.dev (genera frontend/.env)
                          ↓
                      Vite inicia
                          ↓
                   ✅ Todo funciona
```

## Cómo usar

### 1️⃣ Editar variables

Abre solo este archivo:
```
/.env
```

Ejemplo:
```env
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://backend:8080
VITE_GOOGLE_MAPS_API_KEY=AIzaSyA8IVlTXOjnluK9CCJUNj6JCvtYHOaT0r4
```

### 2️⃣ Reiniciar Docker

```bash
docker-compose down
docker-compose up
```

O simplemente:
```bash
docker-compose restart frontend
```

### 3️⃣ ¡Listo!

Docker regenera `frontend/.env` automáticamente con tus variables.

## Lo que cambió

| Antes | Ahora |
|-------|-------|
| Editar `frontend/.env` manualmente | Editar solo `/.env` |
| Se perdía cuando ejecutabas Docker | Docker lo maneja automáticamente |
| Confusión con múltiples archivos `.env` | Una única fuente de verdad |
| Necesitabas recordar dónde era | Solo recuerda: la raíz |

## Archivos creados/modificados

- ✅ `.gitignore` - Ignora `frontend/.env` y `/.env`
- ✅ `frontend/.env` - **ELIMINADO** (regenerado por Docker)
- ✅ `.env.example` - Referencia en raíz (opcional)
- ✅ `frontend/.env.example` - Ya existía (referencia)
- ✅ `setup-env.ps1` - Script PowerShell para verificar setup
- ✅ `setup-env.sh` - Script bash para verificar setup
- ✅ `ENV_SINGLE_SOURCE_OF_TRUTH.md` - Documentación detallada

## Verificar que funciona

Cuando ejecutes `docker-compose up`, deberías ver en los logs:

```
phoenix_frontend | Generando .env desde variables de entorno...
phoenix_frontend | ✅ .env creado en el contenedor:
phoenix_frontend | VITE_SUPABASE_URL=https://...
phoenix_frontend | VITE_SUPABASE_ANON_KEY=eyJ...
phoenix_frontend | VITE_API_URL=http://backend:8080
phoenix_frontend | VITE_GOOGLE_MAPS_API_KEY=AIzaSyA8...
```

Si ves `VITE_GOOGLE_MAPS_API_KEY`, ✅ **funciona perfectamente**.

## Resumen

- 📝 **Edita:** Solo `/.env` en la raíz
- 🐳 **Docker se encarga:** De todo lo demás
- 🔄 **Automático:** Regenera `frontend/.env` cada vez que inicia
- 😌 **Sin frustración:** Una sola fuente de verdad

---

**¡Ya no más `.env` borrándose!** 🎉

Simplemente edita `/.env` y Docker lo maneja.

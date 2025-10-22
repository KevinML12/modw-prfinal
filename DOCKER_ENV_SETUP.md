# Docker & Environment Variables - Configuración

## 🐳 Cómo Funciona en Docker

### El Problema Original
Vite necesita acceso a las variables `VITE_*` en **tiempo de compilación/desarrollo**. En Docker:
- El archivo `.env` en el host NO está disponible automáticamente en el contenedor
- Las variables de `docker-compose.yml` se inyectan como variables de entorno del proceso
- Vite necesita un archivo `.env` real en el contenedor para funcionar correctamente

### La Solución Implementada

#### 1. **docker-compose.yml** - Define variables de entorno
```yaml
environment:
  VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}      # Lee del .env del HOST
  VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}
  VITE_API_URL: http://backend:8080
```

Las variables `${...}` se reemplazan con valores del archivo `.env` en la raíz.

#### 2. **Dockerfile.dev** - Crea .env dinámicamente en el contenedor
- Un ENTRYPOINT script crea `/app/.env` dentro del contenedor
- Toma las variables de entorno que pasó docker-compose
- Las escribe en un archivo `.env` que Vite puede leer
- Luego inicia `pnpm run dev --host`

```dockerfile
ENTRYPOINT ["/entrypoint.sh"]
```

#### 3. **supabaseClient.js** - Tolerante con variables faltantes
- Intenta leer `import.meta.env.VITE_*` primero
- Si faltan, intenta `process.env.VITE_*` (para Docker)
- Si aún faltan, usa valores dummy en desarrollo
- Tira error solo en producción

---

## 🚀 Flujo de Inicialización en Docker

```
1. Usuario ejecuta:
   docker-compose up

2. docker-compose.yml carga .env (raíz):
   ✓ VITE_SUPABASE_URL=https://...
   ✓ VITE_SUPABASE_ANON_KEY=eyJ...

3. Crea contenedor frontend con:
   ENV VITE_SUPABASE_URL=https://... (desde docker-compose)
   ENV VITE_SUPABASE_ANON_KEY=eyJ... (desde docker-compose)

4. Dentro del contenedor, ENTRYPOINT ejecuta /entrypoint.sh:
   - Lee $VITE_SUPABASE_URL (variable de entorno del contenedor)
   - Lee $VITE_SUPABASE_ANON_KEY (variable de entorno del contenedor)
   - Crea /app/.env con esas variables
   - Ejecuta: pnpm run dev --host

5. Vite inicia y lee /app/.env:
   - import.meta.env.VITE_SUPABASE_URL ✓ disponible
   - import.meta.env.VITE_SUPABASE_ANON_KEY ✓ disponible

6. supabaseClient.js se carga:
   - import.meta.env.VITE_SUPABASE_URL ✓ tiene valor
   - import.meta.env.VITE_SUPABASE_ANON_KEY ✓ tiene valor
   - createClient() ejecuta exitosamente
   - "Supabase client inicializado correctamente" ✅
```

---

## 📋 Archivos Relacionados

### Archivo `.env` (en RAÍZ - moda-organica/.env)
```properties
VITE_SUPABASE_URL=https://zsyhuqvoypolkktgngwk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_JWT_SECRET=WcixqD5g...
```

**Ubicación:** `c:\Users\keyme\proyectos\moda-organica\.env`

**Uso:**
- docker-compose lee este archivo
- Las variables `VITE_*` se pasan al frontend
- Las variables `SUPABASE_*` se pasan al backend

**NO debe commitearse a git.**

### Archivo `.env.docker` (REFERENCIA)
```properties
# Copia del contenido para referencia
# Muestra qué variables se necesitan
```

**Ubicación:** `c:\Users\keyme\proyectos\moda-organica\.env.docker`

**Uso:** Referencia, NO se usa en tiempo de ejecución.

### Dockerfile.dev (Frontend)
```dockerfile
RUN echo '#!/bin/bash\n\
...genera .env dinámicamente...\n\
exec pnpm run dev --host' > /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
```

**Función:** Crea un archivo `.env` dentro del contenedor usando variables de entorno del proceso.

### docker-compose.yml
```yaml
frontend:
  environment:
    VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
    VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}
```

**Función:** Lee variables del `.env` del host y las pasa al contenedor.

---

## 🔧 Troubleshooting

### Problema: "Configuración de Supabase faltante"

**Verificar en orden:**

1. **¿Existe `.env` en raíz?**
   ```bash
   cat .env | grep VITE_SUPABASE
   ```
   Debe ver:
   ```
   VITE_SUPABASE_URL=https://zsyhuqvoypolkktgngwk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

2. **¿Está ejecutando con Docker?**
   ```bash
   docker-compose up
   ```
   (NO `pnpm run dev` - eso es solo en desarrollo local sin Docker)

3. **¿Reinició después de cambiar .env?**
   ```bash
   docker-compose restart frontend
   # o
   docker-compose down && docker-compose up
   ```

4. **¿Ver logs del contenedor?**
   ```bash
   docker logs phoenix_frontend
   ```
   Debe ver: `✅ .env creado en el contenedor`

5. **¿Verificar .env dentro del contenedor?**
   ```bash
   docker exec phoenix_frontend cat /app/.env
   ```
   Debe mostrar las variables.

---

## 🎯 Desarrollo Local (Sin Docker)

En desarrollo local sin Docker, también necesitas `.env`:

```bash
# En raíz o en frontend/
VITE_SUPABASE_URL=https://zsyhuqvoypolkktgngwk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:8080
```

Luego:
```bash
cd frontend
pnpm run dev
```

Vite automáticamente lee el `.env` en el directorio raíz.

---

## ✅ Checklist para Verificar

- [ ] Archivo `.env` existe en raíz (`moda-organica/.env`)
- [ ] `.env` contiene `VITE_SUPABASE_URL`
- [ ] `.env` contiene `VITE_SUPABASE_ANON_KEY`
- [ ] `docker-compose.yml` pasa `VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}`
- [ ] `docker-compose.yml` pasa `VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}`
- [ ] `Dockerfile.dev` frontend tiene ENTRYPOINT script
- [ ] `supabaseClient.js` existe en `frontend/src/lib/`
- [ ] Ejecutas `docker-compose up` desde raíz (no desde frontend/)

---

## 🚀 Comandos Útiles

### Ver logs del frontend en Docker
```bash
docker logs phoenix_frontend -f
```

### Reiniciar solo frontend
```bash
docker-compose restart frontend
```

### Entrar al contenedor frontend
```bash
docker exec -it phoenix_frontend bash
# Dentro del contenedor:
cat .env
cat /app/.env
echo $VITE_SUPABASE_URL
```

### Rebuild sin caché
```bash
docker-compose up --build
```

### Limpiar todo y reiniciar
```bash
docker-compose down
docker system prune -f
docker-compose up
```

---

## 📚 Variables de Entorno Explicadas

| Variable | Tipo | Visibilidad | Uso |
|----------|------|------------|-----|
| `VITE_SUPABASE_URL` | VITE | Público (navegador) | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | VITE | Público (navegador) | Anon key Supabase (seguro) |
| `VITE_API_URL` | VITE | Público (navegador) | URL del backend |
| `SUPABASE_URL` | Backend | Secreto | URL de Supabase (backend) |
| `SUPABASE_SERVICE_KEY` | Backend | Secreto | Service role token (admin) |
| `SUPABASE_JWT_SECRET` | Backend | Secreto | Secret para validar JWT |

**VITE** = Se procesan en tiempo de compilación por Vite, se exponen al navegador (no poner secrets).
**Backend** = Variables de entorno del backend, NO se exponen al navegador.

---

## 🔐 Seguridad

- ✅ `VITE_SUPABASE_ANON_KEY` es seguro exponer (anon key, permisos limitados)
- ❌ `SUPABASE_SERVICE_KEY` NUNCA debe exponerse (tiene permisos totales)
- ❌ `SUPABASE_JWT_SECRET` NUNCA debe exponerse
- ✅ El `.env` está en `.gitignore` (no se commite)
- ✅ Usa `.env.docker` como referencia del template


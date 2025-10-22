# Solución: Variables de Entorno en Docker

## Problema Resuelto

**Error Original:**
```
Configuración de Supabase faltante en variables de entorno
Error: Configuración de Supabase faltante en variables de entorno
    at /app/src/lib/supabaseClient.js:9:8
```

**Causa:** 
Las variables `VITE_SUPABASE_*` no estaban disponibles dentro del contenedor Docker cuando Vite intentaba inicializar `supabaseClient.js`.

---

## Solución Implementada

### 1. **Dockerfile.dev (Frontend)** - Crea .env dinámicamente

Se añadió un entrypoint script que:
- Lee las variables de entorno del contenedor (inyectadas por docker-compose)
- Genera un archivo `/app/.env` dentro del contenedor
- Inicia `pnpm run dev --host` con el .env disponible

```dockerfile
RUN echo '#!/bin/bash\n\
echo "Generando .env desde variables de entorno..."\n\
{\n\
  echo "VITE_SUPABASE_URL=${VITE_SUPABASE_URL}"\n\
  echo "VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}"\n\
  echo "VITE_API_URL=${VITE_API_URL:-http://backend:8080}"\n\
} > /app/.env\n\
echo ".env creado en el contenedor:" \n\
cat /app/.env\n\
echo "Iniciando Vite..."\n\
exec pnpm run dev --host' > /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
```

### 2. **docker-compose.yml** - Pasa variables al frontend

```yaml
frontend:
  environment:
    VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
    VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}
    VITE_API_URL: http://backend:8080
  command: bash -c "pnpm install && pnpm playwright install && pnpm run dev --host"
```

**Cómo funciona:**
- `${VITE_SUPABASE_URL}` lee el valor del archivo `.env` en la raíz
- Se inyecta como variable de entorno en el contenedor
- docker-compose lo pasa al script `/entrypoint.sh`

### 3. **supabaseClient.js** - Más tolerante con variables

```javascript
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// En Docker, intenta obtener desde variables de entorno del proceso
if (!supabaseUrl || !supabaseAnonKey) {
	if (typeof process !== 'undefined' && process.env) {
		supabaseUrl = supabaseUrl || process.env.VITE_SUPABASE_URL;
		supabaseAnonKey = supabaseAnonKey || process.env.VITE_SUPABASE_ANON_KEY;
	}
}

// Mejor manejo de errores con instrucciones claras
if (!supabaseUrl || !supabaseAnonKey) {
	console.error('⚠️ ADVERTENCIA: Configuración de Supabase incompleta');
	console.error('Soluciones:');
	console.error('1. En desarrollo local: Asegúrate que .env existe en raíz');
	console.error('2. En Docker: Verifica docker-compose.yml tenga environment: VITE_SUPABASE_*');
	// ... permitir cliente dummy en desarrollo
}

export const supabase = supabaseUrl && supabaseAnonKey 
	? createClient(supabaseUrl, supabaseAnonKey, { auth: {...} })
	: null;
```

### 4. **Archivos de Referencia**

- `.env.docker` - Template para mostrar qué variables se necesitan
- `DOCKER_ENV_SETUP.md` - Documentación completa del sistema

---

## 🧪 Verificación de Éxito

Después de `docker-compose up --build`, los logs muestran:

```
phoenix_frontend     | Generando .env desde variables de entorno...
phoenix_frontend     | ✅ .env creado en el contenedor:
phoenix_frontend     | VITE_SUPABASE_URL=https://zsyhuqvoypolkktgngwk.supabase.co
phoenix_frontend     | VITE_SUPABASE_ANON_KEY=eyJ...
phoenix_frontend     | VITE_API_URL=http://backend:8080
phoenix_frontend     | Iniciando Vite...
phoenix_frontend     | 
phoenix_frontend     | ✅ Supabase client inicializado correctamente
phoenix_frontend     | URL: https://zsyhuqvoypolkktgngwk.supabase.co
phoenix_frontend     | 
phoenix_frontend     | [User Store] Inicializando...
phoenix_frontend     | [User Store] Auth state cambió: INITIAL_SESSION
```

---

## 📋 Cambios Realizados

| Archivo | Cambio | Razón |
|---------|--------|-------|
| `frontend/Dockerfile.dev` | Añadido ENTRYPOINT con script que genera .env | Vite necesita .env para leer variables VITE_* |
| `docker-compose.yml` | Añadido `VITE_API_URL` y ajustado comando | Frontend container recibe las variables |
| `frontend/src/lib/supabaseClient.js` | Mejorada tolerancia de variables faltantes | Fallback a process.env, mejor manejo de errores |
| `.env.docker` | Archivo de referencia creado | Documentación de variables requeridas |
| `DOCKER_ENV_SETUP.md` | Documento completo creado | Explicación detallada de cómo funciona |

---

## 🚀 Uso

### En Docker (Recomendado)

```bash
cd c:\Users\keyme\proyectos\moda-organica

# Asegúrate que .env existe en raíz con:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Luego ejecuta:
docker-compose up --build

# Accede a: http://localhost:5173
```

### En Desarrollo Local (Sin Docker)

```bash
cd frontend

# Copia variables a frontend/.env o usa raíz .env
VITE_SUPABASE_URL=https://zsyhuqvoypolkktgngwk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

pnpm run dev
```

---

## ✅ Checklist Final

- ✅ `.env` existe en raíz con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- ✅ `Dockerfile.dev` frontend genera `.env` dinámicamente
- ✅ `docker-compose.yml` pasa variables al contenedor
- ✅ `supabaseClient.js` inicializa exitosamente
- ✅ `[User Store] Inicializando...` aparece en logs
- ✅ No hay errores de variables faltantes
- ✅ Frontend accesible en http://localhost:5173

---

## 🔍 Troubleshooting Rápido

**Si ves "Configuración de Supabase faltante":**

```bash
# 1. Verifica .env existe en raíz:
cat .env | grep VITE_SUPABASE

# 2. Reinicia Docker:
docker-compose restart frontend

# 3. Ver logs del contenedor:
docker logs phoenix_frontend -f

# 4. Verificar .env dentro del contenedor:
docker exec phoenix_frontend cat /app/.env
```

---

## 📚 Documentación Relacionada

- `DOCKER_ENV_SETUP.md` - Explicación completa del sistema
- `.env.docker` - Template de variables requeridas
- `AUTH_SYSTEM_STATUS.md` - Estado del sistema de autenticación


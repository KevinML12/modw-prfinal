SUPABASE CLIENT SETUP - GUÍA DE CONFIGURACIÓN

ARCHIVOS CREADOS/MODIFICADOS:

✅ frontend/src/lib/supabaseClient.js - CREADO
✅ moda-organica/.env - ACTUALIZADO (variables de frontend)
✅ docker-compose.yml - ACTUALIZADO (variables de entorno)

PASO 1: INSTALAR DEPENDENCIA

Ejecutar en terminal (desde frontend/):

cd frontend
pnpm add @supabase/supabase-js

O si usas npm:
npm install @supabase/supabase-js

PASO 2: VERIFICAR VARIABLES EN .env

El archivo moda-organica/.env ya tiene las siguientes variables:

# SUPABASE - FRONTEND AUTH (Anon Key - Segura de exponer)
VITE_SUPABASE_URL="https://zsyhuqvoypolkktgngwk.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# SUPABASE JWT SECRET (Para middleware de Go)
SUPABASE_JWT_SECRET="super-secret-jwt-token-change-me-in-production"

IMPORTANTE:
- VITE_ prefijo es necesario para que SvelteKit las exponga al frontend
- Las variables se leen en tiempo de build (no en runtime)
- Cambios al .env requieren reiniciar el servidor

PASO 3: ENTENDER LA ESTRUCTURA

frontend/src/lib/supabaseClient.js:
  - Crea cliente de Supabase singleton
  - Configura auto-refresh de tokens
  - Persiste sesiones en localStorage
  - Se usa en user.store.js para autenticación

user.store.js (existente):
  - importa: import { supabase } from '$lib/supabaseClient.js'
  - usa supabase.auth.signUp()
  - usa supabase.auth.signInWithPassword()
  - usa supabase.auth.signOut()

PASO 4: CÓMO FUNCIONA EN DOCKER

docker-compose.yml ahora pasa:
  - VITE_SUPABASE_URL → al contenedor frontend
  - VITE_SUPABASE_ANON_KEY → al contenedor frontend
  - SUPABASE_JWT_SECRET → al contenedor backend

Cuando haces: docker-compose up
  1. Lee moda-organica/.env
  2. Pasa variables a contenedores
  3. Frontend accede vía import.meta.env.VITE_*
  4. Backend accede vía os.Getenv("SUPABASE_JWT_SECRET")

PASO 5: FLUJO DE AUTENTICACIÓN

Usuario escribe credenciales en LoginForm.svelte
  ↓
onClick → userStore.login(email, password)
  ↓
user.store.js → await supabase.auth.signInWithPassword()
  ↓
supabaseClient.js → const supabase = createClient(...)
  ↓
Llamada HTTP a Supabase Auth API
  ↓
Supabase retorna: { user, session { access_token, refresh_token } }
  ↓
userStore guarda: session.access_token en localStorage
  ↓
api.js → authenticatedFetch() lee access_token
  ↓
Envía al backend: Authorization: Bearer <access_token>
  ↓
Backend middleware valida JWT

PASO 6: VARIABLES DE ENTORNO EXPLICADAS

VITE_SUPABASE_URL:
  - Project URL de Supabase
  - Se expone en frontend (seguro, solo identifica el proyecto)
  - Encontrar en: https://app.supabase.com → Settings > API

VITE_SUPABASE_ANON_KEY:
  - Anon public key de Supabase
  - Segura de exponer (protegida por RLS)
  - Encontrar en: https://app.supabase.com → Settings > API
  - Nunca usar la service_role key aquí

SUPABASE_JWT_SECRET:
  - Secret para validar JWTs en backend
  - PRIVADA (nunca en frontend)
  - Solo en backend middleware
  - Encontrar en: https://app.supabase.com → Settings > API

SUPABASE_SERVICE_KEY:
  - Service role key para operaciones de admin en backend
  - PRIVADA (nunca en frontend)
  - Encontrar en: https://app.supabase.com → Settings > API

PASO 7: TESTING LOCAL (SIN DOCKER)

Para probar sin Docker:

1. En frontend/, crear .env.local:
   VITE_SUPABASE_URL=https://zsyhuqvoypolkktgngwk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...

2. En frontend/:
   pnpm install @supabase/supabase-js
   pnpm run dev

3. Abrir http://localhost:5173/login
   - Debería funcionar sin errores de supabaseClient

PASO 8: VERIFICAR QUE FUNCIONA

En navegador (http://localhost:5173):
1. Consola browser (F12)
2. Debería ver: "Supabase client inicializado correctamente"
3. NO debería haber error: "Cannot find module '$lib/supabaseClient.js'"

En login:
1. Intentar registrarse
2. Verificar que supabase.auth.signUp() funciona
3. En userStore debe guardarse session

SOLUCIÓN DE PROBLEMAS:

Error: "Cannot find module '$lib/supabaseClient.js'"
  → Verificar que archivo existe: frontend/src/lib/supabaseClient.js

Error: "VITE_SUPABASE_URL is undefined"
  → Verificar variables en moda-organica/.env
  → Reiniciar servidor (pnpm run dev)
  → Variables se leen en tiempo de build

Error al instalar @supabase/supabase-js:
  → pnpm install -D @supabase/supabase-js
  → O: npm install --save-dev @supabase/supabase-js

Docker no ve variables:
  → Verificar moda-organica/.env existe y tiene VITE_SUPABASE_*
  → docker-compose down
  → docker-compose up --build (fuerza rebuild)

PRÓXIMOS PASOS:

1. Instalar @supabase/supabase-js
2. Reiniciar servidor (pnpm run dev)
3. Probar login en /login
4. Verificar que se crea sesión
5. Acceder a /orders (debe funcionar si autenticado)

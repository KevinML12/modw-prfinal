#!/bin/bash

echo "Generando .env desde variables de entorno..."

# Crear el archivo .env con todas las variables
cat > .env << EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
VITE_API_URL=${VITE_API_URL:-http://backend:8080}
VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY:-AIzaSyA8IVlTXOjnluK9CCJUNj6JCvtYHOaT0r4}
EOF

echo "✅ .env creado:"
cat .env
echo ""

# DEBUG: Verificar que las variables se pasaron
echo "DEBUG - VITE_GOOGLE_MAPS_API_KEY en el contenedor: ${VITE_GOOGLE_MAPS_API_KEY:-(VACÍO)}"
echo ""

# Instalar dependencias
echo "Instalando dependencias..."
pnpm install && pnpm playwright install

# Iniciar el servidor de desarrollo
echo "Iniciando Vite..."
pnpm run dev --host

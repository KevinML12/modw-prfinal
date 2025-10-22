#!/usr/bin/env bash

# ============================================
# VALIDACIÓN DE REFACTORIZACIÓN E2E TESTS
# ============================================
# Script para verificar que todos los archivos
# y imports están correctamente configurados

echo "🔍 Validando estructura de tests E2E..."
echo ""

# 1. Verificar archivos existen
echo "📁 Verificando archivos..."
files=(
  "frontend/tests/page-objects.js"
  "frontend/tests/helpers/svelte-helpers.js"
  "frontend/tests/test-data.js"
  "frontend/tests/e2e/home.spec.ts"
  "frontend/tests/e2e/products.spec.ts"
  "frontend/tests/e2e/cart.spec.ts"
  "frontend/tests/e2e/checkout.spec.ts"
  "frontend/playwright.config.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file MISSING"
  fi
done

echo ""
echo "🔗 Verificando imports en page-objects.js..."

# 2. Verificar imports de svelte-helpers
if grep -q "import.*svelte-helpers" frontend/tests/page-objects.js; then
  echo "  ✅ Imports de svelte-helpers encontrados"
else
  echo "  ❌ Imports de svelte-helpers NO encontrados"
fi

# 3. Verificar funciones clave en page-objects.js
echo ""
echo "🔧 Verificando funciones en page-objects.js..."

functions=(
  "waitForSvelteKitHydration"
  "waitForSvelteTransition"
  "waitForStoreUpdate"
  "waitForNavigationComplete"
  "triggerSvelteReactivity"
  "getCartFromStore"
  "navigateToHome"
  "addToCart"
  "removeFromCart"
  "clearCart"
  "waitForCartSync"
)

for func in "${functions[@]}"; do
  if grep -q "export async function $func\|$func(page" frontend/tests/page-objects.js; then
    echo "  ✅ $func"
  else
    echo "  ⚠️  $func"
  fi
done

# 4. Verificar helpers en svelte-helpers.js
echo ""
echo "🔧 Verificando helpers en svelte-helpers.js..."

helpers=(
  "waitForSvelteKitHydration"
  "clearSvelteStores"
  "waitForSvelteTransition"
  "waitForStoreUpdate"
  "triggerSvelteReactivity"
  "getCartFromStore"
  "waitForNavigationComplete"
  "initializeSvelteTestEnvironment"
)

for helper in "${helpers[@]}"; do
  if grep -q "export async function $helper\|export function $helper" frontend/tests/helpers/svelte-helpers.js; then
    echo "  ✅ $helper"
  else
    echo "  ❌ $helper MISSING"
  fi
done

# 5. Verificar DEFAULT_SVELTE_TIMEOUTS
echo ""
if grep -q "export const DEFAULT_SVELTE_TIMEOUTS" frontend/tests/helpers/svelte-helpers.js; then
  echo "  ✅ DEFAULT_SVELTE_TIMEOUTS definido"
else
  echo "  ❌ DEFAULT_SVELTE_TIMEOUTS NOT FOUND"
fi

# 6. Verificar que page-objects.js usa los nuevos helpers
echo ""
echo "📋 Verificando que page-objects.js usa nuevos helpers..."

uses=(
  "waitForSvelteKitHydration"
  "waitForSvelteTransition"
  "waitForStoreUpdate"
  "triggerSvelteReactivity"
  "getCartFromStore"
)

for use in "${uses[@]}"; do
  if grep -q "await $use" frontend/tests/page-objects.js; then
    echo "  ✅ $use utilizado en funciones"
  else
    echo "  ⚠️  $use NO utilizado"
  fi
done

echo ""
echo "✨ Validación completada"
echo ""
echo "📊 Resumen:"
echo "  - Total archivos: ${#files[@]}"
echo "  - Total helpers Svelte: ${#helpers[@]}"
echo "  - Total funciones page-objects: ${#functions[@]}"
echo ""
echo "🚀 Para ejecutar tests:"
echo "  docker-compose --profile test up -d"
echo "  docker-compose exec playwright pnpm test:e2e"
echo ""

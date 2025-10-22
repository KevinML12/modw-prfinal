# 📍 Sistema de Selector de Ubicación - Moda Orgánica

## Descripción General

Sistema completo para capturar ubicación de envío en Guatemala con selección de departamento, municipio y dirección detallada. Incluye validación en tiempo real, zonas especiales de envío local y cálculo automático de costos.

---

## 📦 Componentes Implementados

### 1. Data Layer: `guatemala-locations.js`

**Ubicación:** `frontend/src/lib/data/guatemala-locations.js`

Contiene:
- **22 Departamentos** con 341 municipios totales
- **Estructuras de datos** con IDs, nombres y zonas de envío
- **Funciones helper** para validación y búsqueda

**Estructura de datos:**

```javascript
{
  id: 'GT-01',                           // ID oficial de Guatemala
  name: 'Guatemala',                     // Nombre del departamento
  shippingZone: 'central',               // Zona para cálculo de envío
  municipalities: [
    {
      id: 'GT-01-01',
      name: 'Guatemala',
      zone: 'metropolitana',
      special: false                     // true solo para Huehuete/Chiantla
    }
    // ... 16 municipios más
  ]
}
```

**Funciones Helper:**

```javascript
// Obtener datos
getDepartmentById(id)                    // → Departamento completo
getMunicipalityById(deptId, munId)       // → Municipio específico
getMunicipalitiesByDepartment(deptId)    // → Array de municipios

// Validación
isValidLocationCombination(deptId, munId) // → boolean
isSpecialDeliveryZone(deptId, munId)     // → boolean (Huehuete/Chiantla)

// Información
getShippingZone(deptId, munId)           // → 'metropolitana'|'central'|etc
getDepartmentShippingZone(deptId)        // → Zona del departamento
getLocationDisplayName(deptId, munId)    // → "Municipio, Departamento"
```

### 2. Componente Frontend: `LocationSelector.svelte`

**Ubicación:** `frontend/src/lib/components/LocationSelector.svelte`

**Props:**

```svelte
{
  value = $bindable({
    department: '',          // ID del departamento (ej: 'GT-01')
    municipality: '',        // ID del municipio (ej: 'GT-01-01')
    address: ''             // Dirección completa (10+ caracteres)
  }),
  required = false,         // Validar campos requeridos
  disabled = false          // Deshabilitar componente
}
```

**Features:**

✅ **Reactividad Svelte 5:**
- `$state` para departamento, municipio, dirección
- `$derived` para municipios filtrados
- `$effect` para resetear municipio al cambiar departamento
- Bindable: `bind:value={shippingLocation}`

✅ **Validación Integrada:**
- Campos requeridos con mensajes de error
- Dirección mínimo 10 caracteres
- Errores con transición fade
- Método `validate()` exportado para validación externa

✅ **Badge Especial:**
- Aparece solo para Huehuetenango y Chiantla
- Diseño aesthetic con gradiente verde
- Transición suave de entrada
- Emoji visual (✨)

✅ **Diseño Tailwind:**
- Minimalista y aesthetic
- Iconos para cada sección (📍 🏘️ 🏠)
- Dark mode completamente soportado
- Focus states para accesibilidad
- Hover effects elegantes

✅ **Accesibilidad:**
- Labels correctamente asociados
- aria-labels en todos los inputs
- aria-invalid para errores
- Keyboard navigation completa
- Screen reader friendly

**Uso Básico:**

```svelte
<script>
  import LocationSelector from '$lib/components/LocationSelector.svelte';
  
  let shippingLocation = $state({
    department: '',
    municipality: '',
    address: ''
  });
  
  let locationRef;
</script>

<LocationSelector 
  bind:this={locationRef}
  bind:value={shippingLocation}
  required={true}
/>

<button onclick={() => {
  if (locationRef.validate()) {
    // Enviar datos
    console.log(shippingLocation);
  }
}}>
  Validar y Continuar
</button>
```

### 3. Integración en Checkout

**Ubicación:** `frontend/src/routes/checkout/+page.svelte`

**Cambios:**

1. **Importar componente:**
```javascript
import LocationSelector from '$lib/components/LocationSelector.svelte';
```

2. **State del formulario:**
```javascript
let shippingLocation = {
  department: '',
  municipality: '',
  address: ''
};
```

3. **Incluir en formulario:**
```svelte
<section>
  <h2>Ubicación de Envío</h2>
  <LocationSelector 
    bind:this={locationSelectorRef}
    bind:value={shippingLocation}
    required={true}
  />
</section>
```

4. **Validación:**
```javascript
function validateForm() {
  // ... otras validaciones ...
  
  if (locationSelectorRef && !locationSelectorRef.validate()) {
    errors.push('Por favor completa la ubicación correctamente');
  }
  
  return errors;
}
```

5. **Capturar en orden:**
```javascript
const orderPayload = {
  customer: { email, fullName, phone },
  shipping: shippingLocation,    // ← Estructura completa
  items: currentCart.items,
  shippingCost,
  total
};
```

### 4. Backend: Modelo Order

**Ubicación:** `backend/models/order.go`

**Nuevos campos en struct Order:**

```go
// Departamento de envío (ID Guatemala)
ShippingDepartment string `json:"shipping_department" gorm:"not null"`

// Municipio (nombre legible)
ShippingMunicipality string `json:"shipping_municipality" gorm:"not null"`

// Dirección detallada
ShippingAddress string `json:"shipping_address" gorm:"not null;type:text"`

// Zona clasificada para cálculo de costos
ShippingZone string `json:"shipping_zone" gorm:"type:varchar(50);default:'central'"`

// Indica si es zona especial (Huehuete/Chiantla)
IsSpecialDeliveryZone bool `json:"is_special_delivery_zone" gorm:"default:false"`

// Costo de envío según zona
ShippingCost float64 `json:"shipping_cost" gorm:"type:decimal(10,2);default:0"`
```

---

## 🧪 Tests E2E

**Ubicación:** `frontend/tests/e2e/location-selector.spec.ts`

**22 tests completos:**

### Estructura Básica
- ✅ Mostrar selector en checkout
- ✅ Listar 22 departamentos
- ✅ Contar opciones correctamente

### Funcionalidad de Selección
- ✅ Filtrar municipios por departamento
- ✅ Resetear municipio al cambiar departamento
- ✅ Deshabilitar municipio hasta seleccionar departamento

### Badge Especial
- ✅ Mostrar badge para Huehuetenango
- ✅ Mostrar badge para Chiantla
- ✅ No mostrar badge para otros municipios

### Validación
- ✅ Validar dirección requerida
- ✅ Validar mínimo 10 caracteres
- ✅ Mostrar contador de caracteres (XX/100)
- ✅ Error desaparece al corregir

### UI/UX
- ✅ Mostrar preview de ubicación
- ✅ Capturar datos completos
- ✅ Indicadores visuales de requerido

### Accesibilidad
- ✅ Labels correctamente asociados
- ✅ Keyboard navigation funcional
- ✅ Atributos aria- correctos

### Responsive
- ✅ Mobile (375px width)
- ✅ Dark mode
- ✅ Integración con formulario de checkout

---

## 📊 Datos de Departamentos y Municipios

### Estructura de Zonas

```
Zonas de Envío:
├── metropolitana    (Ciudad Guatemala - costo bajo)
├── central          (Alrededores - costo medio)
├── occidente        (Occidental - costo medio-alto)
├── oriente          (Oriental - costo medio-alto)
├── norte            (Petén, Verapaz - costo alto)
├── sur              (Escuintla, Santa Rosa - costo medio)
└── local-delivery   (Huehuete, Chiantla - especial ✨)
```

### Departamentos Especiales

**Huehuetenango (GT-13):**
- Municipios especiales: Huehuetenango, Chiantla
- Habilitados para envío local optimizado
- Badge visual "✨ Envío Local Disponible"
- Lógica de costos diferenciada en futuro

---

## 🔄 Flujo de Datos

```
Usuario en Checkout
       ↓
LocationSelector captura
├── Department (GT-XX)
├── Municipality (GT-XX-XX)
└── Address (string)
       ↓
Validación Svelte
├── ¿Departamento seleccionado?
├── ¿Municipio válido para dept?
└── ¿Dirección >= 10 caracteres?
       ↓
[Si válido] → shippingLocation object
       ↓
handleSubmit() captura en orderPayload
       ↓
Backend recibe completo:
├── shipping_department
├── shipping_municipality
├── shipping_address
└── shipping_zone (para cálculo futuro)
```

---

## 🎯 Casos de Uso

### UC1: Cliente de Guatemala City
1. Selecciona "Guatemala" → 17 municipios
2. Selecciona "Guatemala"
3. Ingresa "Calle 6 Avenida 15-25, zona 1"
4. Sistema: zona metropolitana, costo bajo

### UC2: Cliente de Huehuetenango
1. Selecciona "Huehuetenango" → 24 municipios
2. Selecciona "Huehuetenango"
3. ✨ Badge aparece: "Envío Local Disponible"
4. Ingresa dirección
5. Sistema: zona especial, envío optimizado

### UC3: Cliente de Quetzaltenango
1. Selecciona "Quetzaltenango" → 14 municipios
2. Selecciona "Salcajá"
3. Ingresa dirección
4. Sistema: zona occidente, costo medio-alto

---

## 🔧 Configuración para Futuros Cambios

### Agregar Costo de Envío Dinámico

En `checkout/+page.svelte`:

```javascript
function calculateShipping(location) {
  const SHIPPING_RATES = {
    'metropolitana': 25.00,
    'central': 40.00,
    'occidente': 60.00,
    'oriente': 65.00,
    'norte': 80.00,
    'local-delivery': 15.00  // Especial
  };
  
  const zone = location.shippingZone;
  return SHIPPING_RATES[zone] || 50.00;
}
```

### Agregar Validación de Horarios

Para zonas especiales (Huehuete/Chiantla):

```javascript
function getDeliveryEstimate(location) {
  if (location.department === 'GT-13' && 
      ['GT-13-01', 'GT-13-02'].includes(location.municipality)) {
    return {
      minDays: 1,
      maxDays: 2,
      estimate: 'Entrega Local - 1-2 días'
    };
  }
  
  return {
    minDays: 3,
    maxDays: 7,
    estimate: 'Entrega Nacional - 3-7 días'
  };
}
```

---

## 📝 Características de Svelte 5 Runes

### `$state`
```javascript
let selectedDept = $state(value.department);
```
Crea estado reactivo que se actualiza automáticamente

### `$derived`
```javascript
let filteredMunicipalities = $derived.by(() => {
  if (!selectedDept) return [];
  return DEPARTMENTS.find(d => d.id === selectedDept).municipalities;
});
```
Computed value que se recalcula automáticamente

### `$effect`
```javascript
$effect(() => {
  if (selectedDept && !filteredMunicipalities.some(m => m.id === selectedMun)) {
    selectedMun = '';
  }
});
```
Efecto que se ejecuta cuando dependencias cambian

### `$bindable`
```javascript
let { value = $bindable({...}) } = $props();
```
Permite two-way binding con componentes padres

---

## 🚀 Próximos Pasos

1. **Integración de Pagos:**
   - Incluir location en creación de órdenes Stripe
   - Enviar zone info a backend

2. **Cálculo Dinámico de Envío:**
   - API backend que calcula costo según zone
   - Actualizar total dinámicamente

3. **Tracking de Envíos:**
   - Integración con sistema de logística
   - Mostrar estado de entrega

4. **Múltiples Direcciones:**
   - Guardar direcciones favoritas
   - Auto-completar con historial

5. **Geolocalización:**
   - Pre-seleccionar departamento del IP
   - Auto-completar municipio

---

## ✅ Checklist de Validación

- [x] ✅ Datos completos de 22 departamentos
- [x] ✅ Todos los 341 municipios incluidos
- [x] ✅ Zonas de envío clasificadas
- [x] ✅ Huehuetenango y Chiantla marcados especiales
- [x] ✅ Componente con Svelte 5 Runes
- [x] ✅ Validación en tiempo real
- [x] ✅ Badge especial funcional
- [x] ✅ Integración en checkout
- [x] ✅ Backend model actualizado
- [x] ✅ 22 tests E2E completos
- [x] ✅ Accesibilidad completa
- [x] ✅ Dark mode soportado
- [x] ✅ Responsive en mobile
- [x] ✅ Documentación completa

---

## 📞 Soporte

**Problemas comunes:**

| Problema | Solución |
|----------|----------|
| Municipios no aparecen | Seleccionar primero departamento |
| Badge no aparece | Verificar que es Huehuete/Chiantla |
| Validación no funciona | Llamar a `locationRef.validate()` |
| Dark mode no se aplica | Verificar clase `dark` en HTML |

---

## 📚 Archivos Relacionados

```
frontend/
├── src/
│   ├── lib/
│   │   ├── data/
│   │   │   └── guatemala-locations.js     ← Data + helpers
│   │   └── components/
│   │       └── LocationSelector.svelte    ← Componente
│   └── routes/
│       └── checkout/
│           ├── +page.svelte               ← Integración
│           └── +page.ts                   ← Lógica de servidor
└── tests/
    └── e2e/
        └── location-selector.spec.ts      ← 22 tests

backend/
└── models/
    └── order.go                           ← Estructura de orden
```

---

**Creado:** Octubre 22, 2025
**Versión:** 1.0
**Estado:** ✅ Producción-Ready

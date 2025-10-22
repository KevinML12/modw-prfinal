<script>
  import { GUATEMALA_DEPARTMENTS, isSpecialDeliveryZone, getLocationDisplayName } from '$lib/data/guatemala-locations.js';
  import { fade } from 'svelte/transition';

  // Props
  export let value = { department: '', municipality: '', address: '' };
  export let required = false;
  export let disabled = false;

  // Estado reactivo
  let selectedDept = value.department || '';
  let selectedMun = value.municipality || '';
  let addressText = value.address || '';

  // Errores de validación
  let errors = {
    department: '',
    municipality: '',
    address: ''
  };

  // Computed: municipios filtrados según departamento seleccionado
  $: filteredMunicipalities = (() => {
    if (!selectedDept) return [];
    const dept = GUATEMALA_DEPARTMENTS.find(d => d.id === selectedDept);
    return dept ? dept.municipalities : [];
  })();

  // Computed: verificar si es zona especial
  $: isSpecialZone = selectedDept && selectedMun ? isSpecialDeliveryZone(selectedDept, selectedMun) : false;

  // Watcher: cuando cambia departamento, resetear municipio
  $: if (selectedDept && !filteredMunicipalities.some(m => m.id === selectedMun)) {
    selectedMun = '';
    errors.municipality = '';
  }

  // Watcher: actualizar el objeto value
  $: value = {
    department: selectedDept,
    municipality: selectedMun,
    address: addressText
  };

  /**
   * Validar departamento
   */
  function validateDepartment() {
    if (required && !selectedDept) {
      errors.department = 'Por favor selecciona un departamento';
      return false;
    }
    errors.department = '';
    return true;
  }

  /**
   * Validar municipio
   */
  function validateMunicipality() {
    if (required && !selectedMun) {
      errors.municipality = 'Por favor selecciona un municipio';
      return false;
    }
    errors.municipality = '';
    return true;
  }

  /**
   * Validar dirección
   */
  function validateAddress() {
    if (required && !addressText) {
      errors.address = 'Por favor ingresa la dirección';
      return false;
    }
    if (addressText.length < 10 && addressText.length > 0) {
      errors.address = 'La dirección debe tener al menos 10 caracteres';
      return false;
    }
    errors.address = '';
    return true;
  }

  /**
   * Validar todo el formulario
   */
  export function validate() {
    const deptValid = validateDepartment();
    const munValid = validateMunicipality();
    const addrValid = validateAddress();

    return deptValid && munValid && addrValid;
  }
</script>

<div class="location-selector space-y-6">
  <!-- Departamento -->
  <div class="form-group">
    <label
      for="department"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      <span class="text-lg mr-2"></span>
      Departamento
      {#if required}
        <span class="text-red-500" aria-label="requerido">*</span>
      {/if}
    </label>

    <select
      id="department"
      bind:value={selectedDept}
      onchange={validateDepartment}
      {disabled}
      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
             focus:ring-2 focus:ring-green-500 focus:border-transparent
             transition-all duration-200 hover:border-green-400
             disabled:opacity-50 disabled:cursor-not-allowed
             {errors.department ? 'border-red-500 focus:ring-red-500' : ''}"
      aria-label="Selecciona un departamento"
      aria-invalid={!!errors.department}
      aria-describedby={errors.department ? 'dept-error' : undefined}
    >
      <option value="">-- Elige un departamento --</option>
      {#each GUATEMALA_DEPARTMENTS as dept (dept.id)}
        <option value={dept.id}>{dept.name}</option>
      {/each}
    </select>

    {#if errors.department}
      <p
        id="dept-error"
        class="text-red-500 text-sm mt-1 flex items-center"
        transition:fade
        role="alert"
      >
        <span class="mr-1"></span>{errors.department}
      </p>
    {/if}
  </div>

  <!-- Municipio (filtrado) -->
  <div class="form-group">
    <label
      for="municipality"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      <span class="text-lg mr-2"></span>
      Municipio
      {#if required}
        <span class="text-red-500" aria-label="requerido">*</span>
      {/if}
    </label>

    <select
      id="municipality"
      bind:value={selectedMun}
      onchange={validateMunicipality}
      disabled={!selectedDept || disabled}
      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
             focus:ring-2 focus:ring-green-500 focus:border-transparent
             transition-all duration-200 hover:border-green-400
             disabled:opacity-50 disabled:cursor-not-allowed
             {errors.municipality ? 'border-red-500 focus:ring-red-500' : ''}"
      aria-label="Selecciona un municipio"
      aria-invalid={!!errors.municipality}
      aria-describedby={errors.municipality ? 'mun-error' : undefined}
    >
      <option value="">
        {selectedDept ? '-- Elige un municipio --' : '(Primero selecciona departamento)'}
      </option>
      {#each filteredMunicipalities as mun (mun.id)}
        <option value={mun.id}>{mun.name}</option>
      {/each}
    </select>

    {#if errors.municipality}
      <p
        id="mun-error"
        class="text-red-500 text-sm mt-1 flex items-center"
        transition:fade
        role="alert"
      >
        <span class="mr-1"></span>{errors.municipality}
      </p>
    {/if}
  </div>

  <!-- Badge de Zona Especial -->
  {#if isSpecialZone}
    <div
      class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20
             border border-green-200 dark:border-green-800 rounded-lg p-4
             flex items-center gap-3"
      transition:fade
      role="status"
    >
      <span class="text-2xl"></span>
      <div>
        <p class="font-semibold text-green-900 dark:text-green-100">
          Envío Local Disponible
        </p>
        <p class="text-sm text-green-700 dark:text-green-200">
          Hemos optimizado entregas para {getLocationDisplayName(selectedDept, selectedMun)}
        </p>
      </div>
    </div>
  {/if}

  <!-- Dirección Detallada -->
  <div class="form-group">
    <label
      for="address"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      <span class="text-lg mr-2"></span>
      Dirección Detallada
      {#if required}
        <span class="text-red-500" aria-label="requerido">*</span>
      {/if}
    </label>

    <textarea
      id="address"
      bind:value={addressText}
      onblur={validateAddress}
      on:input={validateAddress}
      {disabled}
      placeholder="Ej: Calle Principal 123, Apto 4, zona 1..."
      rows="3"
      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
             focus:ring-2 focus:ring-green-500 focus:border-transparent
             transition-all duration-200 hover:border-green-400
             resize-none placeholder-gray-400 dark:placeholder-gray-500
             disabled:opacity-50 disabled:cursor-not-allowed
             {errors.address ? 'border-red-500 focus:ring-red-500' : ''}"
      aria-label="Ingresa la dirección completa"
      aria-invalid={!!errors.address}
      aria-describedby={errors.address ? 'addr-error' : 'addr-helper'}
    />

    <div class="mt-2 flex items-justify-between gap-4">
      {#if errors.address}
        <p
          id="addr-error"
          class="text-red-500 text-sm flex items-center"
          transition:fade
          role="alert"
        >
          <span class="mr-1"></span>{errors.address}
        </p>
      {:else}
        <p id="addr-helper" class="text-gray-500 dark:text-gray-400 text-xs">
          Incluye calle, número, apto/casa, zona
        </p>
      {/if}
      <p class="text-gray-400 dark:text-gray-500 text-xs">
        {addressText.length}/100
      </p>
    </div>
  </div>

  <!-- Preview de Ubicación Seleccionada -->
  {#if selectedDept && selectedMun}
    <div
      class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700
             rounded-lg p-4"
      transition:fade
    >
      <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
        Vista previa del envío
      </p>
      <div class="space-y-1">
        <p class="text-sm text-gray-900 dark:text-white">
          <span class="font-semibold">Ubicación:</span>
          {getLocationDisplayName(selectedDept, selectedMun)}
        </p>
        {#if addressText}
          <p class="text-sm text-gray-700 dark:text-gray-300">
            <span class="font-semibold">Dirección:</span>
            {addressText}
          </p>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .location-selector {
    --transition-timing: 200ms;
  }

  /* Focus visible para accesibilidad mejorada */
  :global(select:focus-visible, textarea:focus-visible) {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }

  /* Animación suave para errores */
  :global([role='alert']) {
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>

<script>
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	// ============================================================================
	// PROPS
	// ============================================================================
	export let municipality = '';

	// ============================================================================
	// SETUP
	// ============================================================================
	const dispatch = createEventDispatcher();
	const defaultZoom = 15;
	const MAX_INIT_ATTEMPTS = 50; // 5 segundos con intervalos de 100ms
	const INIT_RETRY_INTERVAL = 100; // ms

	// ============================================================================
	// STATE
	// ============================================================================
	let map; // google.maps.Map instancia
	let marker; // google.maps.Marker instancia
	let mapContainer; // Referencia al elemento DOM del contenedor
	let selectedLocation = {
		lat: 15.3197,
		lng: -91.4714,
		address: '',
		formattedAddress: ''
	};

	let geocoder; // google.maps.Geocoder instancia
	let isLoading = true;
	let error = null;
	let initAttempts = 0; // Contador de intentos de inicialización
	let initRetryInterval; // Referencia del setInterval

	// ============================================================================
	// CONFIGURACIÓN DE MUNICIPIOS
	// ============================================================================
	// Coordenadas de los centros de cada municipio para centrar el mapa
	const municipalityCenters = {
		'huehuetenango': { lat: 15.3197, lng: -91.4714, zoom: 14 },
		'chiantla': { lat: 15.3667, lng: -91.4667, zoom: 15 }
	};

	// ============================================================================
	// LIFECYCLE: MOUNT
	// ============================================================================
	/**
	 * Inicializar Google Maps con mecanismo de retry robusto
	 * 
	 * Problema que resuelve:
	 * - El mapContainer puede no estar disponible inmediatamente
	 * - setTimeout único era insuficiente para ciertos casos de retraso
	 * 
	 * Solución:
	 * - setInterval que reintenta cada 100ms
	 * - Máximo 50 intentos = 5 segundos de timeout
	 * - Verifica que mapContainer está disponible Y visible (offsetHeight !== 0)
	 */
	onMount(() => {
		const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
		
		if (!apiKey) {
			error = 'API Key de Google Maps no configurada';
			isLoading = false;
			console.error('VITE_GOOGLE_MAPS_API_KEY no está definida');
			return;
		}

		// Intentar cargar el mapa con reintentos cada 100ms
		initRetryInterval = setInterval(() => {
			initAttempts++;
			
			// Timeout de seguridad después de 5 segundos
			if (initAttempts > MAX_INIT_ATTEMPTS) {
				clearInterval(initRetryInterval);
				error = 'Timeout: No se pudo inicializar el mapa después de 5 segundos';
				isLoading = false;
				console.error('Timeout inicializando MapLocationPicker');
				return;
			}

			// Verificar que mapContainer está disponible Y visible
			// offsetHeight !== 0 asegura que el elemento tiene altura (visible)
			if (mapContainer && mapContainer.offsetHeight !== 0) {
				clearInterval(initRetryInterval);
				console.log(`MapLocationPicker inicializando en intento ${initAttempts}`);
				loadGoogleMapsScript(apiKey);
			}
		}, INIT_RETRY_INTERVAL);

		// Función de limpieza: se ejecuta si el componente se desmonta
		// antes de terminar la inicialización
		return () => {
			if (initRetryInterval) {
				clearInterval(initRetryInterval);
			}
		};
	});

	// ============================================================================
	// LIFECYCLE: DESTROY
	// ============================================================================
	/**
	 * Limpiar recursos al desmontar el componente
	 * 
	 * Importancia:
	 * - Previene memory leaks
	 * - Evita múltiples intervalos si componente se remonta
	 * - Limpia referencias no utilizadas
	 */
	onDestroy(() => {
		if (initRetryInterval) {
			clearInterval(initRetryInterval);
		}
	});

	// ============================================================================
	// FUNCIÓN: Cargar Script de Google Maps
	// ============================================================================
	/**
	 * Cargar el script de Google Maps API
	 * 
	 * Características mejoradas:
	 * 1. Detecta si Google Maps ya está cargado (evita duplicados)
	 * 2. Detecta si el script ya está en el DOM (espera carga)
	 * 3. Incluye loading=async para evitar warnings
	 * 4. Manejo robusto de errores
	 * 5. Logging detallado para debugging
	 */
	function loadGoogleMapsScript(apiKey) {
		// ✅ Verificar si Google Maps ya está cargado en window
		if (window.google && window.google.maps) {
			console.log('Google Maps ya estaba cargado');
			initMap();
			return;
		}

		// ✅ Si el script ya está en el DOM, esperar a que cargue
		// Esto evita agregar el script múltiples veces
		if (document.querySelector('script[src*="maps.googleapis.com"]')) {
			console.log('Script de Google Maps ya está en el DOM, esperando carga...');
			const checkGoogle = setInterval(() => {
				if (window.google && window.google.maps) {
					clearInterval(checkGoogle);
					initMap();
				}
			}, 100);
			// Timeout de 5 segundos si el script no carga
			setTimeout(() => {
				clearInterval(checkGoogle);
				if (!window.google || !window.google.maps) {
					error = 'Error cargando Google Maps (timeout)';
					isLoading = false;
				}
			}, 5000);
			return;
		}

		// ✅ Crear y cargar el script
		const script = document.createElement('script');
		// IMPORTANTE: loading=async evita warnings sobre async loading
		script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
		script.async = true;
		script.defer = true;
		
		script.onload = () => {
			console.log('Script de Google Maps cargado exitosamente');
			initMap();
		};
		
		script.onerror = () => {
			error = 'Error cargando Google Maps. Verifica tu conexión y API Key.';
			isLoading = false;
			console.error('Error cargando script de Google Maps');
		};

		document.head.appendChild(script);
	}

	// ============================================================================
	// FUNCIÓN: Inicializar el Mapa
	// ============================================================================
	/**
	 * Inicializar el mapa de Google Maps con marcador, eventos y geocoder
	 * 
	 * Validaciones múltiples:
	 * 1. mapContainer debe estar disponible
	 * 2. window.google.maps debe estar disponible
	 * 3. Manejo de errores en catch
	 */
	function initMap() {
		try {
			// Verificación 1: mapContainer disponible
			if (!mapContainer) {
				console.error('mapContainer no está disponible al inicializar');
				error = 'Contenedor del mapa no inicializado correctamente';
				isLoading = false;
				return;
			}

			// Verificación 2: Google Maps disponible
			if (!window.google || !window.google.maps) {
				console.error('Google Maps no está disponible');
				error = 'Google Maps no se cargó correctamente';
				isLoading = false;
				return;
			}

			// Obtener configuración del municipio seleccionado
			const munKey = municipality.toLowerCase();
			const center = municipalityCenters[munKey] || municipalityCenters['huehuetenango'];

			// ✅ Crear la instancia del mapa
			map = new google.maps.Map(mapContainer, {
				center: { lat: center.lat, lng: center.lng },
				zoom: center.zoom,
				mapTypeControl: false,
				streetViewControl: false,
				fullscreenControl: true,
				zoomControl: true
			});

			// ✅ Crear el marcador draggable
			marker = new google.maps.Marker({
				position: { lat: center.lat, lng: center.lng },
				map: map,
				draggable: true,
				animation: google.maps.Animation.DROP,
				title: 'Arrastra para ajustar tu ubicacion'
			});

			// ✅ Inicializar Geocoder para reverse geocoding
			geocoder = new google.maps.Geocoder();

			// ✅ Evento: cuando se arrastra el marcador
			marker.addListener('dragend', (event) => {
				const lat = event.latLng.lat();
				const lng = event.latLng.lng();
				updateLocation(lat, lng);
			});

			// ✅ Evento: hacer clic en el mapa
			map.addListener('click', (event) => {
				const lat = event.latLng.lat();
				const lng = event.latLng.lng();
				marker.setPosition({ lat, lng });
				updateLocation(lat, lng);
			});

			// ✅ Configurar autocomplete de direcciones
			const input = document.getElementById('address-autocomplete');
			if (input && window.google.maps.places) {
				const autocomplete = new google.maps.places.Autocomplete(input, {
					bounds: map.getBounds(),
					strictBounds: false,
					componentRestrictions: { country: 'gt' }
				});

				autocomplete.addListener('place_changed', () => {
					const place = autocomplete.getPlace();
					if (place.geometry && place.geometry.location) {
						const lat = place.geometry.location.lat();
						const lng = place.geometry.location.lng();
						map.setCenter({ lat, lng });
						marker.setPosition({ lat, lng });
						updateLocation(lat, lng, place.formatted_address);
					} else {
						console.warn('El lugar seleccionado no tiene geometría válida');
					}
				});
			} else if (input) {
				console.warn('Google Places API no está disponible');
			}

			// Inicializar con ubicación del centro del municipio
			updateLocation(center.lat, center.lng);
			isLoading = false;
			console.log('MapLocationPicker inicializado exitosamente');
		} catch (err) {
			console.error('Error inicializando mapa:', err);
			error = 'Error al inicializar el mapa: ' + err.message;
			isLoading = false;
		}
	}

	// ============================================================================
	// FUNCIÓN: Actualizar Ubicación
	// ============================================================================
	/**
	 * Actualizar la ubicación seleccionada y obtener su dirección
	 * 
	 * Flujo:
	 * 1. Si ya hay dirección (knownAddress), usarla directamente
	 * 2. Si no, usar reverse geocoding para obtener la dirección
	 * 3. Si geocoding falla, usar coordenadas como fallback
	 * 4. Disparar evento locationSelected con los datos
	 */
	async function updateLocation(lat, lng, knownAddress = null) {
		try {
			selectedLocation.lat = lat;
			selectedLocation.lng = lng;

			if (knownAddress) {
				// Ya tenemos la dirección del autocomplete
				selectedLocation.formattedAddress = knownAddress;
				selectedLocation.address = knownAddress;
			} else if (geocoder) {
				// Intentar obtener dirección mediante reverse geocoding
				try {
					const result = await geocodeLatLng(lat, lng);
					selectedLocation.formattedAddress = result.formatted_address;
					selectedLocation.address = result.formatted_address;
				} catch (err) {
					console.warn('Error en reverse geocoding:', err);
					// Fallback: usar coordenadas
					selectedLocation.formattedAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
					selectedLocation.address = `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
				}
			} else {
				// Geocoder aún no está disponible
				selectedLocation.formattedAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
				selectedLocation.address = `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
			}

			// Disparar evento para que el componente padre reciba la ubicación
			dispatch('locationSelected', selectedLocation);
		} catch (err) {
			console.error('Error actualizando ubicación:', err);
		}
	}

	// ============================================================================
	// FUNCIÓN: Reverse Geocoding
	// ============================================================================
	/**
	 * Convertir coordenadas (lat, lng) en dirección
	 * 
	 * Devuelve: Promise que resuelve con objeto de resultado del geocoder
	 * Rechaza: Si geocoder no está disponible o geocoding falla
	 */
	function geocodeLatLng(lat, lng) {
		return new Promise((resolve, reject) => {
			if (!geocoder) {
				reject(new Error('Geocoder no está disponible'));
				return;
			}

			geocoder.geocode({ location: { lat, lng } }, (results, status) => {
				if (status === 'OK' && results[0]) {
					resolve(results[0]);
				} else {
					reject(new Error(`Geocoder failed with status: ${status}`));
				}
			});
		});
	}

	// ============================================================================
	// FUNCIÓN: Centrar en Ubicación Actual del Usuario
	// ============================================================================
	/**
	 * Usar Geolocation API para obtener ubicación actual del usuario
	 * 
	 * Validaciones:
	 * 1. Verificar soporte de Geolocation API
	 * 2. Verificar que mapa está listo (no undefined/null)
	 * 3. Manejo específico de errores por código
	 * 4. Opciones mejoradas de geolocation (highAccuracy, timeout)
	 */
	function centerOnCurrentLocation() {
		// Validación 1: Navegador soporta Geolocation
		if (!navigator.geolocation) {
			alert('Tu navegador no soporta geolocation');
			return;
		}

		// Validación 2: Mapa está inicializado
		if (!map || !marker) {
			alert('El mapa aún no está inicializado. Espera un momento e intenta nuevamente.');
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				// Success callback
				try {
					const lat = position.coords.latitude;
					const lng = position.coords.longitude;
					map.setCenter({ lat, lng });
					marker.setPosition({ lat, lng });
					updateLocation(lat, lng);
				} catch (err) {
					console.error('Error procesando ubicación actual:', err);
					alert('Error al procesar tu ubicación. Por favor intenta nuevamente.');
				}
			},
			(err) => {
				// Error callback
				console.error('Error obteniendo ubicación:', err);
				let message = 'No se pudo obtener tu ubicación. ';
				
				// Mensajes específicos por tipo de error
				switch (err.code) {
					case err.PERMISSION_DENIED:
						message += 'Por favor permite el acceso a tu ubicación en la configuración del navegador.';
						break;
					case err.POSITION_UNAVAILABLE:
						message += 'La información de ubicación no está disponible.';
						break;
					case err.TIMEOUT:
						message += 'Se agotó el tiempo esperando la ubicación. Intenta nuevamente.';
						break;
					default:
						message += 'Marca manualmente en el mapa.';
				}
				alert(message);
			},
			// Opciones de geolocation
			{
				enableHighAccuracy: true, // Usar GPS (más preciso pero más lento)
				timeout: 10000, // 10 segundos máximo
				maximumAge: 0 // No usar ubicación en caché
			}
		);
	}
</script>

<!-- ========================================================================== -->
<!-- MARKUP -->
<!-- ========================================================================== -->

<div class="w-full">
	
	{#if isLoading}
		<!-- Estado: Cargando -->
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
		</div>
	{:else if error}
		<!-- Estado: Error -->
		<div class="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
			<h3 class="text-red-800 dark:text-red-300 font-bold mb-3">⚠️ Error: {error}</h3>
			{#if error.includes('no configurada')}
				<div class="bg-white dark:bg-gray-800 rounded p-4 text-sm text-gray-700 dark:text-gray-300">
					<p class="font-semibold mb-3">Para configurar Google Maps:</p>
					<ol class="list-decimal list-inside space-y-2 mb-4">
						<li>Obtén una API Key gratuita en <a href="https://console.cloud.google.com/" target="_blank" class="text-blue-600 dark:text-blue-400 underline font-medium">Google Cloud Console</a></li>
						<li>Abre el archivo <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">frontend/.env</code></li>
						<li>Agrega: <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">VITE_GOOGLE_MAPS_API_KEY=AIzaSyD_...</code></li>
						<li>Reinicia el servidor (Ctrl+C y npm run dev)</li>
					</ol>
					<p class="text-xs text-gray-500 dark:text-gray-400">Instrucciones completas: <a href="/GOOGLE_MAPS_SETUP.md" class="underline">GOOGLE_MAPS_SETUP.md</a></p>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Estado: Mapa Cargado -->
		
		<!-- Instrucciones -->
		<div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
			<div class="flex items-start gap-3">
				<div class="text-2xl">📍</div>
				<div>
					<h3 class="font-semibold text-blue-800 dark:text-blue-300 mb-1">
						Marca tu ubicacion exacta
					</h3>
					<p class="text-sm text-blue-700 dark:text-blue-400">
						Arrastra el marcador o haz clic en el mapa. Esto nos ayuda a encontrarte para la entrega.
					</p>
				</div>
			</div>
		</div>

		<!-- Buscador de direcciones -->
		<div class="mb-4">
			<label 
				for="address-autocomplete"
				class="block text-sm font-medium text-gray-900 dark:text-white mb-2"
			>
				Buscar direccion (opcional)
			</label>
			<input
				id="address-autocomplete"
				type="text"
				placeholder="Busca tu calle o colonia..."
				class="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-pink-500 focus:outline-none text-gray-900 dark:text-white transition-colors"
			/>
		</div>

		<!-- Contenedor del mapa -->
		<div 
			bind:this={mapContainer}
			class="w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-sm mb-4"
		></div>

		<!-- Botón ubicacion actual -->
		<button
			type="button"
			on:click={centerOnCurrentLocation}
			class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-4"
		>
			Usar mi ubicacion actual
		</button>

		<!-- Ubicacion seleccionada -->
		{#if selectedLocation.formattedAddress}
			<div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
				<p class="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
					Ubicacion seleccionada:
				</p>
				<p class="text-sm text-green-700 dark:text-green-400 mb-2">
					{selectedLocation.formattedAddress}
				</p>
				<p class="text-xs text-green-600 dark:text-green-500">
					Coordenadas: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
				</p>
			</div>
		{/if}
	{/if}
</div>

<!-- ========================================================================== -->
<!-- STYLES -->
<!-- ========================================================================== -->

<style>
	:global(#address-autocomplete) {
		font-family: inherit;
	}
</style>

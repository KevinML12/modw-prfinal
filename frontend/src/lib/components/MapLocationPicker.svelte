<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';

    export let municipality = '';
    export let initialLat = 15.3197;
    export let initialLng = -91.4714;

    const dispatch = createEventDispatcher();

    let map = null;
    let marker = null;
    let mapElement = null;
    let selectedLocation = {
        lat: initialLat,
        lng: initialLng,
        address: '',
        formattedAddress: ''
    };

    let geocoder = null;
    let isLoading = true;
    let error = null;

    const municipalityCenters = {
        'huehuetenango': { lat: 15.3197, lng: -91.4714, zoom: 14 },
        'chiantla': { lat: 15.3667, lng: -91.4667, zoom: 15 }
    };

    onMount(() => {
        console.log('[MapLocationPicker] Iniciando carga del mapa para municipio:', municipality);
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
            error = 'API Key de Google Maps no configurada';
            isLoading = false;
            console.error('[MapLocationPicker] Error: API Key no configurada');
            return;
        }

        // Esperar a que mapElement esté disponible (max 10 segundos)
        let attempts = 0;
        const maxAttempts = 100; // 10 segundos con intervalo de 100ms
        
        const waitForMap = setInterval(() => {
            attempts++;
            console.log(`[MapLocationPicker] Esperando mapElement, intento ${attempts}/${maxAttempts}`);
            
            if (mapElement && mapElement.offsetHeight > 0) {
                clearInterval(waitForMap);
                console.log('[MapLocationPicker] mapElement disponible, cargando Google Maps');
                loadGoogleMaps(apiKey);
            } else if (attempts >= maxAttempts) {
                clearInterval(waitForMap);
                error = 'Error: Contenedor del mapa no disponible (timeout 10s)';
                isLoading = false;
                console.error('[MapLocationPicker] Timeout esperando mapElement');
            }
        }, 100);

        return () => clearInterval(waitForMap);
    });

    function loadGoogleMaps(apiKey) {
        console.log('[MapLocationPicker] Verificando si Google Maps ya está cargado');
        if (window.google?.maps) {
            initMap();
            return;
        }

        console.log('[MapLocationPicker] Cargando script de Google Maps API');
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            console.log('[MapLocationPicker] Google Maps API cargado exitosamente');
            initMap();
        };
        
        script.onerror = () => {
            error = 'Error cargando Google Maps API';
            isLoading = false;
            console.error('[MapLocationPicker] Error cargando Google Maps API');
        };
        
        document.head.appendChild(script);
    }

    function initMap() {
        console.log('[MapLocationPicker] Inicializando mapa');
        if (!mapElement) {
            error = 'Error: Contenedor del mapa no disponible';
            isLoading = false;
            console.error('[MapLocationPicker] mapElement no disponible en initMap');
            return;
        }

        try {
            const munKey = municipality.toLowerCase();
            const center = municipalityCenters[munKey] || municipalityCenters['huehuetenango'];
            console.log('[MapLocationPicker] Centro del mapa:', center);

            map = new google.maps.Map(mapElement, {
                center: { lat: center.lat, lng: center.lng },
                zoom: center.zoom,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true
            });

            marker = new google.maps.Marker({
                position: { lat: center.lat, lng: center.lng },
                map: map,
                draggable: true,
                animation: google.maps.Animation.DROP,
                title: 'Arrastra para ajustar tu ubicación'
            });

            geocoder = new google.maps.Geocoder();

            marker.addListener('dragend', (event) => {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                console.log('[MapLocationPicker] Marcador arrastrado a:', lat, lng);
                updateLocation(lat, lng);
            });

            map.addListener('click', (event) => {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                console.log('[MapLocationPicker] Mapa clickeado en:', lat, lng);
                marker.setPosition({ lat, lng });
                updateLocation(lat, lng);
            });

            const input = document.getElementById('address-autocomplete');
            if (input) {
                const autocomplete = new google.maps.places.Autocomplete(input, {
                    componentRestrictions: { country: 'gt' }
                });

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.geometry) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        console.log('[MapLocationPicker] Autocomplete seleccionado:', place.formatted_address);
                        map.setCenter({ lat, lng });
                        marker.setPosition({ lat, lng });
                        updateLocation(lat, lng, place.formatted_address);
                    }
                });
            }

            updateLocation(center.lat, center.lng);
            isLoading = false;
            console.log('[MapLocationPicker] Mapa inicializado exitosamente');

        } catch (err) {
            error = 'Error al inicializar el mapa: ' + err.message;
            isLoading = false;
            console.error('[MapLocationPicker] Error en initMap:', err);
        }
    }

    async function updateLocation(lat, lng, knownAddress = null) {
        selectedLocation.lat = lat;
        selectedLocation.lng = lng;

        if (knownAddress) {
            selectedLocation.formattedAddress = knownAddress;
            selectedLocation.address = knownAddress;
        } else if (geocoder) {
            try {
                const result = await geocodeLatLng(lat, lng);
                selectedLocation.formattedAddress = result.formatted_address;
                selectedLocation.address = result.formatted_address;
                console.log('[MapLocationPicker] Dirección geocodificada:', result.formatted_address);
            } catch (err) {
                selectedLocation.formattedAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                console.warn('[MapLocationPicker] Error geocodificando:', err);
            }
        }

        dispatch('locationSelected', selectedLocation);
    }

    function geocodeLatLng(lat, lng) {
        return new Promise((resolve, reject) => {
            if (!geocoder) {
                reject(new Error('Geocoder no disponible'));
                return;
            }
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    resolve(results[0]);
                } else {
                    reject(new Error('Geocoder failed: ' + status));
                }
            });
        });
    }

    function centerOnCurrentLocation() {
        console.log('[MapLocationPicker] Solicitando ubicación actual');
        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización');
            return;
        }

        isLoading = true;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                console.log('[MapLocationPicker] Ubicación obtenida:', lat, lng);
                if (map && marker) {
                    map.setCenter({ lat, lng });
                    marker.setPosition({ lat, lng });
                    updateLocation(lat, lng);
                }
                isLoading = false;
            },
            () => {
                alert('No se pudo obtener tu ubicación. Marca manualmente en el mapa.');
                isLoading = false;
                console.warn('[MapLocationPicker] Error obteniendo ubicación');
            }
        );
    }
</script>

<div class="map-location-picker">
    {#if isLoading}
        <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-magenta"></div>
            <p class="ml-4 text-text-secondary">Cargando mapa...</p>
        </div>
    {:else if error}
        <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
            <p class="text-red-800 dark:text-red-300 font-semibold mb-2">Error al cargar el mapa</p>
            <p class="text-sm text-red-700 dark:text-red-400">{error}</p>
            <p class="text-xs text-red-600 dark:text-red-500 mt-2">
                Puedes continuar ingresando tu dirección manualmente arriba.
            </p>
        </div>
    {:else}
        <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div class="flex items-start gap-3">
                <div class="text-2xl">📍</div>
                <div>
                    <h3 class="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                        Marca tu ubicación exacta
                    </h3>
                    <p class="text-sm text-blue-700 dark:text-blue-400">
                        Arrastra el marcador o haz clic en el mapa. Esto nos ayuda a encontrarte para la entrega gratuita.
                    </p>
                </div>
            </div>
        </div>

        <div class="mb-4">
            <label for="address-autocomplete" class="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
                Buscar dirección (opcional)
            </label>
            <input
                id="address-autocomplete"
                type="text"
                placeholder="Busca tu calle o colonia..."
                class="w-full px-4 py-3 bg-bg-primary dark:bg-dark-bg-primary border-2 border-primary-magenta/30 rounded-xl focus:border-primary-magenta focus:outline-none text-text-primary dark:text-dark-text-primary transition-colors"
            />
        </div>

        <div 
            bind:this={mapElement}
            class="w-full h-[400px] rounded-xl overflow-hidden border-2 border-primary-magenta/20 shadow-soft mb-4"
        ></div>

        <button
            type="button"
            onclick={centerOnCurrentLocation}
            disabled={isLoading}
            class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mb-4"
        >
            <span>📍</span>
            <span>Usar mi ubicación actual</span>
        </button>

        {#if selectedLocation.formattedAddress}
            <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                <p class="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                    Ubicación seleccionada:
                </p>
                <p class="text-sm text-green-700 dark:text-green-400">
                    {selectedLocation.formattedAddress}
                </p>
                <p class="text-xs text-green-600 dark:text-green-500 mt-1">
                    Coordenadas: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
            </div>
        {/if}
    {/if}
</div>

<style>
    .map-location-picker {
        width: 100%;
    }
</style>
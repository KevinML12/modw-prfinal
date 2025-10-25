<!-- frontend/src/lib/components/ProductGallery.svelte -->
<script>
	const baseUrl = 'https://zsyhuqvoypolkktgngwk.supabase.co/storage/v1/object/public/product-images';
	
	let { images = [], productName = '' } = $props();
	
	let selectedIndex = $state(0);
	let loading = $state(true);
	
	$effect(() => {
		if (images.length > 0) {
			selectedIndex = 0;
			loading = false;
		}
	});
	
	function selectImage(index) {
		selectedIndex = index;
	}
	
	function nextImage() {
		if (images.length > 1) {
			selectedIndex = (selectedIndex + 1) % images.length;
		}
	}
	
	function prevImage() {
		if (images.length > 1) {
			selectedIndex = (selectedIndex - 1 + images.length) % images.length;
		}
	}
</script>

<div class="gallery-container">
	<!-- Imagen Principal -->
	<div class="main-image-container">
		{#if loading}
			<div class="skeleton"></div>
		{:else}
			<img 
				src="{baseUrl}/{images[selectedIndex]}"
				alt="{productName} - Vista {selectedIndex + 1}"
				class="main-image"
				onload={() => loading = false}
			/>
			
			{#if images.length > 1}
				<button class="nav-button prev" onclick={prevImage} aria-label="Imagen anterior">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="15 18 9 12 15 6"></polyline>
					</svg>
				</button>
				<button class="nav-button next" onclick={nextImage} aria-label="Siguiente imagen">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</button>
			{/if}
		{/if}
	</div>
	
	<!-- Miniaturas -->
	{#if images.length > 1}
		<div class="thumbnails">
			{#each images as img, i}
				<button 
					class="thumbnail"
					class:active={i === selectedIndex}
					onclick={() => selectImage(i)}
					aria-label="Ver imagen {i + 1}"
				>
					<img src="{baseUrl}/{img}" alt="Miniatura {i + 1}" />
				</button>
			{/each}
		</div>
		
		<div class="indicator">
			{selectedIndex + 1} / {images.length}
		</div>
	{/if}
</div>

<style>
	.gallery-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		width: 100%;
	}
	
	.main-image-container {
		position: relative;
		aspect-ratio: 1;
		border-radius: 0.5rem;
		overflow: hidden;
		background: var(--color-background-secondary);
	}
	
	.main-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 0.3s ease;
	}
	
	.skeleton {
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			var(--color-background-secondary) 25%,
			var(--color-border) 50%,
			var(--color-background-secondary) 75%
		);
		background-size: 200% 100%;
		animation: loading 1.5s infinite;
	}
	
	@keyframes loading {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
	
	.nav-button {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(255, 255, 255, 0.95);
		border: none;
		border-radius: 50%;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		color: var(--color-text);
		opacity: 0;
		pointer-events: none;
	}
	
	.main-image-container:hover .nav-button {
		opacity: 1;
		pointer-events: all;
	}
	
	.nav-button:hover {
		background: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
		transform: translateY(-50%) scale(1.1);
	}
	
	.nav-button.prev {
		left: 0.75rem;
	}
	
	.nav-button.next {
		right: 0.75rem;
	}
	
	.thumbnails {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		padding: 0.25rem 0;
		scrollbar-width: thin;
		scrollbar-color: var(--color-border) transparent;
	}
	
	.thumbnails::-webkit-scrollbar {
		height: 6px;
	}
	
	.thumbnails::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.thumbnails::-webkit-scrollbar-thumb {
		background: var(--color-border);
		border-radius: 3px;
	}
	
	.thumbnails::-webkit-scrollbar-thumb:hover {
		background: var(--color-text-secondary);
	}
	
	.thumbnail {
		flex-shrink: 0;
		width: 56px;
		height: 56px;
		border: 2px solid transparent;
		border-radius: 0.375rem;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s;
		background: var(--color-background-secondary);
		padding: 0;
	}
	
	.thumbnail:hover {
		border-color: var(--color-border);
	}
	
	.thumbnail.active {
		border-color: var(--color-primary);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}
	
	.thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.indicator {
		text-align: center;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-top: -0.25rem;
		font-weight: 500;
	}
	
	@media (max-width: 640px) {
		.nav-button {
			width: 32px;
			height: 32px;
		}
		
		.nav-button svg {
			width: 16px;
			height: 16px;
		}
		
		.thumbnail {
			width: 48px;
			height: 48px;
		}
	}
</style>
<!-- frontend/src/lib/components/ProductCard.svelte -->
<script>
	import ProductGallery from './ProductGallery.svelte';
	import { cart } from '$lib/stores/cart.store.js';

	let { product } = $props();

	// Parsear images de JSON string a array
	// Si no existe el campo images, usar image_url como fallback
	let images = $derived(
		product.images 
			? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images)
			: [product.image_url?.split('/').pop()?.replace('.jpg', '') || '1']
	);

	function addToCart() {
		cart.addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			image_url: product.image_url,
			quantity: 1
		});
	}
</script>

<div class="product-card">
	<a href="/products/{product.id}" class="product-link">
		<ProductGallery images={images} productName={product.name} />
	</a>

	<div class="product-info">
		<a href="/products/{product.id}" class="product-name-link">
			<h3 class="product-name">{product.name}</h3>
		</a>
		
		<p class="product-description">{product.description}</p>
		
		<div class="product-footer">
			<span class="product-price">Q{product.price.toFixed(2)}</span>
			
			<button 
				class="add-to-cart-button"
				onclick={addToCart}
				aria-label="Agregar {product.name} al carrito"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="9" cy="21" r="1"></circle>
					<circle cx="20" cy="21" r="1"></circle>
					<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
				</svg>
				<span>Agregar</span>
			</button>
		</div>
	</div>
</div>

<style>
	.product-card {
		display: flex;
		flex-direction: column;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		overflow: hidden;
		transition: all 0.3s ease;
		height: 100%;
	}

	.product-card:hover {
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.product-link {
		display: block;
		padding: 1rem;
		text-decoration: none;
	}

	.product-info {
		display: flex;
		flex-direction: column;
		padding: 0 1rem 1rem;
		flex: 1;
	}

	.product-name-link {
		text-decoration: none;
		color: inherit;
	}

	.product-name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
		line-height: 1.3;
		transition: color 0.2s;
	}

	.product-name-link:hover .product-name {
		color: var(--color-primary);
	}

	.product-description {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin: 0 0 1rem 0;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		flex: 1;
	}

	.product-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: auto;
	}

	.product-price {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.add-to-cart-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.add-to-cart-button:hover {
		background: var(--color-primary-dark);
		transform: scale(1.05);
	}

	.add-to-cart-button:active {
		transform: scale(0.98);
	}

	@media (max-width: 640px) {
		.product-name {
			font-size: 0.9375rem;
		}

		.product-description {
			font-size: 0.8125rem;
		}

		.product-price {
			font-size: 1.125rem;
		}

		.add-to-cart-button {
			padding: 0.5rem 0.75rem;
			font-size: 0.8125rem;
		}

		.add-to-cart-button svg {
			width: 16px;
			height: 16px;
		}
	}
</style>
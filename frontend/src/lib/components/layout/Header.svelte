<script>    
	import { brand } from '$lib/config/brand.config.js';
	import { cart } from '$lib/stores/cart.store.js';
	import { theme, toggleTheme } from '$lib/stores/theme.store.js';
</script>

<header class="w-full theme-transition">
	<div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
		<!-- Logo -->
		<a href="/" class="flex items-center gap-2 group">
			<div class="w-10 h-10 bg-gradient-magenta rounded-lg flex items-center justify-center text-white text-xl font-black group-hover:scale-105 transition-transform duration-300">
				✨
			</div>
			<div>
				<h1 class="text-xl font-black text-text-primary dark:text-dark-text-primary group-hover:text-primary-magenta dark:group-hover:text-dark-magenta transition-colors duration-300">
					{brand.identity.name}
				</h1>
				<p class="text-xs text-text-secondary dark:text-dark-text-secondary">Joyería Artesanal</p>
			</div>
		</a>

		<!-- Navigation -->
		<nav class="flex items-center gap-8">
			<a
				href="/"
				class="text-sm font-medium text-text-primary dark:text-dark-text-primary hover:text-primary-magenta dark:hover:text-dark-magenta transition-colors duration-300 hover:scale-105 inline-block origin-center"
			>
				Tienda
			</a>

			<!-- Cart Icon -->
			<a
				href="/checkout"
				class="relative flex items-center text-text-primary dark:text-dark-text-primary hover:text-primary-magenta dark:hover:text-dark-magenta transition-colors duration-300 hover:scale-105 origin-center group"
				aria-label="Ver carrito"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
				</svg>
				{#if $cart.itemCount && $cart.itemCount > 0}
					<span
						class="
							absolute -top-2 -right-2
							flex items-center justify-center
							w-5 h-5
							text-xs font-bold
							rounded-full
							bg-primary-magenta dark:bg-dark-magenta text-white
							group-hover:bg-primary-purple dark:group-hover:bg-dark-purple
							transition-colors duration-300
						"
					>
						{$cart.itemCount}
					</span>
				{/if}
			</a>

			<!-- Theme Toggle Button -->
			<button
				on:click={toggleTheme}
				class="
					flex items-center justify-center
					w-10 h-10
					text-text-primary dark:text-dark-text-primary
					hover:text-primary-magenta dark:hover:text-dark-magenta
					hover:bg-bg-secondary dark:hover:bg-dark-bg-card
					rounded-lg
					transition-all duration-300
					hover:scale-105
					origin-center
					group
				"
				aria-label={$theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
				title={$theme === 'light' ? '🌙 Modo oscuro' : '☀️ Modo claro'}
			>
				{#if $theme === 'light'}
					<!-- Moon icon for dark mode -->
					<svg class="w-6 h-6 animate-toggle-moon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
					</svg>
				{:else}
					<!-- Sun icon for light mode -->
					<svg class="w-6 h-6 animate-toggle-sun" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<circle cx="12" cy="12" r="5" />
						<line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
						<line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
						<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
						<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
						<line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
						<line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
						<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
						<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					</svg>
				{/if}
			</button>
		</nav>
	</div>
</header>
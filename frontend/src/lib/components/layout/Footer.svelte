<script>
	import { brand } from '$lib/config/brand.config.js';
</script>

<footer
	class="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 mt-24 text-center transition-colors duration-300"
>
	<div class="border-t border-gray-200 dark:border-dark-border pt-8">
		<p class="text-sm text-text-secondary dark:text-dark-text-secondary opacity-75 dark:opacity-100 transition-all duration-300 hover:opacity-100">
			&copy; {new Date().getFullYear()} {brand.identity.name}. Todos los derechos
			reservados.
		</p>
	</div>
</footer>
<script>
	import { brand } from '$lib/config/brand.config.js';
</script>

<footer
	class="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 mt-24 text-center"
>
	<div class="border-t border-gray-800 pt-8">
		<p class="text-sm opacity-50">
			&copy; {new Date().getFullYear()} {brand.identity.name}. Todos los derechos
			reservados.
		</p>
	</div>
</footer>
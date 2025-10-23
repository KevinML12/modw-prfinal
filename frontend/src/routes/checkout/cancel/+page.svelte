<script>
	// No necesita lógica especial, solo UI
</script>

<svelte:head>
	<title>Pago Cancelado | Moda Orgánica</title>
</svelte:head>

<div class="min-h-screen bg-bg-primary dark:bg-dark-bg-primary py-12 px-4">
	<div class="container mx-auto max-w-2xl">
		<div class="bg-bg-card dark:bg-dark-bg-card rounded-2xl p-12 shadow-soft dark:shadow-dark-soft text-center">
			<!-- Cancel Icon -->
			<div class="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
				<svg class="w-12 h-12 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
				</svg>
			</div>
			
			<!-- Title -->
			<h1 class="text-4xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
				Pago Cancelado
			</h1>
			
			<!-- Message -->
			<p class="text-lg text-text-secondary dark:text-dark-text-secondary mb-8">
				No se realizó ningún cargo. Tu carrito sigue intacto.
			</p>
			
			<!-- Info Box -->
			<div class="bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
				<p class="text-sm text-text-secondary dark:text-dark-text-secondary">
					💡 <strong>Tip:</strong> Si tuviste problemas con el pago, verifica tus datos y vuelve a intentarlo.
				</p>
			</div>
			
			<!-- Action Buttons -->
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a 
					href="/checkout"
					class="inline-block bg-gradient-to-r from-primary-magenta to-primary-purple dark:from-dark-magenta dark:to-dark-purple text-white font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform"
				>
					Volver al Checkout
				</a>
				
				<a 
					href="/"
					class="inline-block bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-dark-text-primary font-semibold px-8 py-3 rounded-xl hover:scale-105 transition-transform border-2 border-gray-300 dark:border-dark-border"
				>
					Seguir Comprando
				</a>
			</div>
		</div>
	</div>
</div>

<script>
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import { userStore } from '$lib/stores/user.store.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	
	let isLoading = true;
	
	onMount(() => {
		const unsubscribe = userStore.subscribe(state => {
			isLoading = state.loading;
			
			if (!state.loading && state.user) {
				const redirectTo = $page.url.searchParams.get('redirect') || '/';
				goto(redirectTo);
			}
		});
		
		return unsubscribe;
	});
	
	function handleSuccess(user) {
		const redirectTo = $page.url.searchParams.get('redirect') || '/';
		goto(redirectTo);
	}
</script>

<svelte:head>
	<title>Iniciar Sesión | Moda Orgánica</title>
	<meta name="description" content="Inicia sesión para ver tu historial de pedidos" />
</svelte:head>

<div class="min-h-screen bg-bg-primary dark:bg-dark-bg-primary py-12 px-4">
	{#if isLoading}
		<div class="flex items-center justify-center min-h-[400px]">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-magenta dark:border-dark-magenta"></div>
		</div>
	{:else}
		<div class="container mx-auto max-w-6xl">
			<div class="mb-8 text-center">
				<p class="text-text-secondary dark:text-dark-text-secondary text-sm">
					No necesitas cuenta para comprar.
					<a href="/checkout" class="text-primary-magenta dark:text-dark-magenta hover:underline">
						Continuar como invitado
					</a>
				</p>
			</div>
			
			<LoginForm onSuccess={handleSuccess} />
			
			<div class="mt-12 max-w-md mx-auto">
				<h3 class="text-lg font-bold text-text-primary dark:text-dark-text-primary text-center mb-6">
					¿Por qué crear una cuenta?
				</h3>
				<div class="grid gap-4">
					<div class="flex items-start gap-3 p-4 bg-bg-card dark:bg-dark-bg-card rounded-lg">
						<span class="text-2xl">📦</span>
						<div>
							<h4 class="font-semibold text-text-primary dark:text-dark-text-primary mb-1">
								Historial de pedidos
							</h4>
							<p class="text-sm text-text-secondary dark:text-dark-text-secondary">
								Consulta todos tus pedidos en un solo lugar
							</p>
						</div>
					</div>
					<div class="flex items-start gap-3 p-4 bg-bg-card dark:bg-dark-bg-card rounded-lg">
						<span class="text-2xl">⚡</span>
						<div>
							<h4 class="font-semibold text-text-primary dark:text-dark-text-primary mb-1">
								Checkout más rápido
							</h4>
							<p class="text-sm text-text-secondary dark:text-dark-text-secondary">
								Guardamos tu información para futuras compras
							</p>
						</div>
					</div>
					<div class="flex items-start gap-3 p-4 bg-bg-card dark:bg-dark-bg-card rounded-lg">
						<span class="text-2xl"></span>
						<div>
							<h4 class="font-semibold text-text-primary dark:text-dark-text-primary mb-1">
								Ofertas exclusivas
							</h4>
							<p class="text-sm text-text-secondary dark:text-dark-text-secondary">
								Recibe descuentos especiales por email
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

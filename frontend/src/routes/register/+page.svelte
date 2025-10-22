<script>
	import RegisterForm from '$lib/components/auth/RegisterForm.svelte';
	import { userStore } from '$lib/stores/user.store.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	let isLoading = true;
	
	onMount(() => {
		const unsubscribe = userStore.subscribe(state => {
			isLoading = state.loading;
			
			if (!state.loading && state.user) {
				goto('/');
			}
		});
		
		return unsubscribe;
	});
	
	function handleSuccess(user) {
		goto('/');
	}
</script>

<svelte:head>
	<title>Crear Cuenta | Moda Orgánica</title>
	<meta name="description" content="Crea tu cuenta para guardar tu historial de pedidos" />
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
			
			<RegisterForm onSuccess={handleSuccess} />
		</div>
	{/if}
</div>

<script>
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import RegisterForm from '$lib/components/auth/RegisterForm.svelte';
	
	let showLogin = true;
</script>

<div class="min-h-screen bg-bg-primary dark:bg-dark-bg-primary py-12 px-4">
	<div class="container mx-auto max-w-6xl">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold mb-4">🧪 Test Auth</h1>
			<button 
				onclick={() => showLogin = !showLogin}
				class="bg-primary-magenta text-white px-6 py-2 rounded-lg"
			>
				{showLogin ? 'Ver Register' : 'Ver Login'}
			</button>
		</div>
		
		{#if showLogin}
			<LoginForm />
		{:else}
			<RegisterForm />
		{/if}
	</div>
</div>
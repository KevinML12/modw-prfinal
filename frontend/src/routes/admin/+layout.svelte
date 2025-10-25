<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// Items del menú de admin
	const menuItems = [
		{ icon: '📊', label: 'Dashboard', href: '/admin' },
		{ icon: '📦', label: 'Órdenes', href: '/admin/orders' },
		{ icon: '🛍️', label: 'Inventario', href: '/admin/inventory' },
		{ icon: '⚙️', label: 'Configuración', href: '/admin/settings' },
	];

	let isSidebarOpen = false;

	// Determinar item activo
	$: currentPath = $page.url.pathname;

	// Verificar autenticación al montar
	onMount(() => {
		const token = localStorage.getItem('supabase_token');
		const role = localStorage.getItem('user_role');

		if (!token || role !== 'admin') {
			goto('/login?redirect=/admin');
		}
	});

	function handleLogout() {
		localStorage.removeItem('supabase_token');
		localStorage.removeItem('user_id');
		localStorage.removeItem('user_role');
		localStorage.removeItem('user_email');
		goto('/');
	}

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
	<!-- Overlay mobile -->
	{#if isSidebarOpen}
		<div
			class="fixed inset-0 bg-black/50 lg:hidden z-40"
			on:click={() => (isSidebarOpen = false)}
			role="presentation"
		/>
	{/if}

	<!-- Sidebar -->
	<aside
		class="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 lg:static lg:z-auto transition-transform duration-300 {isSidebarOpen
			? 'translate-x-0'
			: '-translate-x-full lg:translate-x-0'}"
	>
		<!-- Logo/Header -->
		<div class="p-6 border-b border-gray-200 dark:border-gray-700">
			<h1
				class="text-2xl font-black bg-gradient-to-r from-primary-magenta to-primary-purple bg-clip-text text-transparent"
			>
				Admin
			</h1>
			<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
				Moda Orgánica
			</p>
		</div>

		<!-- Navigation -->
		<nav class="p-4 space-y-2">
			{#each menuItems as item}
				<a
					href={item.href}
					on:click={() => (isSidebarOpen = false)}
					class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 {currentPath === item.href
						? 'bg-gradient-to-r from-primary-magenta to-primary-purple text-white shadow-lg'
						: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
				>
					<span class="text-xl">{item.icon}</span>
					<span class="font-medium">{item.label}</span>
				</a>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
			<button
				on:click={handleLogout}
				class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
			>
				<span class="text-xl">🚪</span>
				<span>Cerrar Sesión</span>
			</button>
		</div>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 flex flex-col">
		<!-- Mobile Header -->
		<div class="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between">
			<button
				on:click={toggleSidebar}
				class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
			>
				☰
			</button>
			<h1 class="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h1>
			<div class="w-6" />
		</div>

		<!-- Page Content -->
		<div class="flex-1 p-4 lg:p-8 overflow-auto">
			<slot />
		</div>
	</main>
</div>

<style>
	:global(body) {
		background-color: #f9fafb;
	}

	:global(.dark body) {
		background-color: #111827;
	}
</style>

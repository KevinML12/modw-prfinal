<script>
	export let value = '';
	export let label = '';
	export let id = '';
	export let type = 'text';
	export let placeholder = '';
	export let required = false;
</script>

<div class="w-full">
	<label for={id} class="block mb-2 text-sm font-medium text-neon-pink">
		{label}
	</label>
	{#if type === 'email'}
		<input
			type="email"
			{id}
			bind:value
			{placeholder}
			{required}
			class="w-full px-4 py-2 border rounded-2xl bg-black border-neon-pink/40 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-neon-pink transition-all duration-300"
		/>
	{:else if type === 'tel'}
		<input
			type="tel"
			{id}
			bind:value
			{placeholder}
			{required}
			class="w-full px-4 py-2 border rounded-2xl bg-black border-neon-pink/40 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-neon-pink transition-all duration-300"
		/>
	{:else}
		<input
			type="text"
			{id}
			bind:value
			{placeholder}
			{required}
			class="w-full px-4 py-2 border rounded-2xl bg-black border-neon-pink/40 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-neon-pink transition-all duration-300"
		/>
	{/if}
</div>
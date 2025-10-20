<script>
	export let value = '';
	export let label = '';
	export let id = '';
	export let type = 'text';
	export let placeholder = '';
	export let required = false;
</script>

<div class="w-full">
	<label for={id} class="block mb-2 text-sm font-semibold text-text-primary">
		{label}
	</label>
	{#if type === 'email'}
		<input
			type="email"
			{id}
			bind:value
			{placeholder}
			{required}
			class="
				w-full px-4 py-3
				border-2 border-gray-200
				rounded-lg
				bg-white
				text-text-primary
				placeholder:text-text-secondary/50
				focus:outline-none
				focus:border-primary-magenta
				focus:ring-2
				focus:ring-primary-magenta/10
				transition-all duration-300
			"
		/>
	{:else if type === 'tel'}
		<input
			type="tel"
			{id}
			bind:value
			{placeholder}
			{required}
			class="
				w-full px-4 py-3
				border-2 border-gray-200
				rounded-lg
				bg-white
				text-text-primary
				placeholder:text-text-secondary/50
				focus:outline-none
				focus:border-primary-magenta
				focus:ring-2
				focus:ring-primary-magenta/10
				transition-all duration-300
			"
		/>
	{:else}
		<input
			type="text"
			{id}
			bind:value
			{placeholder}
			{required}
			class="
				w-full px-4 py-3
				border-2 border-gray-200
				rounded-lg
				bg-white
				text-text-primary
				placeholder:text-text-secondary/50
				focus:outline-none
				focus:border-primary-magenta
				focus:ring-2
				focus:ring-primary-magenta/10
				transition-all duration-300
			"
		/>
	{/if}
</div>
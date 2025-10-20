<script>
	export let value = '';
	export let label = '';
	export let id = '';
	export let type = 'text';
	export let placeholder = '';
	export let required = false;
</script>

<div classclass="w-full">
	<label for={id} class="block mb-2 text-sm font-medium text-text">
		{label}
	</label>
	<input
		{type}
		{id}
		bind:value
		{placeholder}
		{required}
		class="w-full p-3 border rounded-lg bg-secondary border-gray-700 text-text placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
	/>
</div>
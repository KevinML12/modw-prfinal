<script>
	export let label = '';
	export let type = 'text';
	export let placeholder = '';
	export let value = '';
	export let required = false;
	export let disabled = false;
	export let helperText = '';
	export let error = '';
	export let autocomplete = '';
	export let maxlength = null;
	export let minlength = null;
	export let pattern = '';
	
	let dataTestId = '';
	export { dataTestId as 'data-testid' };
	
	let isFocused = false;
	let inputElement;
	
	$: hasError = !!error;
	$: showHelper = !hasError && !!helperText;
</script>

<div class="text-input-wrapper">
	{#if label}
		<label 
			for={dataTestId || label.toLowerCase().replace(/\s+/g, '-')}
			class="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2"
		>
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}
	
	{#if type === 'email'}
		<input
			bind:this={inputElement}
			bind:value
			type="email"
			id={dataTestId || label.toLowerCase().replace(/\s+/g, '-')}
			data-testid={dataTestId}
			{placeholder}
			{required}
			{disabled}
			{autocomplete}
			{maxlength}
			{minlength}
			{pattern}
			on:focus={() => isFocused = true}
			on:blur={() => isFocused = false}
			on:input
			on:change
			on:keydown
			on:keyup
			class="w-full px-4 py-3 bg-bg-primary dark:bg-dark-bg-primary border-2 rounded-xl 
				   focus:outline-none transition-colors text-text-primary dark:text-dark-text-primary
				   {hasError ? 'border-red-500 focus:border-red-600' : 'border-primary-magenta/30 focus:border-primary-magenta'}
				   {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
		/>
	{:else if type === 'tel'}
		<input
			bind:this={inputElement}
			bind:value
			type="tel"
			id={dataTestId || label.toLowerCase().replace(/\s+/g, '-')}
			data-testid={dataTestId}
			{placeholder}
			{required}
			{disabled}
			{autocomplete}
			{maxlength}
			{minlength}
			{pattern}
			on:focus={() => isFocused = true}
			on:blur={() => isFocused = false}
			on:input
			on:change
			on:keydown
			on:keyup
			class="w-full px-4 py-3 bg-bg-primary dark:bg-dark-bg-primary border-2 rounded-xl 
				   focus:outline-none transition-colors text-text-primary dark:text-dark-text-primary
				   {hasError ? 'border-red-500 focus:border-red-600' : 'border-primary-magenta/30 focus:border-primary-magenta'}
				   {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
		/>
	{:else if type === 'password'}
		<input
			bind:this={inputElement}
			bind:value
			type="password"
			id={dataTestId || label.toLowerCase().replace(/\s+/g, '-')}
			data-testid={dataTestId}
			{placeholder}
			{required}
			{disabled}
			{autocomplete}
			{maxlength}
			{minlength}
			{pattern}
			on:focus={() => isFocused = true}
			on:blur={() => isFocused = false}
			on:input
			on:change
			on:keydown
			on:keyup
			class="w-full px-4 py-3 bg-bg-primary dark:bg-dark-bg-primary border-2 rounded-xl 
				   focus:outline-none transition-colors text-text-primary dark:text-dark-text-primary
				   {hasError ? 'border-red-500 focus:border-red-600' : 'border-primary-magenta/30 focus:border-primary-magenta'}
				   {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
		/>
	{:else}
		<input
			bind:this={inputElement}
			bind:value
			type="text"
			id={dataTestId || label.toLowerCase().replace(/\s+/g, '-')}
			data-testid={dataTestId}
			{placeholder}
			{required}
			{disabled}
			{autocomplete}
			{maxlength}
			{minlength}
			{pattern}
			on:focus={() => isFocused = true}
			on:blur={() => isFocused = false}
			on:input
			on:change
			on:keydown
			on:keyup
			class="w-full px-4 py-3 bg-bg-primary dark:bg-dark-bg-primary border-2 rounded-xl 
				   focus:outline-none transition-colors text-text-primary dark:text-dark-text-primary
				   {hasError ? 'border-red-500 focus:border-red-600' : 'border-primary-magenta/30 focus:border-primary-magenta'}
				   {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
		/>
	{/if}
	
	{#if hasError}
		<p class="mt-2 text-sm text-red-600 dark:text-red-400">
			{error}
		</p>
	{:else if showHelper}
		<p class="mt-2 text-sm text-text-tertiary dark:text-dark-text-tertiary">
			{helperText}
		</p>
	{/if}
</div>

<style>
	.text-input-wrapper {
		width: 100%;
	}
</style>
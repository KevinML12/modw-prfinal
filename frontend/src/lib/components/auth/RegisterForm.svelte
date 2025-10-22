<script>
	import { userStore } from '$lib/stores/user.store.js';
	import { goto } from '$app/navigation';
	import { isValidEmail, validatePassword, passwordsMatch, isValidName } from '$lib/utils/validation.js';
	import { fade } from 'svelte/transition';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	
	export let redirectTo = '/';
	export let onSuccess = null;
	
	let fullName = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let showPassword = false;
	let showConfirmPassword = false;
	let errors = { fullName: '', email: '', password: '', confirmPassword: '', general: '' };
	let isSubmitting = false;
	
	function clearError(field) {
		errors[field] = '';
		errors.general = '';
	}
	
	function validate() {
		let isValid = true;
		errors = { fullName: '', email: '', password: '', confirmPassword: '', general: '' };
		
		if (!fullName) {
			errors.fullName = 'El nombre es requerido';
			isValid = false;
		} else if (!isValidName(fullName)) {
			errors.fullName = 'Mínimo 3 caracteres';
			isValid = false;
		}
		
		if (!email) {
			errors.email = 'El email es requerido';
			isValid = false;
		} else if (!isValidEmail(email)) {
			errors.email = 'Email inválido';
			isValid = false;
		}
		
		const passwordValidation = validatePassword(password);
		if (!passwordValidation.valid) {
			errors.password = passwordValidation.message;
			isValid = false;
		}
		
		if (!confirmPassword) {
			errors.confirmPassword = 'Confirma tu contraseña';
			isValid = false;
		} else if (!passwordsMatch(password, confirmPassword)) {
			errors.confirmPassword = 'Las contraseñas no coinciden';
			isValid = false;
		}
		
		return isValid;
	}
	
	async function handleRegister(e) {
		e.preventDefault();
		
		if (!validate()) return;
		
		isSubmitting = true;
		
		const result = await userStore.register(email, password, {
			full_name: fullName
		});
		
		isSubmitting = false;
		
		if (result.success) {
			if (onSuccess) {
				onSuccess(result.user);
			} else {
				goto(redirectTo);
			}
		} else {
			errors.general = result.error || 'Error al registrarse';
		}
	}
</script>

<div class="max-w-md mx-auto">
	<form 
		onsubmit={handleRegister} 
		class="bg-bg-card dark:bg-dark-bg-card rounded-2xl p-8 shadow-soft dark:shadow-dark-soft border-2 border-transparent hover:border-primary-magenta/30 dark:hover:border-dark-magenta/30 transition-colors"
		data-testid="register-form"
	>
		<div class="text-center mb-8">
			<h2 class="text-3xl font-bold bg-gradient-to-r from-primary-magenta to-primary-purple dark:from-dark-magenta dark:to-dark-purple bg-clip-text text-transparent mb-2">
				Crear Cuenta
			</h2>
			<p class="text-text-secondary dark:text-dark-text-secondary">
				Únete a nuestra comunidad
			</p>
		</div>
		
		<div class="mb-5">
			<TextInput
				label="Nombre Completo"
				id="register-fullname"
				type="text"
				placeholder="María Rodríguez"
				bind:value={fullName}
				required
			/>
			{#if errors.fullName}
				<p class="text-xs text-red-600 mt-1" transition:fade>
					{errors.fullName}
				</p>
			{/if}
		</div>
		
		<div class="mb-5">
			<TextInput
				label="Email"
				id="register-email"
				type="email"
				placeholder="tu@email.com"
				bind:value={email}
				required
			/>
			{#if errors.email}
				<p class="text-xs text-red-600 mt-1" transition:fade>
					{errors.email}
				</p>
			{/if}
		</div>
		
		<div class="mb-5">
			<label 
				for="register-password" 
				class="block mb-2 text-sm font-semibold text-text-primary dark:text-dark-text-primary"
			>
				Contraseña
			</label>
			<div class="relative">
				{#if showPassword}
					<input 
						type="text"
						id="register-password"
						data-testid="password-input"
						bind:value={password}
						oninput={() => clearError('password')}
						placeholder="••••••••"
						class="w-full px-4 py-3 pr-12 
							   border-2 border-gray-200 dark:border-dark-border
							   rounded-lg
							   bg-white dark:bg-dark-bg-secondary
							   text-text-primary dark:text-dark-text-primary
							   placeholder:text-text-secondary/50 dark:placeholder:text-dark-text-secondary/50
							   focus:outline-none
							   focus:border-primary-magenta dark:focus:border-dark-magenta
							   focus:ring-2
							   focus:ring-primary-magenta/10 dark:focus:ring-dark-magenta/10
							   transition-all duration-300
							   disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={isSubmitting}
						required
					/>
				{:else}
					<input 
						type="password"
						id="register-password"
						data-testid="password-input"
						bind:value={password}
						oninput={() => clearError('password')}
						placeholder="••••••••"
						class="w-full px-4 py-3 pr-12 
							   border-2 border-gray-200 dark:border-dark-border
							   rounded-lg
							   bg-white dark:bg-dark-bg-secondary
							   text-text-primary dark:text-dark-text-primary
							   placeholder:text-text-secondary/50 dark:placeholder:text-dark-text-secondary/50
							   focus:outline-none
							   focus:border-primary-magenta dark:focus:border-dark-magenta
							   focus:ring-2
							   focus:ring-primary-magenta/10 dark:focus:ring-dark-magenta/10
							   transition-all duration-300
							   disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={isSubmitting}
						required
					/>
				{/if}
				<button 
					type="button"
					onclick={() => showPassword = !showPassword}
					class="absolute right-4 top-1/2 transform -translate-y-1/2
						   text-text-secondary dark:text-dark-text-secondary
						   hover:text-primary-magenta dark:hover:text-dark-magenta
						   transition-colors"
					tabindex="-1"
					aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
				>
					{#if showPassword}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
						</svg>
					{:else}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
					{/if}
				</button>
			</div>
			{#if errors.password}
				<p class="text-xs text-red-600 mt-1" transition:fade>
					{errors.password}
				</p>
			{/if}
		</div>
		
		<div class="mb-6">
			<label 
				for="register-confirm-password" 
				class="block mb-2 text-sm font-semibold text-text-primary dark:text-dark-text-primary"
			>
				Confirmar Contraseña
			</label>
			<div class="relative">
				{#if showConfirmPassword}
					<input 
						type="text"
						id="register-confirm-password"
						data-testid="confirm-password-input"
						bind:value={confirmPassword}
						oninput={() => clearError('confirmPassword')}
						placeholder="••••••••"
						class="w-full px-4 py-3 pr-12 
							   border-2 border-gray-200 dark:border-dark-border
							   rounded-lg
							   bg-white dark:bg-dark-bg-secondary
							   text-text-primary dark:text-dark-text-primary
							   placeholder:text-text-secondary/50 dark:placeholder:text-dark-text-secondary/50
							   focus:outline-none
							   focus:border-primary-magenta dark:focus:border-dark-magenta
							   focus:ring-2
							   focus:ring-primary-magenta/10 dark:focus:ring-dark-magenta/10
							   transition-all duration-300
							   disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={isSubmitting}
						required
					/>
				{:else}
					<input 
						type="password"
						id="register-confirm-password"
						data-testid="confirm-password-input"
						bind:value={confirmPassword}
						oninput={() => clearError('confirmPassword')}
						placeholder="••••••••"
						class="w-full px-4 py-3 pr-12 
							   border-2 border-gray-200 dark:border-dark-border
							   rounded-lg
							   bg-white dark:bg-dark-bg-secondary
							   text-text-primary dark:text-dark-text-primary
							   placeholder:text-text-secondary/50 dark:placeholder:text-dark-text-secondary/50
							   focus:outline-none
							   focus:border-primary-magenta dark:focus:border-dark-magenta
							   focus:ring-2
							   focus:ring-primary-magenta/10 dark:focus:ring-dark-magenta/10
							   transition-all duration-300
							   disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={isSubmitting}
						required
					/>
				{/if}
				<button 
					type="button"
					onclick={() => showConfirmPassword = !showConfirmPassword}
					class="absolute right-4 top-1/2 transform -translate-y-1/2
						   text-text-secondary dark:text-dark-text-secondary
						   hover:text-primary-magenta dark:hover:text-dark-magenta
						   transition-colors"
					tabindex="-1"
					aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
				>
					{#if showConfirmPassword}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
						</svg>
					{:else}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
					{/if}
				</button>
			</div>
			{#if errors.confirmPassword}
				<p class="text-xs text-red-600 mt-1" transition:fade>
					{errors.confirmPassword}
				</p>
			{/if}
		</div>
		
		{#if errors.general}
			<div 
				class="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg"
				transition:fade
			>
				<p class="text-sm text-red-800 dark:text-red-200">
					{errors.general}
				</p>
			</div>
		{/if}
		
		<button 
			type="submit"
			data-testid="submit-register"
			disabled={isSubmitting}
			class="w-full
				   bg-gradient-to-r from-primary-magenta to-primary-purple dark:from-dark-magenta dark:to-dark-purple
				   hover:shadow-magenta dark:hover:shadow-[0_0_20px_rgba(255,92,173,0.5)]
				   text-white 
				   font-bold 
				   py-3 px-6
				   rounded-xl
				   transition-all duration-300
				   hover:scale-[1.02]
				   active:scale-95
				   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
		>
			{#if isSubmitting}
				<span class="flex items-center justify-center gap-2">
					<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Creando cuenta...
				</span>
			{:else}
				Crear Cuenta
			{/if}
		</button>
		
		<div class="mt-6 text-center">
			<p class="text-sm text-text-secondary dark:text-dark-text-secondary">
				¿Ya tienes cuenta? 
				<a 
					href="/login" 
					class="text-primary-magenta dark:text-dark-magenta font-semibold hover:underline"
				>
					Inicia sesión
				</a>
			</p>
		</div>
	</form>
</div>

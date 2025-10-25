
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```sh
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const BASE_URL: string;
	export const SUPABASE_URL: string;
	export const CARGO_EXPRESO_SENDER_ADDRESS: string;
	export const npm_config_user_agent: string;
	export const NODE_VERSION: string;
	export const HOSTNAME: string;
	export const YARN_VERSION: string;
	export const npm_node_execpath: string;
	export const SUPABASE_JWT_SECRET: string;
	export const SHLVL: string;
	export const HOME: string;
	export const CARGO_EXPRESO_SENDER_NAME: string;
	export const npm_package_json: string;
	export const COREPACK_ROOT: string;
	export const OLLAMA_URL: string;
	export const COREPACK_ENABLE_DOWNLOAD_PROMPT: string;
	export const pnpm_config_verify_deps_before_run: string;
	export const _: string;
	export const CARGO_EXPRESO_SENDER_PHONE: string;
	export const CARGO_EXPRESO_MOCK: string;
	export const npm_config_registry: string;
	export const npm_config_node_gyp: string;
	export const PATH: string;
	export const VITE_SUPABASE_ANON_KEY: string;
	export const npm_package_name: string;
	export const npm_config_store_dir: string;
	export const NODE: string;
	export const npm_config_frozen_lockfile: string;
	export const MEILI_HOST: string;
	export const STRIPE_SECRET_KEY: string;
	export const npm_lifecycle_script: string;
	export const VITE_SUPABASE_URL: string;
	export const MEILI_MASTER_KEY: string;
	export const npm_package_version: string;
	export const npm_lifecycle_event: string;
	export const npm_config_verify_deps_before_run: string;
	export const NODE_PATH: string;
	export const SUPABASE_SERVICE_KEY: string;
	export const STRIPE_PUBLISHABLE_KEY: string;
	export const CARGO_EXPRESO_SENDER_CITY: string;
	export const GIN_MODE: string;
	export const VITE_GOOGLE_MAPS_API_KEY: string;
	export const SERVER_API_URL: string;
	export const PWD: string;
	export const npm_execpath: string;
	export const npm_config__jsr_registry: string;
	export const npm_command: string;
	export const PNPM_SCRIPT_SRC_DIR: string;
	export const API_URL: string;
	export const NODE_ENV: string;
	export const FRONTEND_URL: string;
	export const VITE_API_URL: string;
	export const INIT_CWD: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		BASE_URL: string;
		SUPABASE_URL: string;
		CARGO_EXPRESO_SENDER_ADDRESS: string;
		npm_config_user_agent: string;
		NODE_VERSION: string;
		HOSTNAME: string;
		YARN_VERSION: string;
		npm_node_execpath: string;
		SUPABASE_JWT_SECRET: string;
		SHLVL: string;
		HOME: string;
		CARGO_EXPRESO_SENDER_NAME: string;
		npm_package_json: string;
		COREPACK_ROOT: string;
		OLLAMA_URL: string;
		COREPACK_ENABLE_DOWNLOAD_PROMPT: string;
		pnpm_config_verify_deps_before_run: string;
		_: string;
		CARGO_EXPRESO_SENDER_PHONE: string;
		CARGO_EXPRESO_MOCK: string;
		npm_config_registry: string;
		npm_config_node_gyp: string;
		PATH: string;
		VITE_SUPABASE_ANON_KEY: string;
		npm_package_name: string;
		npm_config_store_dir: string;
		NODE: string;
		npm_config_frozen_lockfile: string;
		MEILI_HOST: string;
		STRIPE_SECRET_KEY: string;
		npm_lifecycle_script: string;
		VITE_SUPABASE_URL: string;
		MEILI_MASTER_KEY: string;
		npm_package_version: string;
		npm_lifecycle_event: string;
		npm_config_verify_deps_before_run: string;
		NODE_PATH: string;
		SUPABASE_SERVICE_KEY: string;
		STRIPE_PUBLISHABLE_KEY: string;
		CARGO_EXPRESO_SENDER_CITY: string;
		GIN_MODE: string;
		VITE_GOOGLE_MAPS_API_KEY: string;
		SERVER_API_URL: string;
		PWD: string;
		npm_execpath: string;
		npm_config__jsr_registry: string;
		npm_command: string;
		PNPM_SCRIPT_SRC_DIR: string;
		API_URL: string;
		NODE_ENV: string;
		FRONTEND_URL: string;
		VITE_API_URL: string;
		INIT_CWD: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}

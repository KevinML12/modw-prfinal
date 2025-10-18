
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/checkout" | "/product" | "/product/[id]";
		RouteParams(): {
			"/product/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/checkout": Record<string, never>;
			"/product": { id?: string };
			"/product/[id]": { id: string }
		};
		Pathname(): "/" | "/checkout" | "/checkout/" | "/product" | "/product/" | `/product/${string}` & {} | `/product/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/icons/android-chrome-192x192.png" | "/icons/android-chrome-512x512.png" | "/icons/apple-touch-icon.png" | "/icons/favicon-16x16.png" | "/icons/favicon-32x32.png" | "/icons/favicon.ico" | "/manifest.json" | string & {};
	}
}
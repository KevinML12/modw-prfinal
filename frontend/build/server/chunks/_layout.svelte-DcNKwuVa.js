import { c as create_ssr_component, v as validate_component, a as subscribe, e as escape, b as add_attribute } from './ssr-3uoM6Jlz.js';
import { b as brand } from './brand.config-K_sD6LUe.js';
import { c as cart } from './cart.store-DLR5LjFl.js';
import { w as writable } from './index-C12HHKrG.js';

function getInitialTheme() {
  return "light";
}
const initialTheme = getInitialTheme();
const theme = writable(initialTheme);
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let itemCount;
  let $cart, $$unsubscribe_cart;
  let $theme, $$unsubscribe_theme;
  $$unsubscribe_cart = subscribe(cart, (value) => $cart = value);
  $$unsubscribe_theme = subscribe(theme, (value) => $theme = value);
  itemCount = $cart?.itemCount ?? 0;
  $$unsubscribe_cart();
  $$unsubscribe_theme();
  return `<header class="w-full theme-transition"><div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between"> <a href="/" class="flex items-center gap-2 group"><div class="w-10 h-10 bg-gradient-magenta rounded-lg flex items-center justify-center text-white text-xl font-black group-hover:scale-105 transition-transform duration-300" data-svelte-h="svelte-q7rbkk">✨</div> <div><h1 class="text-xl font-black text-text-primary dark:text-dark-text-primary group-hover:text-primary-magenta dark:group-hover:text-dark-magenta transition-colors duration-300">${escape(brand.identity.name)}</h1> <p class="text-xs text-text-secondary dark:text-dark-text-secondary" data-svelte-h="svelte-1yeooaj">Joyería Artesanal</p></div></a>  <nav class="flex items-center gap-8"><a href="/" class="text-sm font-medium text-text-primary dark:text-dark-text-primary hover:text-primary-magenta dark:hover:text-dark-magenta transition-colors duration-300 hover:scale-105 inline-block origin-center" data-svelte-h="svelte-1xdvfeb">Tienda</a>  <a href="/checkout" class="relative flex items-center text-text-primary dark:text-dark-text-primary hover:text-primary-magenta dark:hover:text-dark-magenta transition-colors duration-300 hover:scale-105 origin-center group" aria-label="Ver carrito"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg> ${itemCount > 0 ? `<span class="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-primary-magenta dark:bg-dark-magenta text-white group-hover:bg-primary-purple dark:group-hover:bg-dark-purple transition-colors duration-300 ">${escape(itemCount)}</span>` : ``}</a>  <button class="flex items-center justify-center w-10 h-10 text-text-primary dark:text-dark-text-primary hover:text-primary-magenta dark:hover:text-dark-magenta hover:bg-bg-secondary dark:hover:bg-dark-bg-card rounded-lg transition-all duration-300 hover:scale-105 origin-center group "${add_attribute(
    "aria-label",
    $theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro",
    0
  )}${add_attribute("title", $theme === "light" ? "🌙 Modo oscuro" : "☀️ Modo claro", 0)}>${$theme === "light" ? ` <svg class="w-6 h-6 animate-toggle-moon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>` : ` <svg class="w-6 h-6 animate-toggle-sun" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line><line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line><line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line><line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line></svg>`}</button></nav></div></header>`;
});
const Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<footer class="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 mt-24 text-center transition-colors duration-300"><div class="border-t border-gray-200 dark:border-dark-border pt-8"><p class="text-sm text-text-secondary dark:text-dark-text-secondary opacity-75 dark:opacity-100 transition-all duration-300 hover:opacity-100">© ${escape((/* @__PURE__ */ new Date()).getFullYear())} ${escape(brand.identity.name)}. Todos los derechos
			reservados.</p></div></footer>`;
});
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex flex-col transition-colors duration-300"> <header class="sticky top-0 z-50 bg-white/95 dark:bg-dark-bg-secondary/95 backdrop-blur-md border-b border-gray-200 dark:border-dark-border shadow-soft dark:shadow-dark-soft transition-colors duration-300 ">${validate_component(Header, "Header").$$render($$result, {}, {}, {})}</header>  <main class="flex-1 transition-colors duration-300">${slots.default ? slots.default({}) : ``}</main>  <footer class="bg-bg-secondary dark:bg-dark-bg-secondary border-t border-gray-200 dark:border-dark-border mt-20 transition-colors duration-300 ">${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}</footer></div>`;
});

export { Layout as default };
//# sourceMappingURL=_layout.svelte-DcNKwuVa.js.map

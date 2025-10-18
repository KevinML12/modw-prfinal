import { c as create_ssr_component, a as subscribe, f as each, e as escape, b as add_attribute } from "../../../chunks/ssr.js";
import { c as cart, b as brand } from "../../../chunks/cart.store.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let subtotal;
  let shippingCost;
  let total;
  let $cart, $$unsubscribe_cart;
  $$unsubscribe_cart = subscribe(cart, (value) => $cart = value);
  const shippingRules = brand.businessRules.shipping;
  let clientMunicipality = "";
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(value);
  };
  subtotal = $cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  shippingCost = (() => {
    const normalizedInput = clientMunicipality.toLowerCase().trim();
    if (shippingRules.localZones.includes(normalizedInput)) {
      return shippingRules.costs.local;
    }
    return shippingRules.costs.national;
  })();
  total = subtotal + shippingCost;
  $$unsubscribe_cart();
  return `${$$result.head += `<!-- HEAD_svelte-zv37gt_START -->${$$result.title = `<title>Finalizar Compra | ${escape(brand.identity.name)}</title>`, ""}<!-- HEAD_svelte-zv37gt_END -->`, ""} <div class="bg-background flex min-h-screen justify-center p-4 md:p-8"><div class="w-full max-w-4xl"><h1 class="font-headings text-text mb-8 text-center text-4xl" data-svelte-h="svelte-1g8isny">Finalizar Compra</h1> ${$cart.length === 0 ? `<div class="font-body rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm" data-svelte-h="svelte-88xywg"><p class="text-xl text-gray-700">Tu carrito está vacío.</p> <a href="/" class="bg-primary mt-4 inline-block rounded-md px-6 py-2 text-white hover:bg-secondary focus:bg-secondary">Volver a la tienda</a></div>` : `<div class="font-body grid grid-cols-1 gap-8 md:grid-cols-2"><div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><h2 class="font-headings mb-4 text-2xl" data-svelte-h="svelte-v6qemj">Resumen de tu Orden</h2> <div class="mb-4 space-y-3 border-b pb-4">${each($cart, (item) => {
    return `<div class="flex justify-between"><span>${escape(item.name)} (x${escape(item.quantity)})</span> <span class="font-medium">${escape(formatCurrency(item.price * item.quantity))}</span> </div>`;
  })}</div> <div class="space-y-2"><div class="flex justify-between"><span data-svelte-h="svelte-1ytwh2c">Subtotal:</span> <span>${escape(formatCurrency(subtotal))}</span></div> <div class="flex justify-between"><span>Envío (${escape(shippingRules.nationalProvider)}):</span> <span>${escape(formatCurrency(shippingCost))}</span></div> <div class="font-headings text-text flex justify-between border-t pt-2 text-xl font-bold"><span data-svelte-h="svelte-ukqv8i">Total:</span> <span>${escape(formatCurrency(total))}</span></div></div></div> <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><h2 class="font-headings mb-4 text-2xl" data-svelte-h="svelte-1u3e68z">Información de Envío</h2> <form class="space-y-4"><div data-svelte-h="svelte-1b25qq"><label for="name" class="mb-1 block text-sm font-medium">Nombre Completo</label> <input type="text" id="name" class="w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" required></div> <div data-svelte-h="svelte-1g3l5fj"><label for="address" class="mb-1 block text-sm font-medium">Dirección Completa</label> <input type="text" id="address" class="w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" required></div> <div><label for="municipality" class="mb-1 block text-sm font-medium" data-svelte-h="svelte-y33f1z">Municipio</label> <input type="text" id="municipality" class="w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Ej: Huehuetenango" required${add_attribute("value", clientMunicipality, 0)}> <p class="mt-1 text-xs text-gray-500">Costo local (${escape(formatCurrency(shippingRules.costs.local))}) aplica
                para:
                ${escape(shippingRules.localZones.join(", "))}.</p></div> <div data-svelte-h="svelte-11lqxbs"><label for="phone" class="mb-1 block text-sm font-medium">Teléfono</label> <input type="tel" id="phone" class="w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" required></div> <div class="rounded border border-dashed border-gray-400 bg-gray-50 p-4 text-center" data-svelte-h="svelte-xljpck"><span class="text-gray-600">(Aquí iría el Componente de Pago Seguro)</span></div> <button type="submit" class="font-headings bg-primary w-full rounded-md px-4 py-3 text-lg font-semibold text-white transition-colors duration-300 hover:bg-secondary focus:bg-secondary">Pagar ${escape(formatCurrency(total))}</button></form></div></div>`}</div></div>`;
});
export {
  Page as default
};

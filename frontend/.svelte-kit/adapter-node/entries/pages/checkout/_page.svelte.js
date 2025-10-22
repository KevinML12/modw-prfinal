import { c as create_ssr_component, b as add_attribute, e as escape, v as validate_component, d as each } from "../../../chunks/ssr.js";
import { b as brand } from "../../../chunks/brand.config.js";
import "../../../chunks/cart.store.js";
import { c as currencyFormatter } from "../../../chunks/currency.store.js";
const TextInput = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { value = "" } = $$props;
  let { label = "" } = $$props;
  let { id = "" } = $$props;
  let { type = "text" } = $$props;
  let { placeholder = "" } = $$props;
  let { required = false } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0) $$bindings.label(label);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0) $$bindings.id(id);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0) $$bindings.type(type);
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0) $$bindings.placeholder(placeholder);
  if ($$props.required === void 0 && $$bindings.required && required !== void 0) $$bindings.required(required);
  return `<div class="w-full"><label${add_attribute("for", id, 0)} class="block mb-2 text-sm font-semibold text-text-primary">${escape(label)}</label> ${type === "email" ? `<input type="email"${add_attribute("id", id, 0)}${add_attribute("placeholder", placeholder, 0)} ${required ? "required" : ""} class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary-magenta focus:ring-2 focus:ring-primary-magenta/10 transition-all duration-300 "${add_attribute("value", value, 0)}>` : `${type === "tel" ? `<input type="tel"${add_attribute("id", id, 0)}${add_attribute("placeholder", placeholder, 0)} ${required ? "required" : ""} class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary-magenta focus:ring-2 focus:ring-primary-magenta/10 transition-all duration-300 "${add_attribute("value", value, 0)}>` : `<input type="text"${add_attribute("id", id, 0)}${add_attribute("placeholder", placeholder, 0)} ${required ? "required" : ""} class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary-magenta focus:ring-2 focus:ring-primary-magenta/10 transition-all duration-300 "${add_attribute("value", value, 0)}>`}`}</div>`;
});
const CheckoutItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { item } = $$props;
  const currency = currencyFormatter.format;
  if ($$props.item === void 0 && $$bindings.item && item !== void 0) $$bindings.item(item);
  return `<div class="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-b-0"><div class="relative flex-shrink-0 w-20 h-20"><img${add_attribute("src", item.image_url || "https://dummyimage.com/100x100/FFF5F8/E91E8C.png&text=Moda", 0)}${add_attribute("alt", item.name, 0)} class="object-cover w-full h-full rounded-lg bg-bg-secondary border border-gray-200"> <span class="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-primary-magenta text-white ">${escape(item.quantity)}</span></div> <div class="flex-grow min-w-0"><h4 class="font-semibold text-text-primary truncate">${escape(item.name)}</h4> <p class="text-sm text-text-secondary">Cantidad: ${escape(item.quantity)}</p></div> <div class="flex flex-col items-end gap-2"><span class="font-bold text-primary-magenta">${escape(currency(item.price * item.quantity))}</span> <button class="text-xs text-text-secondary hover:text-primary-magenta transition-colors font-medium " data-svelte-h="svelte-1ay820n">Eliminar</button></div></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentCart = {
    items: [],
    subtotal: 0
  };
  let email = "";
  let fullName = "";
  let phone = "";
  let municipality = "";
  let shippingCost = 0;
  let total = 0;
  function calculateShipping(mun) {
    const { shipping } = brand.businessRules;
    if (shipping.localZones.includes(mun)) {
      return shipping.costs.local;
    }
    if (mun.length > 2) {
      return shipping.costs.national;
    }
    return 0;
  }
  function recalculateTotal() {
    shippingCost = calculateShipping(municipality.toLowerCase().trim());
    total = currentCart.subtotal + shippingCost;
  }
  const currency = currencyFormatter.format;
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      recalculateTotal();
    }
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-1xsr07a_START -->${$$result.title = `<title>Checkout - Moda Orgánica</title>`, ""}<!-- HEAD_svelte-1xsr07a_END -->`, ""} <div class="min-h-screen bg-bg-primary"> <div class="border-b border-gray-200 bg-bg-secondary" data-svelte-h="svelte-12rzxy6"><div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4"><div class="flex items-center gap-2 text-sm"><a href="/" class="text-primary-magenta hover:text-primary-purple transition-colors font-medium">Tienda</a> <span class="text-text-secondary">/</span> <span class="text-text-secondary">Carrito</span></div></div></div>  <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12"> <div class="mb-12" data-svelte-h="svelte-1tv9sh3"><h1 class="text-4xl md:text-5xl font-black text-text-primary mb-2">Resumen de tu Orden</h1> <p class="text-text-secondary text-lg">Revisa los artículos en tu carrito y completa tu información</p></div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-8"> <div class="lg:col-span-2"><form class="flex flex-col gap-8"> <section class="bg-bg-card rounded-2xl p-8 border-2 border-transparent hover:border-primary-magenta/30 transition-colors"><h2 class="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3" data-svelte-h="svelte-19p8qhb"><div class="w-8 h-8 bg-gradient-magenta rounded-lg flex items-center justify-center text-white text-lg font-black">1</div>
							Tu Información</h2> <div class="flex flex-col gap-5">${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        label: "Email",
        id: "email",
        type: "email",
        placeholder: "tu@correo.com",
        required: true,
        value: email
      },
      {
        value: ($$value) => {
          email = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        label: "Nombre Completo",
        id: "fullName",
        placeholder: "Nombre Apellido",
        required: true,
        value: fullName
      },
      {
        value: ($$value) => {
          fullName = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        label: "Teléfono",
        id: "phone",
        type: "tel",
        placeholder: "12345678",
        required: true,
        value: phone
      },
      {
        value: ($$value) => {
          phone = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        label: "Municipalidad (para envío)",
        id: "municipality",
        placeholder: "ej: huehuetenango",
        required: true,
        value: municipality
      },
      {
        value: ($$value) => {
          municipality = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div></section>  <section class="bg-bg-card rounded-2xl p-8 border-2 border-transparent hover:border-primary-magenta/30 transition-colors" data-svelte-h="svelte-15lkgry"><h2 class="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3"><div class="w-8 h-8 bg-gradient-magenta rounded-lg flex items-center justify-center text-white text-lg font-black">2</div>
							Método de Pago</h2> <div class="p-6 bg-bg-secondary rounded-xl border-2 border-dashed border-primary-magenta/30"><p class="text-text-secondary text-center"><span class="font-semibold text-text-primary">Stripe</span> - La integración con Stripe se añadirá en el siguiente paso</p></div></section>  <button type="submit" class="w-full bg-gradient-magenta hover:shadow-magenta text-white font-bold text-lg py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 " data-svelte-h="svelte-e9ujso">Pagar Ahora</button></form></div>  <div class="lg:col-span-1"><div class="sticky top-24 bg-bg-card rounded-2xl p-8 border-2 border-primary-magenta/20 shadow-soft"><h3 class="text-xl font-bold text-text-primary mb-6" data-svelte-h="svelte-18vd5lo">Tu Carrito</h3> ${currentCart.items.length > 0 ? `<div class="flex flex-col gap-4 mb-6 max-h-96 overflow-y-auto">${each(currentCart.items, (item) => {
      return `${validate_component(CheckoutItem, "CheckoutItem").$$render($$result, { item }, {}, {})}`;
    })}</div> <hr class="border-gray-200 my-6">  <div class="flex flex-col gap-3"><div class="flex justify-between items-center"><span class="text-text-secondary" data-svelte-h="svelte-pma8bz">Subtotal</span> <span class="font-semibold text-text-primary">${escape(currency(currentCart.subtotal))}</span></div> <div class="flex justify-between items-center"><span class="text-text-secondary" data-svelte-h="svelte-ulky2y">Envío</span> <span class="font-semibold text-text-primary">${escape(currency(shippingCost))}</span></div> <hr class="border-gray-200 my-4"> <div class="flex justify-between items-center text-lg"><span class="font-bold text-text-primary" data-svelte-h="svelte-hryvl2">Total</span> <span class="font-black text-primary-magenta text-2xl">${escape(currency(total))}</span></div></div>` : `<div class="text-center py-12" data-svelte-h="svelte-1ndqxcc"><p class="text-text-secondary mb-4">Tu carrito está vacío</p> <a href="/" class="inline-block bg-gradient-magenta text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-magenta hover:scale-105 ">Volver a la Tienda</a></div>`}</div></div></div></div></div>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};

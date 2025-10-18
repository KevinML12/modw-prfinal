import { c as create_ssr_component, b as add_attribute, e as escape, d as add_styles, f as each, v as validate_component } from "../../chunks/ssr.js";
import { b as brand } from "../../chunks/cart.store.js";
const ProductCard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { product } = $$props;
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(value);
  };
  if ($$props.product === void 0 && $$bindings.product && product !== void 0) $$bindings.product(product);
  return `<div class="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"><div class="relative overflow-hidden"><a${add_attribute("href", `/product/${product.id}`, 0)}><img${add_attribute("src", product.image_url || "/images/placeholder.jpg", 0)}${add_attribute("alt", product.name, 0)} class="h-64 w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" loading="lazy"></a></div> <div class="flex flex-1 flex-col justify-between p-4"><div><a${add_attribute("href", `/product/${product.id}`, 0)} class="font-headings text-text text-lg font-medium hover:underline">${escape(product.name)}</a> <p class="font-body mt-1 text-sm text-gray-500">${escape(product.description.substring(0, 50))}...</p></div> <div class="mt-4 flex items-center justify-between"><p class="font-body text-secondary text-xl font-semibold">${escape(formatCurrency(product.price))}</p> <button class="bg-primary rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-secondary focus:bg-secondary" data-svelte-h="svelte-gcbfmo">Añadir</button></div></div></div>`;
});
async function load({ fetch }) {
  try {
    const res = await fetch("http://localhost:8080/api/v1/products");
    if (!res.ok) {
      throw new Error(`Error ${res.status}: No se pudo conectar a la API de productos`);
    }
    const products = await res.json();
    return {
      props: {
        products: products || []
        // Asegurarnos de pasar un array
      }
    };
  } catch (error) {
    console.error("Error cargando productos en +page.svelte:", error);
    return {
      props: { products: [], error: error.message }
    };
  }
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { products = [] } = $$props;
  let { error = null } = $$props;
  const fonts = brand.identity.fonts;
  const colors = brand.identity.colors;
  if ($$props.products === void 0 && $$bindings.products && products !== void 0) $$bindings.products(products);
  if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
  return `${$$result.head += `<!-- HEAD_svelte-11gwlkj_START -->${$$result.title = `<title>${escape(brand.seo.title)}</title>`, ""}<meta name="description"${add_attribute("content", brand.seo.description, 0)}><!-- HEAD_svelte-11gwlkj_END -->`, ""} <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><h1 class="mb-8 text-center text-4xl font-bold tracking-tight md:text-5xl"${add_styles({
    "font-family": fonts.headings,
    "color": colors.text
  })} data-svelte-h="svelte-1efkf7n">Nuestra Colección</h1> ${error ? `<div class="rounded-lg border border-red-300 bg-red-50 p-4 text-center"><h3 class="font-bold text-red-800" data-svelte-h="svelte-dg8x74">Error al Cargar Productos</h3> <p class="text-red-700">${escape(error)}</p> <p class="mt-2 text-sm text-gray-600" data-svelte-h="svelte-kr1xol">Asegúrate de que el contenedor del backend (\`phoenix_backend\`) esté corriendo.</p></div>` : `${products.length === 0 ? `<div class="text-center text-gray-500"${add_styles({ "font-family": fonts.body })} data-svelte-h="svelte-1r58icl"><p class="text-xl">Aún no hay productos en la colección.</p> <p>Pronto agregaremos nuevas piezas únicas.</p></div>` : ``}`} <div class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">${each(products, (product) => {
    return `${validate_component(ProductCard, "ProductCard").$$render($$result, { product }, {}, {})}`;
  })}</div></section>`;
});
export {
  Page as default,
  load
};

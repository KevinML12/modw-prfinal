/**
 * @typedef {Object} CartItem
 * @property {string} id - ID único del producto
 * @property {string} name - Nombre del producto
 * @property {string} [description] - Descripción del producto
 * @property {number} price - Precio del producto
 * @property {number} quantity - Cantidad en el carrito
 * @property {string} [image_url] - URL de la imagen
 * @property {number} [stock] - Stock disponible
 */

/**
 * @typedef {Object} Product
 * @property {string} id - ID único del producto
 * @property {string} name - Nombre del producto
 * @property {string} description - Descripción del producto
 * @property {number} price - Precio del producto
 * @property {number} stock - Stock disponible
 * @property {string} [image_url] - URL de la imagen
 * @property {string} [sku] - SKU del producto
 */

/**
 * @typedef {Object} Order
 * @property {string} id - ID único del pedido
 * @property {string} customer_email - Email del cliente
 * @property {string} customer_name - Nombre del cliente
 * @property {string} customer_phone - Teléfono del cliente
 * @property {string} shipping_address - Dirección de envío
 * @property {string} municipality - Municipalidad
 * @property {number} total - Total del pedido
 * @property {'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'} status - Estado del pedido
 * @property {string} created_at - Fecha de creación
 */

/**
 * @typedef {Object} Currency
 * @property {Function} format - Función para formatear valores a moneda
 * @property {Function} getSymbol - Función para obtener el símbolo de moneda
 * @property {Object} config - Configuración de moneda
 * @property {string} config.locale - Locale (ej: 'es-GT')
 * @property {string} config.currency - Código de moneda (ej: 'GTQ')
 */

export {};

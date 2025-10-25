// Script de Testing para Checkout + Carrito
// Copiar y pegar en la consola (F12) de Chrome/Firefox

console.log('%c=== MODA ORGANICA - CART & CHECKOUT TEST ===', 'color: #FF00FF; font-size: 16px; font-weight: bold');

// 1. Ver estado actual del carrito
console.log('%c1. ESTADO DEL CARRITO', 'color: #00FF00; font-weight: bold');
const savedCart = localStorage.getItem('moda-organica-cart');
console.log('localStorage["moda-organica-cart"]:', savedCart ? JSON.parse(savedCart) : 'VACÍO');

// 2. Simular agregar un producto
console.log('%c2. SIMULAR AGREGAR PRODUCTO', 'color: #00FF00; font-weight: bold');
const fakeProduct = {
  id: 999,
  name: 'Anillo de Test',
  price: 250.00,
  image_url: 'https://via.placeholder.com/200'
};
console.log('Agregando:', fakeProduct);

// 3. Ver localStorage después de agregar
console.log('%c3. VERIFICAR LOCALSTORAGE DESPUÉS DE AGREGAR', 'color: #00FF00; font-weight: bold');
setTimeout(() => {
  const cartAfter = localStorage.getItem('moda-organica-cart');
  console.log('Carrito actualizado:', cartAfter ? JSON.parse(cartAfter) : 'VACÍO');
}, 500);

// 4. Funciones útiles
console.log('%c4. FUNCIONES DE UTILIDAD', 'color: #00FF00; font-weight: bold');
console.log('Usa estas funciones en la consola:');

window.testUtils = {
  // Ver carrito
  getCart: () => {
    const cart = localStorage.getItem('moda-organica-cart');
    console.log(cart ? JSON.parse(cart) : 'Carrito vacío');
    return cart ? JSON.parse(cart) : null;
  },

  // Limpiar carrito
  clearCart: () => {
    localStorage.removeItem('moda-organica-cart');
    console.log('✅ Carrito limpiado');
  },

  // Crear carrito de prueba
  seedCart: () => {
    const mockCart = {
      items: [
        { id: 1, name: 'Anillo Plata', price: 250, quantity: 1, image_url: 'https://via.placeholder.com/200' },
        { id: 2, name: 'Collar Oro', price: 450, quantity: 2, image_url: 'https://via.placeholder.com/200' }
      ],
      subtotal: 1150,
      total: 1150,
      itemCount: 3
    };
    localStorage.setItem('moda-organica-cart', JSON.stringify(mockCart));
    console.log('✅ Carrito de prueba creado:', mockCart);
    location.reload();
  },

  // Validar formulario de checkout
  validateCheckout: () => {
    console.log('%c📋 VALIDACIÓN DE CHECKOUT', 'color: #0099FF; font-weight: bold');
    const form = document.querySelector('form');
    if (!form) {
      console.error('❌ No se encontró formulario');
      return;
    }

    const inputs = {
      email: form.querySelector('input[type="email"]')?.value,
      name: form.querySelectorAll('input[type="text"]')[0]?.value,
      phone: form.querySelector('input[type="tel"]')?.value,
      department: form.querySelectorAll('select')[0]?.value,
      municipality: form.querySelectorAll('select')[1]?.value,
      address: form.querySelector('textarea')?.value
    };

    console.log('Valores del formulario:', inputs);

    // Validaciones
    const errors = [];
    if (!inputs.email || !inputs.email.includes('@')) errors.push('❌ Email inválido');
    else console.log('✅ Email válido');

    if (!inputs.name || inputs.name.length < 3) errors.push('❌ Nombre inválido');
    else console.log('✅ Nombre válido');

    if (!inputs.phone || inputs.phone.replace(/\D/g, '').length < 8) errors.push('❌ Teléfono inválido');
    else console.log('✅ Teléfono válido');

    if (!inputs.department) errors.push('❌ Departamento no seleccionado');
    else console.log('✅ Departamento seleccionado');

    if (!inputs.municipality) errors.push('❌ Municipio no seleccionado');
    else console.log('✅ Municipio seleccionado');

    if (!inputs.address || inputs.address.length < 10) errors.push('❌ Dirección inválida');
    else console.log('✅ Dirección válida');

    if (errors.length > 0) {
      console.error('Errores encontrados:', errors);
    } else {
      console.log('%c✅ TODOS LOS CAMPOS SON VÁLIDOS', 'color: #00FF00; font-weight: bold');
    }

    return { fields: inputs, errors };
  },

  // Ver items en carrito visual
  showCart: () => {
    const cart = localStorage.getItem('moda-organica-cart');
    if (cart) {
      const parsed = JSON.parse(cart);
      console.table(parsed.items);
      console.log(`Total items: ${parsed.itemCount}`);
      console.log(`Subtotal: Q${parsed.subtotal}`);
      console.log(`Total: Q${parsed.total}`);
    } else {
      console.log('Carrito vacío');
    }
  }
};

console.log('%c📝 COMANDOS DISPONIBLES', 'color: #FF6600; font-weight: bold');
console.log(`
testUtils.getCart()           - Ver carrito actual
testUtils.showCart()          - Mostrar carrito en tabla
testUtils.clearCart()         - Limpiar carrito
testUtils.seedCart()          - Crear carrito de prueba
testUtils.validateCheckout()  - Validar formulario de checkout

Ejemplos:
> testUtils.getCart()
> testUtils.seedCart()
> testUtils.validateCheckout()
`);

console.log('%c✅ Test Utils Cargados', 'color: #00FF00; font-weight: bold');

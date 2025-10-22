/**
 * Store para formateo centralizado de moneda
 * Evita inconsistencias entre GTQ, MXN, USD, etc.
 * 
 * Uso:
 * import { currencyFormatter } from '$lib/stores/currency.store.js';
 * const formatted = currencyFormatter.format(1500); // Q 1,500.00
 */

const LOCALE = 'es-GT';
const CURRENCY = 'GTQ';

export const currencyFormatter = {
  /**
   * Formatea un valor numérico como moneda GTQ
   * @param {number} value - Valor a formatear
   * @returns {string} - Valor formateado (ej: "Q 1,500.00")
   */
  format: (value) => {
    if (value == null || isNaN(value)) return '';
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency: CURRENCY,
    }).format(value);
  },

  /**
   * Retorna el símbolo de la moneda
   * @returns {string} - Símbolo de moneda (ej: "Q")
   */
  getSymbol: () => {
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency: CURRENCY,
    })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value || 'Q';
  },

  /**
   * Configuración de moneda
   */
  config: {
    locale: LOCALE,
    currency: CURRENCY,
  },
};

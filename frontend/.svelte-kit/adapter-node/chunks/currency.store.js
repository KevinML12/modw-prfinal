const LOCALE = "es-GT";
const CURRENCY = "GTQ";
const currencyFormatter = {
  /**
   * Formatea un valor numérico como moneda GTQ
   * @param {number} value - Valor a formatear
   * @returns {string} - Valor formateado (ej: "Q 1,500.00")
   */
  format: (value) => {
    if (value == null || isNaN(value)) return "";
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: CURRENCY
    }).format(value);
  }
};
export {
  currencyFormatter as c
};

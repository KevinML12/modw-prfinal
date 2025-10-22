/**
 * Valida formato de email
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test(email);
}

/**
 * Valida que la contraseña cumpla requisitos mínimos
 * @param {string} password 
 * @returns {{valid: boolean, message: string}}
 */
export function validatePassword(password) {
	if (!password || password.length < 6) {
		return {
			valid: false,
			message: 'La contraseña debe tener al menos 6 caracteres'
		};
	}
	
	return { valid: true, message: '' };
}

/**
 * Valida que dos contraseñas coincidan
 * @param {string} password 
 * @param {string} confirmPassword 
 * @returns {boolean}
 */
export function passwordsMatch(password, confirmPassword) {
	return password === confirmPassword;
}

/**
 * Valida nombre completo (mínimo 3 caracteres)
 * @param {string} name 
 * @returns {boolean}
 */
export function isValidName(name) {
	return name && name.trim().length >= 3;
}

/**
 * Sanitiza input del usuario (previene XSS básico)
 * @param {string} input 
 * @returns {string}
 */
export function sanitizeInput(input) {
	if (!input) return '';
	return input.trim().replace(/[<>]/g, '');
}

/**
 * Valida número de teléfono guatemalteco (8 dígitos)
 * @param {string} phone 
 * @returns {boolean}
 */
export function isValidPhoneNumber(phone) {
	const regex = /^\d{8}$/;
	return regex.test(phone.replace(/\D/g, ''));
}

/**
 * Valida que un campo no esté vacío
 * @param {string} field 
 * @returns {boolean}
 */
export function isNotEmpty(field) {
	return field && field.trim().length > 0;
}

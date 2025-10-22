// frontend/src/lib/stores/theme.store.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// ===== SISTEMA DE TEMA DARK MODE PREMIUM =====

/**
 * @typedef {'light' | 'dark'} Theme
 */

/**
 * Detecta la preferencia de tema del sistema
 * @returns {Theme}
 */
function getSystemTheme() {
  if (!browser) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Obtiene el tema inicial (localStorage > sistema > light)
 * @returns {Theme}
 */
function getInitialTheme() {
  if (!browser) return 'light';
  
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (e) {
    console.warn('localStorage not available, using system preference:', e.message);
  }
  
  return getSystemTheme();
}

/**
 * Aplicar tema al DOM
 * @param {Theme} theme
 */
function applyTheme(theme) {
  if (!browser) return;
  
  try {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
  } catch (e) {
    console.warn('Could not save theme to localStorage:', e.message);
  }
}

// Inicializar tema
const initialTheme = getInitialTheme();
if (browser) {
  applyTheme(initialTheme);
}

// Crear store
export const theme = writable(initialTheme);

/**
 * Toggle entre light y dark mode
 */
export function toggleTheme() {
  theme.update((current) => {
    const newTheme = current === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    return newTheme;
  });
}

/**
 * Forzar un tema específico
 * @param {Theme} newTheme
 */
export function setTheme(newTheme) {
  applyTheme(newTheme);
  theme.set(newTheme);
}

/**
 * Obtener el tema actual (sincrónico)
 * @returns {Theme}
 */
export function getCurrentTheme() {
  if (!browser) return 'light';
  return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
}
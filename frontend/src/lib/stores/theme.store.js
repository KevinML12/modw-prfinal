// frontend/src/lib/stores/theme.store.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Función auxiliar para obtener preferencia del sistema
function getSystemPreference() {
  if (!browser) return 'light'; // Default en SSR
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Lee preferencia guardada, o del sistema, o usa 'light'
const initialValue = browser
  ? localStorage.getItem('theme') || getSystemPreference()
  : 'light';

// Crea el store reactivo
const theme = writable(initialValue);

// Suscripción para actualizar localStorage y clase <html> en el navegador
if (browser) {
  theme.subscribe((value) => {
    localStorage.setItem('theme', value);
    if (value === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });
}

// Función para cambiar el tema
function toggleTheme() {
  theme.update((current) => (current === 'light' ? 'dark' : 'light'));
}

export { theme, toggleTheme };
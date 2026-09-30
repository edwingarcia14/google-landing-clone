/**
 * Punto de entrada principal y orquestador de módulos de la aplicación.
 */
import { initTheme, toggleTheme } from './modules/theme.js';
import { initPopovers } from './modules/popovers.js';
import { initAutocomplete } from './modules/autocomplete.js';
import { initLensModal } from './modules/lensModal.js';
import { initWeather } from './modules/weather.js';
import { initVoiceSearch } from './modules/voiceSearch.js';
import { initLuckySearch } from './modules/luckySearch.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicialización de los subsistemas y componentes de la interfaz
    initTheme();
    initPopovers();
    initAutocomplete();
    initLensModal();
    initWeather();
    initVoiceSearch();
    initLuckySearch();

    // 2. Vinculación de eventos para controles globales
    const btnToggleTheme = document.getElementById('btnToggleTheme');
    if (btnToggleTheme) {
        btnToggleTheme.addEventListener('click', toggleTheme);
    }

    // 3. Manejo de la búsqueda principal mediante el formulario
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = document.getElementById('searchInput');
            const query = input ? input.value.trim() : '';

            if (query) {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
            }
        });
    }
});